#!/bin/bash

# Script to commit and push all changes to GitHub
echo "Committing and pushing changes to GitHub..."

# Stage all changes
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Commit with timestamp
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
git push origin main

if [ $? -eq 0 ]; then
    echo "Successfully pushed to GitHub!"
else
    echo "Failed to push to GitHub. Please check your credentials and try again."
fi 