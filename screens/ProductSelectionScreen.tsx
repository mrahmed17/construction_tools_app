import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { 
  PRODUCT_CATEGORIES, 
  CategoryStructure, 
  Company, 
  ProductVariant 
} from '../types';

const ProductSelectionScreen = () => {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  
  // Selected product state
  const [selectedCategory, setSelectedCategory] = useState<CategoryStructure | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedThickness, setSelectedThickness] = useState<string | null>(null);
  
  // Product info state
  const [quantity, setQuantity] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('0');
  const [sellingPrice, setSellingPrice] = useState('0');
  
  // UI state
  const [productSelections, setProductSelections] = useState<any[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [productTypeModalVisible, setProductTypeModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [thicknessModalVisible, setThicknessModalVisible] = useState(false);
  
  // Load saved products
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  
  useEffect(() => {
    const loadSavedProducts = async () => {
      try {
        const savedProductsJson = await AsyncStorage.getItem('@products');
        if (savedProductsJson) {
          const products = JSON.parse(savedProductsJson);
          setSavedProducts(products);
        }
      } catch (error) {
        console.error('Error loading saved products:', error);
      }
    };
    
    loadSavedProducts();
  }, []);
  
  // Helper function to generate sizes based on category
  const generateSizesForCategory = (category: string | undefined): string[] => {
    if (!category) return [];
    
    switch (category.toLowerCase()) {
      case 'tin':
      case 'plastictin':
      case 'flowerwavetin':
      case 'chachplastic':
        return ['6', '7', '8', '9', '10', '11', '12'];
      case 'tuya':
      case 'plainsheet':
        return ['6', '7', '8', '9', '10'];
      default:
        return [];
    }
  };
  
  // Find an existing product from saved products
  const findExistingProduct = () => {
    if (!selectedCategory || !quantity) return null;
    
    // Create a filter based on selections
    const filter: any = {
      category: selectedCategory.name,
    };
    
    if (selectedCompany) {
      filter.company = selectedCompany.name;
    }
    
    if (selectedProductType) {
      filter.productType = selectedProductType.name;
    }
    
    if (selectedColor) {
      filter.color = selectedColor;
    }
    
    if (selectedSize) {
      filter.size = selectedSize;
    }
    
    if (selectedThickness) {
      filter.thickness = selectedThickness;
    }
    
    // Try to find a matching product
    const match = savedProducts.find(product => {
      let isMatch = true;
      
      Object.keys(filter).forEach(key => {
        if (filter[key] && product[key] !== filter[key]) {
          isMatch = false;
        }
      });
      
      return isMatch;
    });
    
    return match;
  };
  
  // Add current selection to product selections
  const addSelection = () => {
    if (!selectedCategory) {
      Alert.alert('ত্রুটি', 'অনুগ্রহ করে প্রথমে ক্যাটাগরি নির্বাচন করুন');
      return;
    }
    
    // Check if quantity is valid
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('ত্রুটি', 'সঠিক পরিমাণ দিন');
      return;
    }
    
    // Check if pricing is set
    if (parseFloat(purchasePrice) <= 0 || parseFloat(sellingPrice) <= 0) {
      Alert.alert('ত্রুটি', 'সঠিক মূল্য দিন');
      return;
    }
    
    // Find an existing product or create a new one
    const existingProduct = findExistingProduct();
    
    const selection = {
      id: Date.now().toString(),
      category: selectedCategory.name,
      company: selectedCompany ? selectedCompany.name : 'None',
      productType: selectedProductType ? selectedProductType.name : undefined,
      color: selectedColor || undefined,
      thickness: selectedThickness || undefined,
      size: selectedSize || undefined,
      quantity: parseInt(quantity),
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      profit: parseFloat(sellingPrice) - parseFloat(purchasePrice),
      stock: existingProduct ? existingProduct.stock : 100, // Default stock if new
      lowStockThreshold: existingProduct ? existingProduct.lowStockThreshold : 10,
      unit: 'pieces'
    };
    
    setProductSelections([...productSelections, selection]);
    
    // Reset selections for next item
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedThickness(null);
    setQuantity('1');
    // Keep category, company and product type the same for easier multiple selections
  };
  
  // Remove a selection
  const removeSelection = (id: string) => {
    setProductSelections(productSelections.filter(item => item.id !== id));
  };
  
  // Add all selections to cart
  const addSelectionsToCart = () => {
    if (productSelections.length === 0) {
      Alert.alert('ত্রুটি', 'কমপক্ষে একটি পণ্য নির্বাচন করুন');
      return;
    }
    
    productSelections.forEach(selection => {
      addToCart(selection, selection.quantity);
    });
    
    Alert.alert('সফল', 'পণ্য কার্টে যোগ হয়েছে', [
      {
        text: 'কার্ট দেখুন',
        onPress: () => navigation.navigate('Cart' as never),
      },
      {
        text: 'আরও পণ্য যোগ করুন',
        onPress: () => {
          setProductSelections([]);
          setSelectedCategory(null);
          setSelectedCompany(null);
          setSelectedProductType(null);
          setSelectedColor(null);
          setSelectedSize(null);
          setSelectedThickness(null);
          setQuantity('1');
          setPurchasePrice('0');
          setSellingPrice('0');
        },
      },
    ]);
  };

  // Calculate profit
  const calculateProfit = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const selling = parseFloat(sellingPrice) || 0;
    return (selling - purchase) * parseInt(quantity || '0');
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>পণ্য নির্বাচন করুন</Text>
        
        {/* Category selection */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedCategory ? selectedCategory.name : 'ক্যাটাগরি নির্বাচন করুন'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
        </TouchableOpacity>
        
        {/* Company selection - show only if category is selected */}
        {selectedCategory && selectedCategory.companies && selectedCategory.companies.length > 0 && (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setCompanyModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedCompany ? selectedCompany.name : 'কোম্পানি নির্বাচন করুন'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        {/* Product type selection - show only if company is selected */}
        {selectedCompany && selectedCompany.productTypes && selectedCompany.productTypes.length > 0 && (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setProductTypeModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedProductType ? selectedProductType.name : 'প্রোডাক্ট টাইপ নির্বাচন করুন'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        {/* Color selection - show only if product type has colors */}
        {selectedProductType && selectedProductType.colors && selectedProductType.colors.length > 0 && (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setColorModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedColor ? selectedColor : 'কালার নির্বাচন করুন'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        {/* Size selection - show for categories with sizes */}
        {selectedCategory && generateSizesForCategory(selectedCategory.id).length > 0 && (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setSizeModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedSize ? `${selectedSize} ফুট` : 'সাইজ নির্বাচন করুন'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        {/* Thickness selection - show if product type has thickness */}
        {selectedProductType && selectedProductType.thicknesses && selectedProductType.thicknesses.length > 0 && (
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setThicknessModalVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedThickness ? `${selectedThickness} mm` : 'পুরুত্ব নির্বাচন করুন'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        {/* Quantity input */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>পরিমাণ:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, parseInt(quantity || '1') - 1).toString())}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((parseInt(quantity || '1') + 1).toString())}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Price inputs */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>ক্রয় মূল্য:</Text>
          <TextInput
            style={styles.priceInput}
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>বিক্রয় মূল্য:</Text>
          <TextInput
            style={styles.priceInput}
            value={sellingPrice}
            onChangeText={setSellingPrice}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>লাভ:</Text>
          <Text style={styles.profitText}>৳ {calculateProfit().toFixed(2)}</Text>
        </View>
        
        {/* Add button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={addSelection}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.addButtonText}>যোগ করুন</Text>
        </TouchableOpacity>
        
        {/* Selected Products List */}
        {productSelections.length > 0 && (
          <View style={styles.selectionsContainer}>
            <Text style={styles.selectionsTitle}>নির্বাচিত পণ্য</Text>
            
            {productSelections.map((item, index) => (
              <View key={item.id} style={styles.selectionItem}>
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionCategory}>{item.category}</Text>
                  <Text style={styles.selectionDetails}>
                    {item.company !== 'None' ? `${item.company} • ` : ''}
                    {item.productType ? `${item.productType} • ` : ''}
                    {item.color ? `${item.color} • ` : ''}
                    {item.size ? `${item.size} ফুট • ` : ''}
                    {item.thickness ? `${item.thickness} mm • ` : ''}
                    {item.quantity} পিস
                  </Text>
                  <Text style={styles.selectionPrice}>
                    মূল্য: ৳{parseFloat(item.sellingPrice).toFixed(2)} × {item.quantity} = ৳{(item.sellingPrice * item.quantity).toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSelection(item.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF5722" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.cartButton}
              onPress={addSelectionsToCart}
            >
              <Text style={styles.cartButtonText}>
                কার্টে যোগ করুন ({productSelections.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ক্যাটাগরি নির্বাচন করুন</Text>
            <FlatList
              data={PRODUCT_CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(item);
                    setSelectedCompany(null);
                    setSelectedProductType(null);
                    setSelectedColor(null);
                    setSelectedSize(null);
                    setSelectedThickness(null);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {selectedCategory && selectedCategory.id === item.id && (
                    <Ionicons name="checkmark" size={24} color="#007BFF" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Company Modal */}
      <Modal
        visible={companyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCompanyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>কোম্পানি নির্বাচন করুন</Text>
            {selectedCategory && selectedCategory.companies && (
              <FlatList
                data={selectedCategory.companies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCompany(item);
                      setSelectedProductType(null);
                      setSelectedColor(null);
                      setCompanyModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {selectedCompany && selectedCompany.id === item.id && (
                      <Ionicons name="checkmark" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCompanyModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Product Type Modal */}
      <Modal
        visible={productTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProductTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>প্রোডাক্ট টাইপ নির্বাচন করুন</Text>
            {selectedCompany && selectedCompany.productTypes && (
              <FlatList
                data={selectedCompany.productTypes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedProductType(item);
                      setSelectedColor(null);
                      setProductTypeModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {selectedProductType && selectedProductType.id === item.id && (
                      <Ionicons name="checkmark" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setProductTypeModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Color Modal */}
      <Modal
        visible={colorModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setColorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>কালার নির্বাচন করুন</Text>
            {selectedProductType && selectedProductType.colors && (
              <FlatList
                data={selectedProductType.colors}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedColor(item);
                      setColorModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                    {selectedColor === item && (
                      <Ionicons name="checkmark" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setColorModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Size Modal */}
      <Modal
        visible={sizeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSizeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>সাইজ নির্বাচন করুন</Text>
            {selectedCategory && (
              <FlatList
                data={generateSizesForCategory(selectedCategory.id)}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedSize(item);
                      setSizeModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item} ফুট</Text>
                    {selectedSize === item && (
                      <Ionicons name="checkmark" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSizeModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Thickness Modal */}
      <Modal
        visible={thicknessModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setThicknessModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>পুরুত্ব নির্বাচন করুন</Text>
            {selectedProductType && selectedProductType.thicknesses && (
              <FlatList
                data={selectedProductType.thicknesses}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedThickness(item);
                      setThicknessModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item} mm</Text>
                    {selectedThickness === item && (
                      <Ionicons name="checkmark" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setThicknessModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  dropdownButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 48,
  },
  quantityButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  priceInput: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
  },
  profitText: {
    flex: 2,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  selectionsContainer: {
    marginTop: 20,
  },
  selectionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  selectionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  selectionInfo: {
    flex: 1,
  },
  selectionCategory: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  selectionDetails: {
    color: '#666',
    marginBottom: 4,
  },
  selectionPrice: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  cartButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  closeModalButton: {
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductSelectionScreen;