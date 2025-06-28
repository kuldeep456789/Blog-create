import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenLine, ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { Blog } from '@/types/blog';
import { Separator } from '@/components/ui/separator';

const BlogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const blogId = parseInt(id, 10);
        const fetchedBlog = await api.getBlog(blogId);
        setBlog(fetchedBlog);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse-light text-blog-primary text-2xl">Loading blog...</div>
        </div>
      </div>
    );
  }
  
  if (!blog) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Blog post not found</h2>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      
      <article>
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              {blog.title}
            </h1>
            {blog.status === 'draft' && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Draft
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-gray-500 text-sm gap-2">
            <time dateTime={blog.created_at}>
              {formatDate(blog.created_at)}
            </time>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/editor/${blog.id}`}>
                  <PenLine className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this blog post?')) {
                    try {
                      await api.deleteBlog(blog.id);
                      navigate('/');
                    } catch (error) {
                      alert('Failed to delete blog post.');
                    }
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </header>
        
        {blog.image_url && (
          <div className="mb-6">
            <img 
              src={blog.image_url} 
              alt={blog.title}
              className="w-full h-auto rounded-lg object-cover max-h-[400px]"
            />
          </div>
        )}
        
        <Separator className="my-6" />
        
        <div className="blog-content prose prose-slate max-w-none">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        {blog.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogView;
