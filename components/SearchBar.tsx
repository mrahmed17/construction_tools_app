import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  backgroundColor?: string;
  borderColor?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'অনুসন্ধান করুন...',
  onClear,
  backgroundColor = '#f5f5f5',
  borderColor = '#e0e0e0',
}) => {
  return (
    <View style={[
      styles.container, 
      { backgroundColor, borderColor }
    ]}>
      <Ionicons name="search-outline" size={20} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
      {value ? (
        <TouchableOpacity 
          onPress={() => {
            onChangeText('');
            if (onClear) onClear();
          }} 
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
  },
  icon: {
    paddingLeft: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
  },
});

export default SearchBar;