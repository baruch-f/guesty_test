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

# Опциональный параметр: какой пакет деплоить (host, remote-users, remote-statistic, all)
PACKAGE=${1:-all}

echo "📦 Building packages for deployment ($PACKAGE)..."

# Функция для деплоя отдельного пакета
deploy_package() {
  local PACKAGE_NAME=$1
  local PACKAGE_PATH="packages/$PACKAGE_NAME/dist"
  
  if [ ! -d "$PACKAGE_PATH" ]; then
    echo "⚠️  Skipping $PACKAGE_NAME - dist folder not found"
    return
  fi
  
  echo "☁️  Uploading $PACKAGE_NAME to S3..."
  
  # Загружаем JS/CSS файлы с contenthash - immutable cache
  aws s3 sync "$PACKAGE_PATH" "s3://$BUCKET_NAME/$PACKAGE_NAME/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "remoteEntry.js"
  
  # Загружаем remoteEntry.js с коротким кешем (точка входа Module Federation)
  if [ -f "$PACKAGE_PATH/remoteEntry.js" ]; then
    aws s3 cp "$PACKAGE_PATH/remoteEntry.js" "s3://$BUCKET_NAME/$PACKAGE_NAME/remoteEntry.js" \
      --cache-control "public, max-age=300, must-revalidate" \
      --content-type "application/javascript"
  fi
  
  # Загружаем HTML с коротким кешем
  if [ -f "$PACKAGE_PATH/index.html" ]; then
    aws s3 cp "$PACKAGE_PATH/index.html" "s3://$BUCKET_NAME/$PACKAGE_NAME/index.html" \
      --cache-control "public, max-age=0, must-revalidate" \
      --content-type "text/html"
  fi
  
  echo "✅ $PACKAGE_NAME uploaded"
}

# Деплоим нужные пакеты
if [ "$PACKAGE" = "all" ]; then
  npm run build
  deploy_package "host"
  deploy_package "remote-users"
  deploy_package "remote-statistic"
  INVALIDATION_PATHS="/host/index.html /host/remoteEntry.js /remote-users/remoteEntry.js /remote-statistic/remoteEntry.js"
elif [ "$PACKAGE" = "host" ]; then
  npm run build:host
  deploy_package "host"
  INVALIDATION_PATHS="/host/index.html /host/remoteEntry.js"
elif [ "$PACKAGE" = "remote-users" ]; then
  npm run build:remote-users
  deploy_package "remote-users"
  INVALIDATION_PATHS="/remote-users/remoteEntry.js"
elif [ "$PACKAGE" = "remote-statistic" ]; then
  npm run build:remote-statistic
  deploy_package "remote-statistic"
  INVALIDATION_PATHS="/remote-statistic/remoteEntry.js"
else
  echo "❌ Unknown package: $PACKAGE"
  echo "Usage: $0 [host|remote-users|remote-statistic|all]"
  exit 1
fi

echo "🔄 Creating CloudFront invalidation for: $INVALIDATION_PATHS"
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths $INVALIDATION_PATHS

echo ""
echo "✅ Deploy complete!"
echo "🌐 Host: https://$CLOUDFRONT_DOMAIN/host/index.html"
echo "📊 Remote Users: https://$CLOUDFRONT_DOMAIN/remote-users/remoteEntry.js"
echo "📈 Remote Statistic: https://$CLOUDFRONT_DOMAIN/remote-statistic/remoteEntry.js"