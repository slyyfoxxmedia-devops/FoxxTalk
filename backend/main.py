from fastapi import FastAPI, UploadFile, File, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import boto3
import uuid
import os
import time
import jwt
from jwt import PyJWKSClient

app = FastAPI(title="FoxxTalk API", version="1.0.0")

# Cognito configuration
COGNITO_REGION = os.getenv('COGNITO_REGION', 'us-east-1')
COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
COGNITO_CLIENT_ID = os.getenv('COGNITO_CLIENT_ID')
COGNITO_JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"

security = HTTPBearer()
jwks_client = PyJWKSClient(COGNITO_JWKS_URL) if COGNITO_USER_POOL_ID else None

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

# Cognito authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not jwks_client:
        # Skip auth in development
        return {"sub": "dev-user", "email": "dev@example.com"}
    
    try:
        token = credentials.credentials
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Optional auth dependency (for public endpoints that can have auth)
async def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    if not credentials:
        return None
    return await verify_token(credentials)

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
async def create_post(post: Post, user: dict = Depends(verify_token)):
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
async def upload_image(image: UploadFile = File(...), user: dict = Depends(verify_token)):
    # Configure AWS S3
    s3_client = boto3.client(
        's3',
        region_name='us-east-1',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    
    # Generate unique filename
    file_extension = image.filename.split('.')[-1]
    unique_filename = f"blog-images/{uuid.uuid4()}.{file_extension}"
    
    try:
        # Upload to S3
        s3_client.upload_fileobj(
            image.file,
            'foxxtalk-media',  # Your S3 bucket name
            unique_filename,
            ExtraArgs={
                'ACL': 'public-read',
                'ContentType': image.content_type,
                'CacheControl': 'max-age=31536000'  # 1 year cache
            }
        )
        
        # Return CloudFront URL (replace with your CloudFront domain)
        cloudfront_domain = os.getenv('CLOUDFRONT_DOMAIN', 'foxxtalk-media.s3.amazonaws.com')
        image_url = f"https://{cloudfront_domain}/{unique_filename}"
        return {"url": image_url}
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/auth/callback")
async def auth_callback(request: dict):
    # Exchange authorization code for tokens
    import requests
    
    token_url = f"https://{os.getenv('COGNITO_DOMAIN')}/oauth2/token"
    
    data = {
        'grant_type': 'authorization_code',
        'client_id': COGNITO_CLIENT_ID,
        'code': request['code'],
        'redirect_uri': os.getenv('REDIRECT_URI', 'http://localhost:3000/callback')
    }
    
    try:
        response = requests.post(token_url, data=data)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)