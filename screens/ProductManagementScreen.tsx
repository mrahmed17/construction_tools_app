import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ProductManagementScreen component for adding/editing products by the admin
const ProductManagementScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [productType, setProductType] = useState('');
  const [productColor, setProductColor] = useState('');
  const [productThickness, setProductThickness] = useState('');
  const [productSize, setProductSize] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('category');
  const [image, setImage] = useState(null);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories from AsyncStorage
  const loadCategories = async () => {
    try {
      const productCategories = await AsyncStorage.getItem('productCategories');
      if (productCategories) {
        const parsedCategories = JSON.parse(productCategories);
        // Convert object to array for easier manipulation in UI
        const categoriesArray = Object.keys(parsedCategories).map(key => ({
          name: key,
          ...parsedCategories[key]
        }));
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('ত্রুটি', 'ক্যাটাগরি লোড করা যায়নি');
    }
  };

  // Save categories to AsyncStorage
  const saveCategories = async (updatedCategories) => {
    try {
      // Convert array back to object for storage format
      const categoriesObject = {};
      updatedCategories.forEach(category => {
        const { name, ...rest } = category;
        categoriesObject[name] = rest;
      });
      
      await AsyncStorage.setItem('productCategories', JSON.stringify(categoriesObject));
      await loadCategories(); // Reload categories
      Alert.alert('সফল', 'পরিবর্তন সংরক্ষণ করা হয়েছে');
    } catch (error) {
      console.error('Error saving categories:', error);
      Alert.alert('ত্রুটি', 'পরিবর্তন সংরক্ষণ করা যায়নি');
    }
  };

  // Add new category
  const addCategory = () => {
    if (newCategoryName.trim() === '') {
      Alert.alert('ত্রুটি', 'ক্যাটাগরি নাম লিখুন');
      return;
    }

    const updatedCategories = [...categories, {
      name: newCategoryName,
      companies: []
    }];

    saveCategories(updatedCategories);
    setNewCategoryName('');
    setModalVisible(false);
  };

  // Add company to selected category
  const addCompany = () => {
    if (!selectedCategory) {
      Alert.alert('ত্রুটি', 'প্রথমে একটি ক্যাটাগরি নির্বাচন করুন');
      return;
    }

    if (companyName.trim() === '') {
      Alert.alert('ত্রুটি', 'কোম্পানির নাম লিখুন');
      return;
    }

    const updatedCategories = categories.map(category => {
      if (category.name === selectedCategory.name) {
        // If companies array doesn't exist, create it
        const companies = category.companies || [];
        return {
          ...category,
          companies: [
            ...companies,
            {
              name: companyName,
              products: productType ? [productType] : [],
              colors: productColor ? [productColor] : [],
              thickness: productThickness ? [productThickness] : [],
              sizes: productSize ? [productSize] : []
            }
          ]
        };
      }
      return category;
    });

    saveCategories(updatedCategories);
    resetFields();
    setModalVisible(false);
  };

  // Add product type to selected company
  const addProductType = () => {
    if (!selectedCategory || !companyName) {
      Alert.alert('ত্রুটি', 'ক্যাটাগরি এবং কোম্পানি নির্বাচন করুন');
      return;
    }

    if (!productType.trim()) {
      Alert.alert('ত্রুটি', 'প্রোডাক্ট টাইপ লিখুন');
      return;
    }

    const updatedCategories = categories.map(category => {
      if (category.name === selectedCategory.name) {
        return {
          ...category,
          companies: category.companies.map(company => {
            if (company.name === companyName) {
              return {
                ...company,
                products: [...(company.products || []), productType]
              };
            }
            return company;
          })
        };
      }
      return category;
    });

    saveCategories(updatedCategories);
    setProductType('');
    setModalVisible(false);
  };

  // Add color to selected company
  const addColor = () => {
    if (!selectedCategory || !companyName) {
      Alert.alert('ত্রুটি', 'ক্যাটাগরি এবং কোম্পানি নির্বাচন করুন');
      return;
    }

    if (!productColor.trim()) {
      Alert.alert('ত্রুটি', 'কালার লিখুন');
      return;
    }

    const updatedCategories = categories.map(category => {
      if (category.name === selectedCategory.name) {
        return {
          ...category,
          companies: category.companies.map(company => {
            if (company.name === companyName) {
              return {
                ...company,
                colors: [...(company.colors || []), productColor]
              };
            }
            return company;
          })
        };
      }
      return category;
    });

    saveCategories(updatedCategories);
    setProductColor('');
    setModalVisible(false);
  };

  // Add thickness to selected company
  const addThickness = () => {
    if (!selectedCategory || !companyName) {
      Alert.alert('ত্রুটি', 'ক্যাটাগরি এবং কোম্পানি নির্বাচন করুন');
      return;
    }

    if (!productThickness.trim()) {
      Alert.alert('ত্রুটি', 'পুরুত্ব লিখুন');
      return;
    }

    const updatedCategories = categories.map(category => {
      if (category.name === selectedCategory.name) {
        return {
          ...category,
          companies: category.companies.map(company => {
            if (company.name === companyName) {
              return {
                ...company,
                thickness: [...(company.thickness || []), productThickness]
              };
            }
            return company;
          })
        };
      }
      return category;
    });

    saveCategories(updatedCategories);
    setProductThickness('');
    setModalVisible(false);
  };

  // Add size to selected company
  const addSize = () => {
    if (!selectedCategory || !companyName) {
      Alert.alert('ত্রুটি', 'ক্যাটাগরি এবং কোম্পানি নির্বাচন করুন');
      return;
    }

    if (!productSize.trim()) {
      Alert.alert('ত্রুটি', 'সাইজ লিখুন');
      return;
    }

    const updatedCategories = categories.map(category => {
      if (category.name === selectedCategory.name) {
        return {
          ...category,
          companies: category.companies.map(company => {
            if (company.name === companyName) {
              return {
                ...company,
                sizes: [...(company.sizes || []), productSize]
              };
            }
            return company;
          })
        };
      }
      return category;
    });

    saveCategories(updatedCategories);
    setProductSize('');
    setModalVisible(false);
  };

  // Pick image from camera or gallery
  const pickImage = async () => {
    // Ask for permission first
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('অনুমতি দরকার', 'প্রোডাক্টের ছবি নেওয়ার জন্য আপনার অনুমতি প্রয়োজন');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      
      // Save image to async storage (in a real app, you'd save to FirebaseStorage or similar)
      try {
        // This is simplified - in a real app, you'd save the actual image data
        // Here we're just saving the URI which won't work for longer persistence
        const imageData = {
          uri: result.assets[0].uri,
          category: selectedCategory?.name || '',
          company: companyName || '',
          timestamp: new Date().toISOString()
        };
        
        // Get existing images
        const existingImagesStr = await AsyncStorage.getItem('productImages');
        const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : [];
        
        // Add new image
        existingImages.push(imageData);
        
        // Save back to AsyncStorage
        await AsyncStorage.setItem('productImages', JSON.stringify(existingImages));
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }
  };

  // Reset all fields
  const resetFields = () => {
    setCompanyName('');
    setProductType('');
    setProductColor('');
    setProductThickness('');
    setProductSize('');
    setImage(null);
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>প্রোডাক্ট ম্যানেজমেন্ট</Text>
        
        {/* Category selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ক্যাটাগরি</Text>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>
              {selectedCategory ? selectedCategory.name : 'ক্যাটাগরি নির্বাচন করুন'}
            </Text>
            <TouchableOpacity 
              onPress={() => openModal('categorySelect')}
              style={styles.dropdownButton}
            >
              <MaterialIcons name="arrow-drop-down" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => openModal('category')}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={styles.buttonText}>নতুন ক্যাটাগরি যোগ করুন</Text>
          </TouchableOpacity>
        </View>
        
        {/* Company selection - only shown if category is selected */}
        {selectedCategory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>কোম্পানি</Text>
            {selectedCategory.companies && selectedCategory.companies.length > 0 ? (
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>
                  {companyName || 'কোম্পানি নির্বাচন করুন'}
                </Text>
                <TouchableOpacity 
                  onPress={() => openModal('companySelect')}
                  style={styles.dropdownButton}
                >
                  <MaterialIcons name="arrow-drop-down" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noItems}>কোন কোম্পানি নেই</Text>
            )}
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => openModal('company')}
            >
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.buttonText}>নতুন কোম্পানি যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Product attributes - only shown if company is selected */}
        {selectedCategory && companyName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>প্রোডাক্টের বৈশিষ্ট্য</Text>
            
            {/* Product Type */}
            <TouchableOpacity 
              style={styles.featureButton} 
              onPress={() => openModal('productType')}
            >
              <MaterialIcons name="category" size={18} color="#4CAF50" />
              <Text style={styles.featureText}>প্রোডাক্ট টাইপ যোগ করুন</Text>
            </TouchableOpacity>
            
            {/* Color */}
            <TouchableOpacity 
              style={styles.featureButton} 
              onPress={() => openModal('color')}
            >
              <MaterialIcons name="color-lens" size={18} color="#4CAF50" />
              <Text style={styles.featureText}>কালার যোগ করুন</Text>
            </TouchableOpacity>
            
            {/* Thickness */}
            <TouchableOpacity 
              style={styles.featureButton} 
              onPress={() => openModal('thickness')}
            >
              <MaterialIcons name="line-weight" size={18} color="#4CAF50" />
              <Text style={styles.featureText}>পুরুত্ব যোগ করুন</Text>
            </TouchableOpacity>
            
            {/* Size */}
            <TouchableOpacity 
              style={styles.featureButton} 
              onPress={() => openModal('size')}
            >
              <MaterialIcons name="straighten" size={18} color="#4CAF50" />
              <Text style={styles.featureText}>সাইজ যোগ করুন</Text>
            </TouchableOpacity>
            
            {/* Image upload */}
            <TouchableOpacity 
              style={styles.imageUploadButton} 
              onPress={pickImage}
            >
              <MaterialIcons name="add-a-photo" size={18} color="#fff" />
              <Text style={styles.buttonText}>প্রোডাক্টের ছবি যোগ করুন</Text>
            </TouchableOpacity>
            
            {image && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
              </View>
            )}
          </View>
        )}
        
        {/* View current product specifications */}
        {selectedCategory && companyName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>বর্তমান স্পেসিফিকেশন</Text>
            {selectedCategory.companies?.map(company => {
              if (company.name === companyName) {
                return (
                  <View key={company.name} style={styles.specContainer}>
                    {company.products && company.products.length > 0 && (
                      <View style={styles.specItem}>
                        <Text style={styles.specTitle}>প্রোডাক্ট টাইপ:</Text>
                        <Text style={styles.specValue}>{company.products.join(', ')}</Text>
                      </View>
                    )}
                    {company.colors && company.colors.length > 0 && (
                      <View style={styles.specItem}>
                        <Text style={styles.specTitle}>কালার:</Text>
                        <Text style={styles.specValue}>{company.colors.join(', ')}</Text>
                      </View>
                    )}
                    {company.thickness && company.thickness.length > 0 && (
                      <View style={styles.specItem}>
                        <Text style={styles.specTitle}>পুরুত্ব:</Text>
                        <Text style={styles.specValue}>{company.thickness.join(', ')}</Text>
                      </View>
                    )}
                    {company.sizes && company.sizes.length > 0 && (
                      <View style={styles.specItem}>
                        <Text style={styles.specTitle}>সাইজ:</Text>
                        <Text style={styles.specValue}>{company.sizes.join(', ')}</Text>
                      </View>
                    )}
                  </View>
                );
              }
              return null;
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal for adding/selecting items */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            {/* Category Add */}
            {modalType === 'category' && (
              <>
                <Text style={styles.modalTitle}>নতুন ক্যাটাগরি যোগ করুন</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ক্যাটাগরি নাম লিখুন"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addCategory}
                >
                  <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Category Selection */}
            {modalType === 'categorySelect' && (
              <>
                <Text style={styles.modalTitle}>ক্যাটাগরি নির্বাচন করুন</Text>
                <FlatList
                  data={categories}
                  keyExtractor={item => item.name}
                  renderItem={({item}) => (
                    <TouchableOpacity 
                      style={styles.listItem}
                      onPress={() => {
                        setSelectedCategory(item);
                        setCompanyName('');
                        resetFields();
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.listItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
            
            {/* Company Add */}
            {modalType === 'company' && (
              <>
                <Text style={styles.modalTitle}>নতুন কোম্পানি যোগ করুন</Text>
                <TextInput
                  style={styles.input}
                  placeholder="কোম্পানির নাম লিখুন"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addCompany}
                >
                  <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Company Selection */}
            {modalType === 'companySelect' && selectedCategory?.companies && (
              <>
                <Text style={styles.modalTitle}>কোম্পানি নির্বাচন করুন</Text>
                <FlatList
                  data={selectedCategory.companies}
                  keyExtractor={item => item.name}
                  renderItem={({item}) => (
                    <TouchableOpacity 
                      style={styles.listItem}
                      onPress={() => {
                        setCompanyName(item.name);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.listItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
            
            {/* Product Type Add */}
            {modalType === 'productType' && (
              <>
                <Text style={styles.modalTitle}>প্রোডাক্ট টাইপ যোগ করুন</Text>
                <TextInput
                  style={styles.input}
                  placeholder="প্রোডাক্ট টাইপ লিখুন"
                  value={productType}
                  onChangeText={setProductType}
                />
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addProductType}
                >
                  <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Color Add */}
            {modalType === 'color' && (
              <>
                <Text style={styles.modalTitle}>কালার যোগ করুন</Text>
                <TextInput
                  style={styles.input}
                  placeholder="কালারের নাম লিখুন"
                  value={productColor}
                  onChangeText={setProductColor}
                />
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addColor}
                >
                  <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Thickness Add */}
            {modalType === 'thickness' && (
              <>
                <Text style={styles.modalTitle}>পুরুত্ব যোগ করুন</Text>
                <TextInput
                  style={styles.input}
                  placeholder="পুরুত্বের মান লিখুন (মিলিমিটারে)"
                  value={productThickness}
                  onChangeText={setProductThickness}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addThickness}
                >
                  <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Size Add */}
            {modalType === 'size' && (
              <>
                <Text style={styles.modalTitle}>সাইজ যোগ করুন</Text>
                <TextInput
                  style={styles.input}
                  placeholder="সাইজের মান লিখুন (ফুটে)"
                  value={productSize}
                  onChangeText={setProductSize}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={addSize}
                >
                  <Text style={styles.saveButtonText}>সংরক্ষণ করুন</Text>
                </TouchableOpacity>
              </>
            )}
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
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownButton: {
    padding: 4,
  },
  noItems: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  featureText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
  imageUploadButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  imageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  specContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
  },
  specItem: {
    marginBottom: 8,
  },
  specTitle: {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  specValue: {
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    maxHeight: '70%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProductManagementScreen;