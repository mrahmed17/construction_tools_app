import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { PRODUCT_CATEGORIES, CategoryStructure, Company, ProductVariant } from '../types';

// Generate a UUID for unique product selection
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

type Selection = {
  id: string;
  category: CategoryStructure | null;
  company: Company | null;
  productType: ProductVariant | null;
  color: string | null;
  size: string | null;
  thickness: string | null;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
};

type DropdownType = 'category' | 'company' | 'productType' | 'color' | 'size' | 'thickness';

export default function ProductSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  // Initial params from navigation
  const { categoryId, companyId } = route.params || {};
  
  // State for dropdowns
  const [activeDropdown, setActiveDropdown] = useState<DropdownType | null>(null);
  
  // State for product selections
  const [selections, setSelections] = useState<Selection[]>([
    {
      id: generateId(),
      category: null,
      company: null,
      productType: null,
      color: null,
      size: null,
      thickness: null,
      quantity: 1,
      purchasePrice: 0,
      sellingPrice: 0
    }
  ]);
  
  // Set initial selection based on navigation params
  useEffect(() => {
    if (categoryId) {
      const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId) || null;
      
      if (category) {
        let company = null;
        if (companyId && category.companies) {
          company = category.companies.find(comp => comp.id === companyId) || null;
        }
        
        setSelections([
          {
            id: generateId(),
            category,
            company,
            productType: null,
            color: null,
            size: null,
            thickness: null,
            quantity: 1,
            purchasePrice: 0,
            sellingPrice: 0
          }
        ]);
      }
    }
  }, [categoryId, companyId]);
  
  const updateSelection = useCallback((id: string, field: keyof Selection, value: any) => {
    setSelections(prev => 
      prev.map(sel => {
        if (sel.id === id) {
          // Reset dependent fields when parent field changes
          if (field === 'category') {
            return { 
              ...sel, 
              [field]: value, 
              company: null,
              productType: null,
              color: null,
              size: null,
              thickness: null
            };
          }
          
          if (field === 'company') {
            return { 
              ...sel, 
              [field]: value, 
              productType: null,
              color: null,
              size: null,
              thickness: null
            };
          }
          
          if (field === 'productType') {
            return { 
              ...sel, 
              [field]: value, 
              color: null,
              size: null,
              thickness: null
            };
          }
          
          // Just update the field for other cases
          return { ...sel, [field]: value };
        }
        return sel;
      })
    );
  }, []);
  
  const addNewSelection = () => {
    const newSelection: Selection = {
      id: generateId(),
      category: null,
      company: null,
      productType: null,
      color: null,
      size: null,
      thickness: null,
      quantity: 1,
      purchasePrice: 0,
      sellingPrice: 0
    };
    setSelections(prev => [...prev, newSelection]);
  };
  
  const removeSelection = (id: string) => {
    if (selections.length === 1) {
      Alert.alert('নোটিশ', 'অন্তত একটি আইটেম রাখতে হবে');
      return;
    }
    setSelections(prev => prev.filter(sel => sel.id !== id));
  };
  
  const increaseQuantity = (id: string) => {
    setSelections(prev => 
      prev.map(sel => 
        sel.id === id ? { ...sel, quantity: sel.quantity + 1 } : sel
      )
    );
  };
  
  const decreaseQuantity = (id: string) => {
    setSelections(prev => 
      prev.map(sel => 
        sel.id === id && sel.quantity > 1 ? { ...sel, quantity: sel.quantity - 1 } : sel
      )
    );
  };
  
  const updatePrice = (id: string, type: 'purchasePrice' | 'sellingPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setSelections(prev => 
      prev.map(sel => 
        sel.id === id ? { ...sel, [type]: numValue } : sel
      )
    );
  };
  
  const addToCart = () => {
    const incompleteSelections = selections.filter(
      sel => !sel.category
    );
    
    if (incompleteSelections.length > 0) {
      Alert.alert('অসম্পূর্ণ নির্বাচন', 'সকল প্রয়োজনীয় ফিল্ড পূরণ করুন।');
      return;
    }
    
    const selectionsMissingPrice = selections.filter(
      sel => sel.purchasePrice <= 0 || sel.sellingPrice <= 0
    );
    
    if (selectionsMissingPrice.length > 0) {
      Alert.alert('মূল্য অনুপস্থিত', 'সকল আইটেমের ক্রয় ও বিক্রয় মূল্য দিন।');
      return;
    }
    
    // Add items to cart
    // selections.forEach(sel => {
    //   if (sel.category) {
    //     const cartItem = {
    //       id: sel.id,
    //       category: sel.category.name,
    //       company: sel.company?.name,
    //       productType: sel.productType?.name || '',
    //       color: sel.color || undefined,
    //       size: sel.size || undefined,
    //       thickness: sel.thickness || undefined,
    //       quantity: sel.quantity,
    //       purchasePrice: sel.purchasePrice,
    //       sellingPrice: sel.sellingPrice,
    //       profit: (sel.sellingPrice - sel.purchasePrice) * sel.quantity
    //     };
        
    //     addItem(cartItem);
    //   }
    // });
    
    Alert.alert(
      'সফল',
      'সফলভাবে কার্টে যোগ হয়েছে',
      [{ text: 'ঠিক আছে', onPress: () => navigation.navigate('Cart' as never) }]
    );
  };
  
  const renderDropdownModal = (
    type: DropdownType, 
    selectionId: string, 
    selection: Selection
  ) => {
    // Get the data for the dropdown based on type and current selection
    const getDropdownData = () => {
      switch (type) {
        case 'category':
          return PRODUCT_CATEGORIES.map(cat => ({
            id: cat.id,
            name: cat.name,
          }));
        case 'company':
          return selection.category?.companies?.map(company => ({
            id: company.id,
            name: company.name,
          })) || [];
        case 'productType':
          return selection.company?.productTypes.map(pt => ({
            id: pt.id,
            name: pt.name,
          })) || [];
        case 'color':
          if (selection.productType?.colors) {
            return selection.productType.colors.map((color, index) => ({
              id: `color-${index}`,
              name: color,
            }));
          }
          return [];
        case 'size':
          // Get sizes from the generateSizeRange function based on category
          if (selection.category) {
            const sizes = ['6', '7', '8', '9', '10', '11', '12'];
            return sizes.map((size, index) => ({
              id: `size-${index}`,
              name: size,
            }));
          }
          return [];
        case 'thickness':
          // Get thicknesses from the product type if available
          if (selection.productType?.thicknesses) {
            return selection.productType.thicknesses.map((thickness, index) => ({
              id: `thickness-${index}`,
              name: thickness,
            }));
          }
          return [];
        default:
          return [];
      }
    };
    
    const data = getDropdownData();
    
    const handleSelect = (item: { id: string; name: string }) => {
      switch (type) {
        case 'category':
          const category = PRODUCT_CATEGORIES.find(cat => cat.id === item.id) || null;
          updateSelection(selectionId, 'category', category);
          break;
        case 'company':
          if (selection.category?.companies) {
            const company = selection.category.companies.find(comp => comp.id === item.id) || null;
            updateSelection(selectionId, 'company', company);
          }
          break;
        case 'productType':
          if (selection.company) {
            const productType = selection.company.productTypes.find(pt => pt.id === item.id) || null;
            updateSelection(selectionId, 'productType', productType);
          }
          break;
        case 'color':
          updateSelection(selectionId, 'color', item.name);
          break;
        case 'size':
          updateSelection(selectionId, 'size', item.name);
          break;
        case 'thickness':
          updateSelection(selectionId, 'thickness', item.name);
          break;
        default:
          break;
      }
      setActiveDropdown(null);
    };
    
    return (
      <Modal
        visible={activeDropdown === type}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {type === 'category' ? 'ক্যাটেগরি নির্বাচন' : 
                 type === 'company' ? 'কোম্পানি নির্বাচন' :
                 type === 'productType' ? 'প্রোডাক্ট টাইপ নির্বাচন' :
                 type === 'color' ? 'কালার নির্বাচন' :
                 type === 'size' ? 'সাইজ নির্বাচন' : 'পুরুত্ব নির্বাচন'}
              </Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {data.length > 0 ? (
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>কোন তথ্য নেই</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };
  
  const renderProductSelection = (selection: Selection) => {
    return (
      <View key={selection.id} style={styles.selectionCard}>
        {/* Selection Header */}
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionTitle}>পণ্য নির্বাচন</Text>
          {selections.length > 1 && (
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeSelection(selection.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Category Selection */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>ক্যাটেগরি</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setActiveDropdown('category')}
          >
            <Text style={selection.category ? styles.dropdownText : styles.placeholderText}>
              {selection.category ? selection.category.name : 'ক্যাটেগরি নির্বাচন করুন'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#777" />
          </TouchableOpacity>
          
          {renderDropdownModal('category', selection.id, selection)}
        </View>
        
        {/* Company Selection - Only if the category has companies */}
        {selection.category?.companies && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>কোম্পানি</Text>
            <TouchableOpacity 
              style={[styles.dropdown, !selection.category && styles.disabledDropdown]}
              onPress={() => selection.category && setActiveDropdown('company')}
              disabled={!selection.category}
            >
              <Text style={selection.company ? styles.dropdownText : styles.placeholderText}>
                {selection.company ? selection.company.name : 'কোম্পানি নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={selection.category ? "#777" : "#ccc"} />
            </TouchableOpacity>
            
            {renderDropdownModal('company', selection.id, selection)}
          </View>
        )}
        
        {/* Product Type Selection - Only if company is selected */}
        {selection.company && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>প্রোডাক্ট টাইপ</Text>
            <TouchableOpacity 
              style={[styles.dropdown, !selection.company && styles.disabledDropdown]}
              onPress={() => selection.company && setActiveDropdown('productType')}
              disabled={!selection.company}
            >
              <Text style={selection.productType ? styles.dropdownText : styles.placeholderText}>
                {selection.productType ? selection.productType.name : 'প্রোডাক্ট টাইপ নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={selection.company ? "#777" : "#ccc"} />
            </TouchableOpacity>
            
            {renderDropdownModal('productType', selection.id, selection)}
          </View>
        )}
        
        {/* Color Selection - Only if product type has colors */}
        {selection.productType?.colors && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>কালার</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setActiveDropdown('color')}
            >
              <Text style={selection.color ? styles.dropdownText : styles.placeholderText}>
                {selection.color || 'কালার নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#777" />
            </TouchableOpacity>
            
            {renderDropdownModal('color', selection.id, selection)}
          </View>
        )}
        
        {/* Size Selection */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>সাইজ</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setActiveDropdown('size')}
          >
            <Text style={selection.size ? styles.dropdownText : styles.placeholderText}>
              {selection.size || 'সাইজ নির্বাচন করুন'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#777" />
          </TouchableOpacity>
          
          {renderDropdownModal('size', selection.id, selection)}
        </View>
        
        {/* Thickness Selection - Only if product type has thicknesses */}
        {selection.productType?.thicknesses && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>পুরুত্ব</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setActiveDropdown('thickness')}
            >
              <Text style={selection.thickness ? styles.dropdownText : styles.placeholderText}>
                {selection.thickness || 'পুরুত্ব নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#777" />
            </TouchableOpacity>
            
            {renderDropdownModal('thickness', selection.id, selection)}
          </View>
        )}
        
        {/* Quantity, Purchase Price, and Selling Price */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>পরিমাণ</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => decreaseQuantity(selection.id)}
            >
              <Ionicons name="remove" size={20} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{selection.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => increaseQuantity(selection.id)}
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>ক্রয় মূল্য</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="ক্রয় মূল্য"
            keyboardType="numeric"
            value={selection.purchasePrice > 0 ? selection.purchasePrice.toString() : ''}
            onChangeText={(value) => updatePrice(selection.id, 'purchasePrice', value)}
          />
        </View>
        
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>বিক্রয় মূল্য</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="বিক্রয় মূল্য"
            keyboardType="numeric"
            value={selection.sellingPrice > 0 ? selection.sellingPrice.toString() : ''}
            onChangeText={(value) => updatePrice(selection.id, 'sellingPrice', value)}
          />
        </View>
        
        {/* Profit Calculation */}
        <View style={styles.profitContainer}>
          <Text style={styles.profitLabel}>লাভ:</Text>
          <Text style={styles.profitValue}>
            ৳{((selection.sellingPrice - selection.purchasePrice) * selection.quantity).toFixed(2)}
          </Text>
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
        <Text style={styles.headerTitle}>পণ্য নির্বাচন</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart' as never)}>
          <Ionicons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {selections.map(selection => renderProductSelection(selection))}
        
        {/* Add New Product Button */}
        <TouchableOpacity style={styles.addNewButton} onPress={addNewSelection}>
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.addNewText}>আরও পণ্য যোগ করুন</Text>
        </TouchableOpacity>
        
        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <MaterialIcons name="add-shopping-cart" size={24} color="#fff" />
          <Text style={styles.addToCartText}>কার্টে যোগ করুন</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  selectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#555',
    width: '30%',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: '68%',
  },
  disabledDropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  dropdownText: {
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#aaa',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '68%',
  },
  quantityButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  quantityText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: '68%',
  },
  profitContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  profitLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 8,
  },
  profitValue: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 16,
  },
  addNewText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    marginBottom: 32,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});