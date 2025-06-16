import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, Ionicons, FontAwesome5, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { formatCurrency } from '../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

// MVVM architecture: ViewModel for the HomeScreen
const useHomeViewModel = () => {
  // Fetch data from contexts
  const { products, categories, getLowStockProducts, loading } = useProducts();
  const { items: cartItems } = useCart();
  const { getTopDebtors, getUpcomingDues } = useCustomer();

  const navigation = useNavigation();
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalCategories: 0,
    recentSales: 0,
    totalCustomers: 0,
    outstandingCredit: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topDebtors, setTopDebtors] = useState([]);
  const [upcomingDues, setUpcomingDues] = useState([]);
  
  // Load sales data
  const loadSalesData = async () => {
    try {
      // Check if we already have sales data
      const existingSales = await AsyncStorage.getItem('sales');
      if (!existingSales) {
        await generateSampleSalesData();
      } else {
        const salesData = JSON.parse(existingSales);
        setRecentTransactions(salesData.slice(0, 5).map(sale => ({
          id: sale.id,
          date: sale.date,
          customerName: sale.customerName,
          total: sale.totalAmount,
          items: sale.items.length
        })));
        
        // Update today's sales in stats
        const today = new Date();
        const todaySales = salesData.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getDate() === today.getDate() && 
                 saleDate.getMonth() === today.getMonth() && 
                 saleDate.getFullYear() === today.getFullYear();
        });
        
        const todayTotal = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        setStats(prev => ({
          ...prev,
          recentSales: todayTotal
        }));
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };
  
  // Generate sample sales data for demo purposes
  const generateSampleSalesData = async () => {
    try {
      const pastWeekSales = [];
      const today = new Date();
      
      // Create 30 days of random sales data
      for (let i = 0; i < 30; i++) {
        const saleDate = new Date(today);
        saleDate.setDate(today.getDate() - i);
        
        // Generate 1-3 sales for each day
        const dailySalesCount = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < dailySalesCount; j++) {
          const itemCount = Math.floor(Math.random() * 5) + 1;
          const items = [];
          
          // Generate random items
          for (let k = 0; k < itemCount; k++) {
            const purchasePrice = Math.floor(Math.random() * 1000) + 500;
            const sellingPrice = purchasePrice + Math.floor(Math.random() * 300);
            items.push({
              id: `item-${Date.now()}-${k}`,
              category: ['টিন', 'টুয়া', 'প্লেইন শিট', 'ফুলের শিট'][Math.floor(Math.random() * 4)],
              company: ['php', 'KY', 'TK (G)', 'ABUL Khair'][Math.floor(Math.random() * 4)],
              product: ['সুপার', 'লুম', 'কালার'][Math.floor(Math.random() * 3)],
              quantity: Math.floor(Math.random() * 10) + 1,
              purchasePrice,
              sellingPrice,
              profit: sellingPrice - purchasePrice
            });
          }
          
          // Calculate totals
          const totalAmount = items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
          const totalProfit = items.reduce((sum, item) => sum + (item.profit * item.quantity), 0);
          
          // Create sale record
          const sale = {
            id: `sale-${Date.now()}-${i}-${j}`,
            date: saleDate.toISOString(),
            customerName: ['আলি হোসেন', 'করিম মিয়া', 'আব্দুল রহমান', 'মঞ্জুর আলম', 'রফিকুল ইসলাম'][Math.floor(Math.random() * 5)],
            items,
            totalAmount,
            totalProfit,
            discount: Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0
          };
          
          pastWeekSales.push(sale);
        }
      }
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('sales', JSON.stringify(pastWeekSales));
      
      // Also update recent transactions
      setRecentTransactions(pastWeekSales.slice(0, 5).map(sale => ({
        id: sale.id,
        date: sale.date,
        customerName: sale.customerName,
        total: sale.totalAmount,
        items: sale.items.length
      })));
      
      // Update today's sales in stats
      const todaySales = pastWeekSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getDate() === today.getDate() && 
                saleDate.getMonth() === today.getMonth() && 
                saleDate.getFullYear() === today.getFullYear();
      });
      
      const todayTotal = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      setStats(prev => ({
        ...prev,
        recentSales: todayTotal
      }));
      
      await AsyncStorage.setItem('recentTransactions', JSON.stringify(pastWeekSales.slice(0, 5).map(sale => ({
        id: sale.id,
        date: sale.date,
        customerName: sale.customerName,
        total: sale.totalAmount,
        items: sale.items.length
      }))));
    } catch (error) {
      console.error('Error generating sample sales data:', error);
    }
  };
  
  // Update product stats
  const updateProductStats = useCallback(() => {
    if (products && products.length > 0) {
      const lowStockProducts = getLowStockProducts();
      
      // Show low stock alert
      if (lowStockProducts && lowStockProducts.length > 0) {
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
      setStats(prev => ({
        ...prev,
        totalProducts: products.length,
        lowStockCount: lowStockProducts ? lowStockProducts.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
      }));
    }
  }, [products, categories, getLowStockProducts, navigation]);

  // Refresh all data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      await loadSalesData();
      updateProductStats();
      
      // Get customer data
      if (getTopDebtors) {
        const debtors = getTopDebtors();
        setTopDebtors(debtors);
        
        // Calculate total outstanding credit
        const totalCredit = debtors.reduce((sum, debtor) => sum + debtor.outstandingCredit, 0);
        setStats(prev => ({
          ...prev,
          totalCustomers: debtors.length,
          outstandingCredit: totalCredit
        }));
      }
      
      // Get upcoming due payments
      if (getUpcomingDues) {
        const dues = getUpcomingDues(7); // Next 7 days
        setUpcomingDues(dues);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getLowStockProducts, getTopDebtors, getUpcomingDues, updateProductStats]);
  
  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      onRefresh();
      return () => {
        // Cleanup if needed
      };
    }, [onRefresh])
  );
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  // Handle navigation
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };
  
  const openDrawer = () => {
    navigation.openDrawer();
  };

  return {
    stats,
    recentTransactions,
    cartItems,
    topDebtors,
    upcomingDues,
    refreshing,
    onRefresh,
    formatDate,
    navigateTo,
    openDrawer,
  };
};

