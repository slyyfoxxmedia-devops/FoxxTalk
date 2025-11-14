from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import boto3
import uuid
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Post(BaseModel):
    title: str
    content: str

class PostResponse(BaseModel):
    id: int
    title: str
    content: str

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
    new_post = {"id": post_id_counter, "title": post.title, "content": post.content}
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