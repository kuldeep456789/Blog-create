
export type BlogStatus = 'draft' | 'published';

export interface Blog {
  id: number;
  title: string;
  content: string;
  tags: string[];
  status: BlogStatus;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

export type BlogInput = Omit<Blog, 'id' | 'created_at' | 'updated_at'>;

export type BlogList = Blog[];
