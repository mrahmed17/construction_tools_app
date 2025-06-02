import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductType } from '../types';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Request notification permissions on mount
  useEffect(() => {
    async function registerForPushNotifications() {
      if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Notification permissions not granted');
        }
      }
    }
    registerForPushNotifications();
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  // Send local notification when low stock items detected
  useEffect(() => {
    if (lowStockCount > 0) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'লো স্টক এলার্ট',
          body: `${lowStockCount} টি পণ্য লো স্টকে আছে`
        },
        trigger: null
      });
    }
  }, [lowStockCount]);

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
          স্বাগতম, ব্যবহারকারী
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
          <Ionicons name="alert-circle-outline" size={32} color="#FF9500" />
          <Text style={styles.statValue}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>লো স্টক</Text>
        </View>
        
        <View style={[styles.card, styles.statCard]}>
          <Ionicons name="cash-outline" size={32} color="#4CD964" />
          <Text style={styles.statValue}>৳{totalStockValue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>মোট মূল্য</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>দ্রুত কার্যক্রম</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('ProductSelection')}
        >
          <Ionicons name="cart-outline" size={32} color="#ffffff" />
          <Text style={styles.actionText}>নতুন বিক্রয়</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('StockManagement')}
        >
          <Ionicons name="refresh-outline" size={32} color="#ffffff" />
          <Text style={styles.actionText}>স্টক আপডেট</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('ProductManagement')}
        >
          <Ionicons name="cube-outline" size={32} color="#ffffff" />
          <Text style={styles.actionText}>প্রোডাক্ট ম্যানেজমেন্ট</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, styles.actionCard]} 
          onPress={() => navigateTo('SupplierScreen')}
        >
          <Ionicons name="people-outline" size={32} color="#ffffff" />
          <Text style={styles.actionText}>সাপ্লাইয়ার</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>সাম্প্রতিক লেনদেন</Text>
      <View style={styles.card}>
        <View style={styles.transactionItem}>
          <Ionicons name="arrow-up-circle" size={24} color="#FF3B30" />
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>স্টক আউট</Text>
            <Text style={styles.transactionSubtitle}>টিন - 10 পিস</Text>
          </View>
          <Text style={styles.transactionAmount}>-৳5000</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.transactionItem}>
          <Ionicons name="arrow-down-circle" size={24} color="#4CD964" />
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>স্টক ইন</Text>
            <Text style={styles.transactionSubtitle}>টিন - 20 পিস</Text>
          </View>
          <Text style={[styles.transactionAmount, styles.incomeAmount]}>+৳10000</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.transactionItem}>
          <Ionicons name="arrow-up-circle" size={24} color="#FF3B30" />
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>স্টক আউট</Text>
            <Text style={styles.transactionSubtitle}>প্লাস্টিকের টিন - 5 পিস</Text>
          </View>
          <Text style={styles.transactionAmount}>-৳2500</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#344955',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#F9AA33',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -30,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#344955',
  },
  statLabel: {
    fontSize: 14,
    color: '#4A6572',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    color: '#344955',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  actionCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A6572',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#4A6572',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  incomeAmount: {
    color: '#4CD964',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  }
});