import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Save, Send, X, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { Blog, BlogInput } from '@/types/blog';
import { api } from '@/services/api';
import { useAutoSave } from '@/hooks/useAutoSave';

interface BlogEditorProps {
  existingBlogId?: number;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ existingBlogId }) => {
  const [blog, setBlog] = useState<BlogInput>({
    title: '',
    content: '',
    tags: [],
    status: 'draft',
    image_url: '',
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Load existing blog if editing
  useEffect(() => {
    const loadBlog = async () => {
      if (existingBlogId) {
        try {
          setLoading(true);
          const loadedBlog = await api.getBlog(existingBlogId);
          if (loadedBlog) {
            setBlog(loadedBlog);
          }
        } catch (error) {
          console.error('Error loading blog:', error);
          toast({
            title: 'Failed to load blog',
            description: 'Could not load the blog post for editing',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadBlog();
  }, [existingBlogId, toast]);
  
  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBlog(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image less than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setUploading(true);
      const imageUrl = await api.uploadImage(file);
      
      setBlog(prev => ({
        ...prev,
        image_url: imageUrl
      }));
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload the image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle removing image
  const handleRemoveImage = () => {
    setBlog(prev => ({
      ...prev,
      image_url: ''
    }));
    
    toast({
      title: 'Image removed',
      description: 'The image has been removed from your blog post',
    });
  };
  
  // Handle saving draft
  const handleSaveDraft = async () => {
    if (!blog.title) {
      toast({
        title: 'Title required',
        description: 'Please add a title to save your blog post',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      const savedBlog = await api.saveDraft(blog);
      setBlog(savedBlog);
      setLastSavedAt(new Date());
      
      toast({
        title: 'Draft saved',
        description: 'Your blog post has been saved as a draft',
      });
      
      return savedBlog;
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Failed to save draft',
        description: 'An error occurred while saving your draft',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle publishing
  const handlePublish = async () => {
    if (!blog.title || !blog.content) {
      toast({
        title: 'Missing content',
        description: 'Please add both a title and content to publish',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoadingPublish(true);
      const publishedBlog = await api.publishBlog(blog);
      
      toast({
        title: 'Blog published!',
        description: 'Your blog post has been published successfully',
      });
      
      navigate(`/blogs/${publishedBlog.id}`);
    } catch (error) {
      console.error('Error publishing blog:', error);
      toast({
        title: 'Failed to publish',
        description: 'An error occurred while publishing your blog post',
        variant: 'destructive',
      });
    } finally {
      setLoadingPublish(false);
    }
  };
  
  // Handle tag input
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!blog.tags.includes(tagInput.trim())) {
        setBlog(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setBlog(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Auto-save functionality
  const handleAutoSave = async (data: BlogInput) => {
    try {
      if (data.title) {
        const savedBlog = await api.saveDraft(data);
        setLastSavedAt(new Date());
        return savedBlog;
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };
  
  const { forceSave } = useAutoSave({
    data: blog,
    onSave: handleAutoSave,
    interval: 30000, // 30 seconds
    debounceTime: 5000, // 5 seconds after typing stops
  });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse-light text-blog-primary text-2xl">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-[#0a192f] dark:via-[#1e3a8a] dark:to-[#2563eb] rounded-2xl shadow-xl">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <Input
                placeholder="Blog Title"
                className="text-2xl font-serif p-2 border-none shadow-none focus-visible:ring-0 placeholder:text-gray-400 h-auto"
                name="title"
                value={blog.title}
                onChange={handleChange}
              />
              <Separator className="mt-2" />
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              
              {blog.image_url ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={blog.image_url} 
                    alt="Blog cover" 
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-4">Upload a cover image for your blog post</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Select Image'}
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Textarea
                placeholder="Start writing your blog post here..."
                className="min-h-[400px] font-sans text-base p-2 border-none shadow-none focus-visible:ring-0 placeholder:text-gray-400 resize-none"
                name="content"
                value={blog.content}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                {lastSavedAt && `Last saved: ${lastSavedAt.toLocaleTimeString()}`}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={loadingPublish}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!(blog as any).id) return;
                    if (window.confirm('Are you sure you want to delete this blog post?')) {
                      try {
                        await api.deleteBlog((blog as any).id);
                        toast({
                          title: 'Blog deleted',
                          description: 'Your blog post has been deleted.',
                        });
                        navigate('/');
                      } catch (error) {
                        toast({
                          title: 'Failed to delete',
                          description: 'An error occurred while deleting your blog post.',
                          variant: 'destructive',
                        });
                      }
                    }
                  }}
                  disabled={!(blog as any).id || loadingPublish || isSaving}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default BlogEditor;
