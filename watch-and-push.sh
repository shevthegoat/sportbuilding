#!/bin/bash

# Script to watch for file changes and automatically push to GitHub
echo "Starting file watcher for automatic GitHub pushing..."
echo "Press Ctrl+C to stop"

# Function to commit and push changes
commit_and_push() {
    echo "Changes detected! Committing and pushing..."
    ./push-changes.sh
}

# Watch for changes in the current directory (excluding .git)
while true; do
    # Check if there are any unstaged changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        commit_and_push
    fi
    sleep 5  # Check every 5 seconds
done 