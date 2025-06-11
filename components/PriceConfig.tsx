import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

interface PriceConfigProps {
  navigation: any;
}

const PRICE_RANGES = {
  tin: {
    PHP: { min: 800, max: 1200 },
    KY: { min: 850, max: 1250 },
    'TK (G)': { min: 780, max: 1180 },
    'ABUL Khair': { min: 750, max: 1150 },
    'Jalalabad': { min: 900, max: 1300 },
    'Gelco Steel': { min: 770, max: 1170 }
  },
  tua: {
    PHP: { min: 700, max: 1000 },
    KY: { min: 720, max: 1020 },
    'TK (G)': { min: 680, max: 980 }
  },
  plasticTin: {
    RFL: { min: 2000, max: 2800 }
  }
};

export default function PriceConfig({ navigation }: PriceConfigProps) {
  const [selectedCategory, setSelectedCategory] = useState('tin');
  const [priceData, setPriceData] = useState(PRICE_RANGES);

  const handlePriceUpdate = (category: string, company: string, type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    setPriceData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [company]: {
          ...prev[category as keyof typeof prev][company as keyof (typeof prev)[keyof typeof prev]],
          [type]: numValue
        }
      }
    }));
  };

  const savePrices = () => {
    // In real app, save to AsyncStorage or API
    toast.success('দামের তালিকা সংরক্ষণ করা হয়েছে');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>দামের তালিকা</Text>
        <TouchableOpacity onPress={savePrices}>
          <Ionicons name="save" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.categorySelector}>
          {Object.keys(PRICE_RANGES).map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.activeCategoryButtonText
              ]}>
                {category === 'tin' ? 'টিন' : category === 'tua' ? 'টুয়া' : 'প্লাস্টিক টিন'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.priceList}>
          {Object.entries(priceData[selectedCategory as keyof typeof priceData] || {}).map(([company, prices]) => (
            <View key={company} style={styles.priceItem}>
              <Text style={styles.companyName}>{company}</Text>
              <View style={styles.priceInputs}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>সর্বনিম্ন দাম</Text>
                  <TextInput
                    style={styles.priceField}
                    value={prices.min.toString()}
                    onChangeText={(value) => handlePriceUpdate(selectedCategory, company, 'min', value)}
                    keyboardType="numeric"
                    placeholder="০"
                  />
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>সর্বোচ্চ দাম</Text>
                  <TextInput
                    style={styles.priceField}
                    value={prices.max.toString()}
                    onChangeText={(value) => handlePriceUpdate(selectedCategory, company, 'max', value)}
                    keyboardType="numeric"
                    placeholder="০"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  activeCategoryButton: {
    backgroundColor: '#1976D2',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priceList: {
    gap: 16,
  },
  priceItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceField: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
});