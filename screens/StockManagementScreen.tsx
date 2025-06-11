import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StockItem, PRODUCT_CATEGORIES } from '../types';

// Mock stock data
const mockStockItems: StockItem[] = [
  {
    id: '1',
    category: 'টিন',
    company: 'PHP',
    productType: 'কালার',
    color: 'CNG (ডার্ক গ্রীন)',
    size: '৬ ফুট',
    thickness: '০.১৮০',
    currentStock: 50,
    lowStockThreshold: 10,
    purchasePrice: 1200,
    sellingPrice: 1400
  },
  {
    id: '2',
    category: 'টুয়া',
    company: 'KY',
    productType: 'NOF',
    size: '৮ ফুট',
    thickness: '০.২২০',
    currentStock: 8,
    lowStockThreshold: 10,
    purchasePrice: 1500,
    sellingPrice: 1800
  },
  {
    id: '3',
    category: 'ফুলের শিট',
    productType: 'টাইপ ১',
    size: '১০ ফুট',
    thickness: '০.২০০',
    currentStock: 20,
    lowStockThreshold: 5,
    purchasePrice: 1800,
    sellingPrice: 2200
  }
];

type StockAction = 'in' | 'out';

export default function StockManagementScreen() {
  const navigation = useNavigation();
  
  const [stockItems] = useState<StockItem[]>(mockStockItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockActionModalVisible, setStockActionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockAction, setStockAction] = useState<StockAction>('in');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  
  const filteredItems = searchQuery
    ? stockItems.filter(item => 
        item.category.includes(searchQuery) ||
        (item.company && item.company.includes(searchQuery)) ||
        item.productType.includes(searchQuery) ||
        (item.color && item.color.includes(searchQuery)) ||
        (item.size && item.size.includes(searchQuery)) ||
        (item.thickness && item.thickness.includes(searchQuery))
      )
    : stockItems;
  
  const openStockActionModal = (item: StockItem, action: StockAction) => {
    setSelectedItem(item);
    setStockAction(action);
    setQuantity('');
    setSupplier('');
    setNotes('');
    setStockActionModalVisible(true);
  };
  
  const handleStockAction = () => {
    // Validate quantity
    const quantityValue = parseInt(quantity);
    if (!quantityValue || quantityValue <= 0) {
      Alert.alert('সঠিক পরিমাণ দিন', 'পরিমাণ শূন্যের চেয়ে বড় হতে হবে।');
      return;
    }
    
    // For stock out, check if we have enough
    if (stockAction === 'out' && selectedItem && quantityValue > selectedItem.currentStock) {
      Alert.alert('পর্যাপ্ত স্টক নেই', `বর্তমান স্টক: ${selectedItem.currentStock}`);
      return;
    }
    
    // In a real app, this would update the database
    // Mock: Update the UI to show the change was processed
    Alert.alert(
      'সফল',
      stockAction === 'in' 
        ? `${quantityValue} পরিমাণ যোগ করা হয়েছে`
        : `${quantityValue} পরিমাণ বিক্রয় করা হয়েছে`,
      [{ text: 'ঠিক আছে', onPress: () => setStockActionModalVisible(false) }]
    );
  };

  const renderStockItem = ({ item }: { item: StockItem }) => {
    const isLowStock = item.currentStock <= item.lowStockThreshold;

    return (
      <View style={styles.stockItem}>
        <View style={styles.stockItemHeader}>
          <Text style={styles.stockItemCategory}>
            {item.category} {item.company ? `• ${item.company}` : ''} • {item.productType}
          </Text>
          <View style={[styles.stockBadge, isLowStock ? styles.lowStockBadge : styles.normalStockBadge]}>
            <Text style={styles.stockBadgeText}>{isLowStock ? 'কম স্টক' : 'স্টক আছে'}</Text>
          </View>
        </View>
        
        <View style={styles.stockItemDetails}>
          {item.color && <Text style={styles.detailText}>কালার: {item.color}</Text>}
          {item.size && <Text style={styles.detailText}>সাইজ: {item.size}</Text>}
          {item.thickness && <Text style={styles.detailText}>পুরুত্ব: {item.thickness}</Text>}
        </View>
        
        <View style={styles.stockItemInfo}>
          <View style={styles.stockCount}>
            <Text style={styles.stockCountLabel}>বর্তমান স্টক:</Text>
            <Text style={[styles.stockCountValue, isLowStock && styles.lowStockText]}>{item.currentStock}</Text>
          </View>
          
          <View style={styles.stockCount}>
            <Text style={styles.stockCountLabel}>ক্রয় মূল্য:</Text>
            <Text style={styles.stockCountValue}>৳{item.purchasePrice}</Text>
          </View>
          
          <View style={styles.stockCount}>
            <Text style={styles.stockCountLabel}>বিক্রয় মূল্য:</Text>
            <Text style={styles.stockCountValue}>৳{item.sellingPrice}</Text>
          </View>
        </View>
        
        <View style={styles.stockActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.stockInButton]}
            onPress={() => openStockActionModal(item, 'in')}
          >
            <Ionicons name="add-circle" size={18} color="#4CAF50" />
            <Text style={styles.stockInButtonText}>স্টক যোগ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.stockOutButton]}
            onPress={() => openStockActionModal(item, 'out')}
          >
            <Ionicons name="remove-circle" size={18} color="#FF3B30" />
            <Text style={styles.stockOutButtonText}>স্টক বিক্রয়</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>স্টক ম্যানেজমেন্ট</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProductSelection' as never)}>
          <Ionicons name="add-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="পণ্য অনুসন্ধান করুন..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close" size={20} color="#777" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Stock List */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderStockItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="box-open" size={60} color="#ccc" />
          <Text style={styles.emptyText}>কোন পণ্য পাওয়া যায়নি</Text>
        </View>
      )}
      
      {/* Stock Action Modal */}
      <Modal
        visible={stockActionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStockActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {stockAction === 'in' ? 'স্টক যোগ করুন' : 'স্টক বিক্রয় করুন'}
            </Text>
            
            {selectedItem && (
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemTitle}>
                  {selectedItem.category} {selectedItem.company ? `• ${selectedItem.company}` : ''} • {selectedItem.productType}
                </Text>
                <View style={styles.selectedItemDetails}>
                  {selectedItem.color && <Text style={styles.detailText}>কালার: {selectedItem.color}</Text>}
                  {selectedItem.size && <Text style={styles.detailText}>সাইজ: {selectedItem.size}</Text>}
                  {selectedItem.thickness && <Text style={styles.detailText}>পুরুত্ব: {selectedItem.thickness}</Text>}
                  <Text style={styles.detailText}>বর্তমান স্টক: {selectedItem.currentStock}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>পরিমাণ</Text>
              <TextInput
                style={styles.input}
                placeholder="পরিমাণ"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            
            {stockAction === 'in' && (
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>সাপ্লায়ার</Text>
                <TextInput
                  style={styles.input}
                  placeholder="সাপ্লায়ারের নাম (ঐচ্ছিক)"
                  value={supplier}
                  onChangeText={setSupplier}
                />
              </View>
            )}
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>নোট</Text>
              <TextInput
                style={[styles.input, styles.textAreaInput]}
                placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setStockActionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  stockAction === 'in' ? styles.confirmInButton : styles.confirmOutButton
                ]}
                onPress={handleStockAction}
              >
                <Text style={styles.confirmButtonText}>
                  {stockAction === 'in' ? 'যোগ করুন' : 'বিক্রয় করুন'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  stockItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stockItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockItemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  normalStockBadge: {
    backgroundColor: '#E0FFEA',
  },
  lowStockBadge: {
    backgroundColor: '#FFEBEB',
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  stockItemDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  stockItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 12,
  },
  stockCount: {
    alignItems: 'center',
  },
  stockCountLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  stockCountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lowStockText: {
    color: '#FF3B30',
  },
  stockActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  stockInButton: {
    backgroundColor: '#E0FFEA',
    marginRight: 8,
  },
  stockOutButton: {
    backgroundColor: '#FFEBEB',
    marginLeft: 8,
  },
  stockInButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  stockOutButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  selectedItemInfo: {
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedItemDetails: {
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    marginRight: 8,
  },
  confirmInButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  confirmOutButton: {
    backgroundColor: '#FF3B30',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});