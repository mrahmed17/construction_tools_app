import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, Platform, View, Text } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import HomeScreen from "./screens/HomeScreen";
import ProductSelectionScreen from "./screens/ProductSelectionScreen";
import ProductManagementScreen from "./screens/ProductManagementScreen";
import CartScreen from "./screens/CartScreen";
import CustomerManagementScreen from "./screens/CustomerManagementScreen";
import SupplierScreen from "./screens/SupplierScreen";
import ReportScreen from "./screens/ReportScreen";
import MaterialCalculatorScreen from "./screens/MaterialCalculatorScreen";
import CustomDrawerContent from './components/CustomDrawerContent';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEnabled: Platform.OS !== 'web', // Enable swipe on mobile only
        drawerStyle: {
          width: '75%', // Width of the drawer
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="ProductSelection" component={ProductSelectionScreen} />
      <Drawer.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Drawer.Screen name="Cart" component={CartScreen} />
      <Drawer.Screen name="Suppliers" component={SupplierScreen} />
      <Drawer.Screen name="Customers" component={CustomerManagementScreen} />
      <Drawer.Screen name="MaterialCalculator" component={MaterialCalculatorScreen} />
      <Drawer.Screen name="Reports" component={ReportScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <CustomerProvider>
          <ProductProvider>
            <CartProvider>
              <Toaster />
              <NavigationContainer>
                <MainDrawerNavigator />
              </NavigationContainer>
            </CartProvider>
          </ProductProvider>
        </CustomerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});