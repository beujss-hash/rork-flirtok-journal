export interface Post {
  id: string;
  username: string;
  content: string;
  title: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
}

export interface User {
  username: string;
  createdAt: number;
}
