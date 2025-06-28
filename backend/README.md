
# BlogCraft Backend

This is the Flask backend for the BlogCraft application.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up PostgreSQL:
   - Create a database named `blogcraft`
   - Configure connection details in `.env` file (copy from `.env.example`)

5. Run the application:
   ```
   python app.py
   ```

## API Endpoints

- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get a blog by ID
- `POST /api/blogs/save-draft` - Save a blog as draft
- `POST /api/blogs/publish` - Publish a blog
- `DELETE /api/blogs/:id` - Delete a blog

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost/blogcraft
SECRET_KEY=your_secret_key_here
```
