from fastapi import FastAPI, UploadFile, File, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import uuid
import os
import time
import hashlib
import secrets
import boto3
from datetime import datetime
from database import get_db, User, Post as DBPost

app = FastAPI(title="FoxxTalk API", version="1.0.0")

# Configuration
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@slyyfoxxmedia.com')
ADMIN_PASSWORD_HASH = os.getenv('ADMIN_PASSWORD_HASH', hashlib.sha256('admin123'.encode()).hexdigest())
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
S3_BUCKET = os.getenv('S3_BUCKET', 'foxxtalk-media')
CLOUDFRONT_DOMAIN = os.getenv('CLOUDFRONT_DOMAIN')

security = HTTPBearer()
active_tokens = set()  # In production, use Redis

# S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name='us-east-1'
)

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

# Token authentication
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    user = db.query(User).filter(User.email == current_admin_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"id": user.id, "email": user.email}

# Optional auth dependency
async def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    if not credentials:
        return None
    return await verify_token(credentials)

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str

class ChangeEmailRequest(BaseModel):
    newEmail: str

class Post(BaseModel):
    title: str
    content: str
    category: str = "general"
    tags: str = ""
    image: str = ""
    author: str = ""
    authorImage: str = ""
    published: bool = True

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    tags: str
    image: str
    author: str
    authorImage: str
    published: bool
    created_at: str
    updated_at: str
    user_id: str

# Initialize admin user
def init_admin_user(db: Session):
    admin_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not admin_user:
        admin_user = User(
            id="admin-001",
            email=ADMIN_EMAIL,
            password_hash=ADMIN_PASSWORD_HASH
        )
        db.add(admin_user)
        db.commit()
    return admin_user

@app.get("/api/posts", response_model=List[PostResponse])
async def get_posts(db: Session = Depends(get_db)):
    posts = db.query(DBPost).filter(DBPost.published == True).order_by(DBPost.created_at.desc()).all()
    return [{
        "id": p.id, "title": p.title, "content": p.content, "category": p.category,
        "tags": p.tags, "image": p.image, "author": p.author, "authorImage": p.author_image,
        "published": p.published, "created_at": p.created_at.isoformat() + "Z",
        "updated_at": p.updated_at.isoformat() + "Z", "user_id": p.user_id
    } for p in posts]

@app.get("/api/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(DBPost).filter(DBPost.id == post_id, DBPost.published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "id": post.id, "title": post.title, "content": post.content, "category": post.category,
        "tags": post.tags, "image": post.image, "author": post.author, "authorImage": post.author_image,
        "published": post.published, "created_at": post.created_at.isoformat() + "Z",
        "updated_at": post.updated_at.isoformat() + "Z", "user_id": post.user_id
    }

@app.post("/api/posts", response_model=PostResponse)
async def create_post(post: Post, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    db_post = DBPost(
        title=post.title,
        content=post.content,
        category=post.category,
        tags=post.tags,
        image=post.image,
        author=post.author,
        author_image=post.authorImage,
        published=post.published,
        user_id=user["id"]
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return {
        "id": db_post.id, "title": db_post.title, "content": db_post.content, "category": db_post.category,
        "tags": db_post.tags, "image": db_post.image, "author": db_post.author, "authorImage": db_post.author_image,
        "published": db_post.published, "created_at": db_post.created_at.isoformat() + "Z",
        "updated_at": db_post.updated_at.isoformat() + "Z", "user_id": db_post.user_id
    }

# Store current credentials
current_password_hash = ADMIN_PASSWORD_HASH
current_admin_email = ADMIN_EMAIL

@app.post("/api/auth/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Initialize admin user if not exists
    init_admin_user(db)
    
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    user = db.query(User).filter(User.email == request.email, User.password_hash == password_hash).first()
    
    if user:
        token = secrets.token_urlsafe(32)
        active_tokens.add(token)
        return {
            "token": token,
            "user": {"id": user.id, "email": user.email}
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/auth/change-password")
async def change_password(request: ChangePasswordRequest, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user["id"]).first()
    
    current_hash = hashlib.sha256(request.currentPassword.encode()).hexdigest()
    if current_hash != db_user.password_hash:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = hashlib.sha256(request.newPassword.encode()).hexdigest()
    db_user.password_hash = new_hash
    db.commit()
    
    return {"message": "Password changed successfully"}

@app.post("/api/auth/change-email")
async def change_email(request: ChangeEmailRequest, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user["id"]).first()
    db_user.email = request.newEmail
    db.commit()
    return {"message": "Email changed successfully"}

@app.post("/api/upload/image")
async def upload_image(image: UploadFile = File(...), user: dict = Depends(verify_token)):
    file_extension = image.filename.split('.')[-1]
    unique_filename = f"blog-images/{uuid.uuid4()}.{file_extension}"
    
    try:
        # Upload to S3
        s3_client.upload_fileobj(
            image.file,
            S3_BUCKET,
            unique_filename,
            ExtraArgs={
                'ACL': 'public-read',
                'ContentType': image.content_type,
                'CacheControl': 'max-age=31536000'
            }
        )
        
        # Return CloudFront URL if available, otherwise S3 URL
        if CLOUDFRONT_DOMAIN:
            image_url = f"https://{CLOUDFRONT_DOMAIN}/{unique_filename}"
        else:
            image_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{unique_filename}"
        
        return {"url": image_url}
        
    except Exception as e:
        return {"error": str(e)}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)