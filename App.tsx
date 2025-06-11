import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import HomeScreen from "./screens/HomeScreen";
import ProductSelectionScreen from "./screens/ProductSelectionScreen";
import CartScreen from "./screens/CartScreen";
import StockManagementScreen from "./screens/StockManagementScreen";

// Import providers (commented out to avoid errors until we have proper implementation)
// import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductSelection" component={ProductSelectionScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="StockManagement" component={StockManagementScreen} />
      {/* Add more screens as needed */}
      {/* <Stack.Screen name="Suppliers" component={SuppliersScreen} /> */}
      {/* <Stack.Screen name="PriceConfig" component={PriceConfigScreen} /> */}
      {/* <Stack.Screen name="Reports" component={ReportsScreen} /> */}
      {/* <Stack.Screen name="PriceList" component={PriceListScreen} /> */}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      {/* Wrapping in context providers (commented out for now) */}
      {/* <AuthProvider> */}
      {/* <CartProvider> */}
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
      {/* </CartProvider> */}
      {/* </AuthProvider> */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});