import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const { login, signup, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'মোবাইল নম্বর প্রবেশ করুন');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'পাসওয়ার্ড প্রবেশ করুন');
      return false;
    }

    if (!isLoginMode && !displayName.trim()) {
      Alert.alert('Error', 'নাম প্রবেশ করুন');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLoginMode) {
        await login(phoneNumber, password);
      } else {
        await signup(phoneNumber, password, displayName);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        isLoginMode
          ? 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
          : 'সাইন আপ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
      );
      console.error('Auth error:', error);
    }
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    setPassword('');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://api.a0.dev/assets/image?text=building materials app background with construction materials&aspect=9:16&seed=123' }}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>ঘর তৈরির সরঞ্জাম</Text>
            <Text style={styles.subtitle}>
              {isLoginMode ? 'লগইন করুন' : 'একাউন্ট তৈরি করুন'}
            </Text>

            {!isLoginMode && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#4A6572" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="আপনার নাম"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholderTextColor="#888"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#4A6572" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="মোবাইল নম্বর"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#4A6572" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="পাসওয়ার্ড"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#888"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#4A6572" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLoginMode ? 'লগইন' : 'সাইন আপ'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchMode} onPress={toggleAuthMode}>
              <Text style={styles.switchModeText}>
                {isLoginMode
                  ? 'নতুন একাউন্ট তৈরি করুন'
                  : 'আগের একাউন্টে লগইন করুন'}
              </Text>
            </TouchableOpacity>

            {/* Demo credentials info */}
            {isLoginMode && (
              <View style={styles.demoContainer}>
                <Text style={styles.demoText}>ডেমো অ্যাকাউন্ট:</Text>
                <Text style={styles.demoCredential}>ফোন: 01700000000</Text>
                <Text style={styles.demoCredential}>পাসওয়ার্ড: password</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#344955',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A6572',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#344955',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#344955',
    fontSize: 16,
  },
  demoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4DB6AC',
  },
  demoText: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  demoCredential: {
    color: '#666',
  },
});