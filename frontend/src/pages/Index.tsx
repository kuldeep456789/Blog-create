
import React from 'react';
import Header from '@/components/Header';
import BlogList from '@/components/BlogList';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold font-serif text-blue-900 mb-4">
              Welcome to BlogCraft
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create, edit, and publish your blog posts with ease. 
              Start writing today with our powerful editor.
            </p>
          </div>
          <BlogList />
        </div>
      </main>
    </div>
  );
};

export default Index;
