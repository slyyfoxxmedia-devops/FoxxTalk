# AWS Setup for FoxxTalk

## 1. Create S3 Bucket
```bash
aws s3 mb s3://foxxtalk-media --region us-east-1
```

## 2. Configure S3 Bucket Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::foxxtalk-media/*"
        }
    ]
}
```

## 3. Create CloudFront Distribution
- Origin: foxxtalk-media.s3.amazonaws.com
- Cache Behaviors: 
  - `/blog-images/*` - Cache for 1 year
  - Default - Cache for 24 hours
- Custom Domain: cdn.slyyfoxxmedia.com

## 4. Environment Variables
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
CLOUDFRONT_DOMAIN=your-domain.cloudfront.net
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
GEMINI_API_KEY=your-gemini-api-key
```

## 5. IAM Policy for S3 Access
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::foxxtalk-media/*"
        }
    ]
}
```