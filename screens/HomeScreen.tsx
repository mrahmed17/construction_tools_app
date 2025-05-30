import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; 
import { PRODUCT_CATEGORIES } from '../types';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

// Mock data for dashboard statistics
const mockStats = {
  totalSales: '৳১,২৩,৫৬৭',
  totalStock: '৩৪৫',
  lowStockItems: '১২',
  pendingOrders: '৫',
};

export default function HomeScreen() {
  const navigation = useNavigation();
  // const { user } = useAuth();
  // const { getTotalItems } = useCart();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryMenu, setCategoryMenu] = useState<{id: string, name: string, expanded: boolean}[]>(
    PRODUCT_CATEGORIES.map(cat => ({ id: cat.id, name: cat.name, expanded: false }))
  );
  
  // Mock function for low stock notification
  const checkLowStock = useCallback(() => {
    // In a real app, this would check the database
    if (parseInt(mockStats.lowStockItems) > 0) {
      Alert.alert(
        'স্টক সতর্কতা',
        `${mockStats.lowStockItems} টি আইটেমের স্টক কম`,
        [
          { text: 'ঠিক আছে', onPress: () => navigation.navigate('StockManagement' as never) },
          { text: 'বাদ দিন', style: 'cancel' }
        ]
      );
    }
  }, [navigation]);
  
  useFocusEffect(
    useCallback(() => {
      checkLowStock();
    }, [checkLowStock])
  );
  
  const toggleCategoryExpand = (catId: string) => {
    setCategoryMenu(prev => prev.map(
      cat => cat.id === catId ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };
  
  const renderMenuItem = (category: {id: string, name: string, expanded: boolean}) => {
    const productCategory = PRODUCT_CATEGORIES.find(cat => cat.id === category.id);
    
    if (!productCategory) return null;
    
    return (
      <View key={category.id} style={styles.menuItem}>
        <TouchableOpacity 
          style={styles.menuItemHeader}
          onPress={() => toggleCategoryExpand(category.id)}
        >
          <Text style={styles.menuItemText}>{category.name}</Text>
          <Ionicons 
            name={category.expanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#333"
          />
        </TouchableOpacity>
        
        {category.expanded && productCategory.companies && (
          <View style={styles.submenuContainer}>
            {productCategory.companies.map(company => (
              <TouchableOpacity
                key={company.id}
                style={styles.submenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('ProductSelection' as never, { 
                    categoryId: category.id,
                    companyId: company.id
                  } as never);
                }}
              >
                <Text style={styles.submenuText}>{company.name}</Text>
              </TouchableOpacity>
            ))}
            {productCategory.companies.length === 0 && (
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('ProductSelection' as never, { 
                    categoryId: category.id,
                  } as never);
                }}
              >
                <Text style={styles.submenuText}>সকল পণ্য দেখুন</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* For categories without companies */}
        {category.expanded && !productCategory.companies && (
          <View style={styles.submenuContainer}>
            <TouchableOpacity
              style={styles.submenuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('ProductSelection' as never, { 
                  categoryId: category.id,
                } as never);
              }}
            >
              <Text style={styles.submenuText}>সকল পণ্য দেখুন</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নির্মাণ সামগ্রী ব্যবস্থাপনা</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart' as never)}>
          <View style={styles.cartContainer}>
            <Ionicons name="cart-outline" size={30} color="#333" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{'0'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>স্বাগতম</Text>
            <Text style={styles.userName}>{'স্টোর মালিক'}</Text>
          </View>
          <Image 
            source={{ uri: 'https://api.a0.dev/assets/image?text=store manager&aspect=1:1' }} 
            style={styles.userAvatar} 
          />
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#FFE8CC' }]}>
              <Ionicons name="cash-outline" size={28} color="#FF9500" />
              <Text style={styles.statTitle}>মোট বিক্রয়</Text>
              <Text style={styles.statValue}>{mockStats.totalSales}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#CCFAFF' }]}>
              <Ionicons name="cube-outline" size={28} color="#00B4D8" />
              <Text style={styles.statTitle}>মোট স্টক</Text>
              <Text style={styles.statValue}>{mockStats.totalStock}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#FFD6D6' }]}>
              <Ionicons name="alert-circle-outline" size={28} color="#FF6B6B" />
              <Text style={styles.statTitle}>কম স্টক</Text>
              <Text style={styles.statValue}>{mockStats.lowStockItems}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E0FFEA' }]}>
              <Ionicons name="time-outline" size={28} color="#38B000" />
              <Text style={styles.statTitle}>বিক্রয় বাকি</Text>
              <Text style={styles.statValue}>{mockStats.pendingOrders}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>দ্রুত অ্যাকশন</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProductSelection' as never)}
            >
              <MaterialIcons name="add-shopping-cart" size={24} color="#333" />
              <Text style={styles.actionText}>বিক্রয় যোগ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('StockManagement' as never)}
            >
              <MaterialIcons name="inventory" size={24} color="#333" />
              <Text style={styles.actionText}>স্টক যোগ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PriceConfig' as never)}
            >
              <MaterialIcons name="attach-money" size={24} color="#333" />
              <Text style={styles.actionText}>দাম সেট</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProductManagement' as never)}
            >
              <MaterialIcons name="category" size={24} color="#333" />
              <Text style={styles.actionText}>প্রোডাক্ট ম্যানেজ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentTransactionsContainer}>
          <Text style={styles.sectionTitle}>সাম্প্রতিক লেনদেন</Text>
          {/* Mock transactions */}
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionCustomer}>আব্দুল করিম</Text>
                <Text style={styles.transactionDate}>{`৩০-০৫-${2025 - index}`}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionItems}>আইটেম: ৫টি</Text>
                <Text style={styles.transactionAmount}>৳১২,৫০০</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Side Menu */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View 
            style={styles.sideMenu}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={30} color="#333" />
              </TouchableOpacity>
              <Text style={styles.menuTitle}>মেনু</Text>
            </View>

            <ScrollView style={styles.menuContent}>
              {/* User Info */}
              <View style={styles.menuUserInfo}>
                <Image 
                  source={{ uri: 'https://api.a0.dev/assets/image?text=store manager&aspect=1:1' }} 
                  style={styles.menuUserAvatar} 
                />
                <View>
                  <Text style={styles.menuUserName}>{'স্টোর মালিক'}</Text>
                  <Text style={styles.menuUserRole}>অ্যাডমিন</Text>
                </View>
              </View>

              {/* Menu Items */}
              <TouchableOpacity 
                style={styles.menuItemHeader}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Home' as never);
                }}
              >
                <Ionicons name="home-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>হোম</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItemHeader}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('StockManagement' as never);
                }}
              >
                <Ionicons name="cube-outline" size={24} color="#333" />
                <Text style={styles.menuItemText}>স্টক ম্যানেজমেন্ট</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItemHeader}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Supplier' as never);
                }}
              >
                <FontAwesome5 name="truck" size={20} color="#333" />
                <Text style={styles.menuItemText}>সাপ্লায়ার</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItemHeader}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('PriceConfig' as never);
                }}
              >
                <MaterialIcons name="price-change" size={24} color="#333" />
                <Text style={styles.menuItemText}>মূল্য তালিকা</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItemHeader}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('ProductManagement' as never);
                }}
              >
                <MaterialIcons name="category" size={24} color="#333" />
                <Text style={styles.menuItemText}>প্রোডাক্ট ম্যানেজমেন্ট</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />
              
              <Text style={styles.menuSectionTitle}>পণ্য ক্যাটাগরি</Text>
              
              <FlatList
                data={categoryMenu}
                renderItem={({item}) => renderMenuItem(item)}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
              
              <View style={styles.menuDivider} />
            </ScrollView>
          </View>
        </TouchableOpacity>
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
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: (width / 2) - 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  statTitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width / 2) - 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  recentTransactionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionItems: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuUserRole: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  submenuContainer: {
    backgroundColor: '#f9f9f9',
    paddingLeft: 16,
  },
  submenuItem: {
    padding: 12,
    paddingLeft: 32,
  },
  submenuText: {
    fontSize: 14,
    color: '#444',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginVertical: 8,
  },
  menuSectionTitle: {
    fontSize: 14,
    color: '#888',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
});