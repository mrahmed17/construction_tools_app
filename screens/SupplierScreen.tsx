import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupplierType } from '../types';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

// MVVM architecture: View Model for Supplier Management operations
const useSupplierViewModel = () => {
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [supplierCompany, setSupplierCompany] = useState('');
  const [supplierBalance, setSupplierBalance] = useState('0');
  
  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
  }, []);
  
  // Filter suppliers when search text changes
  useEffect(() => {
    filterSuppliers();
  }, [searchText, suppliers]);
  
  // Load suppliers from storage
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const storedSuppliers = await AsyncStorage.getItem('suppliers');
      if (storedSuppliers) {
        const parsedSuppliers = JSON.parse(storedSuppliers);
        setSuppliers(parsedSuppliers);
        setFilteredSuppliers(parsedSuppliers);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      Alert.alert('ত্রুটি', 'সাপ্লাইয়ার তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };
  
  // Save suppliers to storage
  const saveSuppliers = async (updatedSuppliers: SupplierType[]) => {
    try {
      await AsyncStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    } catch (error) {
      console.error('Error saving suppliers:', error);
      Alert.alert('ত্রুটি', 'সাপ্লাইয়ার তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
    }
  };
  
  // Filter suppliers based on search text
  const filterSuppliers = () => {
    if (!searchText.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }
    
    const filtered = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.phone.includes(searchText) ||
      supplier.company.toLowerCase().includes(searchText.toLowerCase())
    );
    
    setFilteredSuppliers(filtered);
  };
  
  // Add new supplier
  const addSupplier = () => {
    if (!supplierName.trim() || !supplierPhone.trim() || !supplierCompany.trim()) {
      Alert.alert('ত্রুটি', 'সাপ্লাইয়ারের নাম, ফোন নম্বর এবং কোম্পানি প্রয়োজন।');
      return;
    }
    
    const newSupplier: SupplierType = {
      id: Date.now().toString(),
      name: supplierName,
      phone: supplierPhone,
      address: supplierAddress,
      email: supplierEmail,
      notes: supplierNotes,
      company: supplierCompany,
      balance: parseFloat(supplierBalance) || 0,
      createdAt: new Date().toISOString()
    };
    
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);
    resetForm();
    setIsModalVisible(false);
  };
  
  // Update existing supplier
  const updateSupplier = () => {
    if (!editingSupplier) return;
    
    if (!supplierName.trim() || !supplierPhone.trim() || !supplierCompany.trim()) {
      Alert.alert('ত্রুটি', 'সাপ্লাইয়ারের নাম, ফোন নম্বর এবং কোম্পানি প্রয়োজন।');
      return;
    }
    
    const updatedSupplier: SupplierType = {
      ...editingSupplier,
      name: supplierName,
      phone: supplierPhone,
      address: supplierAddress,
      email: supplierEmail,
      notes: supplierNotes,
      company: supplierCompany,
      balance: parseFloat(supplierBalance) || 0
    };
    
    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === editingSupplier.id ? updatedSupplier : supplier
    );
    
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);
    resetForm();
    setIsModalVisible(false);
  };
  
  // Delete supplier
  const deleteSupplier = (id: string) => {
    Alert.alert(
      'নিশ্চিতকরণ',
      'আপনি কি এই সাপ্লাইয়ারকে মুছে ফেলতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        { 
          text: 'মুছুন', 
          style: 'destructive',
          onPress: () => {
            const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
            setSuppliers(updatedSuppliers);
            saveSuppliers(updatedSuppliers);
          }
        }
      ]
    );
  };
  
  // Edit supplier
  const editSupplier = (supplier: SupplierType) => {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setSupplierPhone(supplier.phone);
    setSupplierAddress(supplier.address || '');
    setSupplierEmail(supplier.email || '');
    setSupplierNotes(supplier.notes || '');
    setSupplierCompany(supplier.company);
    setSupplierBalance(supplier.balance.toString());
    setIsModalVisible(true);
  };
  
  // Reset form fields
  const resetForm = () => {
    setEditingSupplier(null);
    setSupplierName('');
    setSupplierPhone('');
    setSupplierAddress('');
    setSupplierEmail('');
    setSupplierNotes('');
    setSupplierCompany('');
    setSupplierBalance('0');
  };
  
  return {
    suppliers,
    filteredSuppliers,
    loading,
    searchText,
    setSearchText,
    isModalVisible,
    setIsModalVisible,
    editingSupplier,
    supplierName,
    setSupplierName,
    supplierPhone,
    setSupplierPhone,
    supplierAddress,
    setSupplierAddress,
    supplierEmail,
    setSupplierEmail,
    supplierNotes,
    setSupplierNotes,
    supplierCompany,
    setSupplierCompany,
    supplierBalance,
    setSupplierBalance,
    loadSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    editSupplier,
    resetForm
  };
};

