# Sportbuilding

This repository is configured to automatically push changes to GitHub.

## Automatic Push Setup

This project has been configured with Git hooks to automatically push changes to GitHub:

1. **Pre-commit hook**: Automatically stages all changes before committing
2. **Post-commit hook**: Automatically pushes to GitHub after each commit

## Manual Push

If you need to manually commit and push changes, you can run:

```bash
./push-changes.sh
```

This script will:
- Stage all changes
- Commit with a timestamp
- Push to GitHub

## Continuous Watching

For continuous automatic pushing, you can run:

```bash
./watch-and-push.sh
```

This script will:
- Watch for file changes every 5 seconds
- Automatically commit and push when changes are detected
- Run continuously until you stop it with Ctrl+C

## How it works

- Any changes made to files in this repository will be automatically staged and committed
- After each commit, changes are automatically pushed to https://github.com/shevthegoat/sportbuilding
- The commit messages include timestamps for tracking

## Requirements

- Git credentials must be configured (SSH key or personal access token)
- Internet connection for pushing to GitHub 