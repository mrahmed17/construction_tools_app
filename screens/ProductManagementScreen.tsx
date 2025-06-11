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
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { 
  DefaultProductCategories, 
  DefaultCompanies, 
  ProductCategory, 
  DefaultProductTypes,
  ProductImage
} from '../types';
import { Ionicons } from '@expo/vector-icons';

const ProductManagementScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<string[]>([...DefaultProductCategories]);
  const [companies, setCompanies] = useState<{[key: string]: string[]}>(JSON.parse(JSON.stringify(DefaultCompanies)));
  const [productTypes, setProductTypes] = useState<{[key: string]: string[]}>(JSON.parse(JSON.stringify(DefaultProductTypes)));
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [newCompany, setNewCompany] = useState<string>('');
  const [newProductType, setNewProductType] = useState<string>('');
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const [productImage, setProductImage] = useState<ProductImage | null>(null);
  
  // Load stored categories, companies and product types on mount
  useEffect(() => {
    loadStoredData();
  }, []);
  
  const loadStoredData = async () => {
    try {
      // Load categories
      const storedCategories = await AsyncStorage.getItem('productCategories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
      
      // Load companies
      const storedCompanies = await AsyncStorage.getItem('productCompanies');
      if (storedCompanies) {
        setCompanies(JSON.parse(storedCompanies));
      }
      
      // Load product types
      const storedProductTypes = await AsyncStorage.getItem('productTypes');
      if (storedProductTypes) {
        setProductTypes(JSON.parse(storedProductTypes));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load stored product data');
    }
  };
  
  // Save categories
  const saveCategories = async (newCategoriesList: string[]) => {
    try {
      await AsyncStorage.setItem('productCategories', JSON.stringify(newCategoriesList));
    } catch (error) {
      Alert.alert('Error', 'Failed to save categories');
    }
  };
  
  // Save companies
  const saveCompanies = async (companiesData: {[key: string]: string[]}) => {
    try {
      await AsyncStorage.setItem('productCompanies', JSON.stringify(companiesData));
    } catch (error) {
      Alert.alert('Error', 'Failed to save companies');
    }
  };
  
  // Save product types
  const saveProductTypes = async (productTypesData: {[key: string]: string[]}) => {
    try {
      await AsyncStorage.setItem('productTypes', JSON.stringify(productTypesData));
    } catch (error) {
      Alert.alert('Error', 'Failed to save product types');
    }
  };
  
  // Add new category
  const handleAddCategory = () => {
    if (newCategory.trim() === '') {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }
    
    if (categories.includes(newCategory)) {
      Alert.alert('Error', 'This category already exists');
      return;
    }
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    // Add empty company array for this category
    const updatedCompanies = {...companies};
    updatedCompanies[newCategory] = [];
    setCompanies(updatedCompanies);
    
    // Save to storage
    saveCategories(updatedCategories);
    saveCompanies(updatedCompanies);
    
    setNewCategory('');
    setShowCategoryModal(false);
    
    Alert.alert('Success', `Category "${newCategory}" has been added`);
  };
  
  // Add new company to selected category
  const handleAddCompany = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category first');
      return;
    }
    
    if (newCompany.trim() === '') {
      Alert.alert('Error', 'Company name cannot be empty');
      return;
    }
    
    if (companies[selectedCategory].includes(newCompany)) {
      Alert.alert('Error', 'This company already exists in the selected category');
      return;
    }
    
    // Update companies
    const updatedCompanies = {...companies};
    updatedCompanies[selectedCategory] = [...updatedCompanies[selectedCategory], newCompany];
    setCompanies(updatedCompanies);
    
    // Initialize product types for this company
    const updatedProductTypes = {...productTypes};
    updatedProductTypes[newCompany] = [];
    setProductTypes(updatedProductTypes);
    
    // Save to storage
    saveCompanies(updatedCompanies);
    saveProductTypes(updatedProductTypes);
    
    setNewCompany('');
    setShowCompanyModal(false);
    
    Alert.alert('Success', `Company "${newCompany}" has been added to "${selectedCategory}"`);
  };
  
  // Add new product type to selected company
  const handleAddProductType = () => {
    if (!selectedCompany) {
      Alert.alert('Error', 'Please select a company first');
      return;
    }
    
    if (newProductType.trim() === '') {
      Alert.alert('Error', 'Product type cannot be empty');
      return;
    }
    
    if (productTypes[selectedCompany] && productTypes[selectedCompany].includes(newProductType)) {
      Alert.alert('Error', 'This product type already exists for the selected company');
      return;
    }
    
    // Update product types
    const updatedProductTypes = {...productTypes};
    
    // Initialize if not exists
    if (!updatedProductTypes[selectedCompany]) {
      updatedProductTypes[selectedCompany] = [];
    }
    
    updatedProductTypes[selectedCompany] = [...updatedProductTypes[selectedCompany], newProductType];
    setProductTypes(updatedProductTypes);
    
    // Save to storage
    saveProductTypes(updatedProductTypes);
    
    setNewProductType('');
    setShowProductTypeModal(false);
    
    Alert.alert('Success', `Product type "${newProductType}" has been added to company "${selectedCompany}"`);
  };
  
  // Delete category
  const handleDeleteCategory = (category: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the category "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Filter out the category
            const updatedCategories = categories.filter(cat => cat !== category);
            setCategories(updatedCategories);
            
            // Remove companies for this category
            const updatedCompanies = {...companies};
            delete updatedCompanies[category];
            setCompanies(updatedCompanies);
            
            // Save to storage
            saveCategories(updatedCategories);
            saveCompanies(updatedCompanies);
            
            Alert.alert('Success', `Category "${category}" has been deleted`);
          }
        }
      ]
    );
  };
  
  // Delete company
  const handleDeleteCompany = (category: string, company: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the company "${company}" from category "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Filter out the company
            const updatedCompanies = {...companies};
            updatedCompanies[category] = updatedCompanies[category].filter(comp => comp !== company);
            setCompanies(updatedCompanies);
            
            // Save to storage
            saveCompanies(updatedCompanies);
            
            Alert.alert('Success', `Company "${company}" has been deleted`);
          }
        }
      ]
    );
  };
  
  // Pick an image from camera or gallery
  const pickImage = async (useCamera: boolean) => {
    try {
      // Request permissions first
      if (Platform.OS !== 'web') {
        const { status } = useCamera 
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
          
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera permissions to use this feature.');
          return;
        }
      }
      
      // Launch camera or image picker
      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
          });
          
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        const base64 = result.assets[0].base64;
        
        setProductImage({ 
          uri: imageUri,
          base64: base64
        });
        
        // Save image to AsyncStorage (in a real app, we'd save to device storage or cloud)
        await saveImageToStorage(imageUri, base64);
      }
    } catch (error) {
      console.error('Error picking image: ', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  // Save image to AsyncStorage
  const saveImageToStorage = async (uri: string, base64?: string) => {
    try {
      if (base64) {
        const imageKey = `product_image_${Date.now()}`;
        await AsyncStorage.setItem(imageKey, base64);
        
        // Save reference to the image key
        const imageReferences = await AsyncStorage.getItem('productImageReferences') || '[]';
        const references = JSON.parse(imageReferences);
        references.push({ key: imageKey, uri });
        await AsyncStorage.setItem('productImageReferences', JSON.stringify(references));
        
        Alert.alert('Success', 'Image saved successfully');
      }
    } catch (error) {
      console.error('Error saving image: ', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>প্রোডাক্ট ম্যানেজমেন্ট</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>প্রোডাক্ট ক্যাটাগরি</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.addButtonText}>নতুন ক্যাটাগরি যোগ করুন</Text>
        </TouchableOpacity>
        
        <View style={styles.categoryList}>
          {categories.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.categoryItem, 
                selectedCategory === category && styles.selectedItem
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteCategory(category)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {selectedCategory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{selectedCategory} - কোম্পানি</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowCompanyModal(true)}
          >
            <Text style={styles.addButtonText}>নতুন কোম্পানি যোগ করুন</Text>
          </TouchableOpacity>
          
          <View style={styles.categoryList}>
            {companies[selectedCategory] && companies[selectedCategory].map((company, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.categoryItem, 
                  selectedCompany === company && styles.selectedItem
                ]}
                onPress={() => setSelectedCompany(company)}
              >
                <Text style={styles.categoryText}>{company}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCompany(selectedCategory, company)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {selectedCompany && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{selectedCompany} - প্রোডাক্ট টাইপ</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowProductTypeModal(true)}
          >
            <Text style={styles.addButtonText}>নতুন প্রোডাক্ট টাইপ যোগ করুন</Text>
          </TouchableOpacity>
          
          <View style={styles.categoryList}>
            {productTypes[selectedCompany] && productTypes[selectedCompany].map((type, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>প্রোডাক্ট ছবি</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowImageModal(true)}
        >
          <Text style={styles.addButtonText}>ছবি যোগ করুন</Text>
        </TouchableOpacity>
        
        {productImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: productImage.uri }} style={styles.productImage} />
            <Text style={styles.imageCaption}>প্রোডাক্টের ছবি</Text>
          </View>
        )}
      </View>
      
      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন ক্যাটাগরি যোগ করুন</Text>
            
            <TextInput
              style={styles.input}
              placeholder="ক্যাটাগরির নাম"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleAddCategory}
              >
                <Text style={styles.buttonText}>যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Company Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCompanyModal}
        onRequestClose={() => setShowCompanyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন কোম্পানি যোগ করুন</Text>
            
            <TextInput
              style={styles.input}
              placeholder="কোম্পানির নাম"
              value={newCompany}
              onChangeText={setNewCompany}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCompanyModal(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleAddCompany}
              >
                <Text style={styles.buttonText}>যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Product Type Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProductTypeModal}
        onRequestClose={() => setShowProductTypeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন প্রোডাক্ট টাইপ যোগ করুন</Text>
            
            <TextInput
              style={styles.input}
              placeholder="প্রোডাক্ট টাইপের নাম"
              value={newProductType}
              onChangeText={setNewProductType}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowProductTypeModal(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleAddProductType}
              >
                <Text style={styles.buttonText}>যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Image Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageModal}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>প্রোডাক্ট ছবি যোগ করুন</Text>
            
            <View style={styles.imagePickerButtons}>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={() => {
                  pickImage(true);
                  setShowImageModal(false);
                }}
              >
                <Ionicons name="camera" size={30} color="#007AFF" />
                <Text style={styles.imagePickerText}>ক্যামেরা</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={() => {
                  pickImage(false);
                  setShowImageModal(false);
                }}
              >
                <Ionicons name="images" size={30} color="#007AFF" />
                <Text style={styles.imagePickerText}>গ্যালারি</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton, { marginTop: 20 }]} 
              onPress={() => setShowImageModal(false)}
            >
              <Text style={styles.buttonText}>বাতিল</Text>
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
    backgroundColor: '#f5f5f5',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryList: {
    marginTop: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButton: {
    backgroundColor: '#4CD964',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  imagePickerButton: {
    alignItems: 'center',
    padding: 15,
  },
  imagePickerText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageCaption: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProductManagementScreen;