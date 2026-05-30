#!/bin/bash

# Exit on any failure
set -e

echo "========= 🚀 STUDENT GENOMICS SUITE DEPLOYMENT PIPELINE ========="

# Deploy backend
echo "Deploying FastAPI backend proxy..."
gcloud run deploy genomics-proxy \
  --source backend/ \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --max-instances 2 \
  --min-instances 0 \
  --port 8080

# Get backend URL
BACKEND_URL=$(gcloud run services describe genomics-proxy --region asia-southeast1 --format 'value(status.url)')
echo "✅ Backend successfully deployed at: $BACKEND_URL"

# Update frontend build config
echo "Updating production configuration..."
echo "VITE_BACKEND_URL=$BACKEND_URL" > .env.production

# Build frontend production assets
echo "Compiling professional production build..."
npm run build

# Deploy frontend to Cloud Run (SPA serving from container or static server)
echo "Deploying frontend container to Cloud Run..."
gcloud run deploy student-genomics-suite \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 100 \
  --max-instances 3

echo "🎉 Deployment successfully completed!"
echo "Enjoy full-potency scientific genomics analysis on Google Cloud."
echo "================================================================"
