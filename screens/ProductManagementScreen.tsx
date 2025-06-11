import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts, Category, Company, ProductType, Product } from '../context/ProductContext';

const ProductManagementScreen = () => {
  const navigation = useNavigation();
  const { categories, products, addCategory, addCompany, addProductType, addProduct, saveProductImage, loading } = useProducts();

  const [modalVisible, setModalVisible] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingCompany, setAddingCompany] = useState(false);
  const [addingProductType, setAddingProductType] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [newCompanyName, setNewCompanyName] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const [newProductTypeName, setNewProductTypeName] = useState('');
  const [newProductTypeHasColors, setNewProductTypeHasColors] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);

  // Product fields
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productCompany, setProductCompany] = useState('');
  const [productType, setProductType] = useState('');
  const [productColor, setProductColor] = useState('');
  const [productThickness, setProductThickness] = useState('');
  const [productSize, setProductSize] = useState('');
  const [productPurchasePrice, setProductPurchasePrice] = useState('');
  const [productSalePrice, setProductSalePrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productLowStockThreshold, setProductLowStockThreshold] = useState('5');

  // Request camera and photo library permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('অনুমতি প্রয়োজন', 'ক্যামেরা ব্যবহারের অনুমতি দিন।');
        }

        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus !== 'granted') {
          Alert.alert('অনুমতি প্রয়োজন', 'গ্যালারি ব্যবহারের অনুমতি দিন।');
        }
      }
    })();
  }, []);

  const handleCategoryAdd = () => {
    if (newCategoryName.trim() === '') {
      Alert.alert('ত্রুটি', 'ক্যাটাগরির নাম প্রয়োজন।');
      return;
    }

    addCategory(newCategoryName);
    setNewCategoryName('');
    setAddingCategory(false);
    Alert.alert('সফল', 'ক্যাটাগরি যোগ করা হয়েছে!');
  };

  const handleCompanyAdd = () => {
    if (!selectedCategory) {
      Alert.alert('ত্রুটি', 'ক্যাটাগরি নির্বাচন করুন।');
      return;
    }

    if (newCompanyName.trim() === '') {
      Alert.alert('ত্রুটি', 'কোম্পানির নাম প্রয়োজন।');
      return;
    }

    addCompany(selectedCategory.id, newCompanyName);
    setNewCompanyName('');
    setAddingCompany(false);
    Alert.alert('সফল', 'কোম্পানি যোগ করা হয়েছে!');
  };

  const handleProductTypeAdd = () => {
    if (!selectedCategory || !selectedCompany) {
      Alert.alert('ত্রুটি', 'ক্যাটাগরি এবং কোম্পানি নির্বাচন করুন।');
      return;
    }

    if (newProductTypeName.trim() === '') {
      Alert.alert('ত্রুটি', 'প্রোডাক্ট টাইপের নাম প্রয়োজন।');
      return;
    }

    const productTypeData: Partial<ProductType> = {
      name: newProductTypeName,
      hasColors: newProductTypeHasColors,
      colors: newProductTypeHasColors ? ['লাল', 'নীল', 'সবুজ'] : [],
      thicknessRange: {
        min: 0.12,
        max: 0.5,
        step: 0.01,
        unit: 'মিমি'
      },
      sizeRange: {
        min: 6,
        max: 12,
        unit: 'ফুট'
      }
    };

    addProductType(selectedCategory.id, selectedCompany.id, productTypeData);
    setNewProductTypeName('');
    setNewProductTypeHasColors(false);
    setAddingProductType(false);
    Alert.alert('সফল', 'প্রোডাক্ট টাইপ যোগ করা হয়েছে!');
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  const handleProductAdd = async () => {
    if (!selectedCategory || !productThickness || !productSize) {
      Alert.alert('ত্রুটি', 'সকল প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    const purchasePrice = parseFloat(productPurchasePrice);
    const salePrice = parseFloat(productSalePrice);
    const stock = parseInt(productStock, 10);
    const lowStockThreshold = parseInt(productLowStockThreshold, 10);

    if (isNaN(purchasePrice) || isNaN(salePrice) || isNaN(stock)) {
      Alert.alert('ত্রুটি', 'মূল্য এবং স্টক সংখ্যা হতে হবে।');
      return;
    }

    const newProduct: Partial<Product> = {
      category: selectedCategory.name,
      company: selectedCompany?.name,
      type: selectedProductType?.name,
      color: productColor || undefined,
      thickness: productThickness,
      size: productSize,
      purchasePrice,
      salePrice,
      stock,
      lowStockThreshold,
      photoUri: productImage || undefined
    };

    // Add the product
    addProduct(newProduct);

    // Reset form fields
    setProductCategory('');
    setProductCompany('');
    setProductType('');
    setProductColor('');
    setProductThickness('');
    setProductSize('');
    setProductPurchasePrice('');
    setProductSalePrice('');
    setProductStock('');
    setProductImage('');
    setProductLowStockThreshold('5');
    
    setSelectedCategory(null);
    setSelectedCompany(null);
    setSelectedProductType(null);
    
    setAddingProduct(false);
    Alert.alert('সফল', 'পণ্য যোগ করা হয়েছে!');
  };

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
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>পণ্য ব্যবস্থাপনা</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ক্যাটাগরি ব্যবস্থাপনা</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddingCategory(true)}
          >
            <Text style={styles.buttonText}>নতুন ক্যাটাগরি যোগ করুন</Text>
          </TouchableOpacity>
        </View>

        {addingCategory && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="ক্যাটাগরির নাম"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCategoryAdd}
            >
              <Text style={styles.buttonText}>যোগ করুন</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, styles.cancelButton]}
              onPress={() => setAddingCategory(false)}
            >
              <Text style={styles.buttonText}>বাতিল</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView horizontal style={styles.categoriesList}>
          {Array.isArray(categories) && categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory?.id === category.id && styles.selectedItem
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedCategory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>কোম্পানি ব্যবস্থাপনা - {selectedCategory.name}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddingCompany(true)}
            >
              <Text style={styles.buttonText}>নতুন কোম্পানি যোগ করুন</Text>
            </TouchableOpacity>
          </View>

          {addingCompany && (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="কোম্পানির নাম"
                value={newCompanyName}
                onChangeText={setNewCompanyName}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCompanyAdd}
              >
                <Text style={styles.buttonText}>যোগ করুন</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, styles.cancelButton]}
                onPress={() => setAddingCompany(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView horizontal style={styles.categoriesList}>
            {Array.isArray(selectedCategory.companies) && selectedCategory.companies.map((company) => (
              <TouchableOpacity
                key={company.id}
                style={[
                  styles.categoryItem,
                  selectedCompany?.id === company.id && styles.selectedItem
                ]}
                onPress={() => setSelectedCompany(company)}
              >
                <Text style={styles.categoryText}>{company.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedCategory && selectedCompany && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>প্রোডাক্ট টাইপ - {selectedCompany.name}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddingProductType(true)}
            >
              <Text style={styles.buttonText}>নতুন প্রোডাক্ট টাইপ যোগ করুন</Text>
            </TouchableOpacity>
          </View>

          {addingProductType && (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="প্রোডাক্ট টাইপের নাম"
                value={newProductTypeName}
                onChangeText={setNewProductTypeName}
              />
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    newProductTypeHasColors && styles.checkboxSelected
                  ]}
                  onPress={() => setNewProductTypeHasColors(!newProductTypeHasColors)}
                >
                  {newProductTypeHasColors && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>কালার অপশন আছে?</Text>
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleProductTypeAdd}
              >
                <Text style={styles.buttonText}>যোগ করুন</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, styles.cancelButton]}
                onPress={() => setAddingProductType(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView horizontal style={styles.categoriesList}>
            {Array.isArray(selectedCompany.productTypes) && selectedCompany.productTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.categoryItem,
                  selectedProductType?.id === type.id && styles.selectedItem
                ]}
                onPress={() => setSelectedProductType(type)}
              >
                <Text style={styles.categoryText}>{type.name}</Text>
                {type.hasColors && <Ionicons name="color-palette" size={16} color="#666" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>পণ্য যোগ করুন</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>নতুন পণ্য যোগ করুন</Text>
        </TouchableOpacity>

        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>মোট পণ্য</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length}
            </Text>
            <Text style={styles.statLabel}>কম স্টক</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Array.isArray(categories) ? categories.length : 0}
            </Text>
            <Text style={styles.statLabel}>ক্যাটাগরি</Text>
          </View>
        </View>
      </View>

      {/* Add Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন পণ্য যোগ করুন</Text>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.formLabel}>পুরুত্ব (মিমি)</Text>
              <TextInput
                style={styles.input}
                placeholder="পুরুত্ব (মিমি)"
                value={productThickness}
                onChangeText={setProductThickness}
                keyboardType="numeric"
              />
              
              <Text style={styles.formLabel}>সাইজ (ফুট)</Text>
              <TextInput
                style={styles.input}
                placeholder="সাইজ (ফুট)"
                value={productSize}
                onChangeText={setProductSize}
              />
              
              <Text style={styles.formLabel}>কালার (যদি থাকে)</Text>
              <TextInput
                style={styles.input}
                placeholder="কালার"
                value={productColor}
                onChangeText={setProductColor}
              />
              
              <Text style={styles.formLabel}>ক্রয় মূল্য (টাকা)</Text>
              <TextInput
                style={styles.input}
                placeholder="ক্রয় মূল্য"
                value={productPurchasePrice}
                onChangeText={setProductPurchasePrice}
                keyboardType="numeric"
              />
              
              <Text style={styles.formLabel}>বিক্রয় মূল্য (টাকা)</Text>
              <TextInput
                style={styles.input}
                placeholder="বিক্রয় মূল্য"
                value={productSalePrice}
                onChangeText={setProductSalePrice}
                keyboardType="numeric"
              />
              
              <Text style={styles.formLabel}>স্টক পরিমাণ</Text>
              <TextInput
                style={styles.input}
                placeholder="স্টক"
                value={productStock}
                onChangeText={setProductStock}
                keyboardType="numeric"
              />
              
              <Text style={styles.formLabel}>কম স্টক সীমা</Text>
              <TextInput
                style={styles.input}
                placeholder="কম স্টক সীমা"
                value={productLowStockThreshold}
                onChangeText={setProductLowStockThreshold}
                keyboardType="numeric"
              />
              
              <Text style={styles.formLabel}>পণ্যের ছবি</Text>
              <View style={styles.imageButtonContainer}>
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.imageButtonText}>ক্যামেরা</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Ionicons name="image" size={24} color="#fff" />
                  <Text style={styles.imageButtonText}>গ্যালারি</Text>
                </TouchableOpacity>
              </View>
              
              {productImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: productImage }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setProductImage('')}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff0000" />
                  </TouchableOpacity>
                </View>
              ) : null}
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleProductAdd}
                >
                  <Text style={styles.modalButtonText}>যোগ করুন</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>বাতিল</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formContainer: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  categoriesList: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  categoryItem: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    marginRight: 4,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
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
    maxHeight: '80%',
  },
  modalScrollView: {
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  imageButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  imageButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    width: '45%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 30,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    width: '48%',
  },
  cancelModalButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductManagementScreen;