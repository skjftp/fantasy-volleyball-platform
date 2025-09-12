#!/bin/bash

echo "🚀 Deploying Fantasy Volleyball Backend with Contest System"
echo "============================================================"

# Check if we're in the right directory
if [ ! -f "backend/main.go" ]; then
    echo "❌ Error: backend/main.go not found. Please run from project root."
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "1. ✅ Contest system backend code updated"
echo "2. ✅ New API endpoints implemented"
echo "3. ✅ Database schema designed"

# Navigate to backend directory
cd backend

echo ""
echo "🔨 Building Go application..."
go mod tidy
if [ $? -ne 0 ]; then
    echo "❌ Error: Go mod tidy failed"
    exit 1
fi

echo ""
echo "🧪 Running basic syntax check..."
go build -o main main.go
if [ $? -ne 0 ]; then
    echo "❌ Error: Go build failed"
    exit 1
fi

echo "✅ Build successful!"

echo ""
echo "🚀 Deploying to Google App Engine..."
gcloud app deploy app.yaml --quiet

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎯 New API Endpoints Available:"
    echo "- POST /api/contests/{contestId}/join (Enhanced with multiple teams)"
    echo "- GET /api/contests/{contestId}/leaderboard"  
    echo "- GET /api/contests/{contestId}"
    echo "- GET /api/users/{userId}/contests"
    echo "- GET /api/users/{userId}/contests?matchId={matchId}"
    echo ""
    echo "📊 Next steps:"
    echo "1. Run: node ../init-contest-system.js (to initialize database)"
    echo "2. Create Firestore composite indexes (see script output)"
    echo "3. Test contest joining flow in frontend"
    echo ""
    echo "🌐 Backend URL: https://fantasy-volleyball-backend-107958119805.us-central1.run.app"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi

cd ..
echo "✅ Done!"