export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  cooking_time: number;
  servings: number;
  image?: string;
  category: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  comments: Comment[];
  comments_count: number;
}

export interface RecipeCreate {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  cooking_time: number;
  servings: number;
  image?: string;
  category: string;
}

export interface Comment {
  id: number;
  recipe: number;
  user: number;
  username: string;
  content: string;
  created_at: string;
}
