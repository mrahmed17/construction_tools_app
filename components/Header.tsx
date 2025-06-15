import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showMenuButton = true,
  rightComponent,
  backgroundColor = '#1565C0',
  textColor = '#fff',
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      
      <View style={styles.leftContainer}>
        {showBackButton ? (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        ) : showMenuButton ? (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={24} color={textColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderLeft} />
        )}
      </View>
      
      <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightComponent || <View style={styles.placeholderRight} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholderLeft: {
    width: 24,
  },
  placeholderRight: {
    width: 24,
  },
});

export default Header;