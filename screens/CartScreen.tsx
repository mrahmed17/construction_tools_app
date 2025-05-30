import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner-native';

interface CartScreenProps {
  navigation: any;
}

export default function CartScreen({ navigation }: CartScreenProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartSubtotal, getCartProfit } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = getCartSubtotal();
  const profit = getCartProfit();
  const total = subtotal - discount;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('কার্ট খালি আছে');
      return;
    }

    if (!customerName.trim()) {
      toast.error('গ্রাহকের নাম প্রয়োজন');
      return;
    }

    // Create bill/invoice
    const bill = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      items: cartItems,
      subtotal,
      discount,
      total,
      profit,
      date: new Date().toISOString()
    };

    // In real app, save to database
    console.log('Bill created:', bill);
    
    // Clear cart and reset form
    clearCart();
    setCustomerName('');
    setCustomerAddress('');
    setDiscount(0);
    
    toast.success('বিল সফলভাবে তৈরি হয়েছে!');
    navigation.navigate('Home');
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>কার্ট</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>আপনার কার্ট খালি</Text>
          <Text style={styles.emptySubtitle}>পণ্য যোগ করতে শপিং শুরু করুন</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>শপিং শুরু করুন</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>কার্ট ({cartItems.length})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>গ্রাহকের তথ্য</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>গ্রাহকের নাম *</Text>
            <TextInput
              style={styles.textInput}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="গ্রাহকের নাম লিখুন"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ঠিকানা</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={customerAddress}
              onChangeText={setCustomerAddress}
              placeholder="গ্রাহকের ঠিকানা লিখুন"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>পণ্যের তালিকা</Text>
          {cartItems.map((item, index) => (
            <View key={`${item.productId}-${index}`} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>
                  {item.product.category}
                  {item.product.company && ` - ${item.product.company}`}
                </Text>
                <Text style={styles.itemSubtitle}>
                  {item.product.type}
                  {item.selectedColor && ` - ${item.selectedColor}`}
                </Text>
                <Text style={styles.itemDetails}>
                  {item.selectedSize && `${item.selectedSize} ফুট`}
                  {item.selectedThickness && ` × ${item.selectedThickness} মিমি`}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>ক্রয়: ৳{item.product.purchasePrice}</Text>
                  <Text style={styles.priceLabel}>বিক্রয়: ৳{item.product.salePrice}</Text>
                  <Text style={styles.profitLabel}>
                    লাভ: ৳{(item.product.salePrice - item.product.purchasePrice) * item.quantity}
                  </Text>
                </View>
              </View>
              
              <View style={styles.itemActions}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.itemTotal}>
                  ৳{(item.product.salePrice * item.quantity).toFixed(2)}
                </Text>
                
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.productId)}
                >
                  <Ionicons name="trash" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Discount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ছাড়</Text>
          <View style={styles.discountContainer}>
            <Text style={styles.inputLabel}>ছাড়ের পরিমাণ (৳)</Text>
            <TextInput
              style={styles.discountInput}
              value={discount.toString()}
              onChangeText={(text) => setDiscount(Number(text) || 0)}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>সাবটোটাল:</Text>
          <Text style={styles.summaryValue}>৳{subtotal.toFixed(2)}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ছাড়:</Text>
            <Text style={[styles.summaryValue, { color: '#F44336' }]}>-৳{discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>মোট:</Text>
          <Text style={styles.totalValue}>৳{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.profitSummaryLabel}>মোট লাভ:</Text>
          <Text style={styles.profitSummaryValue}>৳{profit.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Ionicons name="card" size={20} color="#fff" />
          <Text style={styles.checkoutButtonText}>বিল তৈরি করুন</Text>
        </TouchableOpacity>
      </View>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemDetails: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: '#666',
  },
  profitLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginVertical: 4,
  },
  removeButton: {
    padding: 4,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  bottomSummary: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  profitSummaryLabel: {
    fontSize: 12,
    color: '#4CAF50',
  },
  profitSummaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});