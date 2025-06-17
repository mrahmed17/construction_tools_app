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
import CustomDrawerContent from './components/CustomDrawerContent';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductSelection" component={ProductSelectionScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Customers" component={CustomerManagementScreen} />
      <Stack.Screen name="Suppliers" component={SupplierScreen} />
      <Stack.Screen name="Reports" component={ReportScreen} />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEnabled: false, // Disable swipe to open
        gestureEnabled: false, // Disable gestures
        swipeEdgeWidth: 0, // Set edge width to 0
        drawerStyle: {
          width: '75%', // Width of the drawer
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="HomeDrawer" component={MainStack} />
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
                <DrawerNavigator />
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