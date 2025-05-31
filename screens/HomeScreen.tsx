import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { ProductType } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const productsJson = await AsyncStorage.getItem('products');
      if (productsJson) {
        const products: ProductType[] = JSON.parse(productsJson);
        setTotalProducts(products.length);
        
        // Calculate low stock items
        const lowStock = products.filter(p => p.stock <= p.lowStockThreshold);
        setLowStockCount(lowStock.length);
        
        // Calculate total stock value
        const stockValue = products.reduce((total, product) => {
          return total + (product.buyPrice * product.stock);
        }, 0);
        setTotalStockValue(stockValue);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (screen: string) => {
    // @ts-ignore - We'll handle type safety when implementing full navigation
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ঘর তৈরির সরঞ্জাম</Text>
        <Text style={styles.subtitle}>
          {user ? `স্বাগতম, ${user.displayName || 'ব্যবহারকারী'}` : 'স্বাগতম'}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.card, styles.statCard]}>
          <Ionicons name="cube-outline" size={32} color="#4A6572" />
          <Text style={styles.statValue}>{totalProducts}</Text>
          <Text style={styles.statLabel}>মোট পণ্য</Text>
        </View>
        
        <View style={[styles.card, styles.statCard]}>
          <Ionicons name="alert-circle-outline" size={32} color={lowStockCount > 0 ? "#E57373" : "#4A6572"} />
          <Text style={[styles.statValue, lowStockCount > 0 ? styles.alertText : {}]}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>লো স্টক</Text>
        </View>

        <View style={[styles.card, styles.statCard]}>
          <Ionicons name="cash-outline" size={32} color="#4A6572" />
          <Text style={styles.statValue}>৳{totalStockValue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>মোট স্টক মূল্য</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>দ্রুত অ্যাকশন</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('ProductSelection')}
        >
          <Ionicons name="cart-outline" size={28} color="#344955" />
          <Text style={styles.actionText}>নতুন বিক্রয়</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('ProductManagement')}
        >
          <Ionicons name="list-outline" size={28} color="#344955" />
          <Text style={styles.actionText}>পণ্য ব্যবস্থাপনা</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('StockManagement')}
        >
          <Ionicons name="refresh-outline" size={28} color="#344955" />
          <Text style={styles.actionText}>স্টক আপডেট</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('SupplierScreen')}
        >
          <Ionicons name="people-outline" size={28} color="#344955" />
          <Text style={styles.actionText}>সাপ্লাইয়ার</Text>
        </TouchableOpacity>
      </View>

      {/* Low Stock Alerts */}
      {lowStockCount > 0 && (
        <>
          <Text style={styles.sectionTitle}>লো স্টক অ্যালার্ট</Text>
          <TouchableOpacity 
            style={[styles.card, styles.alertCard]}
            onPress={() => navigateTo('StockManagement')}
          >
            <View style={styles.alertHeader}>
              <Ionicons name="warning-outline" size={24} color="#E57373" />
              <Text style={styles.alertTitle}>
                {lowStockCount} টি পণ্য লো স্টকে রয়েছে
              </Text>
            </View>
            <Text style={styles.alertMessage}>
              স্টক আপডেট করতে এখানে ক্লিক করুন
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Help Card */}
      <View style={[styles.card, styles.helpCard]}>
        <Text style={styles.helpTitle}>সাহায্য প্রয়োজন?</Text>
        <Text style={styles.helpText}>
          এপ্লিকেশন ব্যবহারের জন্য মেনু থেকে প্রয়োজনীয় অপশন নির্বাচন করুন। 
          স্টক আপডেট, পণ্য যোগ, বা বিক্রয় সম্পাদন করতে উপরের আইকনগুলি ব্যবহার করুন।
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#344955',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#344955',
  },
  statLabel: {
    fontSize: 14,
    color: '#4A6572',
  },
  alertText: {
    color: '#E57373',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    color: '#344955',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  actionCard: {
    width: '46%',
    marginHorizontal: '2%',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    color: '#344955',
  },
  alertCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E57373',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#E57373',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
  },
  helpCard: {
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4DB6AC',
    marginBottom: 30,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A6572',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});