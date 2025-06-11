import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Platform,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const navigation = useNavigation();
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart } = useCart();

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Payment info
  const [subtotal, setSubtotal] = useState(0);
  const [discountPercent, setDiscountPercent] = useState('0');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState('0');
  const [dueAmount, setDueAmount] = useState(0);
  
  // Checkout modal
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  
  // Calculate totals
  useEffect(() => {
    if (!cartItems) return;
    
    const subTotal = cartItems.reduce(
      (acc, item) => acc + (item.salePrice * (item.quantity || 1)), 0
    );
    
    setSubtotal(subTotal);
    
    const discount = (parseFloat(discountPercent) / 100) * subTotal;
    setDiscountAmount(discount);
    
    const total = subTotal - discount;
    setTotalAmount(total);
    
    const advance = parseFloat(advanceAmount) || 0;
    setDueAmount(Math.max(0, total - advance));
    
  }, [cartItems, discountPercent, advanceAmount]);

  const handleIncreaseQuantity = (id) => {
    if (!cartItems) return;
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateCartItemQuantity(id, (item.quantity || 1) + 1);
    }
  };

  const handleDecreaseQuantity = (id) => {
    if (!cartItems) return;
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateCartItemQuantity(id, item.quantity - 1);
    }
  };

  const handleRemoveItem = (id) => {
    Alert.alert(
      'নিশ্চিত করুন',
      'আপনি কি এই পণ্যটি কার্ট থেকে সরাতে চান?',
      [
        { text: 'না', style: 'cancel' },
        { text: 'হ্যাঁ', onPress: () => removeFromCart(id) }
      ]
    );
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('ত্রুটি', 'কার্টে কোন পণ্য নেই।');
      return;
    }
    
    setCheckoutModalVisible(true);
  };

  const handleCompleteCheckout = async () => {
    if (!customerName) {
      Alert.alert('ত্রুটি', 'কাস্টমারের নাম লিখুন।');
      return;
    }
    
    try {
      // Create transaction record
      const transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        customerName,
        customerMobile,
        customerAddress,
        items: cartItems,
        subtotal,
        discountPercent: parseFloat(discountPercent),
        discountAmount,
        total: totalAmount,
        advance: parseFloat(advanceAmount) || 0,
        due: dueAmount,
      };
      
      // Save to AsyncStorage
      const savedTransactions = await AsyncStorage.getItem('recentTransactions');
      const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
      transactions.unshift(transaction);
      await AsyncStorage.setItem('recentTransactions', JSON.stringify(transactions));
      
      // Clear cart and close modal
      clearCart();
      setCheckoutModalVisible(false);
      
      // Reset form
      setCustomerName('');
      setCustomerMobile('');
      setCustomerAddress('');
      setDiscountPercent('0');
      setAdvanceAmount('0');
      
      // Show success message
      Alert.alert(
        'সফল',
        'বিক্রয় সম্পন্ন হয়েছে।',
        [
          { text: 'ঠিক আছে', onPress: () => navigation.navigate('Home' as never) }
        ]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('ত্রুটি', 'বিক্রয় সম্পন্ন করতে সমস্যা হয়েছে।');
    }
  };

  // Calculate profit amount
  const calculateProfit = (item) => {
    const sellingPrice = item.salePrice || 0;
    const purchasePrice = item.purchasePrice || 0;
    return (sellingPrice - purchasePrice) * (item.quantity || 1);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString('bn-BD')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>আপনার কার্ট</Text>
          {cartItems && cartItems.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                Alert.alert(
                  'নিশ্চিত করুন',
                  'আপনি কি কার্ট পরিষ্কার করতে চান?',
                  [
                    { text: 'না', style: 'cancel' },
                    { text: 'হ্যাঁ', onPress: () => clearCart() }
                  ]
                );
              }}
            >
              <MaterialIcons name="delete-sweep" size={24} color="#ff5722" />
            </TouchableOpacity>
          )}
        </View>

        {!cartItems || cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <MaterialIcons name="shopping-cart" size={80} color="#e0e0e0" />
            <Text style={styles.emptyCartText}>আপনার কার্ট খালি</Text>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => navigation.navigate('ProductSelection' as never)}
            >
              <Text style={styles.shopNowButtonText}>পণ্য নির্বাচন করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartItemsContainer}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemInfo}>
                    <View>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      <Text style={styles.itemDetails}>
                        {item.company ? `${item.company}, ` : ''}
                        {item.type ? `${item.type}, ` : ''}
                        {item.color ? `${item.color}, ` : ''}
                        {item.thickness ? `${item.thickness} মিমি, ` : ''}
                        {item.size}
                      </Text>
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(item.salePrice || 0)} × {item.quantity || 1}
                      </Text>
                      <Text style={styles.itemTotalPrice}>
                        {formatCurrency((item.salePrice || 0) * (item.quantity || 1))}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.itemActions}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleDecreaseQuantity(item.id)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity || 1}</Text>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleIncreaseQuantity(item.id)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <MaterialIcons name="delete" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.profitContainer}>
                    <Text style={styles.profitText}>
                      লাভ: {formatCurrency(calculateProfit(item))}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>মোট পণ্য</Text>
                <Text style={styles.summaryValue}>{cartItems ? cartItems.length : 0}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>সাবটোটাল</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ডিসকাউন্ট</Text>
                <Text style={styles.summaryValue}>{formatCurrency(discountAmount)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelTotal}>মোট</Text>
                <Text style={styles.summaryValueTotal}>{formatCurrency(totalAmount)}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>চেকআউট</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
        
        {/* Checkout Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={checkoutModalVisible}
          onRequestClose={() => setCheckoutModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>বিক্রয় সম্পন্ন করুন</Text>
              
              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.modalSectionTitle}>কাস্টমার তথ্য</Text>
                
                <Text style={styles.inputLabel}>কাস্টমারের নাম *</Text>
                <TextInput
                  style={styles.input}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="কাস্টমারের নাম লিখুন"
                />
                
                <Text style={styles.inputLabel}>মোবাইল নম্বর</Text>
                <TextInput
                  style={styles.input}
                  value={customerMobile}
                  onChangeText={setCustomerMobile}
                  placeholder="মোবাইল নম্বর লিখুন"
                  keyboardType="phone-pad"
                />
                
                <Text style={styles.inputLabel}>ঠিকানা</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  placeholder="ঠিকানা লিখুন"
                  multiline
                  numberOfLines={3}
                />
                
                <Text style={styles.modalSectionTitle}>অর্থ প্রদান</Text>
                
                <Text style={styles.inputLabel}>ডিসকাউন্ট (%)</Text>
                <TextInput
                  style={styles.input}
                  value={discountPercent}
                  onChangeText={setDiscountPercent}
                  placeholder="ডিসকাউন্ট শতাংশ"
                  keyboardType="numeric"
                />
                
                <Text style={styles.inputLabel}>অগ্রিম (৳)</Text>
                <TextInput
                  style={styles.input}
                  value={advanceAmount}
                  onChangeText={setAdvanceAmount}
                  placeholder="অগ্রিম পরিমাণ"
                  keyboardType="numeric"
                />
                
                <View style={styles.paymentSummary}>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>সাবটোটাল:</Text>
                    <Text style={styles.paymentValue}>{formatCurrency(subtotal)}</Text>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>ডিসকাউন্ট:</Text>
                    <Text style={styles.paymentValue}>- {formatCurrency(discountAmount)}</Text>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>মোট:</Text>
                    <Text style={styles.paymentValue}>{formatCurrency(totalAmount)}</Text>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>অগ্রিম:</Text>
                    <Text style={styles.paymentValue}>{formatCurrency(parseFloat(advanceAmount) || 0)}</Text>
                  </View>
                  
                  <View style={[styles.paymentRow, styles.dueRow]}>
                    <Text style={styles.dueLabel}>বাকি:</Text>
                    <Text style={styles.dueValue}>{formatCurrency(dueAmount)}</Text>
                  </View>
                </View>
                
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setCheckoutModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>বাতিল</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleCompleteCheckout}
                  >
                    <Text style={styles.confirmButtonText}>সম্পন্ন করুন</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#757575',
    marginVertical: 16,
  },
  shopNowButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemsContainer: {
    flex: 1,
  },
  cartItem: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    width: 32,
    textAlign: 'center',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#f44336',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profitContainer: {
    marginTop: 10,
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 4,
  },
  profitText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  checkoutButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 6,
    marginTop: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalScrollView: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2196f3',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentSummary: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginVertical: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 15,
    color: '#666',
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  dueRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dueLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  dueValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 14,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});