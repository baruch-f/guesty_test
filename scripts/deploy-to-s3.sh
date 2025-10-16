#!/bin/bash
set -e

# Загружаем переменные из .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Проверяем что все переменные установлены
if [ -z "$BUCKET_NAME" ] || [ -z "$CLOUDFRONT_ID" ] || [ -z "$CLOUDFRONT_DOMAIN" ]; then
  echo "❌ Error: Missing environment variables in .env file"
  echo "Required: BUCKET_NAME, CLOUDFRONT_ID, CLOUDFRONT_DOMAIN"
  exit 1
fi

echo "📦 Building all packages with NODE_ENV=$NODE_ENV..."
npm run build

echo "☁️  Uploading host to S3..."
aws s3 sync packages/host/dist s3://$BUCKET_NAME/host/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

aws s3 cp packages/host/dist/index.html s3://$BUCKET_NAME/host/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

echo "☁️  Uploading remote-users to S3..."
aws s3 sync packages/remote-users/dist s3://$BUCKET_NAME/remote-users/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

if [ -f packages/remote-users/dist/index.html ]; then
  aws s3 cp packages/remote-users/dist/index.html s3://$BUCKET_NAME/remote-users/index.html \
    --cache-control "public, max-age=0, must-revalidate" \
    --content-type "text/html"
fi

echo "☁️  Uploading remote-statistic to S3..."
aws s3 sync packages/remote-statistic/dist s3://$BUCKET_NAME/remote-statistic/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html"

if [ -f packages/remote-statistic/dist/index.html ]; then
  aws s3 cp packages/remote-statistic/dist/index.html s3://$BUCKET_NAME/remote-statistic/index.html \
    --cache-control "public, max-age=0, must-revalidate" \
    --content-type "text/html"
fi

echo "🔄 Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/host/*" "/remote-users/*" "/remote-statistic/*"

echo ""
echo "✅ Deploy complete!"
echo "🌐 Host: https://$CLOUDFRONT_DOMAIN/host/index.html"
echo "📊 Remote Users: https://$CLOUDFRONT_DOMAIN/remote-users/remoteEntry.js"
echo "📈 Remote Statistic: https://$CLOUDFRONT_DOMAIN/remote-statistic/remoteEntry.js"