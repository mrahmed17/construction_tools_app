import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCustomer } from '../context/CustomerContext';
import { CustomerModel, CreditHistoryItem } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

// MVVM architecture: View Model for Customer Management operations
const useCustomerViewModel = () => {
  const {
    customers, 
    loading, 
    error, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    getTopDebtors,
    recordPayment
  } = useCustomer();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerModel | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: '5000'
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  // Filtered customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim() || !customers) return customers || [];
    
    const query = searchQuery.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(query) || 
      customer.phone.includes(query) ||
      customer.address.toLowerCase().includes(query)
    );
  }, [searchQuery, customers]);

  // Top debtors with highest outstanding balance
  const topDebtors = useMemo(() => {
    if (!customers) return [];
    return [...customers]
      .sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0))
      .slice(0, 5);
  }, [customers]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refresh customers data
    setRefreshing(false);
  }, []);

  // Handle adding new customer
  const handleAddCustomer = useCallback(() => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      Alert.alert('ত্রুটি', 'কাস্টমারের নাম এবং ফোন নম্বর প্রয়োজন।');
      return;
    }

    const customerData = {
      ...newCustomer,
      id: Date.now().toString(),
      outstandingBalance: 0,
      creditLimit: parseFloat(newCustomer.creditLimit) || 5000,
      creditHistory: [],
      createdAt: new Date().toISOString()
    };

    addCustomer(customerData);
    setNewCustomer({ name: '', phone: '', address: '', creditLimit: '5000' });
    setModalVisible(false);
  }, [newCustomer, addCustomer]);

  // Handle updating customer
  const handleUpdateCustomer = useCallback(() => {
    if (!selectedCustomer) return;
    
    if (!selectedCustomer.name.trim() || !selectedCustomer.phone.trim()) {
      Alert.alert('ত্রুটি', 'কাস্টমারের নাম এবং ফোন নম্বর প্রয়োজন।');
      return;
    }

    updateCustomer(selectedCustomer);
    setSelectedCustomer(null);
    setModalVisible(false);
  }, [selectedCustomer, updateCustomer]);

  // Handle deleting customer
  const handleDeleteCustomer = useCallback((customer: CustomerModel) => {
    Alert.alert(
      'নিশ্চিতকরণ',
      `আপনি কি "${customer.name}" কাস্টমারকে মুছে ফেলতে চান?`,
      [
        { text: 'বাতিল', style: 'cancel' },
        { 
          text: 'মুছুন', 
          style: 'destructive',
          onPress: () => deleteCustomer(customer.id)
        }
      ]
    );
  }, [deleteCustomer]);

  // Handle recording payment
  const handleRecordPayment = useCallback(() => {
    if (!selectedCustomer) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('ত্রুটি', 'একটি বৈধ পরিমাণ প্রবেশ করুন।');
      return;
    }

    const paymentData: CreditHistoryItem = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString(),
      type: 'payment',
      description: 'পেমেন্ট রেকর্ড করা হয়েছে'
    };

    recordPayment(selectedCustomer.id, paymentData);
    setPaymentAmount('');
    setPaymentModalVisible(false);
    setSelectedCustomer(null);
  }, [selectedCustomer, paymentAmount, recordPayment]);

  return {
    customers,
    filteredCustomers,
    topDebtors,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    modalVisible,
    setModalVisible,
    selectedCustomer,
    setSelectedCustomer,
    newCustomer,
    setNewCustomer,
    handleRefresh,
    handleAddCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    paymentAmount,
    setPaymentAmount,
    paymentModalVisible,
    setPaymentModalVisible,
    handleRecordPayment
  };
};

