import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Post } from '@/types';
import { fetchPosts } from '@/services/api';

const storage: StateStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  },
};

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  selectedPost: Post | null;
  fetchPosts: () => Promise<void>;
  setSelectedPost: (post: Post | null) => void;
  invalidatePosts: () => Promise<void>;
}

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: [],
      isLoading: false,
      error: null,
      selectedPost: null,
      fetchPosts: async () => {
        // Only fetch if posts array is empty
        if (get().posts.length === 0) {
          set({ isLoading: true, error: null });
          try {
            const posts = await fetchPosts();
            set({ posts, isLoading: false });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        }
      },
      setSelectedPost: (post) => set({ selectedPost: post }),
      invalidatePosts: async () => {
        set({ isLoading: true, error: null });
        try {
          const posts = await fetchPosts();
          set({ posts, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: 'post-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);