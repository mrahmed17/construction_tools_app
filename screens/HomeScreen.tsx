import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useProduct } from '../context/ProductContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { cartItems } = useCart();
  const { products, getLowStockProducts } = useProduct();
  
  const [sales, setSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  
  // Load sales data from AsyncStorage
  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await AsyncStorage.getItem('sales');
        if (salesData) {
          const parsedSales = JSON.parse(salesData);
          setSales(parsedSales);
          
          // Calculate revenue and profit
          const revenue = parsedSales.reduce((sum, sale) => sum + sale.finalAmount, 0);
          const profit = parsedSales.reduce((sum, sale) => sum + sale.profit, 0);
          
          setTotalRevenue(revenue);
          setTotalProfit(profit);
          
          // Get recent sales (last 5)
          const recent = parsedSales.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ).slice(0, 5);
          
          setRecentSales(recent);
        }
      } catch (error) {
        console.error('Error loading sales data:', error);
      }
    };
    
    loadSales();
  }, []);
  
  // Check for low stock items
  useEffect(() => {
    if (getLowStockProducts) {
      const lowStock = getLowStockProducts();
      setLowStockItems(lowStock);
      
      // Show alert if there are low stock items
      if (lowStock && lowStock.length > 0) {
        Alert.alert(
          'কম স্টক সতর্কতা',
          `${lowStock.length}টি পণ্যের স্টক কম রয়েছে। বিস্তারিত দেখতে স্টক মনিটরিং পৃষ্ঠা দেখুন।`,
          [{ text: 'ঠিক আছে', onPress: () => console.log('Alert closed') }]
        );
      }
    }
  }, [getLowStockProducts]);
  
  // Calculate total stock value
  const totalStock = products ? products.length : 0;
  const totalStockValue = products 
    ? products.reduce((sum, product) => sum + (product.purchasePrice * product.stock), 0)
    : 0;
  
  return (
    <ScrollView style={styles.container}>
      {/* Dashboard Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://api.a0.dev/assets/image?text=টিন+শিট+ইত্যাদি+নির্মাণ+সামগ্রী&aspect=1:1' }}
          style={styles.headerImage}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>স্বাগতম</Text>
          <Text style={styles.businessText}>আপনার নির্মাণ সামগ্রীর দোকানে</Text>
        </View>
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{totalRevenue.toLocaleString('bn-BD')} ৳</Text>
          <Text style={styles.statsLabel}>মোট বিক্রয়</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{totalProfit.toLocaleString('bn-BD')} ৳</Text>
          <Text style={styles.statsLabel}>মোট লাভ</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{totalStock}</Text>
          <Text style={styles.statsLabel}>পণ্য সংখ্যা</Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{lowStockItems ? lowStockItems.length : 0}</Text>
          <Text style={styles.statsLabel}>কম স্টক পণ্য</Text>
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.actionButtonsContainer}>
        <Text style={styles.sectionTitle}>দ্রুত কার্যক্রম</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductSelection')}
          >
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>নতুন বিক্রয়</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('StockManagement')}
          >
            <Ionicons name="refresh" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>স্টক আপডেট</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Report')}
          >
            <Ionicons name="document-text" size={24} color="#FFC107" />
            <Text style={styles.actionButtonText}>রিপোর্ট</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductManagement')}
          >
            <Ionicons name="settings" size={24} color="#9C27B0" />
            <Text style={styles.actionButtonText}>পণ্য সেটিংস</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <View style={styles.alertContainer}>
          <Text style={styles.sectionTitle}>কম স্টক সতর্কতা</Text>
          <View style={styles.alertBox}>
            <Ionicons name="warning" size={24} color="#F44336" style={styles.alertIcon} />
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>
                {lowStockItems.length}টি পণ্যের স্টক কম
              </Text>
              <Text style={styles.alertText}>
                অনুগ্রহ করে স্টক আপডেট করুন
              </Text>
            </View>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => navigation.navigate('StockManagement')}
            >
              <Text style={styles.alertButtonText}>দেখুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Recent Sales */}
      <View style={styles.recentSalesContainer}>
        <Text style={styles.sectionTitle}>সাম্প্রতিক বিক্রয়</Text>
        {recentSales && recentSales.length > 0 ? (
          recentSales.map((sale, index) => (
            <View key={index} style={styles.saleCard}>
              <View style={styles.saleHeader}>
                <Text style={styles.saleCustomer}>{sale.customerName}</Text>
                <Text style={styles.saleDate}>{new Date(sale.date).toLocaleDateString('bn-BD')}</Text>
              </View>
              <View style={styles.saleDetails}>
                <View style={styles.saleItemCount}>
                  <Text style={styles.saleItemCountText}>{sale.items.length}টি আইটেম</Text>
                </View>
                <Text style={styles.saleAmount}>{sale.finalAmount.toLocaleString('bn-BD')} ৳</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>কোনো বিক্রয় নেই</Text>
        )}
      </View>
      
      {/* Cart Button */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Ionicons name="cart" size={24} color="#FFFFFF" />
        {cartItems && cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
  },
  headerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  businessText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -20,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionButtonsContainer: {
    padding: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  actionButtonText: {
    marginTop: 10,
    color: '#555',
    fontWeight: '500',
  },
  alertContainer: {
    padding: 15,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertIcon: {
    marginRight: 15,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  alertText: {
    color: '#777',
    marginTop: 3,
  },
  alertButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recentSalesContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  saleCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  saleCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  saleDate: {
    color: '#777',
  },
  saleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleItemCount: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  saleItemCountText: {
    color: '#388E3C',
    fontSize: 12,
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
    padding: 20,
  },
  cartButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5722',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;