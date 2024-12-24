'use client';

import { useEffect, useState } from 'react';
import { usePostStore } from '@/store/postStore';

const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds in milliseconds

export const PostList = () => {
  const [isClient, setIsClient] = useState(false);
  const { 
    posts, 
    isLoading, 
    error, 
    selectedPost,
    lastUpdated, 
    setSelectedPost, 
    fetchPosts,
    invalidatePosts 
  } = usePostStore();

  useEffect(() => {
    setIsClient(true);
    fetchPosts();

    // Set up automatic refresh
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing posts...');
      invalidatePosts();
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchPosts, invalidatePosts]);

  // Show nothing until client-side code is running
  if (!isClient) return null;

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
          )}
        </div>
        <button
          onClick={invalidatePosts}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Posts
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts?.map((post) => (
          <div
            key={post.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedPost?.id === post.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedPost(post)}
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};