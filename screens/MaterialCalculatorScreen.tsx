import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { formatCurrency, calculateRoofMaterial, calculateWallMaterial, safeParseFloat } from '../utils/helpers';
import { MaterialEstimationResult } from '../types';
import { Ionicons } from '@expo/vector-icons';

// MVVM architecture: This is the View component that interacts with the ViewModel logic
const MaterialCalculatorScreen = () => {
  const navigation = useNavigation();
  
  // ViewModel state
  const [calculationType, setCalculationType] = useState<'roof' | 'wall'>('roof');
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [thickness, setThickness] = useState<string>('10'); // Default thickness (cm)
  const [roofMaterial, setRoofMaterial] = useState<'টিন' | 'টুয়া'>('টিন');
  const [calculating, setCalculating] = useState<boolean>(false);
  const [results, setResults] = useState<MaterialEstimationResult[]>([]);

  // ViewModel logic: Calculate materials based on input dimensions
  const calculateMaterials = () => {
    setCalculating(true);
    setTimeout(() => {
      const lengthValue = safeParseFloat(length);
      const widthValue = safeParseFloat(width);
      const heightValue = safeParseFloat(height);
      const thicknessValue = safeParseFloat(thickness);
      
      const newResults: MaterialEstimationResult[] = [];
      
      if (calculationType === 'roof') {
        if (lengthValue && widthValue) {
          const roofCalculation = calculateRoofMaterial(lengthValue, widthValue);
          
          newResults.push({
            materialType: roofMaterial,
            quantity: roofCalculation.tinSheets,
            unit: 'শীট',
            estimatedCost: roofCalculation.tinSheets * (roofMaterial === 'টিন' ? 450 : 500) // Approximate costs
          });
          
          newResults.push({
            materialType: 'J-হুক',
            quantity: Math.ceil(roofCalculation.tinSheets * 4), // 4 hooks per sheet
            unit: 'পিস',
            estimatedCost: Math.ceil(roofCalculation.tinSheets * 4) * 5
          });
          
          newResults.push({
            materialType: 'স্ক্রু',
            quantity: Math.ceil(roofCalculation.tinSheets * 8), // 8 screws per sheet
            unit: 'পিস',
            estimatedCost: Math.ceil(roofCalculation.tinSheets * 8) * 2
          });
        }
      } else if (calculationType === 'wall') {
        if (lengthValue && heightValue && thicknessValue) {
          const wallCalculation = calculateWallMaterial(lengthValue, heightValue, thicknessValue);
          
          newResults.push({
            materialType: 'ইট',
            quantity: wallCalculation.bricks,
            unit: 'পিস',
            estimatedCost: wallCalculation.bricks * 10 // Approximate cost
          });
          
          newResults.push({
            materialType: 'সিমেন্ট',
            quantity: wallCalculation.cement,
            unit: 'ব্যাগ',
            estimatedCost: wallCalculation.cement * 450 // Approximate cost
          });
          
          newResults.push({
            materialType: 'বালি',
            quantity: wallCalculation.sand,
            unit: 'ঘন ফুট',
            estimatedCost: wallCalculation.sand * 50 // Approximate cost
          });
        }
      }
      
      setResults(newResults);
      setCalculating(false);
    }, 500); // Simulate calculation time for better UX
  };

  // Total estimated cost
  const totalEstimatedCost = useMemo(() => {
    return results.reduce((sum, item) => sum + item.estimatedCost, 0);
  }, [results]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>নির্মাণ সামগ্রী ক্যালকুলেটর</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  calculationType === 'roof' && styles.selectedTypeButton
                ]}
                onPress={() => setCalculationType('roof')}
              >
                <Text style={[
                  styles.typeButtonText, 
                  calculationType === 'roof' && styles.selectedTypeButtonText
                ]}>
                  ছাদের সামগ্রী
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  calculationType === 'wall' && styles.selectedTypeButton
                ]}
                onPress={() => setCalculationType('wall')}
              >
                <Text style={[
                  styles.typeButtonText, 
                  calculationType === 'wall' && styles.selectedTypeButtonText
                ]}>
                  দেয়ালের সামগ্রী
                </Text>
              </TouchableOpacity>
            </View>

            {calculationType === 'roof' ? (
              <>
                <Text style={styles.sectionTitle}>ছাদের মাপ</Text>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>ছাদের ধরন</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={roofMaterial}
                      onValueChange={(value) => setRoofMaterial(value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="টিন" value="টিন" />
                      <Picker.Item label="টুয়া" value="টুয়া" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>দৈর্ঘ্য (ফুট)</Text>
                  <TextInput
                    style={styles.input}
                    value={length}
                    onChangeText={setLength}
                    keyboardType="numeric"
                    placeholder="উদাহরণঃ 15"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>প্রস্থ (ফুট)</Text>
                  <TextInput
                    style={styles.input}
                    value={width}
                    onChangeText={setWidth}
                    keyboardType="numeric"
                    placeholder="উদাহরণঃ 12"
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>দেয়ালের মাপ</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>দৈর্ঘ্য (ফুট)</Text>
                  <TextInput
                    style={styles.input}
                    value={length}
                    onChangeText={setLength}
                    keyboardType="numeric"
                    placeholder="উদাহরণঃ 20"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>উচ্চতা (ফুট)</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholder="উদাহরণঃ 10"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>পুরুত্ব (সেন্টিমিটার)</Text>
                  <TextInput
                    style={styles.input}
                    value={thickness}
                    onChangeText={setThickness}
                    keyboardType="numeric"
                    placeholder="উদাহরণঃ 10"
                  />
                </View>
              </>
            )}

            <TouchableOpacity style={styles.calculateButton} onPress={calculateMaterials}>
              <Text style={styles.calculateButtonText}>ক্যালকুলেট করুন</Text>
            </TouchableOpacity>

            {calculating ? (
              <ActivityIndicator size="large" color="#1565C0" style={styles.loading} />
            ) : results.length > 0 ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>প্রয়োজনীয় সামগ্রীর পরিমাণ</Text>
                
                {results.map((item, index) => (
                  <View key={index} style={styles.resultItem}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>{item.materialType}</Text>
                      <Text style={styles.resultValue}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <Text style={styles.resultCost}>
                      আনুমানিক মূল্যঃ {formatCurrency(item.estimatedCost)}
                    </Text>
                  </View>
                ))}
                
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>সম্পূর্ণ আনুমানিক মূল্য</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalEstimatedCost)}</Text>
                </View>
                
                <Text style={styles.disclaimer}>
                  * এই হিসাবটি শুধুমাত্র আনুমানিক এবং বাস্তব মূল্য এবং পরিমাণ পরিবর্তন হতে পারে।
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#e9e9e9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#1565C0',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  calculateButton: {
    backgroundColor: '#1565C0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 32,
  },
  resultsContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  resultItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  resultCost: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default MaterialCalculatorScreen;