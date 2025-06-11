import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useCart } from '../context/CartContext';

// Mock cart items for now until we have useCart implemented
const mockCartItems = [
  {
    id: '1',
    category: 'টিন',
    company: 'PHP',
    productType: 'কালার',
    color: 'CNG (ডার্ক গ্রীন)',
    size: '৬ ফুট',
    thickness: '০.১৮০',
    quantity: 5,
    purchasePrice: 1200,
    sellingPrice: 1400,
    profit: 1000
  },
  {
    id: '2',
    category: 'টুয়া',
    company: 'KY',
    productType: 'NOF',
    size: '৮ ফুট',
    thickness: '০.২২০',
    quantity: 3,
    purchasePrice: 1500,
    sellingPrice: 1800,
    profit: 900
  },
  {
    id: '3',
    category: 'ফুলের শিট',
    productType: 'টাইপ ১',
    size: '১০ ফুট',
    thickness: '০.২০০',
    quantity: 2,
    purchasePrice: 1800,
    sellingPrice: 2200,
    profit: 800
  }
];

export default function CartScreen() {
  const navigation = useNavigation();
  // const { items, removeItem, updateQuantity, clearCart, getTotalAmount, getTotalProfit } = useCart();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  
  // Use mock data for now
  const cartItems = mockCartItems;
  
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.sellingPrice * item.quantity, 
    0
  );
  
  const totalProfit = cartItems.reduce(
    (total, item) => total + item.profit, 
    0
  );
  
  const discountAmount = parseFloat(discount) || 0;
  const finalAmount = totalAmount - discountAmount;
  const paidAmountValue = parseFloat(paidAmount) || 0;
  const dueAmount = finalAmount - paidAmountValue;
  
  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'নিশ্চিতকরণ',
      'আপনি কি এই আইটেমটি মুছতে চান?',
      [
        {
          text: 'না',
          style: 'cancel'
        },
        {
          text: 'হ্যাঁ',
          onPress: () => {
            // In a real app: removeItem(id);
            Alert.alert('আইটেম মুছে ফেলা হয়েছে');
          }
        }
      ]
    );
  };
  
  const increaseQuantity = (id: string, currentQuantity: number) => {
    // In a real app: updateQuantity(id, currentQuantity + 1);
  };
  
  const decreaseQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      // In a real app: updateQuantity(id, currentQuantity - 1);
    }
  };
  
  const handleCheckout = () => {
    // Validation
    if (!customerName.trim()) {
      Alert.alert('গ্রাহক নাম প্রয়োজন', 'গ্রাহকের নাম দিন');
      return;
    }
    
    setConfirmModalVisible(true);
  };
  
  const confirmCheckout = () => {
    // In a real app, this would save the order to the database and clear the cart
    
    const invoice = {
      id: `INV-${Date.now()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: cartItems,
      totalAmount,
      discount: discountAmount,
      finalAmount,
      totalProfit,
      date: new Date(),
      paidAmount: paidAmountValue,
      dueAmount,
    };
    
    // Save the invoice to the database
    // clearCart();
    
    setConfirmModalVisible(false);
    Alert.alert('সফল', 'বিক্রয় সম্পন্ন হয়েছে', [
      {
        text: 'ঠিক আছে',
        onPress: () => navigation.navigate('Home' as never)
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>কার্ট</Text>
        <TouchableOpacity onPress={() => Alert.alert('কার্ট সাফ করুন?', 'আপনি কি কার্ট সাফ করতে চান?', [
          { text: 'না', style: 'cancel' },
          { text: 'হ্যাঁ', onPress: () => {
            // In a real app: clearCart();
            Alert.alert('কার্ট সাফ করা হয়েছে');
          }}
        ])}>
          <Ionicons name="trash-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyCartText}>কার্ট খালি</Text>
            <TouchableOpacity 
              style={styles.emptyCartButton}
              onPress={() => navigation.navigate('ProductSelection' as never)}
            >
              <Text style={styles.emptyCartButtonText}>পণ্য যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            {cartItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemHeader}>
                  <Text style={styles.cartItemCategory}>
                    {item.category} {item.company ? `• ${item.company}` : ''} • {item.productType}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Ionicons name="close-circle" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.cartItemDetails}>
                  {item.color && <Text style={styles.detailText}>কালার: {item.color}</Text>}
                  {item.size && <Text style={styles.detailText}>সাইজ: {item.size}</Text>}
                  {item.thickness && <Text style={styles.detailText}>পুরুত্ব: {item.thickness}</Text>}
                </View>
                
                <View style={styles.cartItemFooter}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => decreaseQuantity(item.id, item.quantity)}
                    >
                      <Ionicons name="remove" size={18} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => increaseQuantity(item.id, item.quantity)}
                    >
                      <Ionicons name="add" size={18} color="#333" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>দাম:</Text>
                    <Text style={styles.priceValue}>৳{item.sellingPrice}/টি = ৳{item.sellingPrice * item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
            
            {/* Customer Information */}
            <View style={styles.sectionTitle}>
              <MaterialIcons name="person" size={24} color="#333" />
              <Text style={styles.sectionTitleText}>গ্রাহকের তথ্য</Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>নাম</Text>
                <TextInput
                  style={styles.input}
                  placeholder="গ্রাহকের নাম"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>
              
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>মোবাইল</Text>
                <TextInput
                  style={styles.input}
                  placeholder="গ্রাহকের মোবাইল নম্বর"
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>
              
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>ঠিকানা</Text>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  placeholder="গ্রাহকের ঠিকানা"
                  multiline
                  numberOfLines={3}
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                />
              </View>
            </View>
            
            {/* Order Summary */}
            <View style={styles.sectionTitle}>
              <MaterialIcons name="receipt" size={24} color="#333" />
              <Text style={styles.sectionTitleText}>বিল সারসংক্ষেপ</Text>
            </View>
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>মোট মূল্য</Text>
                <Text style={styles.summaryValue}>৳{totalAmount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.discountRow}>
                <Text style={styles.summaryLabel}>ডিসকাউন্ট</Text>
                <TextInput
                  style={styles.discountInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={discount}
                  onChangeText={setDiscount}
                />
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>সর্বমোট</Text>
                <Text style={styles.finalAmount}>৳{finalAmount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.discountRow}>
                <Text style={styles.summaryLabel}>প্রদানকৃত</Text>
                <TextInput
                  style={styles.discountInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                />
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>বাকি</Text>
                <Text style={[styles.finalAmount, dueAmount > 0 ? styles.dueAmount : null]}>
                  ৳{dueAmount.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.profitRow}>
                <Text style={styles.profitLabel}>মোট লাভ:</Text>
                <Text style={styles.profitValue}>৳{totalProfit.toFixed(2)}</Text>
              </View>
            </View>
            
            {/* Checkout Button */}
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>বিক্রয় সম্পন্ন করুন</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      
      {/* Confirm Checkout Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>বিক্রয় নিশ্চিতকরণ</Text>
            
            <Text style={styles.modalText}>গ্রাহক: {customerName}</Text>
            <Text style={styles.modalText}>মোট আইটেম: {cartItems.length}</Text>
            <Text style={styles.modalText}>সর্বমোট: ৳{finalAmount.toFixed(2)}</Text>
            
            {dueAmount > 0 && (
              <Text style={[styles.modalText, styles.dueText]}>বাকি: ৳{dueAmount.toFixed(2)}</Text>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmCheckout}
              >
                <Text style={styles.confirmButtonText}>নিশ্চিত করুন</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#888',
    marginVertical: 16,
  },
  emptyCartButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
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
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartItemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartItemDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  discountInput: {
    width: 120,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '600',
    padding: 4,
  },
  finalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dueAmount: {
    color: '#FF3B30',
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  profitLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
  profitValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  dueText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});