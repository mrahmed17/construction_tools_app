import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCustomer } from '../context/CustomerContext';
import { CustomerModel, CreditHistoryItem } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

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
    if (!searchQuery.trim()) return customers;
    
    const query = searchQuery.toLowerCase();
    return customers.filter(
      customer => 
        customer.name.toLowerCase().includes(query) || 
        customer.phone.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  // Refresh customer data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In a real app with backend, we would fetch fresh data here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Add new customer
  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      Alert.alert('ত্রুটি', 'নাম এবং ফোন নম্বর দিতে হবে');
      return;
    }
    
    try {
      const customerData = {
        ...newCustomer,
        creditLimit: parseFloat(newCustomer.creditLimit) || 5000
      };
      
      await addCustomer(customerData);
      
      setNewCustomer({
        name: '',
        phone: '',
        address: '',
        creditLimit: '5000'
      });
      
      setModalVisible(false);
      Alert.alert('সফল', 'কাস্টমার যোগ করা হয়েছে');
    } catch (err) {
      Alert.alert('ত্রুটি', 'কাস্টমার যোগ করা যায়নি');
    }
  };

  // Delete customer
  const handleDeleteCustomer = (customerId: string) => {
    Alert.alert(
      'নিশ্চিতকরণ',
      'আপনি কি এই কাস্টমার মুছে ফেলতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        { 
          text: 'হ্যাঁ', 
          onPress: async () => {
            await deleteCustomer(customerId);
          }
        }
      ]
    );
  };

  // Record payment from customer
  const handleRecordPayment = async () => {
    if (!selectedCustomer) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('ত্রুটি', 'সঠিক পরিমাণ দিন');
      return;
    }
    
    try {
      await recordPayment(selectedCustomer.id, amount, 'মেনুয়াল পেমেন্ট');
      setPaymentAmount('');
      setPaymentModalVisible(false);
      Alert.alert('সফল', 'পেমেন্ট রেকর্ড করা হয়েছে');
    } catch (err) {
      Alert.alert('ত্রুটি', 'পেমেন্ট রেকর্ড করা যায়নি');
    }
  };
  
  return {
    customers: filteredCustomers,
    loading,
    refreshing,
    onRefresh,
    searchQuery,
    setSearchQuery,
    modalVisible,
    setModalVisible,
    newCustomer,
    setNewCustomer,
    handleAddCustomer,
    handleDeleteCustomer,
    selectedCustomer,
    setSelectedCustomer,
    paymentAmount,
    setPaymentAmount,
    paymentModalVisible, 
    setPaymentModalVisible,
    handleRecordPayment
  };
};

