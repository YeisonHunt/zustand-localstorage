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

const arePostsEqual = (oldPosts: Post[], newPosts: Post[]): boolean => {
  if (oldPosts.length !== newPosts.length) return false;
  return JSON.stringify(oldPosts) === JSON.stringify(newPosts);
};

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  selectedPost: Post | null;
  lastUpdated: string | null;
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
      lastUpdated: null,
      fetchPosts: async () => {
        if (get().posts.length === 0) {
          set({ isLoading: true, error: null });
          try {
            const newPosts = await fetchPosts();
            set({ 
              posts: newPosts, 
              isLoading: false,
              lastUpdated: new Date().toLocaleTimeString()
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        }
      },
      setSelectedPost: (post) => set({ selectedPost: post }),
      invalidatePosts: async () => {
        try {
          const newPosts = await fetchPosts();
          const currentPosts = get().posts;
          
          // Only update if the data has actually changed
          if (!arePostsEqual(currentPosts, newPosts)) {
            set({ 
              posts: newPosts,
              lastUpdated: new Date().toLocaleTimeString()
            });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
    }),
    {
      name: 'post-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);