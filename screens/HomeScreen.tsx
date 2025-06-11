import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  // Commented out auth for now as requested
  // const { user } = useAuth();
  const { products, categories, getLowStockProducts, loading } = useProducts();
  const { cartItems } = useCart();

  // Demo stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalCategories: 0,
    recentSales: 0,
  });

  // Recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Check low stock alert
  useEffect(() => {
    if (products && products.length > 0) {
      const lowStockProducts = getLowStockProducts();
      
      if (lowStockProducts.length > 0) {
        Alert.alert(
          'কম স্টক সতর্কতা',
          `${lowStockProducts.length}টি পণ্যের স্টক কম রয়েছে। দয়া করে যাচাই করুন।`,
          [
            { text: 'পরে', style: 'cancel' },
            { 
              text: 'স্টক দেখুন', 
              onPress: () => navigation.navigate('StockManagement' as never) 
            }
          ]
        );
      }
      
      // Update stats
      setStats({
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
        recentSales: 0, // Will be loaded later
      });
    }
  }, [products, categories]);

  // Load recent transactions from AsyncStorage
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const savedTransactions = await AsyncStorage.getItem('recentTransactions');
        if (savedTransactions) {
          setRecentTransactions(JSON.parse(savedTransactions).slice(0, 5)); // Show only latest 5
        } else {
          // Demo transactions
          const demoTransactions = [
            { 
              id: '1',
              date: new Date().toISOString(),
              customerName: 'আলি হোসেন',
              total: 15000,
              items: 3
            },
            {
              id: '2',
              date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              customerName: 'করিম মিয়া',
              total: 8500,
              items: 2
            }
          ];
          
          setRecentTransactions(demoTransactions);
          await AsyncStorage.setItem('recentTransactions', JSON.stringify(demoTransactions));
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };
    
    loadTransactions();
  }, []);

  const openDrawer = () => {
    navigation.openDrawer();
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString()}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="menu" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ঘর তৈরির সরঞ্জাম</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart' as never)}>
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={28} color="#333" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>স্বাগতম</Text>
        <Text style={styles.businessName}>আপনার ব্যবসা</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#e3f2fd' }]}>
            <MaterialIcons name="inventory" size={24} color="#1976d2" />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>মোট পণ্য</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#fce4ec' }]}>
            <MaterialIcons name="warning" size={24} color="#d81b60" />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.lowStockCount}</Text>
            <Text style={styles.statLabel}>কম স্টক</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#e0f2f1' }]}>
            <MaterialIcons name="category" size={24} color="#009688" />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.totalCategories}</Text>
            <Text style={styles.statLabel}>ক্যাটাগরি</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#f3e5f5' }]}>
            <FontAwesome5 name="money-bill-wave" size={18} color="#7b1fa2" />
          </View>
          <View>
            <Text style={styles.statValue}>{formatCurrency(stats.recentSales)}</Text>
            <Text style={styles.statLabel}>আজকের বিক্রয়</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>দ্রুত অ্যাকশন</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductSelection' as never)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#e3f2fd' }]}>
              <MaterialIcons name="shopping-bag" size={24} color="#1976d2" />
            </View>
            <Text style={styles.actionText}>নতুন বিক্রয়</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('StockManagement' as never)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#e8f5e9' }]}>
              <MaterialIcons name="add-box" size={24} color="#388e3c" />
            </View>
            <Text style={styles.actionText}>স্টক যোগ করুন</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductManagement' as never)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fff3e0' }]}>
              <MaterialIcons name="edit" size={24} color="#f57c00" />
            </View>
            <Text style={styles.actionText}>পণ্য ব্যবস্থাপনা</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Supplier' as never)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#f3e5f5' }]}>
              <Entypo name="users" size={22} color="#7b1fa2" />
            </View>
            <Text style={styles.actionText}>সাপ্লায়ার</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PriceConfig' as never)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#e0f7fa' }]}>
              <MaterialIcons name="price-change" size={24} color="#0097a7" />
            </View>
            <Text style={styles.actionText}>মূল্য তালিকা</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentTransactionsContainer}>
        <Text style={styles.sectionTitle}>সাম্প্রতিক বিক্রয়</Text>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction, index) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                <Text style={styles.transactionCustomer}>{transaction.customerName}</Text>
                <Text style={styles.transactionItems}>{transaction.items} টি আইটেম</Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>
                  {formatCurrency(transaction.total)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noTransactionsContainer}>
            <MaterialIcons name="receipt-long" size={48} color="#bdbdbd" />
            <Text style={styles.noTransactionsText}>কোন বিক্রয় রেকর্ড নেই</Text>
          </View>
        )}
      </View>
      
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    padding: 16,
    backgroundColor: '#2196f3',
  },
  welcomeText: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  recentTransactionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 14,
    color: '#757575',
  },
  transactionCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
  },
  transactionItems: {
    fontSize: 14,
    color: '#757575',
  },
  transactionRight: {
    justifyContent: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  noTransactionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noTransactionsText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
  },
  spacer: {
    height: 20,
  },
});

export default HomeScreen;