// Customer Management Screen Component
export default function CustomerManagementScreen() {
  const navigation = useNavigation();
  const viewModel = useCustomerViewModel();
  
  // Render customer item
  const renderCustomerItem = ({ item }: { item: CustomerModel }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <Text style={styles.customerName}>{item.name}</Text>
        <View style={[
          styles.balanceBadge, 
          (item.outstandingBalance || 0) > 0 ? styles.debtBadge : styles.noBadge
        ]}>
          <Text style={styles.balanceText}>
            {(item.outstandingBalance || 0) > 0 
              ? `৳${(item.outstandingBalance || 0).toLocaleString()}`
              : 'কোন বাকি নেই'}
          </Text>
        </View>
      </View>
      
      <View style={styles.customerDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#555" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        
        {item.address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#555" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={16} color="#555" />
          <Text style={styles.detailText}>ক্রেডিট লিমিট: ৳{(item.creditLimit || 0).toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            viewModel.setSelectedCustomer(item);
            viewModel.setModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>সম্পাদনা</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.paymentButton]}
          onPress={() => {
            viewModel.setSelectedCustomer(item);
            viewModel.setPaymentModalVisible(true);
          }}
        >
          <Ionicons name="cash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>পেমেন্ট</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => viewModel.handleDeleteCustomer(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>মুছুন</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render top debtor item
  const renderDebtorItem = ({ item }: { item: CustomerModel }) => (
    <TouchableOpacity 
      style={styles.debtorCard}
      onPress={() => {
        viewModel.setSelectedCustomer(item);
        viewModel.setPaymentModalVisible(true);
      }}
    >
      <Text style={styles.debtorName}>{item.name}</Text>
      <Text style={styles.debtorAmount}>৳{(item.outstandingBalance || 0).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="কাস্টমার ব্যবস্থাপনা" />
      
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="কাস্টমার খুঁজুন..."
          value={viewModel.searchQuery}
          onChangeText={viewModel.setSearchQuery}
        />
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            viewModel.setSelectedCustomer(null);
            viewModel.setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {viewModel.topDebtors.length > 0 && (
        <View style={styles.debtorsContainer}>
          <Text style={styles.sectionTitle}>সর্বোচ্চ বাকিদার</Text>
          <FlatList
            data={viewModel.topDebtors}
            renderItem={renderDebtorItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.debtorsList}
          />
        </View>
      )}
      
      <FlatList
        data={viewModel.filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.customersList}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.refreshing}
            onRefresh={viewModel.handleRefresh}
            colors={['#2c3e50']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {viewModel.searchQuery ? 'কোন কাস্টমার পাওয়া যায়নি' : 'কোন কাস্টমার নেই'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => {
                viewModel.setSelectedCustomer(null);
                viewModel.setModalVisible(true);
              }}
            >
              <Text style={styles.emptyButtonText}>কাস্টমার যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Customer Add/Edit Modal */}
      <Modal
        visible={viewModel.modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => viewModel.setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {viewModel.selectedCustomer ? 'কাস্টমার সম্পাদনা' : 'নতুন কাস্টমার'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="কাস্টমারের নাম"
              value={viewModel.selectedCustomer ? viewModel.selectedCustomer.name : viewModel.newCustomer.name}
              onChangeText={(text) => {
                if (viewModel.selectedCustomer) {
                  viewModel.setSelectedCustomer({
                    ...viewModel.selectedCustomer,
                    name: text
                  });
                } else {
                  viewModel.setNewCustomer({
                    ...viewModel.newCustomer,
                    name: text
                  });
                }
              }}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ফোন নম্বর"
              keyboardType="phone-pad"
              value={viewModel.selectedCustomer ? viewModel.selectedCustomer.phone : viewModel.newCustomer.phone}
              onChangeText={(text) => {
                if (viewModel.selectedCustomer) {
                  viewModel.setSelectedCustomer({
                    ...viewModel.selectedCustomer,
                    phone: text
                  });
                } else {
                  viewModel.setNewCustomer({
                    ...viewModel.newCustomer,
                    phone: text
                  });
                }
              }}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ঠিকানা"
              value={viewModel.selectedCustomer ? viewModel.selectedCustomer.address : viewModel.newCustomer.address}
              onChangeText={(text) => {
                if (viewModel.selectedCustomer) {
                  viewModel.setSelectedCustomer({
                    ...viewModel.selectedCustomer,
                    address: text
                  });
                } else {
                  viewModel.setNewCustomer({
                    ...viewModel.newCustomer,
                    address: text
                  });
                }
              }}
            />
            
            <TextInput
              style={styles.input}
              placeholder="ক্রেডিট লিমিট"
              keyboardType="numeric"
              value={viewModel.selectedCustomer 
                ? viewModel.selectedCustomer.creditLimit?.toString() 
                : viewModel.newCustomer.creditLimit
              }
              onChangeText={(text) => {
                if (viewModel.selectedCustomer) {
                  viewModel.setSelectedCustomer({
                    ...viewModel.selectedCustomer,
                    creditLimit: parseFloat(text) || 0
                  });
                } else {
                  viewModel.setNewCustomer({
                    ...viewModel.newCustomer,
                    creditLimit: text
                  });
                }
              }}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => viewModel.setModalVisible(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={viewModel.selectedCustomer 
                  ? viewModel.handleUpdateCustomer 
                  : viewModel.handleAddCustomer
                }
              >
                <Text style={styles.buttonText}>সংরক্ষণ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Payment Modal */}
      <Modal
        visible={viewModel.paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => viewModel.setPaymentModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>পেমেন্ট রেকর্ড</Text>
            
            {viewModel.selectedCustomer && (
              <View style={styles.paymentCustomerInfo}>
                <Text style={styles.paymentCustomerName}>{viewModel.selectedCustomer.name}</Text>
                <Text style={styles.paymentCustomerBalance}>
                  বর্তমান বাকি: ৳{(viewModel.selectedCustomer.outstandingBalance || 0).toLocaleString()}
                </Text>
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="পেমেন্ট পরিমাণ"
              keyboardType="numeric"
              value={viewModel.paymentAmount}
              onChangeText={viewModel.setPaymentAmount}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => viewModel.setPaymentModalVisible(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={viewModel.handleRecordPayment}
              >
                <Text style={styles.buttonText}>রেকর্ড করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButton: {
    backgroundColor: '#2c3e50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  debtorsContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  debtorsList: {
    paddingHorizontal: 12,
  },
  debtorCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    width: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  debtorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  debtorAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  customersList: {
    padding: 16,
    paddingTop: 8,
  },
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  balanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  debtBadge: {
    backgroundColor: '#fef2f2',
  },
  noBadge: {
    backgroundColor: '#f0fff4',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e74c3c',
  },
  customerDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  paymentButton: {
    backgroundColor: '#2ecc71',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  paymentCustomerInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentCustomerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  paymentCustomerBalance: {
    fontSize: 14,
    color: '#e74c3c',
  },
});