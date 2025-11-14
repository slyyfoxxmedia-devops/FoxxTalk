from fastapi import FastAPI, UploadFile, File, Request, Depends, HTTPException, Response
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
from database import get_db, User, Post as DBPost, Page, LandingPage, BlogSettings, GlobalSettings

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
    allow_origins=["http://localhost:3000", "https://slyyfoxxmedia.com", "https://*.slyyfoxxmedia.com"],
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

class LandingPageData(BaseModel):
    hero: dict
    featuredPosts: dict
    sections: list = []



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
async def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    
    # Initialize admin user if not exists
    init_admin_user(db)
    
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    user = db.query(User).filter(User.email == request.email, User.password_hash == password_hash).first()
    
    if user:
        token = secrets.token_urlsafe(32)
        active_tokens.add(token)
        
        # Set cross-subdomain cookie
        response.set_cookie(
            key="auth_token",
            value=token,
            domain=".slyyfoxxmedia.com",
            secure=True,
            httponly=True,
            samesite="lax",
            max_age=86400  # 24 hours
        )
        
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

@app.post("/api/auth/logout")
async def logout(response: Response, credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    # Clear the cross-subdomain cookie
    response.set_cookie(
        key="auth_token",
        value="",
        domain=".slyyfoxxmedia.com",
        expires=0,
        secure=True,
        httponly=True,
        samesite="lax"
    )
    
    # Remove token from active tokens if provided
    if credentials:
        active_tokens.discard(credentials.credentials)
    
    return {"message": "Logged out successfully"}

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

# Landing Page API
@app.get("/api/landing")
async def get_landing_data(db: Session = Depends(get_db)):
    landing = db.query(LandingPage).first()
    if landing:
        import json
        return json.loads(landing.data)
    
    # Default data if none exists
    return {
        "hero": {
            "title": "FoxxTalk",
            "subtitle": "A Blog for Every Conversation",
            "backgroundColor": "#000000",
            "show": True
        },
        "featuredPosts": {
            "title": "Featured Posts",
            "count": 3,
            "show": True
        },
        "sections": []
    }

@app.post("/api/landing")
async def save_landing_data(data: LandingPageData, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    import json
    
    # Check if landing page exists
    landing = db.query(LandingPage).first()
    if landing:
        landing.data = json.dumps(data.dict())
        landing.updated_at = datetime.utcnow()
    else:
        landing = LandingPage(
            data=json.dumps(data.dict()),
            user_id=user["id"]
        )
        db.add(landing)
    
    db.commit()
    return {"message": "Landing page saved successfully"}

# Global Settings API
@app.get("/api/global-settings")
async def get_global_settings(db: Session = Depends(get_db)):
    settings = db.query(GlobalSettings).first()
    if settings:
        import json
        return json.loads(settings.data)
    
    # Default settings
    return {
        "siteTitle": "SlyyFoxx Media",
        "primaryColor": "#ff6b35",
        "backgroundColor": "#000000"
    }

@app.post("/api/global-settings")
async def save_global_settings(settings: dict, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    import json
    
    global_settings = db.query(GlobalSettings).first()
    if global_settings:
        global_settings.data = json.dumps(settings)
        global_settings.updated_at = datetime.utcnow()
    else:
        global_settings = GlobalSettings(
            data=json.dumps(settings),
            user_id=user["id"]
        )
        db.add(global_settings)
    
    db.commit()
    return {"message": "Global settings saved successfully"}

# Analytics API
@app.get("/api/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    total_posts = db.query(DBPost).count()
    # In production, you'd get real analytics data from Google Analytics API
    return {
        "totalPosts": total_posts,
        "totalViews": total_posts * 150,  # Mock data
        "monthlyViews": total_posts * 50   # Mock data
    }

# Delete Post API
@app.delete("/api/posts/{post_id}")
async def delete_post(post_id: int, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    post = db.query(DBPost).filter(DBPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}

# Pages API
@app.get("/api/pages/{slug}")
async def get_page(slug: str, db: Session = Depends(get_db)):
    from database import Page
    page = db.query(Page).filter(Page.slug == slug, Page.published == True).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    return {
        "id": page.id,
        "title": page.title,
        "slug": page.slug,
        "content": page.content,
        "meta_description": page.meta_description,
        "published": page.published,
        "created_at": page.created_at.isoformat() + "Z",
        "updated_at": page.updated_at.isoformat() + "Z"
    }

# Blog Settings API
@app.get("/api/blog-settings")
async def get_blog_settings(db: Session = Depends(get_db)):
    settings = db.query(BlogSettings).first()
    if settings:
        import json
        return json.loads(settings.data)
    
    # Default settings
    return {
        "headerTitle": "FoxxTalk Blog",
        "headerSubtitle": "Latest insights and updates",
        "backgroundColor": "#000000",
        "postsPerPage": 12,
        "showSearch": True,
        "showCategories": True,
        "categories": "general,tech,media,creative,business",
        "showPagination": True,
        "paginationStyle": "numbers"
    }

@app.post("/api/blog-settings")
async def save_blog_settings(settings: dict, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    import json
    
    blog_settings = db.query(BlogSettings).first()
    if blog_settings:
        blog_settings.data = json.dumps(settings)
        blog_settings.updated_at = datetime.utcnow()
    else:
        blog_settings = BlogSettings(
            data=json.dumps(settings),
            user_id=user["id"]
        )
        db.add(blog_settings)
    
    db.commit()
    return {"message": "Blog settings saved successfully"}

# AI Generation API
@app.post("/api/ai/generate")
async def generate_with_ai(request: dict, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    # Get Gemini API key from global settings
    settings = db.query(GlobalSettings).first()
    if not settings:
        raise HTTPException(status_code=400, detail="Global settings not configured")
    
    import json
    settings_data = json.loads(settings.data)
    gemini_api_key = settings_data.get('geminiApiKey')
    
    if not gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API key not configured")
    
    prompt_type = request.get('prompt')
    current_data = request.get('currentData', {})
    
    try:
        # Mock response for now - replace with actual Gemini API call
        if prompt_type == 'generate_title':
            return {
                "title": "AI-Generated: The Future of Digital Innovation"
            }
        elif prompt_type == 'generate_category':
            return {
                "category": "technology"
            }
        elif prompt_type == 'generate_tags':
            return {
                "tags": "ai, innovation, digital, future, technology"
            }
        elif prompt_type == 'generate_content':
            return {
                "content": "Digital innovation is transforming how we work, communicate, and live. From artificial intelligence to blockchain technology, we're witnessing unprecedented changes that will shape the next decade.\n\nKey trends include:\n- AI-powered automation\n- Sustainable technology solutions\n- Enhanced user experiences\n- Data-driven decision making\n\nThese developments present both opportunities and challenges for businesses and individuals alike."
            }
        elif prompt_type == 'generate_image':
            # Generate image based on post title/content
            title = current_data.get('title', 'blog post')
            return {
                "image": f"https://picsum.photos/400/200?random={hash(title) % 1000}"
            }
        else:
            return {"message": "AI generation completed"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@app.post("/api/ai/generate-image")
async def generate_ai_image(request: dict, user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    # Get Gemini API key from global settings
    settings = db.query(GlobalSettings).first()
    if not settings:
        raise HTTPException(status_code=400, detail="Global settings not configured")
    
    import json
    settings_data = json.loads(settings.data)
    gemini_api_key = settings_data.get('geminiApiKey')
    
    if not gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API key not configured")
    
    prompt = request.get('prompt', '')
    if not prompt:
        raise HTTPException(status_code=400, detail="Image prompt is required")
    
    try:
        # Mock response for now - replace with actual AI image generation
        # You can integrate with DALL-E, Midjourney, or Stable Diffusion APIs
        image_url = f"https://picsum.photos/800/400?random={hash(prompt) % 10000}"
        
        return {
            "imageUrl": image_url,
            "prompt": prompt
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI image generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)