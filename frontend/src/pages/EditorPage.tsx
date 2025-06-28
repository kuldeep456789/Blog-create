
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import BlogEditor from '@/components/BlogEditor';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const blogId = id ? parseInt(id, 10) : undefined;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6 font-serif">
            {blogId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <BlogEditor existingBlogId={blogId} />
        </div>
      </main>
    </div>
  );
};

export default EditorPage;
