import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import CartScreen from './screens/CartScreen';
import SupplierScreen from './screens/SupplierScreen';
import StockManagementScreen from './screens/StockManagementScreen';
import ProductSelectionScreen from './screens/ProductSelectionScreen';
import ProductManagementScreen from './screens/ProductManagementScreen';
import ReportScreen from './screens/ReportScreen';
import PriceConfig from './components/PriceConfig';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// For development, we'll skip authentication
const SKIP_AUTH = true;

// Create a custom sidebar drawer component
function CustomDrawerContent({ navigation }) {
  return (
    <React.Fragment>
      {/* Navigation items will be rendered by the DrawerContentScrollView */}
    </React.Fragment>
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
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'ড্যাশবোর্ড',
        }}
      />
      <Drawer.Screen 
        name="ProductSelection" 
        component={ProductSelectionScreen} 
        options={{
          title: 'পণ্য নির্বাচন',
        }}
      />
      <Drawer.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'কার্ট',
        }}
      />
      <Drawer.Screen 
        name="StockManagement" 
        component={StockManagementScreen} 
        options={{
          title: 'স্টক ব্যবস্থাপনা',
        }}
      />
      <Drawer.Screen 
        name="ProductManagement" 
        component={ProductManagementScreen} 
        options={{
          title: 'পণ্য ব্যবস্থাপনা',
        }}
      />
      <Drawer.Screen 
        name="Report" 
        component={ReportScreen} 
        options={{
          title: 'রিপোর্ট',
        }}
      />
      <Drawer.Screen 
        name="Supplier" 
        component={SupplierScreen} 
        options={{
          title: 'সাপ্লায়ার',
        }}
      />
      <Drawer.Screen 
        name="PriceConfig" 
        component={PriceConfig} 
        options={{
          title: 'মূল্য কনফিগারেশন',
        }}
      />
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
    <NavigationContainer>
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            {isSignedIn ? <DrawerNavigator /> : <AuthStack />}
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

export default App;