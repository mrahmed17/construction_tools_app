import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BillInfo, CartItem, Product } from '../types';

export default function CartScreen() {
  const navigation = useNavigation();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState('0');
  const [advance, setAdvance] = useState('0');

  // Calculate final total after discount
  const discountAmount = Number(discount) || 0;
  const advanceAmount = Number(advance) || 0;
  const finalTotal = Math.max(0, total - discountAmount);
  const dueAmount = Math.max(0, finalTotal - advanceAmount);

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    updateQuantity(item.productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'নিশ্চিতকরণ',
      'আপনি কি এই পণ্যটি কার্ট থেকে সরাতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        { text: 'হ্যাঁ', onPress: () => removeItem(productId) }
      ]
    );
  };

  const calculateProfit = (item: CartItem) => {
    const { product, quantity } = item;
    return (product.sellingPrice - product.purchasePrice) * quantity;
  };

  const handleCompletePurchase = async () => {
    if (!customerName.trim()) {
      Alert.alert('ত্রুটি', 'কাস্টমারের নাম দিন');
      return;
    }

    try {
      // Generate bill info
      const billInfo: BillInfo = {
        customerName,
        customerPhone,
        customerAddress,
        date: new Date().toISOString(),
        discount: Number(discount) || 0,
        advance: Number(advance) || 0,
        totalAmount: finalTotal,
        items: [...items]
      };
      
      // Generate unique bill ID
      const billId = `BILL-${Date.now()}`;
      
      // Store bill in AsyncStorage
      await AsyncStorage.setItem(`bill_${billId}`, JSON.stringify(billInfo));
      
      // Store in transaction history
      const transactionsJson = await AsyncStorage.getItem('transactions');
      const transactions = transactionsJson ? JSON.parse(transactionsJson) : [];
      transactions.push({
        id: billId,
        date: billInfo.date,
        customer: billInfo.customerName,
        amount: billInfo.totalAmount,
        type: 'sale'
      });
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      
      // Update product stock
      await updateProductStock(items);
      
      // Clear cart
      clearCart();
      
      Alert.alert(
        'সম্পন্ন',
        'বিক্রয় সফল হয়েছে',
        [
          { text: 'ঠিক আছে', onPress: () => navigation.navigate('Dashboard' as never) }
        ]
      );
    } catch (error) {
      console.error('Error completing purchase:', error);
      Alert.alert('ত্রুটি', 'বিক্রয় সম্পন্ন করতে ব্যর্থ');
    }
  };
  
  const updateProductStock = async (cartItems: CartItem[]) => {
    try {
      // Get current products
      const productsJson = await AsyncStorage.getItem('products');
      if (!productsJson) return;
      
      const products: Product[] = JSON.parse(productsJson);
      
      // Update stock for each product
      const updatedProducts = products.map(product => {
        const cartItem = cartItems.find(item => item.productId === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: Math.max(0, product.stock - cartItem.quantity)
          };
        }
        return product;
      });
      
      // Save updated products
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Add stock transaction records
      const stockTransactions = cartItems.map(item => ({
        id: `ST-OUT-${Date.now()}-${item.productId}`,
        productId: item.productId,
        date: new Date().toISOString(),
        quantity: item.quantity,
        type: 'out' as const
      }));
      
      const stockHistoryJson = await AsyncStorage.getItem('stockHistory');
      const stockHistory = stockHistoryJson ? JSON.parse(stockHistoryJson) : [];
      await AsyncStorage.setItem('stockHistory', JSON.stringify([...stockHistory, ...stockTransactions]));
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>কার্ট</Text>
        </View>
        
        {items.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyCartText}>কার্ট খালি</Text>
            <TouchableOpacity 
              style={styles.continueShopping}
              onPress={() => navigation.navigate('ProductSelection' as never)}
            >
              <Text style={styles.continueShoppingText}>পণ্য যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Items list */}
            <View style={styles.itemsContainer}>
              <Text style={styles.sectionTitle}>পণ্য তালিকা</Text>
              <FlatList
                data={items}
                keyExtractor={(item) => item.productId}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>
                        {item.product.category} {item.product.company && `- ${item.product.company}`}
                      </Text>
                      <Text style={styles.itemSpecs}>
                        {[
                          item.product.type,
                          item.product.thickness && `${item.product.thickness} মিমি`,
                          item.product.size && `${item.product.size}'`
                        ].filter(Boolean).join(', ')}
                      </Text>
                      <Text style={styles.itemPrice}>
                        ৳{item.product.sellingPrice} × {item.quantity} = ৳{item.product.sellingPrice * item.quantity}
                      </Text>
                      <Text style={styles.profit}>
                        লাভ: ৳{calculateProfit(item)}
                      </Text>
                    </View>
                    
                    <View style={styles.itemActions}>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity 
                          onPress={() => handleQuantityChange(item, item.quantity - 1)}
                          style={styles.quantityButton}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.quantityInput}
                          value={item.quantity.toString()}
                          onChangeText={(text) => {
                            const qty = parseInt(text);
                            if (!isNaN(qty)) handleQuantityChange(item, qty);
                          }}
                          keyboardType="number-pad"
                        />
                        <TouchableOpacity 
                          onPress={() => handleQuantityChange(item, item.quantity + 1)}
                          style={styles.quantityButton}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity 
                        onPress={() => handleRemoveItem(item.productId)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
            
            {/* Customer Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>কাস্টমারের তথ্য</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>নাম</Text>
                <TextInput
                  style={styles.input}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="কাস্টমারের নাম"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ফোন</Text>
                <TextInput
                  style={styles.input}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="কাস্টমারের ফোন"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ঠিকানা</Text>
                <TextInput
                  style={styles.input}
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  placeholder="কাস্টমারের ঠিকানা"
                  multiline
                />
              </View>
            </View>
            
            {/* Price Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>দাম হিসাব</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>মোট দাম</Text>
                <Text style={styles.summaryValue}>৳{total.toLocaleString()}</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ছাড়</Text>
                <TextInput
                  style={styles.input}
                  value={discount}
                  onChangeText={setDiscount}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ছাড়ের পরে মোট</Text>
                <Text style={styles.summaryValue}>৳{finalTotal.toLocaleString()}</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>অগ্রিম</Text>
                <TextInput
                  style={styles.input}
                  value={advance}
                  onChangeText={setAdvance}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>বাকি</Text>
                <Text style={[styles.summaryValue, styles.dueAmount]}>৳{dueAmount.toLocaleString()}</Text>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  Alert.alert(
                    'নিশ্চিতকরণ',
                    'আপনি কি সমস্ত কার্ট বাতিল করতে চান?',
                    [
                      { text: 'না', style: 'cancel' },
                      { text: 'হ্যাঁ', onPress: () => clearCart() }
                    ]
                  );
                }}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.completeButton]}
                onPress={handleCompletePurchase}
              >
                <Text style={styles.buttonText}>বিক্রয় সম্পন্ন</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#344955',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  continueShopping: {
    backgroundColor: '#344955',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#344955',
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemDetails: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 3,
  },
  itemSpecs: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 15,
    color: '#333',
    marginBottom: 3,
  },
  profit: {
    fontSize: 14,
    color: '#4CD964',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 4,
  },
  removeButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
  },
  dueAmount: {
    color: '#FF3B30',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  completeButton: {
    backgroundColor: '#4CD964',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});