
import React from 'react';
import Header from '@/components/Header';
import BlogView from '@/components/BlogView';

const BlogViewPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogView />
        </div>
      </main>
    </div>
  );
};

export default BlogViewPage;
