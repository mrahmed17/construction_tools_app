import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { CustomerProvider } from './context/CustomerContext';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import CartScreen from './screens/CartScreen';
import SupplierScreen from './screens/SupplierScreen';
import StockManagementScreen from './screens/StockManagementScreen';
import ProductSelectionScreen from './screens/ProductSelectionScreen';
import ProductManagementScreen from './screens/ProductManagementScreen';
import ReportScreen from './screens/ReportScreen';
import MaterialCalculatorScreen from './screens/MaterialCalculatorScreen';
import CustomerManagementScreen from './screens/CustomerManagementScreen';
import PriceConfig from './components/PriceConfig';
import { StatusBar, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Define type for our navigation
type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

type DrawerParamList = {
  Home: undefined;
  ProductSelection: undefined;
  Cart: undefined;
  StockManagement: undefined;
  ProductManagement: undefined;
  Report: undefined;
  Supplier: undefined;
  PriceConfig: undefined;
  MaterialCalculator: undefined;
  CustomerManagement: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// For development, we'll skip authentication
const SKIP_AUTH = true;

// Create a custom sidebar drawer component
function CustomDrawerContent({ navigation }) {
  const categories = [
    {
      title: 'মূল মেনু',
      items: [
        { name: 'Home', label: 'ড্যাশবোর্ড', icon: 'home-outline' },
        { name: 'ProductSelection', label: 'পণ্য নির্বাচন', icon: 'list-outline' },
        { name: 'Cart', label: 'কার্ট', icon: 'cart-outline' },
      ]
    },
    {
      title: 'ব্যবস্থাপনা',
      items: [
        { name: 'StockManagement', label: 'স্টক ব্যবস্থাপনা', icon: 'cube-outline' },
        { name: 'ProductManagement', label: 'পণ্য ব্যবস্থাপনা', icon: 'pricetags-outline' },
        { name: 'CustomerManagement', label: 'কাস্টমার ব্যবস্থাপনা', icon: 'people-outline' },
        { name: 'Supplier', label: 'সাপ্লায়ার', icon: 'business-outline' },
      ]
    },
    {
      title: 'রিপোর্ট ও টুলস',
      items: [
        { name: 'Report', label: 'রিপোর্ট', icon: 'bar-chart-outline' },
        { name: 'MaterialCalculator', label: 'মেটেরিয়াল ক্যালকুলেটর', icon: 'calculator-outline' },
        { name: 'PriceConfig', label: 'মূল্য কনফিগারেশন', icon: 'options-outline' },
      ]
    },
  ];

  // Get the current route name
  const currentRouteName = navigation.state?.routeNames[navigation.state.index] || 'Home';

  return (
    <SafeAreaView style={styles.drawerContainer} edges={['top', 'right', 'left']}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Ionicons name="business" size={32} color="#1565C0" />
        </View>
        <View>
          <Text style={styles.appName}>গৃহ নির্মাণ ভাণ্ডার</Text>
          <Text style={styles.appVersion}>ভার্সন ১.০</Text>
        </View>
      </View>

      <ScrollView style={styles.drawerItems}>
        {categories.map((category, categoryIndex) => (
          <View key={categoryIndex}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {category.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.drawerItem,
                  currentRouteName === item.name && styles.activeDrawerItem
                ]}
                onPress={() => navigation.navigate(item.name)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={22} 
                  color={currentRouteName === item.name ? "#1565C0" : "#555"} 
                />
                <Text 
                  style={[
                    styles.drawerItemText,
                    currentRouteName === item.name && styles.activeDrawerItemText
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>লগআউট</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Main drawer navigation component
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
        drawerType: 'front',
        swipeEnabled: true,
        drawerActiveTintColor: '#1565C0',
        drawerInactiveTintColor: '#555',
        swipeEdgeWidth: Platform.OS === 'ios' ? 50 : 100,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="ProductSelection" component={ProductSelectionScreen} />
      <Drawer.Screen name="Cart" component={CartScreen} />
      <Drawer.Screen name="StockManagement" component={StockManagementScreen} />
      <Drawer.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Drawer.Screen name="Report" component={ReportScreen} />
      <Drawer.Screen name="Supplier" component={SupplierScreen} />
      <Drawer.Screen name="PriceConfig" component={PriceConfig} />
      <Drawer.Screen name="MaterialCalculator" component={MaterialCalculatorScreen} />
      <Drawer.Screen name="CustomerManagement" component={CustomerManagementScreen} />
    </Drawer.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // For development, we'll skip authentication check
    if (SKIP_AUTH) {
      setIsSignedIn(true);
      return;
    }

    // Here you would normally check if the user is authenticated
    // For example, by checking AsyncStorage for a token
    const checkAuthStatus = async () => {
      try {
        // Check authentication status
        // For now, we'll just set it to false
        setIsSignedIn(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsSignedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
      <NavigationContainer>
        <AuthProvider>
          <ProductProvider>
            <CustomerProvider>
              <CartProvider>
                {isSignedIn ? <DrawerNavigator /> : <AuthStack />}
              </CartProvider>
            </CustomerProvider>
          </ProductProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  drawerHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appVersion: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  drawerItems: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: '#f1f1f1',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeDrawerItem: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  drawerItemText: {
    marginLeft: 32,
    fontSize: 16,
    color: '#444',
  },
  activeDrawerItemText: {
    color: '#1565C0',
    fontWeight: 'bold',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e53935',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default App;