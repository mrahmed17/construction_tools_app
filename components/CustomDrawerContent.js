import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomDrawerContent(props) {
  const { navigation } = props;
  
  // Menu items with icons
  const menuItems = [
    { name: 'Dashboard', icon: 'home-outline', screen: 'Home' },
    { name: 'Products', icon: 'cube-outline', screen: 'Products' },
    { name: 'Suppliers', icon: 'people-outline', screen: 'Suppliers' },
    { name: 'Customers', icon: 'person-outline', screen: 'Customers' },
    { name: 'Sales', icon: 'cart-outline', screen: 'Sales' },
    { name: 'Reports', icon: 'bar-chart-outline', screen: 'Reports' },
    { name: 'Settings', icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.storeName}>Construction Materials</Text>
        <Text style={styles.storeSubtitle}>Inventory Management</Text>
      </View>
      
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate(item.screen);
              navigation.closeDrawer(); // Close drawer after navigation
            }}
          >
            <Ionicons name={item.icon} size={24} color="#555" />
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  storeSubtitle: {
    fontSize: 14,
    color: '#ddd',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e74c3c',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 5,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});