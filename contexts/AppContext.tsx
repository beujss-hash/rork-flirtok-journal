import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Post, User } from '@/types';

const STORAGE_KEYS = {
  USER: '@flirtok_user',
  POSTS: '@flirtok_posts',
};

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    username: 'Аня',
    title: 'Первая встреча в кафе',
    content: 'Сегодня познакомилась с парнем в кафе. Он случайно взял мой кофе, и мы начали разговаривать. Обменялись номерами! 💕',
    timestamp: Date.now() - 3600000,
    likes: 12,
    likedBy: [],
  },
  {
    id: '2',
    username: 'Максим',
    title: 'Переписка в инстаграме',
    content: 'Неделю переписывались с девушкой из инсты. Наконец решились встретиться! Жду завтрашнего вечера 🌟',
    timestamp: Date.now() - 7200000,
    likes: 8,
    likedBy: [],
  },
  {
    id: '3',
    username: 'Лиза',
    title: 'Комплимент от незнакомца',
    content: 'В метро парень сделал мне комплимент о моей улыбке. Весь день на позитиве! Жаль не успела спросить номер 😊',
    timestamp: Date.now() - 10800000,
    likes: 15,
    likedBy: [],
  },
];

export const [AppProvider, useApp] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [storedUser, storedPosts] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.POSTS),
      ]);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedPosts) {
        const parsedPosts = JSON.parse(storedPosts);
        setPosts([...MOCK_POSTS, ...parsedPosts]);
      } else {
        setPosts(MOCK_POSTS);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setPosts(MOCK_POSTS);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsernameAvailability = useCallback(
    async (username: string): Promise<boolean> => {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) return false;

      const realPosts = posts.filter((p) => !MOCK_POSTS.find((mp) => mp.id === p.id));
      const realUsernames = realPosts.map((post) => post.username.toLowerCase());
      return !realUsernames.includes(trimmedUsername.toLowerCase());
    },
    [posts]
  );

  const registerUser = useCallback(async (username: string) => {
    try {
      const newUser: User = {
        username: username.trim(),
        createdAt: Date.now(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }, []);

  const createPost = useCallback(
    async (title: string, content: string) => {
      if (!user) return false;

      try {
        const newPost: Post = {
          id: Date.now().toString(),
          username: user.username,
          title: title.trim(),
          content: content.trim(),
          timestamp: Date.now(),
          likes: 0,
          likedBy: [],
        };

        const userPosts = posts.filter((p) => !MOCK_POSTS.find((mp) => mp.id === p.id));
        const updatedPosts = [newPost, ...userPosts];

        await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
        setPosts([newPost, ...posts]);
        return true;
      } catch (error) {
        console.error('Error creating post:', error);
        return false;
      }
    },
    [user, posts]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) return;

      try {
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            const hasLiked = post.likedBy.includes(user.username);
            return {
              ...post,
              likes: hasLiked ? post.likes - 1 : post.likes + 1,
              likedBy: hasLiked
                ? post.likedBy.filter((name) => name !== user.username)
                : [...post.likedBy, user.username],
            };
          }
          return post;
        });

        setPosts(updatedPosts);

        const userPosts = updatedPosts.filter((p) => !MOCK_POSTS.find((mp) => mp.id === p.id));
        await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(userPosts));
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    [user, posts]
  );

  const getUserPosts = useCallback(() => {
    if (!user) return [];
    return posts
      .filter((post) => post.username === user.username)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [user, posts]);

  const getAllPosts = useCallback(() => {
    return [...posts].sort((a, b) => b.timestamp - a.timestamp);
  }, [posts]);

  return useMemo(
    () => ({
      user,
      isLoading,
      checkUsernameAvailability,
      registerUser,
      createPost,
      toggleLike,
      getUserPosts,
      getAllPosts,
    }),
    [user, isLoading, checkUsernameAvailability, registerUser, createPost, toggleLike, getUserPosts, getAllPosts]
  );
});
