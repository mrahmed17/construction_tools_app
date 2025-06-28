import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MaterialEstimationResult } from '../types';

const MaterialCalculatorScreen = () => {
  const navigation = useNavigation();
  const [calculationType, setCalculationType] = useState<'tin' | 'cement' | 'rod'>('tin');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState<MaterialEstimationResult[]>([]);

  const calculateMaterials = () => {
    let newResults: MaterialEstimationResult[] = [];
    
    switch (calculationType) {
      case 'tin':
        if (length && width) {
          const areaInSqFt = parseFloat(length) * parseFloat(width);
          const tinSheets = Math.ceil(areaInSqFt / 32); // Assuming standard tin sheet is 8x4 ft
          const estimatedCost = tinSheets * 1200; // Assuming average cost of 1200 per sheet
          
          newResults = [
            {
              materialType: 'টিন শিট',
              quantity: tinSheets,
              unit: 'শিট',
              estimatedCost: estimatedCost
            },
            {
              materialType: 'স্ক্রু',
              quantity: tinSheets * 20,
              unit: 'পিস',
              estimatedCost: tinSheets * 20 * 2
            }
          ];
        }
        break;
        
      case 'cement':
        if (area) {
          const areaInSqFt = parseFloat(area);
          const cementBags = Math.ceil(areaInSqFt * 0.02); // Rough estimate
          const sand = Math.ceil(areaInSqFt * 0.06); // Rough estimate in cubic feet
          
          newResults = [
            {
              materialType: 'সিমেন্ট',
              quantity: cementBags,
              unit: 'ব্যাগ',
              estimatedCost: cementBags * 450
            },
            {
              materialType: 'বালি',
              quantity: sand,
              unit: 'কিউবিক ফিট',
              estimatedCost: sand * 50
            }
          ];
        }
        break;
        
      case 'rod':
        if (length && width && height) {
          const volume = parseFloat(length) * parseFloat(width) * parseFloat(height);
          const rodWeight = Math.ceil(volume * 0.05); // Rough estimate in kg
          
          newResults = [
            {
              materialType: 'রড',
              quantity: rodWeight,
              unit: 'কেজি',
              estimatedCost: rodWeight * 80
            }
          ];
        }
        break;
    }
    
    setResults(newResults);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নির্মাণ সামগ্রী ক্যালকুলেটর</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ক্যালকুলেশন টাইপ নির্বাচন করুন</Text>
            
            <View style={styles.calculationTypeContainer}>
              <TouchableOpacity 
                style={[
                  styles.calculationTypeButton,
                  calculationType === 'tin' && styles.activeCalculationType
                ]}
                onPress={() => setCalculationType('tin')}
              >
                <Text style={[
                  styles.calculationTypeText,
                  calculationType === 'tin' && styles.activeCalculationTypeText
                ]}>টিন</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.calculationTypeButton,
                  calculationType === 'cement' && styles.activeCalculationType
                ]}
                onPress={() => setCalculationType('cement')}
              >
                <Text style={[
                  styles.calculationTypeText,
                  calculationType === 'cement' && styles.activeCalculationTypeText
                ]}>সিমেন্ট</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.calculationTypeButton,
                  calculationType === 'rod' && styles.activeCalculationType
                ]}
                onPress={() => setCalculationType('rod')}
              >
                <Text style={[
                  styles.calculationTypeText,
                  calculationType === 'rod' && styles.activeCalculationTypeText
                ]}>রড</Text>
              </TouchableOpacity>
            </View>
            
            {calculationType === 'tin' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>দৈর্ঘ্য (ফুট)</Text>
                <TextInput
                  style={styles.input}
                  value={length}
                  onChangeText={setLength}
                  keyboardType="numeric"
                  placeholder="দৈর্ঘ্য লিখুন"
                />
                
                <Text style={styles.inputLabel}>প্রস্থ (ফুট)</Text>
                <TextInput
                  style={styles.input}
                  value={width}
                  onChangeText={setWidth}
                  keyboardType="numeric"
                  placeholder="প্রস্থ লিখুন"
                />
              </View>
            )}
            
            {calculationType === 'cement' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>মোট এরিয়া (বর্গফুট)</Text>
                <TextInput
                  style={styles.input}
                  value={area}
                  onChangeText={setArea}
                  keyboardType="numeric"
                  placeholder="এরিয়া লিখুন"
                />
              </View>
            )}
            
            {calculationType === 'rod' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>দৈর্ঘ্য (ফুট)</Text>
                <TextInput
                  style={styles.input}
                  value={length}
                  onChangeText={setLength}
                  keyboardType="numeric"
                  placeholder="দৈর্ঘ্য লিখুন"
                />
                
                <Text style={styles.inputLabel}>প্রস্থ (ফুট)</Text>
                <TextInput
                  style={styles.input}
                  value={width}
                  onChangeText={setWidth}
                  keyboardType="numeric"
                  placeholder="প্রস্থ লিখুন"
                />
                
                <Text style={styles.inputLabel}>উচ্চতা (ফুট)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="উচ্চতা লিখুন"
                />
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.calculateButton}
              onPress={calculateMaterials}
            >
              <Text style={styles.calculateButtonText}>হিসাব করুন</Text>
            </TouchableOpacity>
          </View>
          
          {results.length > 0 && (
            <View style={styles.resultsCard}>
              <Text style={styles.cardTitle}>ফলাফল</Text>
              
              {results.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultItemTitle}>{result.materialType}</Text>
                  <View style={styles.resultItemDetails}>
                    <Text style={styles.resultItemText}>পরিমাণ: {result.quantity} {result.unit}</Text>
                    <Text style={styles.resultItemText}>আনুমানিক মূল্য: ৳ {result.estimatedCost}</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>মোট আনুমানিক মূল্য: ৳ {results.reduce((sum, item) => sum + item.estimatedCost, 0)}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  calculationTypeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  calculationTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeCalculationType: {
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
  },
  calculationTypeText: {
    color: '#333',
  },
  activeCalculationTypeText: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  calculateButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  resultItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  resultItemDetails: {
    marginLeft: 10,
  },
  resultItemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  totalContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
});

export default MaterialCalculatorScreen;