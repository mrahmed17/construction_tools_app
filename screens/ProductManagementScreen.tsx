import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductManagementScreen = () => {
  const [categories, setCategories] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem('productCategories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load product categories');
    }
  };

  const saveCategories = async (updatedCategories: any) => {
    try {
      await AsyncStorage.setItem('productCategories', JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
      Alert.alert('Error', 'Failed to save product categories');
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const updatedCategories = { ...categories };
    
    if (updatedCategories[newCategory]) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    // Initialize new category with empty structure
    updatedCategories[newCategory] = {
      companies: []
    };

    await saveCategories(updatedCategories);
    setNewCategory('');
    setModalVisible(false);
    Alert.alert('Success', `Category "${newCategory}" has been added`);
  };

  const addNewCompany = async () => {
    if (!newCompanyName.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }

    const updatedCategories = { ...categories };
    
    // Check if company already exists in this category
    const existingCompanies = updatedCategories[selectedCategory].companies || [];
    if (existingCompanies.some((company: any) => company.name === newCompanyName)) {
      Alert.alert('Error', 'This company already exists in this category');
      return;
    }

    // Add new company with default structure
    const newCompany = {
      name: newCompanyName,
      products: ["সুপার", "লুম", "কালার"],
      colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
      thickness: ["0.25", "0.30", "0.35", "0.40"],
      sizes: ["6", "7", "8", "9", "10", "11", "12"]
    };

    if (!updatedCategories[selectedCategory].companies) {
      updatedCategories[selectedCategory].companies = [];
    }
    
    updatedCategories[selectedCategory].companies.push(newCompany);

    await saveCategories(updatedCategories);
    setNewCompanyName('');
    setCompanyModalVisible(false);
    Alert.alert('Success', `Company "${newCompanyName}" has been added to ${selectedCategory}`);
  };

  const deleteCategory = async (categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete the category "${categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            const updatedCategories = { ...categories };
            delete updatedCategories[categoryName];
            await saveCategories(updatedCategories);
            Alert.alert('Success', `Category "${categoryName}" has been deleted`);
          } 
        }
      ]
    );
  };

  const deleteCompany = async (categoryName: string, companyName: string) => {
    Alert.alert(
      'Delete Company',
      `Are you sure you want to delete the company "${companyName}" from ${categoryName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            const updatedCategories = { ...categories };
            updatedCategories[categoryName].companies = updatedCategories[categoryName].companies.filter(
              (company: any) => company.name !== companyName
            );
            await saveCategories(updatedCategories);
            Alert.alert('Success', `Company "${companyName}" has been deleted from ${categoryName}`);
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>প্রোডাক্ট ক্যাটাগরি ও কোম্পানি ম্যানেজমেন্ট</Text>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>নতুন ক্যাটাগরি যোগ করুন</Text>
      </TouchableOpacity>

      <ScrollView style={styles.categoriesContainer}>
        {Object.keys(categories).map((categoryName) => (
          <View key={categoryName} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{categoryName}</Text>
              <TouchableOpacity onPress={() => deleteCategory(categoryName)}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <View style={styles.companyList}>
              {categories[categoryName].companies?.map((company: any, index: number) => (
                <View key={index} style={styles.companyItem}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <TouchableOpacity onPress={() => deleteCompany(categoryName, company.name)}>
                    <Ionicons name="close-circle-outline" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity 
                style={styles.addCompanyButton}
                onPress={() => {
                  setSelectedCategory(categoryName);
                  setCompanyModalVisible(true);
                }}
              >
                <Ionicons name="add" size={20} color="#4CAF50" />
                <Text style={styles.addCompanyText}>কোম্পানি যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal for adding new category */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন ক্যাটাগরি যোগ করুন</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="ক্যাটাগরির নাম লিখুন"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={addNewCategory}
              >
                <Text style={styles.buttonText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for adding new company */}
      <Modal
        transparent={true}
        visible={companyModalVisible}
        animationType="slide"
        onRequestClose={() => setCompanyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedCategory} - নতুন কোম্পানি যোগ করুন
            </Text>
            
            <TextInput 
              style={styles.input}
              placeholder="কোম্পানির নাম লিখুন"
              value={newCompanyName}
              onChangeText={setNewCompanyName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCompanyModalVisible(false)}
              >
                <Text style={styles.buttonText}>বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={addNewCompany}
              >
                <Text style={styles.buttonText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  companyList: {
    marginTop: 8,
  },
  companyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  companyName: {
    fontSize: 16,
    color: '#555',
  },
  addCompanyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
  },
  addCompanyText: {
    color: '#4CAF50',
    marginLeft: 5,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ProductManagementScreen;