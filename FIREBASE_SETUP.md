# Firebase Database Rules Setup

## How to Apply Database Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `jump-d784a`
3. Go to **Realtime Database** → **Rules** tab
4. Copy the contents of `database.rules.json` 
5. Paste into the rules editor
6. Click **Publish**

## Or use Firebase CLI:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in this project
firebase init database

# Deploy the rules
firebase deploy --only database
```

The rules file enables indexing on the `time` field for all three leaderboard types:
- `speedruns/world1`
- `speedruns/world2`
- `speedruns/ironman`

This fixes the error: "Index not defined, add \".indexOn\": \"time\""
