import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import CartScreen from './screens/CartScreen';
import ProductSelectionScreen from './screens/ProductSelectionScreen';
import StockManagementScreen from './screens/StockManagementScreen';
import SupplierScreen from './screens/SupplierScreen';
import PriceConfig from './components/PriceConfig';
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "construction-app-xxxxx.firebaseapp.com",
  projectId: "construction-app-xxxxx",
  storageBucket: "construction-app-xxxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxxxx",
  appId: "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxx"
};

// Firebase initialization code would be here
// Note: This is a placeholder. In a real app, we would initialize Firebase
// but for this demo, we'll simulate Firebase functionality

const Drawer = createDrawerNavigator();

export default function App() {
  useEffect(() => {
    console.log('Firebase would be initialized here in a real app');
    // In a real app: firebase.initializeApp(firebaseConfig);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'ড্যাশবোর্ড' }} />
            <Drawer.Screen name="Auth" component={AuthScreen} options={{ title: 'লগইন/সাইন আপ' }} />
            <Drawer.Screen name="Cart" component={CartScreen} options={{ title: 'কার্ট' }} />
            <Drawer.Screen 
              name="ProductSelection" 
              component={ProductSelectionScreen} 
              options={{ title: 'পণ্য নির্বাচন' }} 
            />
            <Drawer.Screen 
              name="StockManagement" 
              component={StockManagementScreen} 
              options={{ title: 'স্টক ম্যানেজমেন্ট' }} 
            />
            <Drawer.Screen 
              name="Supplier" 
              component={SupplierScreen} 
              options={{ title: 'সাপ্লায়ার' }} 
            />
            <Drawer.Screen 
              name="PriceConfig" 
              component={PriceConfig} 
              options={{ title: 'মূল্য নির্ধারণ' }} 
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}