import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { ScrollView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// For development, we'll skip authentication
const SKIP_AUTH = true;

// Create a custom sidebar drawer component
function CustomDrawerContent({ navigation }) {
  const categoryItems = [
    {
      title: 'টিন',
      companies: [
        {name: 'PHP', types: ['সুপার', 'লুম', 'কালার']},
        {name: 'KY', types: ['NOF', 'লুম', 'কালার']},
        {name: 'TK (G)', types: []},
        {name: 'ABUL Khair', types: []},
        {name: 'Jalalabad', types: []},
        {name: 'Gelco Steel', types: []}
      ]
    },
    {title: 'টুয়া', companies: []},
    {title: 'প্লেইন শিট', companies: []},
    {title: 'ফুলের শিট', companies: []},
    {title: 'প্লাস্টিকের টিন', companies: [{name: 'RFL', types: []}]},
    {title: 'ফুলের ঢেউটিন', companies: [{name: 'PHP', types: []}]},
    {title: 'চাচের প্লাস্টিক', companies: []},
    {title: 'চাচ ডিজিটাল', companies: []},
    {title: 'ডিপ চাচ', companies: []},
    {title: 'কয়েল', companies: []},
    {title: 'অ্যালুমিনিয়াম', companies: [{name: 'এ-গ্রেড', types: []}, {name: 'বি-গ্রেড', types: []}]},
    {title: 'ঝালট', companies: []}
  ];

  return (
    <ScrollView style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>নির্মাণ সামগ্রী</Text>
      </View>
      
      {/* Main Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>মূল মেনু</Text>
        <Text 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('Home')}
        >
          ড্যাশবোর্ড
        </Text>
        <Text 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('ProductSelection')}
        >
          পণ্য নির্বাচন
        </Text>
        <Text 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Cart')}
        >
          কার্ট
        </Text>
        <Text 
          style={styles.menuItem}
          onPress={() => navigation.navigate('StockManagement')}
        >
          স্টক ব্যবস্থাপনা
        </Text>
        <Text 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ProductManagement')}
        >
          পণ্য ব্যবস্থাপনা
        </Text>
        <Text 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Report')}
        >
          রিপোর্ট
        </Text>
        <Text 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Supplier')}
        >
          সাপ্লায়ার
        </Text>
        <Text 
          style={styles.menuItem}
          onPress={() => navigation.navigate('PriceConfig')}
        >
          মূল্য কনফিগারেশন
        </Text>
      </View>
      
      {/* Categories Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>পণ্য ক্যাটাগরি</Text>
        
        {categoryItems.map((category, index) => (
          <View key={index} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            
            {category.companies.length > 0 && (
              <View style={styles.companyList}>
                {category.companies.map((company, companyIndex) => (
                  <Text 
                    key={companyIndex} 
                    style={styles.companyItem}
                    onPress={() => navigation.navigate('ProductSelection', {
                      category: category.title,
                      company: company.name
                    })}
                  >
                    {company.name}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Main drawer navigation component
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
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

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  drawerHeader: {
    backgroundColor: '#388E3C',
    padding: 15,
    marginBottom: 10,
  },
  drawerHeaderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#388E3C',
  },
  menuItem: {
    fontSize: 15,
    paddingVertical: 8,
    paddingLeft: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  categorySection: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingVertical: 5,
  },
  companyList: {
    paddingLeft: 15,
  },
  companyItem: {
    fontSize: 14,
    paddingVertical: 5,
    color: '#555',
  },
});

export default App;