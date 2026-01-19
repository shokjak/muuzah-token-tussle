# Deploying Muuzah to Reddit Devvit

This guide will walk you through deploying the Muuzah game to Reddit.

## Prerequisites

- Node.js 18+ installed
- A Reddit account
- A subreddit where you're a moderator (for testing)

## Step 1: Install Devvit CLI

```bash
npm install -g devvit
```

## Step 2: Login to Devvit

```bash
devvit login
```

This will open a browser window to authenticate with Reddit.

## Step 3: Create a New Devvit Project

```bash
mkdir muuzah-devvit
cd muuzah-devvit
devvit new --template web-view
```

## Step 4: Copy the Game Files

### 4a. Copy the React Frontend

1. Build this Lovable project:
   - In Lovable, go to **Project Settings → GitHub**
   - Connect to GitHub and push the code
   - Clone the repo locally
   - Run `npm install && npm run build`

2. Copy the `dist/` folder contents to your Devvit project's `webroot/` folder:
```bash
cp -r /path/to/lovable-project/dist/* ./webroot/
```

### 4b. Copy the Devvit Backend

Copy the backend code from `src/devvit/main.tsx` to your Devvit project's `src/main.tsx`:
```bash
cp /path/to/lovable-project/src/devvit/main.tsx ./src/main.tsx
```

### 4c. Update devvit.yaml

Replace your Devvit project's `devvit.yaml` with:
```yaml
name: muuzah-game
version: 0.0.1
author: your-reddit-username

capabilities:
  - redis
  - redditAPI

webviewEnabled: true
```

## Step 5: Upload to Reddit

```bash
devvit upload
```

## Step 6: Install on Your Subreddit

```bash
devvit install <your-subreddit-name>
```

## Step 7: Create a Game Post

1. Go to your subreddit on Reddit
2. Click the three-dot menu
3. Select "Create Muuzah Game"

## Testing Locally

You can test the Devvit app locally before uploading:

```bash
devvit playtest <your-subreddit-name>
```

This runs the app in a local development mode.

## Troubleshooting

### "webview not loading"
- Make sure `index.html` exists in `webroot/`
- Check that all asset paths are relative (not absolute)

### "Redis errors"
- Ensure `redis` capability is in `devvit.yaml`

### "User not found"
- Ensure `redditAPI` capability is in `devvit.yaml`

## Architecture Notes

```
┌─────────────────────────────────────────────────────┐
│                    Reddit Post                       │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │            Devvit Backend (main.tsx)         │   │
│  │  - Handles postMessage from webview          │   │
│  │  - Manages Redis (game state, leaderboard)   │   │
│  │  - Accesses Reddit API (user info)           │   │
│  └─────────────────────────────────────────────┘   │
│                         ↕ postMessage               │
│  ┌─────────────────────────────────────────────┐   │
│  │            Webview (React App)               │   │
│  │  - All game UI and logic                     │   │
│  │  - Communicates via devvitBridge.ts          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## File Structure

```
muuzah-devvit/
├── devvit.yaml           # Devvit configuration
├── package.json          # Dependencies
├── src/
│   └── main.tsx          # Devvit backend (copy from src/devvit/main.tsx)
└── webroot/
    ├── index.html        # Entry point
    ├── assets/           # JS, CSS, images
    └── ...               # Other built files
```

## Next Steps

- Add realtime notifications when opponent makes a move
- Implement game invites (challenge specific users)
- Add more game statistics tracking
- Create a tournament mode
