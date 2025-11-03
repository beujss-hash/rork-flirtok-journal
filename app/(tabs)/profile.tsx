import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, PenLine } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import type { Post } from '@/types';

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const { user } = useApp();
  const scaleValue = new Animated.Value(1);
  const isLiked = user ? post.likedBy.includes(user.username) : false;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLike = () => {
    onLike(post.id);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days === 1) return 'вчера';
    return `${days} дней назад`;
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <Heart
            size={22}
            color={isLiked ? '#FF6B9D' : '#999999'}
            fill={isLiked ? '#FF6B9D' : 'transparent'}
          />
          <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { user, getUserPosts, toggleLike } = useApp();
  const userPosts = getUserPosts();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#C86DD7', '#9B72FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />

      <View style={styles.profileHeader}>
        <LinearGradient
          colors={['#FF6B9D', '#C86DD7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarLarge}
        >
          <Text style={styles.avatarLargeText}>{user.username[0].toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.name}>{user.username}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userPosts.length}</Text>
            <Text style={styles.statLabel}>публикаций</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userPosts.reduce((sum, post) => sum + post.likes, 0)}
            </Text>
            <Text style={styles.statLabel}>лайков</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} onLike={toggleLike} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PenLine size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>У вас пока нет публикаций</Text>
            <Text style={styles.emptySubtext}>
              Нажмите на кнопку &ldquo;Создать&rdquo;,{'\n'}чтобы поделиться своей историей
            </Text>
          </View>
        }
      />
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
    height: 250,
    opacity: 0.15,
  },
  profileHeader: {
    alignItems: 'center' as const,
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#333333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 24,
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FF6B9D',
  },
  statLabel: {
    fontSize: 13,
    color: '#999999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333333',
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  likeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  likeCount: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#999999',
  },
  likeCountActive: {
    color: '#FF6B9D',
  },
  emptyContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#999999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 8,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
