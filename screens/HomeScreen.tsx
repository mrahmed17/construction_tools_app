import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Header from '../components/Header';

export default function HomeScreen() {
  const navigation = useNavigation();

  // Dashboard menu items
  const menuItems = [
    { 
      name: 'পণ্য নির্বাচন', 
      icon: 'shopping-cart', 
      iconType: 'material', 
      screen: 'ProductSelection',
      color: '#2196F3',
      description: 'পণ্য নির্বাচন করে কার্টে যোগ করুন'
    },
    { 
      name: 'পণ্য ব্যবস্থাপনা', 
      icon: 'cube-outline', 
      iconType: 'ionicon', 
      screen: 'ProductManagement',
      color: '#4CAF50',
      description: 'নতুন পণ্য যোগ করুন এবং বিদ্যমান পণ্য ব্যবস্থাপনা করুন'
    },
    { 
      name: 'কার্ট', 
      icon: 'cart-outline', 
      iconType: 'ionicon', 
      screen: 'Cart',
      color: '#FF9800',
      description: 'কার্টে যোগ করা পণ্য দেখুন এবং বিল তৈরি করুন'
    },
    { 
      name: 'সাপ্লাইয়ার', 
      icon: 'people-outline', 
      iconType: 'ionicon', 
      screen: 'Suppliers',
      color: '#9C27B0',
      description: 'সাপ্লাইয়ারদের তথ্য ব্যবস্থাপনা করুন'
    },
    { 
      name: 'কাস্টমার', 
      icon: 'person-outline', 
      iconType: 'ionicon', 
      screen: 'Customers',
      color: '#E91E63',
      description: 'কাস্টমারদের তথ্য ব্যবস্থাপনা করুন'
    },
    { 
      name: 'রিপোর্ট', 
      icon: 'bar-chart-outline', 
      iconType: 'ionicon', 
      screen: 'Reports',
      color: '#607D8B',
      description: 'বিক্রয় এবং স্টক রিপোর্ট দেখুন'
    },
  ];

  // Render the appropriate icon based on the icon type
  const renderIcon = (item) => {
    switch (item.iconType) {
      case 'material':
        return <MaterialIcons name={item.icon} size={32} color="#fff" />;
      case 'fontawesome':
        return <FontAwesome5 name={item.icon} size={28} color="#fff" />;
      case 'ionicon':
      default:
        return <Ionicons name={item.icon} size={32} color="#fff" />;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="ড্যাশবোর্ড" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>স্বাগতম!</Text>
          <Text style={styles.welcomeText}>ঘর তৈরির সরঞ্জাম ইনভেন্টরি ম্যানেজমেন্ট সিস্টেমে আপনাকে স্বাগতম। নিচের অপশনগুলি থেকে একটি বেছে নিন।</Text>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <View style={styles.menuIconContainer}>
                {renderIcon(item)}
              </View>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>দ্রুত পরিসংখ্যান</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>১২৫</Text>
              <Text style={styles.statLabel}>মোট পণ্য</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>১৮</Text>
              <Text style={styles.statLabel}>কম স্টক</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>৩৫</Text>
              <Text style={styles.statLabel}>আজকের বিক্রয়</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#ecf0f1',
    lineHeight: 22,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  menuItemDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});