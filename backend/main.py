from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import List
import boto3
import uuid
import os
import time

app = FastAPI(title="FoxxTalk API", version="1.0.0")

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.slyyfoxxmedia.com"]
)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://slyyfoxxmedia.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Simple rate limiting - in production use Redis
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = "100"
    return response

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"{request.method} {request.url} - {response.status_code} - {process_time:.3f}s")
    return response

class Post(BaseModel):
    title: str
    content: str
    category: str = "general"
    tags: str = ""
    image: str = ""
    author: str = ""
    authorImage: str = ""

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    tags: str
    image: str
    author: str
    authorImage: str

posts_db = [
    {"id": 1, "title": "Welcome to FoxxTalk", "content": "This is our first blog post on FoxxTalk. We're excited to share insights about media, technology, and creative content."},
    {"id": 2, "title": "The Future of Digital Media", "content": "Digital media is evolving rapidly. From streaming platforms to interactive content, we're seeing unprecedented changes in how audiences consume media."},
    {"id": 3, "title": "Building Creative Communities", "content": "Community building is at the heart of successful media ventures. Learn how to engage your audience and create lasting connections."}
]
post_id_counter = 4

@app.get("/api/posts", response_model=List[PostResponse])
async def get_posts():
    return posts_db

@app.post("/api/posts", response_model=PostResponse)
async def create_post(post: Post):
    global post_id_counter
    new_post = {
        "id": post_id_counter, 
        "title": post.title, 
        "content": post.content,
        "category": post.category,
        "tags": post.tags,
        "image": post.image,
        "author": post.author,
        "authorImage": post.authorImage
    }
    posts_db.append(new_post)
    post_id_counter += 1
    return new_post

@app.post("/api/upload/image")
async def upload_image(image: UploadFile = File(...)):
    # Configure Lightsail Object Storage
    session = boto3.session.Session()
    client = session.client(
        service_name='s3',
        region_name='us-east-1',  # Your Lightsail region
        endpoint_url='https://s3.us-east-1.amazonaws.com',  # Lightsail endpoint
        aws_access_key_id=os.getenv('LIGHTSAIL_ACCESS_KEY'),
        aws_secret_access_key=os.getenv('LIGHTSAIL_SECRET_KEY')
    )
    
    # Generate unique filename
    file_extension = image.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    try:
        # Upload to Lightsail Object Storage
        client.upload_fileobj(
            image.file,
            'foxxtalk-images',  # Your bucket name
            unique_filename,
            ExtraArgs={'ACL': 'public-read'}
        )
        
        # Return public URL
        image_url = f"https://foxxtalk-images.s3.us-east-1.amazonaws.com/{unique_filename}"
        return {"url": image_url}
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)