// MVVM architecture: View component that uses the ViewModel
const HomeScreen = () => {
  // Use the ViewModel
  const viewModel = useHomeViewModel();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <Header 
        title="ঘর তৈরির সরঞ্জাম" 
        showBackButton={false} 
        showMenuButton={true} 
        backgroundColor="#1565C0"
        textColor="#fff"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart-outline" size={28} color="#fff" />
              {viewModel.cartItems && viewModel.cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{viewModel.cartItems.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.refreshing}
            onRefresh={viewModel.onRefresh}
            colors={['#1565C0']}
          />
        }
      >
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>স্বাগতম</Text>
          <Text style={styles.businessName}>আপনার ব্যবসা</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#e3f2fd' }]}>
              <MaterialIcons name="inventory" size={24} color="#1565C0" />
            </View>
            <View>
              <Text style={styles.statValue}>{viewModel.stats.totalProducts}</Text>
              <Text style={styles.statLabel}>মোট পণ্য</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fce4ec' }]}>
              <MaterialIcons name="warning" size={24} color="#d81b60" />
            </View>
            <View>
              <Text style={styles.statValue}>{viewModel.stats.lowStockCount}</Text>
              <Text style={styles.statLabel}>কম স্টক</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f3e5f5' }]}>
              <FontAwesome5 name="money-bill-wave" size={18} color="#7b1fa2" />
            </View>
            <View>
              <Text style={styles.statValue}>{formatCurrency(viewModel.stats.recentSales)}</Text>
              <Text style={styles.statLabel}>আজকের বিক্রয়</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#e8f5e9' }]}>
              <MaterialIcons name="attach-money" size={24} color="#388e3c" />
            </View>
            <View>
              <Text style={styles.statValue}>{formatCurrency(viewModel.stats.outstandingCredit)}</Text>
              <Text style={styles.statLabel}>মোট বাকি</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>দ্রুত অ্যাকশন</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => viewModel.navigateTo('ProductSelection')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <MaterialIcons name="shopping-bag" size={24} color="#1565C0" />
              </View>
              <Text style={styles.actionText}>নতুন বিক্রয়</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => viewModel.navigateTo('StockManagement')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e8f5e9' }]}>
                <MaterialIcons name="add-box" size={24} color="#388e3c" />
              </View>
              <Text style={styles.actionText}>স্টক যোগ করুন</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => viewModel.navigateTo('ProductManagement')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#fff3e0' }]}>
                <MaterialIcons name="edit" size={24} color="#f57c00" />
              </View>
              <Text style={styles.actionText}>পণ্য ব্যবস্থাপনা</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => viewModel.navigateTo('CustomerManagement')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#f3e5f5' }]}>
                <MaterialIcons name="people" size={24} color="#7b1fa2" />
              </View>
              <Text style={styles.actionText}>কাস্টমার</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => viewModel.navigateTo('MaterialCalculator')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e0f7fa' }]}>
                <MaterialIcons name="calculate" size={24} color="#0097a7" />
              </View>
              <Text style={styles.actionText}>ক্যালকুলেটর</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => viewModel.navigateTo('Report')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#fff8e1' }]}>
                <MaterialIcons name="bar-chart" size={24} color="#ffa000" />
              </View>
              <Text style={styles.actionText}>রিপোর্ট</Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewModel.topDebtors && viewModel.topDebtors.length > 0 && (
          <View style={styles.outstandingContainer}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>বাকি ট্র্যাকিং</Text>
              <TouchableOpacity onPress={() => viewModel.navigateTo('CustomerManagement')}>
                <Text style={styles.seeAllText}>সব দেখুন</Text>
              </TouchableOpacity>
            </View>
            
            {viewModel.topDebtors.slice(0, 3).map((debtor) => (
              <View key={debtor.id} style={styles.debtorCard}>
                <View style={styles.debtorInfo}>
                  <Text style={styles.debtorName}>{debtor.name}</Text>
                  <Text style={styles.debtorPhone}>{debtor.phone}</Text>
                </View>
                <View style={styles.debtorAmount}>
                  <Text style={styles.debtorAmountText}>
                    {formatCurrency(debtor.outstandingCredit)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.recentTransactionsContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>সাম্প্রতিক বিক্রয়</Text>
            <TouchableOpacity onPress={() => viewModel.navigateTo('Report')}>
              <Text style={styles.seeAllText}>সব দেখুন</Text>
            </TouchableOpacity>
          </View>
          
          {viewModel.recentTransactions && viewModel.recentTransactions.length > 0 ? (
            viewModel.recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionDate}>{viewModel.formatDate(transaction.date)}</Text>
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

        <View style={styles.materialCalcPromo}>
          <View style={styles.materialCalcContent}>
            <MaterialCommunityIcons name="home-roof" size={34} color="#fff" />
            <View style={styles.materialCalcText}>
              <Text style={styles.materialCalcTitle}>নির্মাণ সামগ্রী হিসাব করুন</Text>
              <Text style={styles.materialCalcDescription}>
                আপনার প্রয়োজনীয় টিন, ইট, সিমেন্ট ইত্যাদি হিসাব করতে ক্যালকুলেটর ব্যবহার করুন
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.materialCalcButton}
            onPress={() => viewModel.navigateTo('MaterialCalculator')}
          >
            <Text style={styles.materialCalcButtonText}>ক্যালকুলেটর খুলুন</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
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
    backgroundColor: '#1565C0',
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
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: -24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#1565C0',
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 8,
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
  outstandingContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  debtorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  debtorInfo: {
    flex: 1,
  },
  debtorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  debtorPhone: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  debtorAmount: {
    justifyContent: 'center',
  },
  debtorAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
  },
  recentTransactionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 8,
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
    color: '#1565C0',
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
  materialCalcPromo: {
    backgroundColor: '#1565C0',
    marginHorizontal: 12,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  materialCalcContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  materialCalcText: {
    flex: 1,
    marginLeft: 12,
  },
  materialCalcTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  materialCalcDescription: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  materialCalcButton: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  materialCalcButtonText: {
    color: '#1565C0',
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },
});

export default HomeScreen;