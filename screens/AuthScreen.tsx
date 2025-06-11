import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext';
// Authentication is skipped for now

interface AuthScreenProps {
  navigation: any;
}

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Authentication is skipped for now
  // const { login, signup, user } = useAuth();

  // useEffect(() => {
  //   if (user) {
  //     navigation.replace('Home');
  //   }
  // }, [user]);

  const handleAuth = async () => {
    if (!phone || !password) {
      alert('ফোন নম্বর এবং পাসওয়ার্ড প্রয়োজন');
      return;
    }

    if (!isLogin && (!name || !businessName)) {
      alert('সকল তথ্য পূরণ করুন');
      return;
    }

    // Simple phone number validation
    if (!/^(\\+88)?01[3-9]\d{8}$/.test(phone)) {
      alert('সঠিক বাংলাদেশী ফোন নম্বর লিখুন');
      return;
    }

    if (password.length < 6) {
      alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setLoading(true);

    try {
      // Skip actual auth - just navigate to home
      setTimeout(() => {
        navigation.replace('Home');
      }, 1000);

      /* Authentication is skipped for now
      if (isLogin) {
        const success = await login(phone, password);
        if (success) {
          toast.success('সফলভাবে লগইন হয়েছে!');
          navigation.replace('Home');
        } else {
          toast.error('ভুল ফোন নম্বর বা পাসওয়ার্ড');
        }
      } else {
        const success = await signup({ name, phone, password, businessName });
        if (success) {
          toast.success('সফলভাবে নিবন্ধন হয়েছে!');
          navigation.replace('Home');
        } else {
          toast.error('এই ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে');
        }
      }
      */
    } catch (error) {
      alert('কিছু সমস্যা হয়েছে, আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  // Skip auth screen and go directly to home for demo purposes
  React.useEffect(() => {
    navigation.replace('Home');
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="construct" size={48} color="#1976D2" />
          </View>
          <Text style={styles.title}>নির্মাণ সামগ্রী ব্যবস্থাপনা</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="আপনার নাম"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="business" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="ব্যবসার নাম"
                  value={businessName}
                  onChangeText={setBusinessName}
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="ফোন নম্বর (01XXXXXXXXX)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="পাসওয়ার্ড"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.authButtonText}>অপেক্ষা করুন...</Text>
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? 'লগইন করুন' : 'নিবন্ধন করুন'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Switch Auth Mode */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {isLogin ? 'নতুন ব্যবহারকারী? ' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? '}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchLink}>
              {isLogin ? 'নিবন্ধন করুন' : 'লগইন করুন'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip Auth Button - For Demo */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.skipButtonText}>অ্যাপ দেখুন (লগইন ছাড়া)</Text>
        </TouchableOpacity>

        {/* Demo Info */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>ডেমো মোড:</Text>
          <Text style={styles.demoText}>অথেনটিকেশন বর্তমানে অফ আছে</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  authButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: '#388E3C',
  },
});