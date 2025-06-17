import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

// Report Screen Component
export default function ReportScreen() {
  const navigation = useNavigation();
  const { products, loading: productsLoading } = useProducts();
  const { orders, loading: ordersLoading } = useCart();
  
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [timeFrame, setTimeFrame] = useState('today');
  
  // Calculate report data
  const inventoryReport = React.useMemo(() => {
    if (!products) return { totalItems: 0, lowStock: 0, totalValue: 0 };
    
    const totalItems = products.length;
    const lowStock = products.filter(p => (p.quantity || 0) < 10).length;
    const totalValue = products.reduce((sum, p) => sum + ((p.purchasePrice || 0) * (p.quantity || 0)), 0);
    
    return { totalItems, lowStock, totalValue };
  }, [products]);
  
  // Calculate sales data
  const salesReport = React.useMemo(() => {
    if (!orders) return { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      const today = new Date();
      
      switch(timeFrame) {
        case 'today':
          return orderDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
    
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    return { totalSales, totalOrders, averageOrderValue };
  }, [orders, timeFrame]);
  
  if (productsLoading || ordersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>রিপোর্ট লোড হচ্ছে...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="রিপোর্ট" />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, selectedReport === 'inventory' && styles.activeTab]}
          onPress={() => setSelectedReport('inventory')}
        >
          <Text style={[styles.tabText, selectedReport === 'inventory' && styles.activeTabText]}>
            ইনভেন্টরি রিপোর্ট
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, selectedReport === 'sales' && styles.activeTab]}
          onPress={() => setSelectedReport('sales')}
        >
          <Text style={[styles.tabText, selectedReport === 'sales' && styles.activeTabText]}>
            বিক্রয় রিপোর্ট
          </Text>
        </TouchableOpacity>
      </View>
      
      {selectedReport === 'inventory' ? (
        <ScrollView style={styles.reportContainer}>
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>ইনভেন্টরি সারাংশ</Text>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventoryReport.totalItems}</Text>
                <Text style={styles.statLabel}>মোট পণ্য</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: inventoryReport.lowStock > 0 ? '#e74c3c' : '#2ecc71' }]}>
                  {inventoryReport.lowStock}
                </Text>
                <Text style={styles.statLabel}>কম স্টক</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalValueContainer}>
              <Text style={styles.totalValueLabel}>মোট ইনভেন্টরি মূল্য:</Text>
              <Text style={styles.totalValueAmount}>৳ {inventoryReport.totalValue.toLocaleString()}</Text>
            </View>
          </View>
          
          {inventoryReport.lowStock > 0 && (
            <View style={styles.alertCard}>
              <Ionicons name="warning-outline" size={24} color="#e74c3c" />
              <Text style={styles.alertText}>
                {inventoryReport.lowStock}টি পণ্যের স্টক কম! অনুগ্রহ করে স্টক আপডেট করুন।
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductManagement')}
          >
            <Ionicons name="cube-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>পণ্য ব্যবস্থাপনা</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.reportContainer}>
          <View style={styles.timeFrameContainer}>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'today' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('today')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'today' && styles.activeTimeFrameText]}>আজ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'week' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('week')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'week' && styles.activeTimeFrameText]}>সাপ্তাহিক</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'month' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('month')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'month' && styles.activeTimeFrameText]}>মাসিক</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>বিক্রয় সারাংশ</Text>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{salesReport.totalOrders}</Text>
                <Text style={styles.statLabel}>মোট অর্ডার</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>৳ {salesReport.averageOrderValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</Text>
                <Text style={styles.statLabel}>গড় অর্ডার মূল্য</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalValueContainer}>
              <Text style={styles.totalValueLabel}>মোট বিক্রয়:</Text>
              <Text style={styles.totalValueAmount}>৳ {salesReport.totalSales.toLocaleString()}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // Navigate to detailed sales report or export
              Alert.alert('বিস্তারিত রিপোর্ট', 'এই ফিচারটি শীঘ্রই আসছে!');
            }}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>রিপোর্ট ডাউনলোড করুন</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  activeTabText: {
    color: '#fff',
  },
  reportContainer: {
    flex: 1,
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 16,
  },
  totalValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalValueLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  totalValueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  alertCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  alertText: {
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTimeFrame: {
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  timeFrameText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  activeTimeFrameText: {
    color: '#fff',
    fontWeight: '500',
  },
});