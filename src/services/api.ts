import { Post } from "@/types";

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${BASE_URL}/posts`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};