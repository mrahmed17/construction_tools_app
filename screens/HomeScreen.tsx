import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
// import { useAuth } from '../context/AuthContext'; // Commented out temporarily
import { useCart } from '../context/CartContext';

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  todaySales: number;
  monthlyRevenue: number;
}

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {  
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 245,
    lowStockItems: 12,
    todaySales: 15,
    monthlyRevenue: 125000
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Authentication temporarily commented out
  // const { user, logout, loading } = useAuth();
  const { cartItems } = useCart();
  
  // Mock user data for now
  const user = {
    name: 'ব্যবহারকারী',
    businessName: 'আপনার ব্যবসা',
    phone: '01712345678'
  };

  // Authentication disabled for now
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigation.replace('Auth');
  //   }
  // }, [user, loading, navigation]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // In real app, this would fetch from API
    // For now using mock data
  };
  
  const handleLogout = async () => {
    // await logout();
    // navigation.navigate('Auth');
    toast.success('লগআউট ফিচার শীঘ্রই সক্রিয় হবে');
  };

  const menuItems = [
    { id: 'dashboard', title: 'ড্যাশবোর্ড', icon: 'home', hasSubmenu: false },
    { 
      id: 'products', 
      title: 'পণ্য ব্যবস্থাপনা', 
      icon: 'cube', 
      hasSubmenu: true,
      submenu: [
        { id: 'tin', title: 'টিন', icon: 'square' },
        { id: 'tua', title: 'টুয়া', icon: 'square-outline' },
        { id: 'plainSheet', title: 'প্লেইন শিট', icon: 'document' },
        { id: 'flowerSheet', title: 'ফুলের শিট', icon: 'flower' },
        { id: 'plasticTin', title: 'প্লাস্টিকের টিন', icon: 'square' },
        { id: 'corrugated', title: 'ফুলের ঢেউটিন', icon: 'wave' },
        { id: 'roofingPlastic', title: 'চাচের প্লাস্টিক', icon: 'home' },
        { id: 'digitalRoof', title: 'চাচ ডিজিটাল', icon: 'grid' },
        { id: 'deepRoof', title: 'ডিপ চাচ', icon: 'layers' },
        { id: 'coil', title: 'কয়েল (পি-ফোম)', icon: 'disc' },
        { id: 'aluminum', title: 'অ্যালুমিনিয়াম', icon: 'square' },
        { id: 'scrap', title: 'ঝালট', icon: 'trash' }
      ]
    },
    { id: 'inventory', title: 'স্টক ব্যবস্থাপনা', icon: 'layers', hasSubmenu: false },
    { id: 'sales', title: 'বিক্রয়', icon: 'card', hasSubmenu: false },
    { id: 'suppliers', title: 'সাপ্লাইয়ার', icon: 'people', hasSubmenu: false },
    { id: 'price-list', title: 'মূল্য তালিকা', icon: 'list', hasSubmenu: false },
    { id: 'reports', title: 'রিপোর্ট', icon: 'bar-chart', hasSubmenu: false },
    { id: 'settings', title: 'সেটিংস', icon: 'settings', hasSubmenu: false }
  ];

  const quickActions = [
    { id: 'add-product', title: 'নতুন পণ্য', icon: 'add-circle', color: '#4CAF50' },
    { id: 'sale', title: 'বিক্রয়', icon: 'card', color: '#2196F3' },
    { id: 'stock-in', title: 'স্টক ইন', icon: 'arrow-down-circle', color: '#FF9800' },
    { id: 'low-stock', title: 'কম স্টক', icon: 'warning', color: '#F44336' }
  ];
  
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add-product':
        navigation.navigate('ProductSelection', { category: 'tin' });
        break;
      case 'sale':
        navigation.navigate('Cart');
        break;
      case 'stock-in':
        navigation.navigate('StockManagement');
        break;
      case 'low-stock':
        navigation.navigate('StockManagement', { filter: 'lowStock' });
        break;
      default:
        toast.success(`${actionId} এ নেভিগেট করা হচ্ছে...`);
    }
  };
  
  const handleMenuItemPress = (itemId: string, subItemId?: string) => {
    setIsDrawerOpen(false);
    
    if (subItemId) {
      // Navigate to product selection with specific category
      navigation.navigate('ProductSelection', { category: subItemId });
    } else {
      switch (itemId) {
        case 'dashboard':
          // Already on dashboard
          break;
        case 'inventory':
          navigation.navigate('StockManagement');
          break;
        case 'sales':
          navigation.navigate('Cart');
          break;
        case 'suppliers':
          navigation.navigate('Supplier');
          break;
        case 'price-list':
          navigation.navigate('PriceConfig');
          break;        
        case 'settings':
          toast.success('সেটিংস মেনু শীঘ্রই সক্রিয় হবে');
          break;
        default:
          toast.success(`${itemId} এ নেভিগেট করা হচ্ছে...`);
      }
    }
  };

  const handleDrawerMenuPress = (itemId: string, subItemId?: string) => {
    setIsDrawerOpen(false);
    
    if (subItemId) {
      navigation.navigate('ProductSelection', { category: subItemId });
    } else {
      handleMenuItemPress(itemId);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>নির্মাণ সামগ্রী ব্যবস্থাপনা</Text>
          <Text style={styles.headerSubtext}>{user?.businessName || 'আপনার ব্যবসা'}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart" size={24} color="#fff" />
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('StockManagement', { filter: 'lowStock' })}
          >
            <Ionicons name="notifications" size={24} color="#fff" />
            {stats.lowStockItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.lowStockItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>স্বাগতম, {user?.name || 'ব্যবহারকারী'}!</Text>
          <Text style={styles.welcomeSubtext}>আজকের ব্যবসার অবস্থা দেখুন</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}
            onPress={() => navigation.navigate('ProductSelection', { category: 'tin' })}
          >
            <Ionicons name="cube" size={24} color="#1976D2" />
            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>মোট পণ্য</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}
            onPress={() => navigation.navigate('StockManagement', { filter: 'lowStock' })}
          >
            <Ionicons name="warning" size={24} color="#D32F2F" />
            <Text style={styles.statNumber}>{stats.lowStockItems}</Text>
            <Text style={styles.statLabel}>কম স্টক</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="trending-up" size={24} color="#388E3C" />
            <Text style={styles.statNumber}>{stats.todaySales}</Text>
            <Text style={styles.statLabel}>আজকের বিক্রয়</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}
            onPress={() => toast.success('রিপোর্টস পেইজ শীঘ্রই সক্রিয় হবে')}
          >
            <Ionicons name="cash" size={24} color="#F57C00" />
            <Text style={styles.statNumber}>৳{stats.monthlyRevenue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>মাসিক আয়</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>দ্রুত কাজ</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
                onPress={() => handleQuickAction(action.id)}
              >
                <Ionicons name={action.icon as any} size={28} color="#fff" />
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>সাম্প্রতিক কার্যক্রম</Text>
          <View style={styles.activityContainer}>
            <TouchableOpacity 
              style={styles.activityItem}
              onPress={() => navigation.navigate('StockManagement')}
            >
              <View style={styles.activityIcon}>
                <Ionicons name="arrow-down-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>PHP কোম্পানির সুপার টিন স্টক ইন</Text>
                <Text style={styles.activitySubtitle}>৫০টি • ২ ঘন্টা আগে</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityItem}
              onPress={() => navigation.navigate('Cart')}
            >
              <View style={styles.activityIcon}>
                <Ionicons name="card" size={20} color="#2196F3" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>KY কোম্পানির কালার টিন বিক্রয়</Text>
                <Text style={styles.activitySubtitle}>৳১২,৫০০ • ৩ ঘন্টা আগে</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityItem}
              onPress={() => navigation.navigate('StockManagement', { filter: 'lowStock' })}
            >
              <View style={styles.activityIcon}>
                <Ionicons name="warning" size={20} color="#FF9800" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>TK (G) কোম্পানির লুম টিন কম স্টক</Text>
                <Text style={styles.activitySubtitle}>৫টি বাকি • ৫ ঘন্টা আগে</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Side Drawer */}
      {isDrawerOpen && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            onPress={() => setIsDrawerOpen(false)}
          />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.userName}>{user?.name}</Text>
                  <Text style={styles.userPhone}>{user?.phone}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDrawerOpen(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.drawerContent}>
              {menuItems.map((item) => (
                <View key={item.id}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => handleDrawerMenuPress(item.id)}
                  >
                    <Ionicons name={item.icon as any} size={20} color="#333" />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    {item.hasSubmenu && (
                      <Ionicons name="chevron-forward" size={16} color="#666" />
                    )}
                  </TouchableOpacity>
                  {item.hasSubmenu && item.submenu && (
                    <View style={styles.submenuContainer}>
                      {item.submenu.map((subItem) => (
                        <TouchableOpacity 
                          key={subItem.id} 
                          style={styles.submenuItem}
                          onPress={() => handleDrawerMenuPress(item.id, subItem.id)}
                        >
                          <Ionicons name={subItem.icon as any} size={16} color="#666" />
                          <Text style={styles.submenuItemText}>{subItem.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              
              {/* Logout Button */}
              <TouchableOpacity 
                style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: '#E0E0E0', marginTop: 20 }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={20} color="#F44336" />
                <Text style={[styles.menuItemText, { color: '#F44336' }]}>লগআউট</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtext: {
    color: '#E3F2FD',
    fontSize: 12,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionContainer: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: 300,
    backgroundColor: '#fff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  drawerHeader: {
    backgroundColor: '#1976D2',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userPhone: {
    color: '#E3F2FD',
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  drawerContent: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  submenuContainer: {
    backgroundColor: '#F8F8F8',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  submenuItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});