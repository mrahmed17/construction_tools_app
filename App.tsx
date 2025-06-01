import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from 'sonner-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from "./screens/HomeScreen";
import AuthScreen from "./screens/AuthScreen";
import CartScreen from "./screens/CartScreen";
import ProductSelectionScreen from "./screens/ProductSelectionScreen";
import StockManagementScreen from "./screens/StockManagementScreen";
import SupplierScreen from "./screens/SupplierScreen";
import ProductManagementScreen from "./screens/ProductManagementScreen";
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

// Stack navigator for auth flow
const AuthStack = createNativeStackNavigator();
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
    </AuthStack.Navigator>
  );
}

// Drawer navigator for main app
const Drawer = createDrawerNavigator();
function AppDrawerNavigator() {
  return (
    <Drawer.Navigator 
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#344955',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: '#344955',
        drawerInactiveTintColor: '#4A6572',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          title: 'ড্যাশবোর্ড'
        }}
      />
      <Drawer.Screen
        name="ProductSelection"
        component={ProductSelectionScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="cart-outline" size={22} color={color} />,
          title: 'নতুন বিক্রয়'
        }}
      />
      <Drawer.Screen
        name="StockManagement"
        component={StockManagementScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="refresh-outline" size={22} color={color} />,
          title: 'স্টক ব্যবস্থাপনা'
        }}
      />
      <Drawer.Screen
        name="SupplierScreen"
        component={SupplierScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
          title: 'সাপ্লাইয়ার'
        }}
      />
      <Drawer.Screen
        name="ProductManagement"
        component={ProductManagementScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="cube-outline" size={22} color={color} />,
          title: 'পণ্য ব্যবস্থাপনা'
        }}
      />
      <Drawer.Screen
        name="CartScreen"
        component={CartScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="basket-outline" size={22} color={color} />,
          title: 'কার্ট',
          drawerItemStyle: { display: 'none' }, // Hide from drawer but keep in navigation
        }}
      />
    </Drawer.Navigator>
  );
}

// Main stack for navigating between auth and app flows
const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    // You could return a loading screen here
    return null;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="AppFlow" component={AppDrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <Toaster />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </CartProvider>
        </ProductProvider>
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