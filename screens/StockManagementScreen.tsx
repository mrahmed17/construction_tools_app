import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductType } from '../types';
import { useNavigation } from '@react-navigation/native';

export default function StockManagementScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);
  
  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);
  
  // Filter products when search text changes
  useEffect(() => {
    filterProducts();
  }, [searchText, products, filterLowStock]);
  
  // Load products from storage
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsJson = await AsyncStorage.getItem('products');
      
      if (productsJson) {
        const loadedProducts: ProductType[] = JSON.parse(productsJson);
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load product data');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter products based on search text and low stock filter
  const filterProducts = () => {
    let filtered = [...products];
    
    // Apply search filter if text exists
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(lowerCaseSearch)) ||
        (p.category && p.category.toLowerCase().includes(lowerCaseSearch)) ||
        (p.companyName && p.companyName.toLowerCase().includes(lowerCaseSearch)) ||
        (p.productType && p.productType.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    // Apply low stock filter if enabled
    if (filterLowStock) {
      filtered = filtered.filter(p => p.stock <= p.lowStockThreshold);
    }
    
    setFilteredProducts(filtered);
  };
  
  // Update stock for a product
  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      // Find the product in the array
      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          return { ...product, stock: newStock };
        }
        return product;
      });
      
      // Update state
      setProducts(updatedProducts);
      
      // Update in storage
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      
      Alert.alert('Success', 'স্টক আপডেট হয়েছে');
    } catch (error) {
      console.error('Error updating stock:', error);
      Alert.alert('Error', 'স্টক আপডেট করতে ব্যর্থ হয়েছে');
    }
  };
  
  // Add stock to a product
  const addStock = (product: ProductType, amount: number) => {
    const newStock = product.stock + amount;
    updateProductStock(product.id, newStock);
  };
  
  // Render each product item in the list
  const renderProductItem = ({ item }: { item: ProductType }) => {
    const isLowStock = item.stock <= item.lowStockThreshold;
    
    return (
      <View style={[styles.productItem, isLowStock ? styles.lowStockItem : {}]}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {item.name || `${item.category} - ${item.companyName || ''}`}
          </Text>
          <Text style={styles.productDetails}>
            {item.category} {item.companyName ? `- ${item.companyName}` : ''}
            {item.productType ? ` - ${item.productType}` : ''}
            {item.color ? ` - ${item.color}` : ''}
            {item.thickness ? ` - ${item.thickness}mm` : ''}
            {item.size ? ` - ${item.size}ft` : ''}
          </Text>
        </View>
        
        <View style={styles.stockContainer}>
          <Text style={[styles.stockText, isLowStock ? styles.lowStockText : {}]}>
            Stock: {item.stock}
          </Text>
          {isLowStock && (
            <Text style={styles.lowStockAlert}>লো স্টক!</Text>
          )}
        </View>
        
        <View style={styles.stockActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => addStock(item, 1)}
          >
            <Text style={styles.actionButtonText}>+1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => addStock(item, 5)}
          >
            <Text style={styles.actionButtonText}>+5</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => addStock(item, 10)}
          >
            <Text style={styles.actionButtonText}>+10</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Add a new product to inventory
  const navigateToAddProduct = () => {
    // @ts-ignore
    navigation.navigate('ProductManagement');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>স্টক ব্যবস্থাপনা</Text>
      </View>
      
      <View style={styles.container}>
        {/* Search and filter controls */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="পণ্য অনুসন্ধান করুন..."
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={[styles.filterButton, filterLowStock && styles.filterActive]}
            onPress={() => setFilterLowStock(!filterLowStock)}
          >
            <Ionicons 
              name="alert-circle-outline" 
              size={20} 
              color={filterLowStock ? '#fff' : "#666"} 
            />
            <Text style={[styles.filterText, filterLowStock && styles.filterActiveText]}>
              লো স্টক
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Product list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#344955" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText || filterLowStock ? 'কোন পণ্য পাওয়া যায়নি' : 'স্টকে কোন পণ্য নেই'}
            </Text>
            <TouchableOpacity 
              style={styles.addProductButton}
              onPress={navigateToAddProduct}
            >
              <Text style={styles.addProductButtonText}>পণ্য যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.productList}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={styles.fabButton}
              onPress={navigateToAddProduct}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
  },
  searchIcon: {
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  filterActive: {
    backgroundColor: '#E57373',
  },
  filterText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  filterActiveText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addProductButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  addProductButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  productList: {
    padding: 16,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  lowStockItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#E57373',
  },
  productInfo: {
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: '#4A6572',
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#344955',
  },
  lowStockText: {
    color: '#E57373',
    fontWeight: 'bold',
  },
  lowStockAlert: {
    color: '#E57373',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stockActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#344955',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});