// MVVM architecture: View component that uses the ViewModel
const CustomerManagementScreen = () => {
  const navigation = useNavigation();
  const viewModel = useCustomerViewModel();
  
  // Render individual customer item
  const renderCustomerItem = ({ item }: { item: CustomerModel }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <Text style={styles.customerName}>{item.name}</Text>
        <View style={[
          styles.creditBadge,
          item.outstandingCredit > 0 ? styles.creditBadgeWarning : styles.creditBadgeGood
        ]}>
          <Text style={styles.creditBadgeText}>
            {item.outstandingCredit > 0 ? 'বাকি আছে' : 'কোন বাকি নেই'}
          </Text>
        </View>
      </View>
      
      <View style={styles.customerInfo}>
        <Ionicons name="call-outline" size={16} color="#555" />
        <Text style={styles.customerPhone}>{item.phone}</Text>
      </View>
      
      {item.address ? (
        <View style={styles.customerInfo}>
          <Ionicons name="location-outline" size={16} color="#555" />
          <Text style={styles.customerAddress}>{item.address}</Text>
        </View>
      ) : null}
      
      <View style={styles.creditContainer}>
        <View style={styles.creditItem}>
          <Text style={styles.creditLabel}>ক্রেডিট লিমিট</Text>
          <Text style={styles.creditValue}>{formatCurrency(item.creditLimit)}</Text>
        </View>
        
        <View style={styles.creditItem}>
          <Text style={styles.creditLabel}>বাকির পরিমাণ</Text>
          <Text style={[
            styles.creditValue,
            item.outstandingCredit > 0 && styles.outstandingCredit
          ]}>
            {formatCurrency(item.outstandingCredit)}
          </Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => viewModel.setSelectedCustomer(item)}
        >
          <Text style={styles.detailsButtonText}>বিস্তারিত</Text>
        </TouchableOpacity>
        
        {item.outstandingCredit > 0 && (
          <TouchableOpacity 
            style={styles.paymentButton}
            onPress={() => {
              viewModel.setSelectedCustomer(item);
              viewModel.setPaymentModalVisible(true);
            }}
          >
            <Text style={styles.paymentButtonText}>পেমেন্ট</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => viewModel.handleDeleteCustomer(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render credit history item
  const renderCreditHistoryItem = ({ item }: { item: CreditHistoryItem }) => (
    <View style={[
      styles.historyItem,
      item.type === 'purchase' ? styles.purchaseItem : styles.paymentItem
    ]}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyType}>
          {item.type === 'purchase' ? 'বাকি' : 'পেমেন্ট'}
        </Text>
        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.historyAmount}>
        <Text style={[
          styles.amountValue,
          item.type === 'purchase' ? styles.purchaseAmount : styles.paymentAmount
        ]}>
          {item.type === 'purchase' ? '-' : '+'} {formatCurrency(item.amount)}
        </Text>
        {item.dueDate && (
          <Text style={styles.dueDate}>
            শোধের তারিখ: {formatDate(item.dueDate)}
          </Text>
        )}
      </View>
      
      {item.notes && (
        <Text style={styles.historyNotes}>{item.notes}</Text>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>কাস্টমার ম্যানেজমেন্ট</Text>
        <TouchableOpacity onPress={() => viewModel.setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="#1565C0" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="কাস্টমার খুঁজুন..."
          value={viewModel.searchQuery}
          onChangeText={viewModel.setSearchQuery}
        />
      </View>
      
      <FlatList
        data={viewModel.customers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={viewModel.refreshing} 
            onRefresh={viewModel.onRefresh} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={50} color="#ccc" />
            <Text style={styles.emptyText}>কোন কাস্টমার নেই</Text>
            <Text style={styles.emptySubtext}>
              কাস্টমার যোগ করতে উপরের "+" আইকনে ক্লিক করুন
            </Text>
          </View>
        }
      />
      
      {/* Add Customer Modal */}
      <Modal
        visible={viewModel.modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন কাস্টমার যোগ করুন</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>নাম</Text>
              <TextInput
                style={styles.input}
                placeholder="কাস্টমারের নাম"
                value={viewModel.newCustomer.name}
                onChangeText={(text) => viewModel.setNewCustomer({
                  ...viewModel.newCustomer,
                  name: text
                })}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ফোন নম্বর</Text>
              <TextInput
                style={styles.input}
                placeholder="ফোন নম্বর"
                keyboardType="phone-pad"
                value={viewModel.newCustomer.phone}
                onChangeText={(text) => viewModel.setNewCustomer({
                  ...viewModel.newCustomer,
                  phone: text
                })}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ঠিকানা</Text>
              <TextInput
                style={styles.input}
                placeholder="ঠিকানা"
                value={viewModel.newCustomer.address}
                onChangeText={(text) => viewModel.setNewCustomer({
                  ...viewModel.newCustomer,
                  address: text
                })}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ক্রেডিট লিমিট</Text>
              <TextInput
                style={styles.input}
                placeholder="ক্রেডিট লিমিট (টাকা)"
                keyboardType="numeric"
                value={viewModel.newCustomer.creditLimit}
                onChangeText={(text) => viewModel.setNewCustomer({
                  ...viewModel.newCustomer,
                  creditLimit: text
                })}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => viewModel.setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={viewModel.handleAddCustomer}
              >
                <Text style={styles.saveButtonText}>সেভ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Customer Details Modal */}
      <Modal
        visible={!!viewModel.selectedCustomer}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>কাস্টমার বিস্তারিত</Text>
              <TouchableOpacity onPress={() => viewModel.setSelectedCustomer(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {viewModel.selectedCustomer && (
              <>
                <View style={styles.customerDetailHeader}>
                  <Text style={styles.customerDetailName}>{viewModel.selectedCustomer.name}</Text>
                  <View style={[
                    styles.creditBadge,
                    viewModel.selectedCustomer.outstandingCredit > 0 
                      ? styles.creditBadgeWarning 
                      : styles.creditBadgeGood
                  ]}>
                    <Text style={styles.creditBadgeText}>
                      {viewModel.selectedCustomer.outstandingCredit > 0 ? 'বাকি আছে' : 'কোন বাকি নেই'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ফোন নম্বর</Text>
                  <Text style={styles.detailValue}>{viewModel.selectedCustomer.phone}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ঠিকানা</Text>
                  <Text style={styles.detailValue}>
                    {viewModel.selectedCustomer.address || 'কোন ঠিকানা নেই'}
                  </Text>
                </View>
                
                <View style={styles.detailStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {viewModel.selectedCustomer.totalPurchases}
                    </Text>
                    <Text style={styles.statLabel}>মোট লেনদেন</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatCurrency(viewModel.selectedCustomer.creditLimit)}
                    </Text>
                    <Text style={styles.statLabel}>ক্রেডিট লিমিট</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[
                      styles.statValue, 
                      viewModel.selectedCustomer.outstandingCredit > 0 && styles.outstandingCredit
                    ]}>
                      {formatCurrency(viewModel.selectedCustomer.outstandingCredit)}
                    </Text>
                    <Text style={styles.statLabel}>বাকির পরিমাণ</Text>
                  </View>
                </View>
                
                <Text style={styles.historyTitle}>লেনদেনের ইতিহাস</Text>
                
                <FlatList
                  data={viewModel.selectedCustomer.history}
                  keyExtractor={(item) => item.id}
                  renderItem={renderCreditHistoryItem}
                  style={styles.historyList}
                  ListEmptyComponent={
                    <Text style={styles.emptyHistory}>কোন লেনদেনের ইতিহাস নেই</Text>
                  }
                />
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Payment Modal */}
      <Modal
        visible={viewModel.paymentModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent} style={[styles.modalContent, styles.paymentModal]}>
            <Text style={styles.modalTitle}>পেমেন্ট রেকর্ড করুন</Text>
            
            {viewModel.selectedCustomer && (
              <>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentCustomer}>{viewModel.selectedCustomer.name}</Text>
                  <Text style={styles.paymentBalance}>
                    বর্তমান বাকি: {formatCurrency(viewModel.selectedCustomer.outstandingCredit)}
                  </Text>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>পেমেন্টের পরিমাণ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="পেমেন্টের পরিমাণ"
                    keyboardType="numeric"
                    value={viewModel.paymentAmount}
                    onChangeText={viewModel.setPaymentAmount}
                  />
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => viewModel.setPaymentModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>বাতিল</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={viewModel.handleRecordPayment}
                  >
                    <Text style={styles.saveButtonText}>রেকর্ড করুন</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  creditBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  creditBadgeGood: {
    backgroundColor: '#e6f4ea',
  },
  creditBadgeWarning: {
    backgroundColor: '#fef7e6',
  },
  creditBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#43a047',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerPhone: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  customerAddress: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  creditContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 16,
  },
  creditItem: {
    flex: 1,
  },
  creditLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  creditValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  outstandingCredit: {
    color: '#f57c00',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#1565C0',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginRight: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#43a047',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginRight: 8,
  },
  paymentButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#e53935',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#777',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  customerDetailHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  detailStats: {
    flexDirection: 'row',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    color: '#333',
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  purchaseItem: {
    backgroundColor: '#fff3e0',
  },
  paymentItem: {
    backgroundColor: '#e8f5e9',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyType: {
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 12,
    color: '#777',
  },
  historyAmount: {
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseAmount: {
    color: '#f57c00',
  },
  paymentAmount: {
    color: '#43a047',
  },
  dueDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  historyNotes: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  emptyHistory: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  paymentModal: {
    padding: 24,
  },
  paymentInfo: {
    marginBottom: 16,
  },
  paymentCustomer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentBalance: {
    fontSize: 16,
    color: '#777',
  },
});

export default CustomerManagementScreen;