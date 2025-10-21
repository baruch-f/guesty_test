#!/bin/bash
set -e

# Загружаем переменные из .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Проверяем что переменные установлены
if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Error: BUCKET_NAME not found in .env file"
  exit 1
fi

LOCALES_DIR="./locales-dist"

echo "🚀 Deploying translations to S3 bucket: $BUCKET_NAME..."

# Проверяем наличие локалей
if [ ! -d "$LOCALES_DIR" ]; then
  echo "❌ Error: $LOCALES_DIR not found."
  echo "Run 'npm run i18n:translate' first to generate translation files."
  exit 1
fi

# Проверяем AWS CLI
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI not found. Please install it first."
  exit 1
fi

echo "📦 Uploading translation files..."

# Upload всех файлов кроме manifest с immutable cache (версия никогда не меняется)
aws s3 sync "$LOCALES_DIR" "s3://$BUCKET_NAME/locales/" \
  --exclude "manifest.json" \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "application/json" \
  --delete

echo "📄 Uploading manifest.json with shorter cache..."

# Upload manifest с коротким кешем (обновляется часто)
aws s3 cp "$LOCALES_DIR/manifest.json" "s3://$BUCKET_NAME/locales/manifest.json" \
  --cache-control "public, max-age=3600" \
  --content-type "application/json"

# Опционально: инвалидация CloudFront для мгновенного обновления manifest
if [ -n "$CLOUDFRONT_ID" ]; then
  echo "🔄 Creating CloudFront invalidation for manifest..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/locales/manifest.json" > /dev/null
fi

echo ""
echo "✅ Translations deployed successfully!"
echo ""
echo "📍 URLs:"
if [ -n "$CLOUDFRONT_DOMAIN" ]; then
  echo "   Manifest: https://$CLOUDFRONT_DOMAIN/locales/manifest.json"
  echo "   Example:  https://$CLOUDFRONT_DOMAIN/locales/host/v0.1.0/en.json"
else
  echo "   Manifest: https://$BUCKET_NAME.s3.amazonaws.com/locales/manifest.json"
  echo "   Example:  https://$BUCKET_NAME.s3.amazonaws.com/locales/host/v0.1.0/en.json"
fi