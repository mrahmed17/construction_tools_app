import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomDrawerContent(props) {
  const { navigation } = props;
  
  // Menu items with icons
  const menuItems = [
    { name: 'ড্যাশবোর্ড', icon: 'home-outline', iconType: 'ionicon', screen: 'Home' },
    { name: 'পণ্য নির্বাচন', icon: 'shopping-cart', iconType: 'material', screen: 'ProductSelection' },
    { name: 'পণ্য ব্যবস্থাপনা', icon: 'cube-outline', iconType: 'ionicon', screen: 'ProductManagement' },
    { name: 'কার্ট', icon: 'cart-outline', iconType: 'ionicon', screen: 'Cart' },
    { name: 'সাপ্লাইয়ার', icon: 'people-outline', iconType: 'ionicon', screen: 'Suppliers' },
    { name: 'কাস্টমার', icon: 'person-outline', iconType: 'ionicon', screen: 'Customers' },
    { name: 'বিক্রয়', icon: 'cash-register', iconType: 'fontawesome', screen: 'Sales' },
    { name: 'রিপোর্ট', icon: 'bar-chart-outline', iconType: 'ionicon', screen: 'Reports' },
    { name: 'সেটিংস', icon: 'settings-outline', iconType: 'ionicon', screen: 'Settings' },
  ];

  // Render the appropriate icon based on the icon type
  const renderIcon = (item) => {
    switch (item.iconType) {
      case 'material':
        return <MaterialIcons name={item.icon} size={24} color="#555" />;
      case 'fontawesome':
        return <FontAwesome5 name={item.icon} size={22} color="#555" />;
      case 'ionicon':
      default:
        return <Ionicons name={item.icon} size={24} color="#555" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.storeName}>ঘর তৈরির সরঞ্জাম</Text>
        <Text style={styles.storeSubtitle}>ইনভেন্টরি ম্যানেজমেন্ট</Text>
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
            {renderIcon(item)}
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>লগআউট</Text>
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