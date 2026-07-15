export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  coverGradient: string;
  author: string;
}

export const BLOG_CATEGORIES = ["Todos", "WhatsApp", "Instagram", "Email", "Automação"] as const;

export const BLOG_POSTS: BlogPost[] = [];