// Supplier Screen Component
export default function SupplierScreen() {
  const navigation = useNavigation();
  const viewModel = useSupplierViewModel();
  
  // Render supplier item
  const renderSupplierItem = ({ item }: { item: SupplierType }) => (
    <View style={styles.supplierCard}>
      <View style={styles.supplierHeader}>
        <Text style={styles.supplierName}>{item.name}</Text>
        <Text style={styles.supplierCompany}>{item.company}</Text>
      </View>
      
      <View style={styles.supplierDetails}>
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
        
        {item.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#555" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={16} color="#555" />
          <Text style={styles.detailText}>
            বাকি: ৳{item.balance.toLocaleString()}
          </Text>
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>নোট:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => viewModel.editSupplier(item)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>সম্পাদনা</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => viewModel.deleteSupplier(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>মুছুন</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  if (viewModel.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>সাপ্লাইয়ার তথ্য লোড হচ্ছে...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="সাপ্লাইয়ার ব্যবস্থাপনা" />
      
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="সাপ্লাইয়ার খুঁজুন..."
          value={viewModel.searchText}
          onChangeText={viewModel.setSearchText}
        />
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            viewModel.resetForm();
            viewModel.setIsModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={viewModel.filteredSuppliers}
        renderItem={renderSupplierItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.suppliersList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {viewModel.searchText ? 'কোন সাপ্লাইয়ার পাওয়া যায়নি' : 'কোন সাপ্লাইয়ার নেই'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => {
                viewModel.resetForm();
                viewModel.setIsModalVisible(true);
              }}
            >
              <Text style={styles.emptyButtonText}>সাপ্লাইয়ার যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Supplier Add/Edit Modal */}
      <Modal
        visible={viewModel.isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => viewModel.setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {viewModel.editingSupplier ? 'সাপ্লাইয়ার সম্পাদনা' : 'নতুন সাপ্লাইয়ার'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="সাপ্লাইয়ারের নাম"
                value={viewModel.supplierName}
                onChangeText={viewModel.setSupplierName}
              />
              
              <TextInput
                style={styles.input}
                placeholder="কোম্পানি"
                value={viewModel.supplierCompany}
                onChangeText={viewModel.setSupplierCompany}
              />
              
              <TextInput
                style={styles.input}
                placeholder="ফোন নম্বর"
                keyboardType="phone-pad"
                value={viewModel.supplierPhone}
                onChangeText={viewModel.setSupplierPhone}
              />
              
              <TextInput
                style={styles.input}
                placeholder="ঠিকানা"
                value={viewModel.supplierAddress}
                onChangeText={viewModel.setSupplierAddress}
              />
              
              <TextInput
                style={styles.input}
                placeholder="ইমেইল"
                keyboardType="email-address"
                value={viewModel.supplierEmail}
                onChangeText={viewModel.setSupplierEmail}
              />
              
              <TextInput
                style={styles.input}
                placeholder="বাকি পরিমাণ"
                keyboardType="numeric"
                value={viewModel.supplierBalance}
                onChangeText={viewModel.setSupplierBalance}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="নোট"
                multiline={true}
                numberOfLines={4}
                value={viewModel.supplierNotes}
                onChangeText={viewModel.setSupplierNotes}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => viewModel.setIsModalVisible(false)}
                >
                  <Text style={styles.buttonText}>বাতিল</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={viewModel.editingSupplier ? viewModel.updateSupplier : viewModel.addSupplier}
                >
                  <Text style={styles.buttonText}>সংরক্ষণ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  suppliersList: {
    padding: 16,
  },
  supplierCard: {
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
  supplierHeader: {
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  supplierCompany: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    marginTop: 2,
  },
  supplierDetails: {
    marginBottom: 12,
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
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
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
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
});