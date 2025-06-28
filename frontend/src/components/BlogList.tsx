
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine } from 'lucide-react';
import { api } from '@/services/api';
import { Blog } from '@/types/blog';

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const fetchedBlogs = await api.getBlogs();
        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);
  
  const publishedBlogs = blogs.filter(blog => blog.status === 'published');
  const draftBlogs = blogs.filter(blog => blog.status === 'draft');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse-light text-blog-primary text-2xl">Loading blogs...</div>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const renderBlogList = (blogList: Blog[]) => {
    if (blogList.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-500">No blog posts found.</p>
          <Button asChild className="mt-4">
            <Link to="/editor">Create New Blog</Link>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {blogList.map(blog => (
          <Card key={blog.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Link to={`/blogs/${blog.id}`} className="text-xl font-serif font-bold hover:text-blog-primary transition">
                  {blog.title}
                </Link>
                {blog.status === 'draft' && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Draft
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-600 line-clamp-3">
                {blog.content.substring(0, 150)}
                {blog.content.length > 150 ? '...' : ''}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-2">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between w-full items-center">
                <span className="text-sm text-gray-500">
                  {formatDate(blog.created_at)}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/editor/${blog.id}`}>
                    <PenLine className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="published" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="published" className="flex-1">
            Published ({publishedBlogs.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex-1">
            Drafts ({draftBlogs.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="published">
          {renderBlogList(publishedBlogs)}
        </TabsContent>
        <TabsContent value="drafts">
          {renderBlogList(draftBlogs)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogList;
