import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Supplier } from '../types';
import { toast } from 'sonner-native';

interface SupplierScreenProps {
  navigation: any;
}

export default function SupplierScreen({ navigation }: SupplierScreenProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');

  // Load mock data
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'আব্দুল করিম',
        phone: '01712345678',
        address: 'মিরপুর ১০, ঢাকা',
        company: 'PHP'
      },
      {
        id: '2',
        name: 'মনজুর রহমান',
        phone: '01923456789',
        address: 'গুলশান ২, ঢাকা',
        company: 'KY'
      },
      {
        id: '3',
        name: 'জাহিদ হাসান',
        phone: '01834567890',
        address: 'আদাবর, ঢাকা',
        company: 'ABUL Khair'
      },
      {
        id: '4',
        name: 'রফিকুল ইসলাম',
        phone: '01645678901',
        address: 'সাভার, ঢাকা',
        company: 'TK (G)'
      },
    ];
    
    setSuppliers(mockSuppliers);
  }, []);

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier => {
    const searchLower = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.company.toLowerCase().includes(searchLower) ||
      supplier.phone.includes(searchQuery)
    );
  });

  // Add new supplier
  const handleAddSupplier = () => {
    if (!name.trim()) {
      toast.error('সাপ্লাইয়ারের নাম দিন');
      return;
    }
    
    if (!phone.trim()) {
      toast.error('ফোন নম্বর দিন');
      return;
    }
    
    if (!company.trim()) {
      toast.error('কোম্পানির নাম দিন');
      return;
    }
    
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      company: company.trim()
    };
    
    setSuppliers([...suppliers, newSupplier]);
    resetForm();
    setShowAddModal(false);
    toast.success('সাপ্লাইয়ার যোগ করা হয়েছে');
  };

  // Update supplier
  const handleUpdateSupplier = () => {
    if (!selectedSupplier) return;
    
    if (!name.trim()) {
      toast.error('সাপ্লাইয়ারের নাম দিন');
      return;
    }
    
    if (!phone.trim()) {
      toast.error('ফোন নম্বর দিন');
      return;
    }
    
    if (!company.trim()) {
      toast.error('কোম্পানির নাম দিন');
      return;
    }
    
    const updatedSuppliers = suppliers.map(supplier => {
      if (supplier.id === selectedSupplier.id) {
        return {
          ...supplier,
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          company: company.trim()
        };
      }
      return supplier;
    });
    
    setSuppliers(updatedSuppliers);
    resetForm();
    setShowEditModal(false);
    toast.success('সাপ্লাইয়ার আপডেট করা হয়েছে');
  };

  // Delete supplier
  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
    toast.success('সাপ্লাইয়ার মুছে ফেলা হয়েছে');
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setPhone('');
    setAddress('');
    setCompany('');
    setSelectedSupplier(null);
  };

  // Open edit modal with selected supplier data
  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setName(supplier.name);
    setPhone(supplier.phone);
    setAddress(supplier.address);
    setCompany(supplier.company);
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>সাপ্লাইয়ার তালিকা</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="সাপ্লাইয়ার অনুসন্ধান করুন..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Suppliers List */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredSuppliers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.supplierCard}
            onPress={() => openEditModal(item)}
          >
            <View style={styles.supplierInfo}>
              <Text style={styles.supplierName}>{item.name}</Text>
              <Text style={styles.supplierCompany}>{item.company}</Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Ionicons name="call" size={14} color="#666" />
                  <Text style={styles.contactText}>{item.phone}</Text>
                </View>
                {item.address && (
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.contactText}>{item.address}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => {/* TODO: Handle phone call */}}
              >
                <Ionicons name="call" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="create" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteSupplier(item.id)}
              >
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>কোন সাপ্লাইয়ার পাওয়া যায়নি</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'অনুসন্ধান পরিবর্তন করুন' : 'সাপ্লাইয়ার যোগ করতে "+" বাটনে ক্লিক করুন'}
            </Text>
          </View>
        }
      />

      {/* Add Supplier Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>নতুন সাপ্লাইয়ার যোগ করুন</Text>
              <TouchableOpacity onPress={() => {
                resetForm();
                setShowAddModal(false);
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>সাপ্লাইয়ারের নাম *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="নাম লিখুন"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ফোন নম্বর *</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="ফোন নম্বর লিখুন"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ঠিকানা</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="ঠিকানা লিখুন"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>কোম্পানি *</Text>
                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="কোম্পানির নাম লিখুন"
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddSupplier}
              >
                <Text style={styles.confirmButtonText}>যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>সাপ্লাইয়ার আপডেট করুন</Text>
              <TouchableOpacity onPress={() => {
                resetForm();
                setShowEditModal(false);
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>সাপ্লাইয়ারের নাম *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="নাম লিখুন"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ফোন নম্বর *</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="ফোন নম্বর লিখুন"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ঠিকানা</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="ঠিকানা লিখুন"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>কোম্পানি *</Text>
                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="কোম্পানির নাম লিখুন"
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setShowEditModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleUpdateSupplier}
              >
                <Text style={styles.confirmButtonText}>আপডেট করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  supplierCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  supplierCompany: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
  },
  contactInfo: {
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    gap: 8,
    justifyContent: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1976D2',
    borderRadius: 4,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});