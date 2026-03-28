import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Heart } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ой!' }} />
      <View style={styles.container}>
        <Heart size={64} color="#FF6B9D" />
        <Text style={styles.title}>Эта страница не найдена</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Вернуться на главную</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
    backgroundColor: '#F5F5F5',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#333333',
    textAlign: 'center' as const,
  },
  link: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
