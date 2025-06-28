import { Blog, BlogInput, BlogList } from '../types/blog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Get all blogs
  getBlogs: async () => {
    const res = await fetch(`${API_URL}/blogs`);
    if (!res.ok) throw new Error('Failed to fetch blogs');
    return res.json();
  },
  // Get single blog
  getBlog: async (id: number) => {
    const res = await fetch(`${API_URL}/blogs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch blog');
    return res.json();
  },
  // Upload image
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  },
  // Save draft
  saveDraft: async (blog: any) => {
    const res = await fetch(`${API_URL}/blogs/save-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blog),
    });
    if (!res.ok) throw new Error('Failed to save draft');
    return res.json();
  },
  // Publish blog
  publishBlog: async (blog: any) => {
    const res = await fetch(`${API_URL}/blogs/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blog),
    });
    if (!res.ok) throw new Error('Failed to publish blog');
    return res.json();
  },
  // Delete blog
  deleteBlog: async (id: number) => {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete blog');
    return res.json();
  },
};
