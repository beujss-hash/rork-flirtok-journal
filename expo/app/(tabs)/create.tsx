import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function CreatePostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { createPost } = useApp();

  const scaleValue = new Animated.Value(1);

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
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError('Пожалуйста, введите заголовок');
      return;
    }

    if (!trimmedContent) {
      setError('Пожалуйста, расскажите свою историю');
      return;
    }

    if (trimmedTitle.length < 3) {
      setError('Заголовок должен быть не менее 3 символов');
      return;
    }

    if (trimmedContent.length < 10) {
      setError('История должна быть не менее 10 символов');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const success = await createPost(trimmedTitle, trimmedContent);

      if (success) {
        setTitle('');
        setContent('');
        router.back();
      } else {
        setError('Произошла ошибка. Попробуйте снова.');
      }
    } catch (err) {
      console.error('Create post error:', err);
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#C86DD7', '#9B72FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.heading}>Поделитесь своей историей</Text>
            <Text style={styles.subheading}>
              Расскажите о флирте, знакомстве или романтическом моменте
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Заголовок</Text>
                <TextInput
                  style={[styles.input, error && !title.trim() ? styles.inputError : null]}
                  placeholder="Например: Случайная встреча в кафе"
                  placeholderTextColor="#BBBBBB"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    setError('');
                  }}
                  maxLength={100}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ваша история</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    error && !content.trim() ? styles.inputError : null,
                  ]}
                  placeholder="Расскажите подробнее о том, что произошло..."
                  placeholderTextColor="#BBBBBB"
                  value={content}
                  onChangeText={(text) => {
                    setContent(text);
                    setError('');
                  }}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  maxLength={1000}
                  editable={!isSubmitting}
                />
                <Text style={styles.charCount}>{content.length}/1000</Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <TouchableOpacity
                  style={[styles.button, isSubmitting && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isSubmitting}
                  activeOpacity={0.9}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Опубликовать</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#333333',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: '#999999',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 160,
  },
  inputError: {
    borderColor: '#FF6B9D',
  },
  charCount: {
    fontSize: 13,
    color: '#BBBBBB',
    textAlign: 'right' as const,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  errorText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  button: {
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
