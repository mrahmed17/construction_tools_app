import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import ProductSelectionScreen from './screens/ProductSelectionScreen';
import CartScreen from './screens/CartScreen';
import StockManagementScreen from './screens/StockManagementScreen';
import SupplierScreen from './screens/SupplierScreen';
import PriceConfig from './components/PriceConfig';
import { CartProvider } from './context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

export default function App() {
  // Function to initialize offline storage
  const initializeOfflineStorage = async () => {
    try {
      // Check if initial data is already stored
      const hasInitializedData = await AsyncStorage.getItem('hasInitializedData');
      
      if (!hasInitializedData) {
        console.log('Initializing offline data storage...');
        // Store default product categories and settings
        await AsyncStorage.setItem('productCategories', JSON.stringify(defaultProductCategories));
        await AsyncStorage.setItem('hasInitializedData', 'true');
      }
    } catch (error) {
      console.error('Error initializing offline storage:', error);
    }
  };

  useEffect(() => {
    initializeOfflineStorage();
  }, []);

  return (
    <CartProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Drawer.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            drawerActiveTintColor: '#4CAF50',
            drawerLabelStyle: {
              fontSize: 16,
            }
          }}
        >
          <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'হোম' }} />
          <Drawer.Screen 
            name="ProductSelection" 
            component={ProductSelectionScreen} 
            options={{ title: 'পণ্য নির্বাচন করুন' }}
          />
          <Drawer.Screen name="Cart" component={CartScreen} options={{ title: 'কার্ট' }} />
          <Drawer.Screen 
            name="StockManagement" 
            component={StockManagementScreen} 
            options={{ title: 'স্টক ম্যানেজমেন্ট' }}
          />
          <Drawer.Screen 
            name="Supplier" 
            component={SupplierScreen} 
            options={{ title: 'সাপ্লাইয়ার' }}
          />
          <Drawer.Screen 
            name="PriceConfig" 
            component={PriceConfig} 
            options={{ title: 'মূল্য সেটিংস' }}
          />
          <Drawer.Screen 
            name="ProductManagement" 
            component={ProductManagementScreen} 
            options={{ title: 'প্রোডাক্ট ম্যানেজমেন্ট' }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

// Default product categories for offline storage initialization
const defaultProductCategories = {
  "টিন": {
    companies: [
      {
        name: "PHP",
        products: ["সুপার", "লুম", "কালার"],
        colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
        thickness: ["0.120", "0.130", "0.140", "0.150", "0.160", "0.170", "0.180", "0.190", "0.200", "0.210", "0.220", "0.230", "0.240", "0.250", "0.260", "0.270", "0.280", "0.290", "0.300", "0.310", "0.320", "0.330", "0.340", "0.350", "0.360", "0.370", "0.380", "0.390", "0.400", "0.410", "0.420", "0.430", "0.440", "0.450", "0.460", "0.470", "0.480", "0.490", "0.500", "0.510"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"]
      },
      {
        name: "KY",
        products: ["NOF", "লুম", "কালার"],
        colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
        thickness: ["0.120", "0.130", "0.140", "0.150", "0.160", "0.170", "0.180", "0.190", "0.200", "0.210", "0.220", "0.230", "0.240", "0.250", "0.260", "0.270", "0.280", "0.290", "0.300", "0.310", "0.320", "0.330", "0.340", "0.350", "0.360", "0.370", "0.380", "0.390", "0.400", "0.410", "0.420", "0.430", "0.440", "0.450", "0.460", "0.470", "0.480", "0.490", "0.500", "0.510"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"]
      },
      {
        name: "TK (G)",
        products: ["NOF", "লুম", "কালার"],
        colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
        thickness: ["0.120", "0.130", "0.140", "0.150", "0.160", "0.170", "0.180", "0.190", "0.200", "0.210", "0.220", "0.230", "0.240", "0.250", "0.260", "0.270", "0.280", "0.290", "0.300", "0.310", "0.320", "0.330", "0.340", "0.350", "0.360", "0.370", "0.380", "0.390", "0.400", "0.410", "0.420", "0.430", "0.440", "0.450", "0.460", "0.470", "0.480", "0.490", "0.500", "0.510"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"]
      },
      {
        name: "ABUL Khair",
        products: ["NOF", "লুম", "কালার"],
        colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
        thickness: ["0.12", "0.13", "0.14", "0.15", "0.16", "0.17", "0.18", "0.19", "0.20", "0.21", "0.22", "0.23", "0.24", "0.25", "0.26", "0.27", "0.28", "0.29", "0.30", "0.31", "0.32", "0.33", "0.34", "0.35", "0.36", "0.37", "0.38", "0.39", "0.40", "0.41", "0.42", "0.43", "0.44", "0.45", "0.46"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"]
      },
      {
        name: "Jalalabad",
        products: ["NOF", "লুম", "কালার"],
        colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
        thickness: ["0.25", "0.35", "0.38", "0.42", "0.46", "0.48", "0.52", "0.54", "0.58", "0.62", "0.64", "0.72"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"]
      },
      {
        name: "Gelco Steel",
        products: ["NOF", "লুম", "কালার"],
        colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
        thickness: ["0.12", "0.13", "0.14", "0.15", "0.16", "0.17", "0.18", "0.19", "0.20", "0.21", "0.22", "0.23", "0.24", "0.25", "0.26", "0.27", "0.28", "0.29", "0.30", "0.31", "0.32", "0.33", "0.34", "0.35", "0.36", "0.37", "0.38", "0.39", "0.40", "0.41", "0.42", "0.43", "0.44", "0.45", "0.46"],
        sizes: ["6", "7", "8", "9", "10", "11", "12"]
      }
    ]
  },
  "টুয়া": {
    companies: [
      {
        name: "PHP",
        products: ["সুপার", "লুম", "কালার"],
        colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
        thickness: ["0.120", "0.130", "0.140", "0.150", "0.160", "0.170", "0.180", "0.190", "0.200", "0.210", "0.220", "0.230", "0.240", "0.250", "0.260", "0.270", "0.280", "0.290", "0.300", "0.310", "0.320", "0.330", "0.340", "0.350", "0.360", "0.370", "0.380", "0.390", "0.400", "0.410", "0.420", "0.430", "0.440", "0.450", "0.460", "0.470", "0.480", "0.490", "0.500", "0.510"],
        sizes: ["6", "7", "8", "9", "10"]
      },
      // Other companies similar to 'টিন' but with sizes 6-10
    ]
  },
  "প্লেইন শিট": {
    companies: [
      // Similar to 'টুয়া'
    ]
  },
  "ফুলের শিট": {
    prints: ["প্রিন্ট টাইপ ১", "প্রিন্ট টাইপ ২", "প্রিন্ট টাইপ ৩"],
    thickness: ["0.25", "0.30", "0.35", "0.40"],
    sizes: ["6", "7", "8", "9", "10"]
  },
  "প্লাস্টিকের টিন": {
    companies: ["RFL"],
    thickness: ["0.75", "1.00", "1.25", "1.50", "1.75"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"]
  },
  "ফুলের ঢেউটিন": {
    companies: ["PHP"],
    products: ["সুপার", "লুম", "কালার"],
    colors: ["CNG (ডার্ক গ্রীন)", "ব্লু কালার", "রেড"],
    thickness: ["0.120", "0.130", "0.140", "0.150", "0.160", "0.170", "0.180", "0.190", "0.200"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"]
  },
  "চাচের প্লাস্টিক": {
    thickness: ["0.25", "0.30", "0.35", "0.40"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"]
  },
  "চাচ ডিজিটাল": {
    // Sold by piece
  },
  "ডিপ চাচ": {
    // Sold by piece
  },
  "কয়েল (পি-ফোমে)": {
    thickness: ["4", "5", "6", "7", "8", "9", "10", "11", "12"]
  },
  "অ্যালুমিনিয়াম": {
    grades: ["এ-গ্রেড", "বি-গ্রেড"]
  },
  "ঝালট": {
    // Sold by piece
  }
};