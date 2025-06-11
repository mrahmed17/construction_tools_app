import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import HomeScreen from "./screens/HomeScreen"
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthScreen from './screens/AuthScreen';
import ProductSelectionScreen from './screens/ProductSelectionScreen';
import CartScreen from './screens/CartScreen';
import StockManagementScreen from './screens/StockManagementScreen';
import SupplierScreen from './screens/SupplierScreen';
import PriceConfig from './components/PriceConfig';
  
const Stack = createNativeStackNavigator();
  
function RootStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      {/* Auth screen is disabled for now, starting directly with Home */}
      {/* <Stack.Screen name="Auth" component={AuthScreen} /> */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductSelection" component={ProductSelectionScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="StockManagement" component={StockManagementScreen} />
      <Stack.Screen name="Supplier" component={SupplierScreen} />
      <Stack.Screen name="PriceConfig" component={PriceConfig} />
    </Stack.Navigator>
  );
}
  
export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      {/* Wrap navigation in Auth + Cart providers */}
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </CartProvider>
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