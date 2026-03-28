import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  const { checkUsernameAvailability, registerUser } = useApp();

  const scaleValue = new Animated.Value(1);
  const insets = useSafeAreaInsets();

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Пожалуйста, введите имя');
      return;
    }

    if (trimmedUsername.length < 2) {
      setError('Имя должно быть не менее 2 символов');
      return;
    }

    if (trimmedUsername.length > 20) {
      setError('Имя должно быть не более 20 символов');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const isAvailable = await checkUsernameAvailability(trimmedUsername);

      if (!isAvailable) {
        setError('Это имя уже занято. Попробуйте другое.');
        setIsChecking(false);
        return;
      }

      const success = await registerUser(trimmedUsername);

      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Произошла ошибка. Попробуйте снова.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FF6B9D', '#C86DD7', '#9B72FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Heart size={48} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={styles.logo}>flirtok</Text>
            <Text style={styles.subtitle}>
              Делитесь историями о флирте{'\n'}и знакомствах
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Как вас зовут?</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Введите ваше имя"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError('');
              }}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={20}
              editable={!isChecking}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                style={[styles.button, isChecking && styles.buttonDisabled]}
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isChecking}
                activeOpacity={0.9}
              >
                {isChecking ? (
                  <ActivityIndicator color="#FF6B9D" />
                ) : (
                  <Text style={styles.buttonText}>Начать</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.hint}>
              Ваше имя будет показываться другим пользователям
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FFE5E5',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FF6B9D',
  },
  hint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
