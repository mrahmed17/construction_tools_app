import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, Product, StockMovement } from '../types';
import { toast } from 'sonner-native';

interface StockManagementScreenProps {
  navigation: any;
}

export default function StockManagementScreen({ navigation }: StockManagementScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Mock initial products
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 'tin-PHP-সুপার-0.250-8',
        category: 'টিন',
        company: 'PHP',
        type: 'সুপার',
        thickness: 0.250,
        size: 8,
        purchasePrice: 550,
        salePrice: 600,
        stock: 25,
        minStock: 10,
        unit: 'sheet'
      },
      {
        id: 'tin-PHP-কালার-0.300-10',
        category: 'টিন',
        company: 'PHP',
        type: 'কালার',
        color: 'CNG (ডার্ক গ্রীন)',
        thickness: 0.300,
        size: 10,
        purchasePrice: 750,
        salePrice: 820,
        stock: 8,
        minStock: 10,
        unit: 'sheet'
      },
      {
        id: 'tua-KY-লুম-0.250-7',
        category: 'টুয়া',
        company: 'KY',
        type: 'লুম',
        thickness: 0.250,
        size: 7,
        purchasePrice: 480,
        salePrice: 520,
        stock: 15,
        minStock: 10,
        unit: 'sheet'
      },
      {
        id: 'plasticTin-RFL-স্ট্যান্ডার্ড-1.00-8',
        category: 'প্লাস্টিকের টিন',
        company: 'RFL',
        type: 'স্ট্যান্ডার্ড',
        thickness: 1.00,
        size: 8,
        purchasePrice: 350,
        salePrice: 400,
        stock: 5,
        minStock: 15,
        unit: 'sheet'
      },
    ];
    
    setProducts(mockProducts);
  }, []);

  // Filter products based on search query and filter
  const filteredProducts = products.filter(product => {
    if (lowStockOnly && product.stock >= product.minStock) {
      return false;
    }
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      product.category.toLowerCase().includes(searchLower) ||
      (product.company && product.company.toLowerCase().includes(searchLower)) ||
      product.type.toLowerCase().includes(searchLower)
    );
  });

  // Add stock movement
  const addStockMovement = () => {
    if (!selectedProduct) {
      toast.error('পণ্য নির্বাচন করুন');
      return;
    }
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error('সঠিক পরিমাণ দিন');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('কারণ উল্লেখ করুন');
      return;
    }
    
    // Create stock movement
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      type: movementType,
      quantity: quantityNum,
      reason: reason.trim(),
      date: new Date().toISOString()
    };
    
    // Update product stock
    const updatedProducts = products.map(product => {
      if (product.id === selectedProduct.id) {
        const newStock = movementType === 'in' 
          ? product.stock + quantityNum 
          : product.stock - quantityNum;
          
        // Validate if stock goes below 0
        if (newStock < 0) {
          toast.error('স্টকে পর্যাপ্ত পরিমাণ নেই');
          return product;
        }
        
        return { ...product, stock: newStock };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    setStockMovements([newMovement, ...stockMovements]);
    
    // Reset form
    setSelectedProduct(null);
    setQuantity('');
    setReason('');
    
    toast.success(`সফলভাবে ${quantityNum} ${selectedProduct.unit} ${movementType === 'in' ? 'যোগ' : 'বাদ'} করা হয়েছে`);
    setShowMovementModal(false);
  };

  // Show stock alert for product with low stock
  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) {
      return { color: '#F44336', text: 'স্টক শেষ!' };
    } else if (product.stock < product.minStock) {
      return { color: '#FF9800', text: 'কম স্টক!' };
    } else {
      return { color: '#4CAF50', text: 'পর্যাপ্ত' };
    }
  };

  // Format product unit for display
  const getUnitDisplay = (unit: string, quantity: number) => {
    switch (unit) {
      case 'piece':
        return `${quantity} পিস`;
      case 'sheet':
        return `${quantity} শিট`;
      case 'foot':
        return `${quantity} ফুট`;
      default:
        return `${quantity} ${unit}`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>স্টক ব্যবস্থাপনা</Text>
        <TouchableOpacity onPress={() => setShowProductModal(true)}>
          <Ionicons name="add-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="পণ্য অনুসন্ধান করুন..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity 
          style={[styles.filterButton, lowStockOnly && styles.filterButtonActive]} 
          onPress={() => setLowStockOnly(!lowStockOnly)}
        >
          <Ionicons 
            name={lowStockOnly ? "warning" : "funnel"} 
            size={20} 
            color={lowStockOnly ? "#fff" : "#666"} 
          />
          {lowStockOnly && <Text style={styles.filterButtonText}>কম স্টক</Text>}
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const stockStatus = getStockStatus(item);
          
          return (
            <TouchableOpacity 
              style={styles.productCard}
              onPress={() => {
                setSelectedProduct(item);
                setShowMovementModal(true);
              }}
            >
              <View style={styles.productHeader}>
                <Text style={styles.productTitle}>
                  {item.category} {item.company ? `- ${item.company}` : ''}
                </Text>
                <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                  <Text style={styles.stockBadgeText}>{stockStatus.text}</Text>
                </View>
              </View>
              
              <View style={styles.productDetails}>
                <Text style={styles.productType}>
                  {item.type} {item.color ? `- ${item.color}` : ''}
                </Text>
                {item.thickness && <Text style={styles.productSpec}>{item.thickness} মিমি</Text>}
                {item.size && <Text style={styles.productSpec}>{item.size} ফুট</Text>}
              </View>
              
              <View style={styles.stockInfo}>
                <View style={styles.stockCount}>
                  <Text style={styles.stockLabel}>বর্তমান স্টক:</Text>
                  <Text style={[styles.stockValue, { color: stockStatus.color }]}>
                    {getUnitDisplay(item.unit, item.stock)}
                  </Text>
                </View>
                
                <View style={styles.minStockCount}>
                  <Text style={styles.stockLabel}>ন্যূনতম স্টক:</Text>
                  <Text style={styles.minStockValue}>
                    {getUnitDisplay(item.unit, item.minStock)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.productActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.inButton]}
                  onPress={() => {
                    setSelectedProduct(item);
                    setMovementType('in');
                    setShowMovementModal(true);
                  }}
                >
                  <Ionicons name="add-circle" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>যোগ করুন</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.outButton]}
                  onPress={() => {
                    setSelectedProduct(item);
                    setMovementType('out');
                    setShowMovementModal(true);
                  }}
                >
                  <Ionicons name="remove-circle" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>বাদ দিন</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>কোন পণ্য পাওয়া যায়নি</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'অনুসন্ধান পরিবর্তন করুন' : 'পণ্য যোগ করতে "+" বাটন ক্লিক করুন'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          navigation.navigate('ProductSelection', { category: 'tin' });
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Stock Movement Modal */}
      <Modal
        visible={showMovementModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMovementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                স্টক {movementType === 'in' ? 'যোগ' : 'বাদ'} করুন
              </Text>
              <TouchableOpacity onPress={() => setShowMovementModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.selectedProduct}>
                  <Text style={styles.selectedProductTitle}>
                    {selectedProduct.category} {selectedProduct.company ? `- ${selectedProduct.company}` : ''}
                  </Text>
                  <Text style={styles.selectedProductSubtitle}>
                    {selectedProduct.type} {selectedProduct.color ? `- ${selectedProduct.color}` : ''}
                    {selectedProduct.size && `, ${selectedProduct.size} ফুট`}
                    {selectedProduct.thickness && `, ${selectedProduct.thickness} মিমি`}
                  </Text>
                  <Text style={styles.currentStock}>
                    বর্তমান স্টক: {getUnitDisplay(selectedProduct.unit, selectedProduct.stock)}
                  </Text>
                </View>

                <View style={styles.movementTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.movementTypeButton,
                      movementType === 'in' && styles.movementTypeButtonActive
                    ]}
                    onPress={() => setMovementType('in')}
                  >
                    <Ionicons 
                      name="add-circle" 
                      size={20} 
                      color={movementType === 'in' ? '#fff' : '#4CAF50'} 
                    />
                    <Text
                      style={[
                        styles.movementTypeText,
                        movementType === 'in' && styles.movementTypeTextActive
                      ]}
                    >
                      স্টক যোগ
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.movementTypeButton,
                      movementType === 'out' && styles.movementTypeButtonOutActive
                    ]}
                    onPress={() => setMovementType('out')}
                  >
                    <Ionicons 
                      name="remove-circle" 
                      size={20} 
                      color={movementType === 'out' ? '#fff' : '#F44336'} 
                    />
                    <Text
                      style={[
                        styles.movementTypeText,
                        styles.movementTypeTextOut,
                        movementType === 'out' && styles.movementTypeTextActive
                      ]}
                    >
                      স্টক বাদ
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>পরিমাণ ({selectedProduct.unit})</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="পরিমাণ লিখুন"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{movementType === 'in' ? 'স্রোত / সাপ্লাইয়ার' : 'উদ্দেশ্য / খরচ'}</Text>
                  <TextInput
                    style={styles.input}
                    value={reason}
                    onChangeText={setReason}
                    placeholder={movementType === 'in' ? "সাপ্লাইয়ার বা স্রোত লিখুন" : "উদ্দেশ্য বা খরচের কারণ লিখুন"}
                  />
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowMovementModal(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  movementType === 'out' && styles.outConfirmButton
                ]}
                onPress={addStockMovement}
              >
                <Text style={styles.confirmButtonText}>
                  {movementType === 'in' ? 'যোগ করুন' : 'বাদ দিন'}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  filterButtonActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  productType: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  productSpec: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginBottom: 12,
  },
  stockCount: {
    flex: 1,
  },
  minStockCount: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    color: '#999',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  minStockValue: {
    fontSize: 16,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  inButton: {
    backgroundColor: '#4CAF50',
  },
  outButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9800',
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
    maxHeight: '80%',
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
    maxHeight: 400,
  },
  selectedProduct: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  selectedProductTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedProductSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  currentStock: {
    fontSize: 12,
    color: '#1976D2',
    marginTop: 8,
    fontWeight: 'bold',
  },
  movementTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  movementTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  movementTypeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  movementTypeButtonOutActive: {
    backgroundColor: '#F44336',
  },
  movementTypeText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  movementTypeTextOut: {
    color: '#F44336',
  },
  movementTypeTextActive: {
    color: '#fff',
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
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginLeft: 8,
  },
  outConfirmButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});