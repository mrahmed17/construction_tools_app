import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useProducts, Category, Company, ProductType, Product } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const ProductSelectionScreen = () => {
  const navigation = useNavigation();
  const { categories, products, loading } = useProducts();
  const { addToCart } = useCart();

  // Selected product state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedThickness, setSelectedThickness] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Modals
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [productTypeModalVisible, setProductTypeModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [thicknessModalVisible, setThicknessModalVisible] = useState(false);
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  
  // Product quantity
  const [quantity, setQuantity] = useState('1');
  
  // Multiple product entries
  const [productEntries, setProductEntries] = useState<Array<{
    category: Category | null,
    company: Company | null,
    productType: ProductType | null,
    color: string | null,
    thickness: string | null,
    size: string | null,
    quantity: string
  }>>([]);
  
  // Reset all selections
  const resetSelections = () => {
    setSelectedCategory(null);
    setSelectedCompany(null);
    setSelectedProductType(null);
    setSelectedColor(null);
    setSelectedThickness(null);
    setSelectedSize(null);
    setQuantity('1');
  };
  
  // Add current selection to entries
  const addProductEntry = () => {
    if (!selectedCategory || !selectedThickness || !selectedSize) {
      Alert.alert('ত্রুটি', 'আপনাকে অবশ্যই ক্যাটাগরি, পুরুত্ব এবং সাইজ নির্বাচন করতে হবে।');
      return;
    }
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('ত্রুটি', 'পরিমাণ সঠিক নয়।');
      return;
    }
    
    const newEntry = {
      category: selectedCategory,
      company: selectedCompany,
      productType: selectedProductType,
      color: selectedColor,
      thickness: selectedThickness,
      size: selectedSize,
      quantity
    };
    
    setProductEntries([...productEntries, newEntry]);
    
    // Reset selections after adding
    resetSelections();
    
    Alert.alert('সফল', 'পণ্যটি যোগ করা হয়েছে। আরও পণ্য যোগ করুন বা কার্টে যান।');
  };
  
  // Remove a product entry
  const removeProductEntry = (index: number) => {
    const newEntries = [...productEntries];
    newEntries.splice(index, 1);
    setProductEntries(newEntries);
  };
  
  // Add all product entries to cart
  const addAllToCart = () => {
    if (productEntries.length === 0) {
      Alert.alert('ত্রুটি', 'কোন পণ্য যোগ করা হয়নি।');
      return;
    }
    
    productEntries.forEach(entry => {
      if (!entry.category) return;
      
      // Search for a matching product or use first product of matching category
      let matchingProduct = products.find(p => 
        p.category === entry.category?.name &&
        (entry.company ? p.company === entry.company?.name : true) &&
        (entry.productType ? p.type === entry.productType?.name : true) &&
        (entry.color ? p.color === entry.color : true) &&
        p.thickness === entry.thickness &&
        p.size === entry.size
      );
      
      if (!matchingProduct && entry.category) {
        // If no exact match, find a product in this category
        matchingProduct = products.find(p => p.category === entry.category?.name);
      }
      
      if (matchingProduct) {
        addToCart({
          ...matchingProduct,
          quantity: parseInt(entry.quantity)
        });
      } else {
        // No matching product, create placeholder with default prices
        const newProduct: Product = {
          id: Date.now().toString(),
          category: entry.category.name,
          company: entry.company?.name,
          type: entry.productType?.name,
          color: entry.color || undefined,
          thickness: entry.thickness || '',
          size: entry.size || '',
          purchasePrice: 0,
          salePrice: 0,
          stock: 100,
          quantity: parseInt(entry.quantity)
        };
        
        addToCart(newProduct);
      }
    });
    
    setProductEntries([]);
    
    Alert.alert(
      'সফল',
      'সমস্ত পণ্য কার্টে যোগ করা হয়েছে।',
      [
        { text: 'আরও যোগ করুন', style: 'cancel' },
        { text: 'কার্টে যান', onPress: () => navigation.navigate('Cart' as never) }
      ]
    );
  };
  
  // Generate thickness options based on selected product type
  const getThicknessOptions = (): string[] => {
    if (!selectedProductType) return [];
    
    if (selectedProductType.thicknessOptions) {
      return selectedProductType.thicknessOptions;
    }
    
    if (selectedProductType.thicknessRange) {
      const { min, max, step } = selectedProductType.thicknessRange;
      const options: string[] = [];
      
      for (let value = min; value <= max; value += step) {
        options.push(value.toFixed(3));
      }
      
      return options;
    }
    
    return [];
  };
  
  // Generate size options based on selected product type
  const getSizeOptions = (): string[] => {
    if (!selectedProductType || !selectedProductType.sizeRange) return [];
    
    const { min, max, unit } = selectedProductType.sizeRange;
    const options: string[] = [];
    
    for (let value = min; value <= max; value++) {
      options.push(`${value} ${unit}`);
    }
    
    return options;
  };
  
  // Reset company and product type when category changes
  useEffect(() => {
    setSelectedCompany(null);
    setSelectedProductType(null);
    setSelectedColor(null);
    setSelectedThickness(null);
    setSelectedSize(null);
  }, [selectedCategory]);
  
  // Reset product type when company changes
  useEffect(() => {
    setSelectedProductType(null);
    setSelectedColor(null);
    setSelectedThickness(null);
    setSelectedSize(null);
  }, [selectedCompany]);
  
  // Reset color when product type changes
  useEffect(() => {
    setSelectedColor(null);
    setSelectedThickness(null);
    setSelectedSize(null);
  }, [selectedProductType]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>পণ্য নির্বাচন করুন</Text>
      </View>
      
      <View style={styles.selectionContainer}>
        {/* Category Selection */}
        <View style={styles.selectionRow}>
          <Text style={styles.selectionLabel}>ক্যাটাগরি:</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.selectionText}>
              {selectedCategory ? selectedCategory.name : "ক্যাটাগরি নির্বাচন করুন"}
            </Text>
            <AntDesign name="down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Company Selection - Only show if category is selected */}
        {selectedCategory && Array.isArray(selectedCategory.companies) && selectedCategory.companies.length > 0 && (
          <View style={styles.selectionRow}>
            <Text style={styles.selectionLabel}>কোম্পানি:</Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setCompanyModalVisible(true)}
            >
              <Text style={styles.selectionText}>
                {selectedCompany ? selectedCompany.name : "কোম্পানি নির্বাচন করুন"}
              </Text>
              <AntDesign name="down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Product Type Selection - Only show if company is selected */}
        {selectedCompany && Array.isArray(selectedCompany.productTypes) && selectedCompany.productTypes.length > 0 && (
          <View style={styles.selectionRow}>
            <Text style={styles.selectionLabel}>প্রোডাক্ট টাইপ:</Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setProductTypeModalVisible(true)}
            >
              <Text style={styles.selectionText}>
                {selectedProductType ? selectedProductType.name : "প্রোডাক্ট টাইপ নির্বাচন করুন"}
              </Text>
              <AntDesign name="down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Color Selection - Only show if product type has colors */}
        {selectedProductType && selectedProductType.hasColors && (
          <View style={styles.selectionRow}>
            <Text style={styles.selectionLabel}>কালার:</Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setColorModalVisible(true)}
            >
              <Text style={styles.selectionText}>
                {selectedColor || "কালার নির্বাচন করুন"}
              </Text>
              <AntDesign name="down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Thickness Selection */}
        {selectedProductType && (
          <View style={styles.selectionRow}>
            <Text style={styles.selectionLabel}>পুরুত্ব:</Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setThicknessModalVisible(true)}
            >
              <Text style={styles.selectionText}>
                {selectedThickness || "পুরুত্ব নির্বাচন করুন"}
              </Text>
              <AntDesign name="down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Size Selection */}
        {selectedProductType && (
          <View style={styles.selectionRow}>
            <Text style={styles.selectionLabel}>সাইজ:</Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setSizeModalVisible(true)}
            >
              <Text style={styles.selectionText}>
                {selectedSize || "সাইজ নির্বাচন করুন"}
              </Text>
              <AntDesign name="down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Quantity Input */}
        <View style={styles.selectionRow}>
          <Text style={styles.selectionLabel}>পরিমাণ:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const current = parseInt(quantity);
                if (current > 1) {
                  setQuantity((current - 1).toString());
                }
              }}
            >
              <AntDesign name="minus" size={18} color="#fff" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const current = parseInt(quantity);
                setQuantity((current + 1).toString());
              }}
            >
              <AntDesign name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Add Product Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={addProductEntry}
        >
          <Text style={styles.addButtonText}>পণ্য যোগ করুন</Text>
          <AntDesign name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Selected Products List */}
      {productEntries.length > 0 && (
        <View style={styles.selectedProductsContainer}>
          <Text style={styles.selectedProductsTitle}>নির্বাচিত পণ্য</Text>
          
          {productEntries.map((entry, index) => (
            <View key={index} style={styles.selectedProductItem}>
              <View style={styles.selectedProductInfo}>
                <Text style={styles.selectedProductCategory}>
                  {entry.category?.name}
                </Text>
                <Text style={styles.selectedProductDetails}>
                  {entry.company?.name && `${entry.company.name}, `}
                  {entry.productType?.name && `${entry.productType.name}, `}
                  {entry.color && `${entry.color}, `}
                  {entry.thickness} মিমি, {entry.size}
                </Text>
                <Text style={styles.selectedProductQuantity}>
                  পরিমাণ: {entry.quantity}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeProductEntry(index)}
              >
                <AntDesign name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={addAllToCart}
          >
            <Text style={styles.addToCartButtonText}>কার্টে যোগ করুন</Text>
            <MaterialIcons name="shopping-cart" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ক্যাটাগরি নির্বাচন করুন</Text>
            <ScrollView>
              {Array.isArray(categories) && categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Company Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={companyModalVisible}
        onRequestClose={() => setCompanyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>কোম্পানি নির্বাচন করুন</Text>
            <ScrollView>
              {selectedCategory && Array.isArray(selectedCategory.companies) && selectedCategory.companies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCompany(company);
                    setCompanyModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{company.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCompanyModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Product Type Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={productTypeModalVisible}
        onRequestClose={() => setProductTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>প্রোডাক্ট টাইপ নির্বাচন করুন</Text>
            <ScrollView>
              {selectedCompany && Array.isArray(selectedCompany.productTypes) && selectedCompany.productTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProductType(type);
                    setProductTypeModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{type.name}</Text>
                  {type.hasColors && <Text style={styles.modalItemSubtext}>(কালার অপশন আছে)</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setProductTypeModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Color Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={colorModalVisible}
        onRequestClose={() => setColorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>কালার নির্বাচন করুন</Text>
            <ScrollView>
              {selectedProductType && selectedProductType.colors && selectedProductType.colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedColor(color);
                    setColorModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{color}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setColorModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Thickness Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={thicknessModalVisible}
        onRequestClose={() => setThicknessModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>পুরুত্ব নির্বাচন করুন</Text>
            <ScrollView>
              {getThicknessOptions().map((thickness, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedThickness(thickness);
                    setThicknessModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{thickness} মিমি</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setThicknessModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Size Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sizeModalVisible}
        onRequestClose={() => setSizeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>সাইজ নির্বাচন করুন</Text>
            <ScrollView>
              {getSizeOptions().map((size, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSize(size);
                    setSizeModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSizeModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  },
  selectionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionRow: {
    marginBottom: 16,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  selectionText: {
    fontSize: 16,
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 60,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 6,
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  selectedProductsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  selectedProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedProductInfo: {
    flex: 1,
  },
  selectedProductCategory: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedProductDetails: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  selectedProductQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#F44336',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginLeft: 8,
  },
  addToCartButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 6,
    marginTop: 16,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeModalButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductSelectionScreen;