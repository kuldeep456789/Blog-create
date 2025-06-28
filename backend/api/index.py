import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Blog
from datetime import datetime
import uuid
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure database
# Load .env from backend root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://neondb_owner:npg_aRtjSdfKh5w0@ep-wispy-voice-a1jsog9k-pooler.ap-southeast-1.aws.neon.tech/Blogeditor?sslmode=require')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Store uploads in backend/uploads
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')))

# Create the upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db.init_app(app)

@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    """Get all blogs"""
    blogs = Blog.query.all()
    return jsonify([blog.to_dict() for blog in blogs]), 200

@app.route('/api/blogs/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    """Get a specific blog by ID"""
    blog = Blog.query.get_or_404(blog_id)
    return jsonify(blog.to_dict()), 200

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Upload an image and return its URL"""
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Check file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if '.' not in file.filename or file.filename.split('.')[-1].lower() not in allowed_extensions:
        return jsonify({"error": "File type not allowed"}), 400
    
    # Generate unique filename
    filename = str(uuid.uuid4()) + '.' + file.filename.split('.')[-1].lower()
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Generate URL for the uploaded image
    host = request.host_url.rstrip('/')
    image_url = f"{host}/uploads/{filename}"
    
    return jsonify({"url": image_url}), 200

@app.route('/api/blogs/save-draft', methods=['POST'])
def save_draft():
    """Save or update a blog draft"""
    data = request.json
    
    # Check if we're updating an existing blog
    if 'id' in data:
        blog = Blog.query.get(data['id'])
        if not blog:
            return jsonify({"error": "Blog not found"}), 404
        
        # Update existing blog
        blog.title = data.get('title', blog.title)
        blog.content = data.get('content', blog.content)
        blog.tags = data.get('tags', blog.tags)
        blog.image_url = data.get('image_url', blog.image_url)
        blog.status = 'draft'
        blog.updated_at = datetime.utcnow()
    else:
        # Create new blog draft
        blog = Blog(
            title=data.get('title', ''),
            content=data.get('content', ''),
            tags=data.get('tags', []),
            image_url=data.get('image_url', ''),
            status='draft'
        )
        db.session.add(blog)
    
    db.session.commit()
    return jsonify(blog.to_dict()), 200

@app.route('/api/blogs/publish', methods=['POST'])
def publish_blog():
    """Publish a new or update an existing blog"""
    data = request.json
    
    # Check if we're updating an existing blog
    if 'id' in data:
        blog = Blog.query.get(data['id'])
        if not blog:
            return jsonify({"error": "Blog not found"}), 404
        
        # Update existing blog
        blog.title = data.get('title', blog.title)
        blog.content = data.get('content', blog.content)
        blog.tags = data.get('tags', blog.tags)
        blog.image_url = data.get('image_url', blog.image_url)
        blog.status = 'published'
        blog.updated_at = datetime.utcnow()
    else:
        # Create new published blog
        blog = Blog(
            title=data.get('title', ''),
            content=data.get('content', ''),
            tags=data.get('tags', []),
            image_url=data.get('image_url', ''),
            status='published'
        )
        db.session.add(blog)
    
    db.session.commit()
    return jsonify(blog.to_dict()), 200

@app.route('/api/blogs/<int:blog_id>', methods=['DELETE'])
def delete_blog(blog_id):
    """Delete a blog"""
    blog = Blog.query.get_or_404(blog_id)
    db.session.delete(blog)
    db.session.commit()
    return jsonify({"message": "Blog deleted successfully"}), 200

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True, host='0.0.0.0', port=5000)