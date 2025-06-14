import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupplierType } from '../types';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

export default function SupplierScreen() {
  const navigation = useNavigation();
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
      const suppliersJson = await AsyncStorage.getItem('suppliers');
      
      if (suppliersJson) {
        const loadedSuppliers: SupplierType[] = JSON.parse(suppliersJson);
        setSuppliers(loadedSuppliers);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      Alert.alert('Error', 'Failed to load supplier data');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter suppliers based on search text
  const filterSuppliers = () => {
    if (!searchText) {
      setFilteredSuppliers(suppliers);
      return;
    }
    
    const lowerCaseSearch = searchText.toLowerCase();
    const filtered = suppliers.filter(s => 
      (s.name && s.name.toLowerCase().includes(lowerCaseSearch)) ||
      (s.phone && s.phone.includes(searchText)) ||
      (s.address && s.address.toLowerCase().includes(lowerCaseSearch))
    );
    
    setFilteredSuppliers(filtered);
  };
  
  // Save supplier to storage
  const saveSupplier = async (supplier: SupplierType) => {
    try {
      let updatedSuppliers;
      
      if (editingSupplier) {
        // Update existing supplier
        updatedSuppliers = suppliers.map(s => 
          s.id === supplier.id ? supplier : s
        );
      } else {
        // Add new supplier
        updatedSuppliers = [...suppliers, supplier];
      }
      
      setSuppliers(updatedSuppliers);
      await AsyncStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      
      Alert.alert('Success', editingSupplier 
        ? 'সাপ্লাইয়ার আপডেট হয়েছে'
        : 'নতুন সাপ্লাইয়ার যোগ হয়েছে'
      );
      
      // Reset form and close modal
      resetFormAndCloseModal();
      
    } catch (error) {
      console.error('Error saving supplier:', error);
      Alert.alert('Error', 'সাপ্লাইয়ার সেভ করতে ত্রুটি হয়েছে');
    }
  };
  
  // Delete supplier
  const deleteSupplier = async (id: string) => {
    Alert.alert(
      'নিশ্চিত করুন',
      'আপনি কি এই সাপ্লাইয়ার মুছে ফেলতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'মুছে ফেলুন',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSuppliers = suppliers.filter(s => s.id !== id);
              setSuppliers(updatedSuppliers);
              await AsyncStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
              Alert.alert('Success', 'সাপ্লাইয়ার মুছে ফেলা হয়েছে');
            } catch (error) {
              console.error('Error deleting supplier:', error);
              Alert.alert('Error', 'সাপ্লাইয়ার মুছতে ত্রুটি হয়েছে');
            }
          }
        }
      ]
    );
  };
  
  // Open modal for adding new supplier
  const openAddSupplierModal = () => {
    setEditingSupplier(null);
    resetForm();
    setIsModalVisible(true);
  };
  
  // Open modal for editing existing supplier
  const openEditSupplierModal = (supplier: SupplierType) => {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setSupplierPhone(supplier.phone);
    setSupplierAddress(supplier.address);
    setSupplierEmail(supplier.email || '');
    setSupplierNotes(supplier.notes || '');
    setIsModalVisible(true);
  };
  
  // Reset form fields
  const resetForm = () => {
    setSupplierName('');
    setSupplierPhone('');
    setSupplierAddress('');
    setSupplierEmail('');
    setSupplierNotes('');
  };
  
  // Reset form and close modal
  const resetFormAndCloseModal = () => {
    resetForm();
    setIsModalVisible(false);
    setEditingSupplier(null);
  };
  
  // Handle submit for add/edit supplier
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const supplier: SupplierType = {
      id: editingSupplier ? editingSupplier.id : Date.now().toString(),
      name: supplierName,
      phone: supplierPhone,
      address: supplierAddress,
      email: supplierEmail || undefined,
      notes: supplierNotes || undefined,
      unpaidAmount: editingSupplier ? editingSupplier.unpaidAmount : 0,
      lastPurchaseDate: editingSupplier ? editingSupplier.lastPurchaseDate : undefined
    };
    
    saveSupplier(supplier);
  };
  
  // Validate form before saving
  const validateForm = () => {
    if (!supplierName.trim()) {
      Alert.alert('Error', 'সাপ্লাইয়ারের নাম প্রবেশ করুন');
      return false;
    }
    
    if (!supplierPhone.trim()) {
      Alert.alert('Error', 'সাপ্লাইয়ারের ফোন নম্বর প্রবেশ করুন');
      return false;
    }
    
    if (!supplierAddress.trim()) {
      Alert.alert('Error', 'সাপ্লাইয়ারের ঠিকানা প্রবেশ করুন');
      return false;
    }
    
    return true;
  };
  
  // Render each supplier item in the list
  const renderSupplierItem = ({ item }: { item: SupplierType }) => {
    return (
      <View style={styles.supplierItem}>
        <TouchableOpacity
          style={styles.supplierInfo}
          onPress={() => openEditSupplierModal(item)}
        >
          <Text style={styles.supplierName}>{item.name}</Text>
          <Text style={styles.supplierDetail}>
            <Ionicons name="call-outline" size={14} color="#4A6572" /> {item.phone}
          </Text>
          <Text style={styles.supplierDetail}>
            <Ionicons name="location-outline" size={14} color="#4A6572" /> {item.address}
          </Text>
          {item.email && (
            <Text style={styles.supplierDetail}>
              <Ionicons name="mail-outline" size={14} color="#4A6572" /> {item.email}
            </Text>
          )}
          {item.unpaidAmount > 0 && (
            <Text style={styles.unpaidAmount}>
              বাকি: ৳{item.unpaidAmount.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.supplierActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditSupplierModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#4A6572" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteSupplier(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#E57373" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      {/* Header */}
      <Header title="সাপ্লাইয়ার ব্যবস্থাপনা" />
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="সাপ্লাইয়ার অনুসন্ধান করুন..."
        />
      </View>
      
      {/* Supplier list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={styles.loadingText}>সাপ্লাইয়ার লোড হচ্ছে...</Text>
        </View>
      ) : filteredSuppliers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchText ? 'কোন সাপ্লাইয়ার পাওয়া যায়নি' : 'কোন সাপ্লাইয়ার নেই'}
          </Text>
          <TouchableOpacity 
            style={styles.addSupplierButton}
            onPress={openAddSupplierModal}
          >
            <Text style={styles.addSupplierButtonText}>নতুন সাপ্লাইয়ার যোগ করুন</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredSuppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.supplierList}
        />
      )}
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={openAddSupplierModal}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetFormAndCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSupplier ? 'সাপ্লাইয়ার আপডেট করুন' : 'নতুন সাপ্লাইয়ার যোগ করুন'}
              </Text>
              <TouchableOpacity onPress={resetFormAndCloseModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>নাম *</Text>
                <TextInput
                  style={styles.formInput}
                  value={supplierName}
                  onChangeText={setSupplierName}
                  placeholder="সাপ্লাইয়ারের নাম"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ফোন নম্বর *</Text>
                <TextInput
                  style={styles.formInput}
                  value={supplierPhone}
                  onChangeText={setSupplierPhone}
                  placeholder="সাপ্লাইয়ারের ফোন নম্বর"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ঠিকানা *</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  value={supplierAddress}
                  onChangeText={setSupplierAddress}
                  placeholder="সাপ্লাইয়ারের ঠিকানা"
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ইমেইল (ঐচ্ছিক)</Text>
                <TextInput
                  style={styles.formInput}
                  value={supplierEmail}
                  onChangeText={setSupplierEmail}
                  placeholder="সাপ্লাইয়ারের ইমেইল"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>নোট (ঐচ্ছিক)</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  value={supplierNotes}
                  onChangeText={setSupplierNotes}
                  placeholder="সাপ্লাইয়ার সম্পর্কে অতিরিক্ত তথ্য"
                  multiline
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={resetFormAndCloseModal}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSubmit}
              >
                <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addSupplierButton: {
    backgroundColor: '#1565C0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  addSupplierButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  supplierList: {
    padding: 16,
  },
  supplierItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 6,
  },
  supplierDetail: {
    fontSize: 14,
    color: '#4A6572',
    marginBottom: 4,
  },
  unpaidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E57373',
    marginTop: 4,
  },
  supplierActions: {
    justifyContent: 'space-around',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 20,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1565C0',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
  },
  modalScrollView: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: '#4A6572',
    marginBottom: 4,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#1565C0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});