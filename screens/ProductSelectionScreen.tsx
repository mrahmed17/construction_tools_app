import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { CATEGORIES, Product } from '../types';
import { toast } from 'sonner-native';

interface ProductSelectionScreenProps {
  navigation: any;
  route: any;
}

export default function ProductSelectionScreen({ navigation, route }: ProductSelectionScreenProps) {
  const { category } = route.params;
  const { addToCart } = useCart();
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedThickness, setSelectedThickness] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [productItems, setProductItems] = useState<any[]>([]);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [dropdownType, setDropdownType] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState<{label: string; value: any}[]>([]);

  const categoryData = CATEGORIES[category as keyof typeof CATEGORIES];

  const showDropdown = (type: string, options: {label: string; value: any}[]) => {
    setDropdownType(type);
    setDropdownOptions(options);
    setShowDropdownModal(true);
  };

  const handleDropdownSelect = (value: any) => {
    switch (dropdownType) {
      case 'company':
        setSelectedCompany(value);
        // Reset dependent selections
        setSelectedThickness(null);
        break;
      case 'product':
        setSelectedProduct(value);
        // Reset color if switching away from color product
        if (value !== 'কালার') {
          setSelectedColor('');
        }
        break;
      case 'color':
        setSelectedColor(value);
        break;
      case 'size':
        setSelectedSize(value);
        break;
      case 'thickness':
        setSelectedThickness(value);
        break;
    }
    setShowDropdownModal(false);
  };

  useEffect(() => {
    if (!categoryData) {
      navigation.goBack();
      toast.error('ক্যাটেগরি পাওয়া যায়নি');
    }
  }, [categoryData]);

  const calculateProfit = (purchase: string, sale: string): number => {
    const buyPrice = parseFloat(purchase) || 0;
    const sellPrice = parseFloat(sale) || 0;
    return sellPrice - buyPrice;
  };

  const addProductItem = () => {
    if (!purchasePrice || !salePrice) {
      toast.error('ক্রয় মূল্য এবং বিক্রয় মূল্য দিন');
      return;
    }

    const pPrice = parseFloat(purchasePrice);
    const sPrice = parseFloat(salePrice);

    if (isNaN(pPrice) || isNaN(sPrice)) {
      toast.error('সঠিক মূল্য দিন');
      return;
    }

    if (sPrice <= pPrice) {
      toast.error('বিক্রয় মূল্য ক্রয় মূল্যের চেয়ে বেশি হতে হবে');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      company: selectedCompany,
      product: selectedProduct,
      color: selectedColor,
      thickness: selectedThickness,
      size: selectedSize,
      purchasePrice: pPrice,
      salePrice: sPrice,
      profit: sPrice - pPrice,
      quantity: 1
    };
    setProductItems([...productItems, newItem]);
    
    // Reset selections
    setSelectedCompany('');
    setSelectedProduct('');
    setSelectedColor('');
    setSelectedThickness(null);
    setSelectedSize(null);
    setPurchasePrice('');
    setSalePrice('');
  };

  const removeProductItem = (id: string) => {
    setProductItems(productItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProductItem(id);
      return;
    }
    setProductItems(productItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const addToCartHandler = () => {
    if (productItems.length === 0) {
      toast.error('কমপক্ষে একটি পণ্য যোগ করুন');
      return;
    }

    productItems.forEach(item => {
      const product: Product = {
        id: `${category}-${item.company}-${item.product}-${item.thickness}-${item.size}`,
        category: categoryData.name,
        company: item.company,
        type: item.product,
        color: item.color,
        thickness: item.thickness,
        size: item.size,
        purchasePrice: item.purchasePrice,
        salePrice: item.salePrice,
        stock: 50, // Mock stock
        minStock: 10,
        unit: categoryData.unit || 'sheet'
      };

      addToCart(product, item.quantity, {
        selectedThickness: item.thickness,
        selectedSize: item.size,
        selectedColor: item.color
      });
    });

    toast.success(`${productItems.length}টি পণ্য কার্টে যোগ করা হয়েছে`);
    navigation.navigate('Cart');
  };

  const canAddProduct = () => {
    if (categoryData.companies.length > 0 && !selectedCompany) return false;
    if (!selectedProduct) return false;
    if (categoryData.colors.length > 0 && selectedProduct === 'কালার' && !selectedColor) return false;
    if (categoryData.sizes.length > 0 && !selectedSize) return false;
    if (Object.keys(categoryData.thicknesses).length > 0 && !selectedThickness) return false;
    if (!purchasePrice || !salePrice) return false;
    return true;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryData?.name} নির্বাচন</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>        
        {/* Company Selection */}
        {categoryData.companies.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>কোম্পানি নির্বাচন করুন</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                // Company selection dropdown
                const options = categoryData.companies.map(company => ({
                  label: company,
                  value: company
                }));
                showDropdown('company', options);
              }}
            >
              <Text style={styles.dropdownText}>
                {selectedCompany || 'কোম্পানি নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Product Type Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>পণ্যের ধরন নির্বাচন করুন</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              const options = categoryData.products.map(product => ({
                label: product,
                value: product
              }));
              showDropdown('product', options);
            }}
          >
            <Text style={styles.dropdownText}>
              {selectedProduct || 'পণ্যের ধরন নির্বাচন করুন'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Color Selection */}
        {selectedProduct === 'কালার' && categoryData.colors.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>রং নির্বাচন করুন</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                const options = categoryData.colors.map(color => ({
                  label: color,
                  value: color
                }));
                showDropdown('color', options);
              }}
            >
              <Text style={styles.dropdownText}>
                {selectedColor || 'রং নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Size Selection */}
        {categoryData.sizes.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>সাইজ নির্বাচন করুন (ফুট)</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                const options = categoryData.sizes.map(size => ({
                  label: `${size} ফুট`,
                  value: size
                }));
                showDropdown('size', options);
              }}
            >
              <Text style={styles.dropdownText}>
                {selectedSize ? `${selectedSize} ফুট` : 'সাইজ নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Thickness Selection */}
        {selectedCompany && categoryData.thicknesses[selectedCompany] && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>পুরুত্ব নির্বাচন করুন (মিমি)</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                const options = categoryData.thicknesses[selectedCompany].map(thickness => ({
                  label: `${thickness} মিমি`,
                  value: thickness
                }));
                showDropdown('thickness', options);
              }}
            >
              <Text style={styles.dropdownText}>
                {selectedThickness ? `${selectedThickness} মিমি` : 'পুরুত্ব নির্বাচন করুন'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Price Inputs */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>মূল্য নির্ধারণ</Text>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>ক্রয় মূল্য (৳)</Text>
              <TextInput
                style={styles.priceInput}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>বিক্রয় মূল্য (৳)</Text>
              <TextInput
                style={styles.priceInput}
                value={salePrice}
                onChangeText={setSalePrice}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>
          
          {purchasePrice && salePrice && (
            <View style={styles.profitContainer}>
              <Text style={styles.profitLabel}>লাভ:</Text>
              <Text style={styles.profitValue}>
                ৳{calculateProfit(purchasePrice, salePrice).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Add Product Button */}
        <TouchableOpacity
          style={[styles.addButton, !canAddProduct() && styles.addButtonDisabled]}
          onPress={addProductItem}
          disabled={!canAddProduct()}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addButtonText}>পণ্য যোগ করুন</Text>
        </TouchableOpacity>

        {/* Selected Products List */}
        {productItems.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>নির্বাচিত পণ্যসমূহ</Text>
            {productItems.map(item => (
              <View key={item.id} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>
                    {item.company} - {item.product}
                    {item.color && ` - ${item.color}`}
                  </Text>
                  <Text style={styles.productDetails}>
                    {item.size && `${item.size} ফুট`}
                    {item.thickness && ` × ${item.thickness} মিমি`}
                  </Text>
                  <Text style={styles.productPrice}>
                    ক্রয়: ৳{item.purchasePrice} | বিক্রয়: ৳{item.salePrice} | লাভ: ৳{item.profit}
                  </Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeProductItem(item.id)}
                >
                  <Ionicons name="trash" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>      
      
      {/* Bottom Actions */}
      {productItems.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={addToCartHandler}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.cartButtonText}>কার্টে যোগ করুন ({productItems.length})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdownModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdownModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>নির্বাচন করুন</Text>
              <TouchableOpacity onPress={() => setShowDropdownModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownContent}>
              {dropdownOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => handleDropdownSelect(option.value)}
                >
                  <Text style={styles.dropdownOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },  
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    maxHeight: '70%',
    width: '80%',
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownContent: {
    maxHeight: 300,
  },
  dropdownOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    height: 50,
    fontSize: 16,
  },
  profitContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 14,
    color: '#555',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  productDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 12,
    color: '#1976D2',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cartButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});