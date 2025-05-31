import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { PRODUCT_CATEGORIES, CategoryStructure, Company, ProductVariant, generateSizeRange } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductSelectionScreen() {
  const navigation = useNavigation();
  const { addItem } = useCart();
  
  // Selection states
  const [selectedCategory, setSelectedCategory] = useState<CategoryStructure | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedThickness, setSelectedThickness] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<string>('');
  
  // Selected products list for current session
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  
  // Reset dependent selections when a higher-level selection changes
  useEffect(() => {
    if (selectedCategory) {
      setSelectedCompany(null);
      setSelectedProductType(null);
      setSelectedColor(null);
      setSelectedThickness(null);
      setSelectedSize(null);
    }
  }, [selectedCategory]);
  
  useEffect(() => {
    if (selectedCompany) {
      setSelectedProductType(null);
      setSelectedColor(null);
      setSelectedThickness(null);
      setSelectedSize(null);
    }
  }, [selectedCompany]);
  
  useEffect(() => {
    if (selectedProductType) {
      setSelectedColor(null);
      setSelectedThickness(null);
      setSelectedSize(null);
    }
  }, [selectedProductType]);
  
  // Calculate profit amount
  const calculateProfit = () => {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    return (sell - buy) * quantity;
  };
  
  // Add current selection to cart
  const handleAddToSelection = () => {
    if (!validateSelection()) {
      return;
    }
    
    const newProduct = {
      id: new Date().getTime().toString(),
      category: selectedCategory?.name,
      company: selectedCompany?.name,
      product: selectedProductType?.name,
      color: selectedColor,
      thickness: selectedThickness,
      size: selectedSize,
      quantity,
      purchasePrice: parseFloat(buyPrice),
      sellingPrice: parseFloat(sellPrice),
      profit: calculateProfit()
    };
    
    setSelectedProducts([...selectedProducts, newProduct]);
    
    // Reset form for next selection
    setSelectedColor(null);
    setSelectedThickness(null);
    setSelectedSize(null);
    setQuantity(1);
    setBuyPrice('');
    setSellPrice('');
    
    Alert.alert("Success", "পণ্যটি যোগ করা হয়েছে");
  };
  
  // Validate all required fields are filled
  const validateSelection = () => {
    if (!selectedCategory) {
      Alert.alert("Error", "পণ্য ক্যাটাগরি সিলেক্ট করুন");
      return false;
    }
    
    if (!selectedCompany) {
      Alert.alert("Error", "কোম্পানি সিলেক্ট করুন");
      return false;
    }
    
    if (!selectedProductType) {
      Alert.alert("Error", "প্রোডাক্ট টাইপ সিলেক্ট করুন");
      return false;
    }
    
    if (selectedProductType.colors && selectedProductType.colors.length > 0 && !selectedColor) {
      Alert.alert("Error", "কালার সিলেক্ট করুন");
      return false;
    }
    
    if (selectedProductType.thicknesses && selectedProductType.thicknesses.length > 0 && !selectedThickness) {
      Alert.alert("Error", "পুরুত্ব সিলেক্ট করুন");
      return false;
    }
    
    const sizeArray = generateSizeRange(selectedCategory.id);
    if (sizeArray.length > 0 && !selectedSize) {
      Alert.alert("Error", "সাইজ সিলেক্ট করুন");
      return false;
    }
    
    if (!buyPrice) {
      Alert.alert("Error", "ক্রয়মূল্য প্রবেশ করুন");
      return false;
    }
    
    if (!sellPrice) {
      Alert.alert("Error", "বিক্রয়মূল্য প্রবেশ করুন");
      return false;
    }
    
    if (parseFloat(sellPrice) < parseFloat(buyPrice)) {
      Alert.alert("Warning", "বিক্রয়মূল্য ক্রয়মূল্য থেকে কম!");
      // Allow to continue despite warning
    }
    
    return true;
  };
  
  // Add all selected products to cart
  const handleAddAllToCart = () => {
    if (selectedProducts.length === 0) {
      Alert.alert("Error", "কার্টে পণ্য যোগ করার আগে কমপক্ষে একটি পণ্য সিলেক্ট করুন");
      return;
    }
    
    selectedProducts.forEach(product => {
      addItem({
        category: product.category,
        company: product.company,
        product: product.product,
        color: product.color,
        size: product.size,
        thickness: product.thickness,
        quantity: product.quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        profit: product.profit
      });
    });
    
    // Navigate to cart screen
    // @ts-ignore
    navigation.navigate('CartScreen');
  };
  
  // Remove a product from selection
  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };
  
  // Increase quantity
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  // Decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.formContainer}>
        {/* Category Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>পণ্যের ক্যাটাগরি নির্বাচন করুন:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory?.id || ''}
              onValueChange={(itemValue) => {
                const category = PRODUCT_CATEGORIES.find(c => c.id === itemValue);
                setSelectedCategory(category || null);
              }}
              style={styles.picker}
            >
              <Picker.Item label="-- ক্যাটাগরি সিলেক্ট করুন --" value="" />
              {PRODUCT_CATEGORIES.map((category) => (
                <Picker.Item 
                  key={category.id} 
                  label={category.name} 
                  value={category.id} 
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Company Selection - Show only if category is selected */}
        {selectedCategory && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>কোম্পানি নির্বাচন করুন:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCompany?.id || ''}
                onValueChange={(itemValue) => {
                  const company = selectedCategory.companies?.find(c => c.id === itemValue);
                  setSelectedCompany(company || null);
                }}
                style={styles.picker}
              >
                <Picker.Item label="-- কোম্পানি সিলেক্ট করুন --" value="" />
                {selectedCategory.companies?.map((company) => (
                  <Picker.Item 
                    key={company.id} 
                    label={company.name} 
                    value={company.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
        
        {/* Product Type Selection - Show only if company is selected */}
        {selectedCompany && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>প্রোডাক্ট টাইপ নির্বাচন করুন:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedProductType?.id || ''}
                onValueChange={(itemValue) => {
                  const productType = selectedCompany.productTypes.find(p => p.id === itemValue);
                  setSelectedProductType(productType || null);
                }}
                style={styles.picker}
              >
                <Picker.Item label="-- প্রোডাক্ট টাইপ সিলেক্ট করুন --" value="" />
                {selectedCompany.productTypes.map((product) => (
                  <Picker.Item 
                    key={product.id} 
                    label={product.name} 
                    value={product.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
        
        {/* Color Selection - Show only if product type has colors */}
        {selectedProductType?.colors && selectedProductType.colors.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>কালার নির্বাচন করুন:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedColor || ''}
                onValueChange={(itemValue) => setSelectedColor(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="-- কালার সিলেক্ট করুন --" value="" />
                {selectedProductType.colors.map((color) => (
                  <Picker.Item 
                    key={color} 
                    label={color} 
                    value={color} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
        
        {/* Thickness Selection - Show only if product type has thicknesses */}
        {selectedProductType?.thicknesses && selectedProductType.thicknesses.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>পুরুত্ব নির্বাচন করুন (মিলিমিটার):</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedThickness || ''}
                onValueChange={(itemValue) => setSelectedThickness(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="-- পুরুত্ব সিলেক্ট করুন --" value="" />
                {selectedProductType.thicknesses.map((thickness) => (
                  <Picker.Item 
                    key={thickness} 
                    label={thickness} 
                    value={thickness} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
        
        {/* Size Selection - Show only for categories with sizes */}
        {selectedCategory && generateSizeRange(selectedCategory.id).length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>সাইজ নির্বাচন করুন (ফুট):</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSize || ''}
                onValueChange={(itemValue) => setSelectedSize(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="-- সাইজ সিলেক্ট করুন --" value="" />
                {generateSizeRange(selectedCategory.id).map((size) => (
                  <Picker.Item 
                    key={size} 
                    label={size} 
                    value={size} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
        
        {/* Quantity Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>পরিমাণ:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
            >
              <Ionicons name="remove" size={24} color="#344955" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <Ionicons name="add" size={24} color="#344955" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Price Inputs */}
        <View style={styles.sectionContainer}>
          <View style={styles.priceContainer}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>ক্রয় মূল্য (৳):</Text>
              <TextInput 
                style={styles.priceInput} 
                keyboardType="numeric"
                value={buyPrice}
                onChangeText={setBuyPrice}
              />
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>বিক্রয় মূল্য (৳):</Text>
              <TextInput 
                style={styles.priceInput} 
                keyboardType="numeric"
                value={sellPrice}
                onChangeText={setSellPrice}
              />
            </View>
          </View>
          
          <View style={styles.profitContainer}>
            <Text style={styles.profitLabel}>লাভ:</Text>
            <Text style={styles.profitAmount}>৳{calculateProfit().toFixed(2)}</Text>
          </View>
        </View>
        
        {/* Add to Selection Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToSelection}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>পণ্য যোগ করুন</Text>
        </TouchableOpacity>
        
        {/* Selected Products List */}
        {selectedProducts.length > 0 && (
          <View style={styles.selectedProductsContainer}>
            <Text style={styles.selectedProductsTitle}>নির্বাচিত পণ্যসমূহ:</Text>
            
            <FlatList
              data={selectedProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.selectedProductItem}>
                  <View style={styles.productDetails}>
                    <Text style={styles.productCategory}>{item.category}</Text>
                    <Text style={styles.productInfo}>
                      {item.company} {item.product}
                      {item.color ? ` - ${item.color}` : ''}
                      {item.thickness ? ` - ${item.thickness}mm` : ''}
                      {item.size ? ` - ${item.size}ft` : ''}
                    </Text>
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productQuantity}>
                        পরিমাণ: {item.quantity}
                      </Text>
                      <Text style={styles.productPrice}>
                        মূল্য: ৳{item.sellingPrice} × {item.quantity} = ৳{(item.sellingPrice * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveProduct(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.productList}
            />
            
            {/* Total Amount */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>মোট:</Text>
              <Text style={styles.totalAmount}>
                ৳{selectedProducts.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0).toFixed(2)}
              </Text>
            </View>
            
            {/* Add All to Cart Button */}
            <TouchableOpacity
              style={styles.cartButton}
              onPress={handleAddAllToCart}
            >
              <Ionicons name="cart-outline" size={20} color="#FFF" />
              <Text style={styles.cartButtonText}>কার্টে যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  formContainer: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#344955',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    width: '48%',
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#4A6572',
  },
  priceInput: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  profitContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  profitLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#344955',
  },
  profitAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#344955',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  selectedProductsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selectedProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#344955',
  },
  productList: {
    maxHeight: 300,
  },
  selectedProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productDetails: {
    flex: 1,
  },
  productCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
  },
  productInfo: {
    fontSize: 14,
    color: '#4A6572',
    marginVertical: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#4A6572',
  },
  productPrice: {
    fontSize: 14,
    color: '#4A6572',
  },
  removeButton: {
    padding: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#344955',
  },
  cartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  cartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});