import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenLine, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="w-full border-b border-blog-light/30 bg-gradient-to-r from-background to-accent/30">
      <div className="container mx-auto py-4 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 hover-scale">
          <div className="bg-blog-primary rounded-lg p-1.5">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-blog-primary to-blog-tertiary">
            BlogCraft
          </h1>
        </Link>
        
        <nav>
          <ul className="flex items-center space-x-6">
            <li>
              <Link to="/" className="text-blog-secondary hover:text-blog-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Button asChild className="bg-gradient-to-r from-blog-primary to-blog-secondary hover:opacity-90 transition-opacity">
                <Link to="/editor">New Post</Link>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="ml-2 rounded-full border border-blog-light/30 hover:bg-blog-primary/10 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-900" />
                )}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
