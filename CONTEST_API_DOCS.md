# Contest System API Documentation

## Overview
The contest system enables users to join contests with multiple teams, track leaderboards, and view contest history with proper ranking and points calculation.

## Database Schema

### 🏆 contestTeams Collection
Tracks individual team participation in contests.

```javascript
{
  contestTeamId: "contest_1_user_123_team_456", // Composite key
  contestId: "contest_1",                        // Reference to contest
  teamId: "team_456",                           // Reference to user's team  
  userId: "user_123",                           // Reference to user
  matchId: "match_1",                           // Reference to match
  entryFee: 25,                                 // Entry fee paid
  totalPoints: 85,                              // Current team points
  rank: 3,                                      // Current rank in contest
  joinedAt: "2025-01-15T10:30:00Z"             // Join timestamp
}
```

**Firestore Indexes Required:**
1. `contestId (ASC), totalPoints (DESC), joinedAt (ASC)` - For leaderboards
2. `userId (ASC), matchId (ASC)` - For user contests by match
3. `userId (ASC), contestId (ASC)` - For user teams in specific contest

## 🔧 API Endpoints

### 1. Join Contest (Enhanced)
**POST** `/api/contests/{contestId}/join`

Allows users to join contests with multiple teams.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "teamIds": ["team_1", "team_2"],
  "userId": "user_1757400308642902360", 
  "matchId": "match_1"
}
```

**Response:**
```json
{
  "status": "joined",
  "teamsJoined": 2,
  "contestId": "contest_1"
}
```

**Changes Made:**
- ✅ Now accepts multiple `teamIds` instead of single `teamId`
- ✅ Creates individual `contestTeam` entries for tracking
- ✅ Updates contest `spotsLeft` by number of teams joined
- ✅ Atomic batch operation for data consistency

---

### 2. Get Contest Leaderboard
**GET** `/api/contests/{contestId}/leaderboard`

Returns ranked list of all teams in a contest with user teams highlighted.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "rank": 1,
    "teamId": "team_123",
    "teamName": "Team Alpha", 
    "userId": "user_456",
    "userName": "John Doe",
    "points": 127,
    "isCurrentUser": false
  },
  {
    "rank": 2, 
    "teamId": "team_789",
    "teamName": "Team Beta",
    "userId": "user_1757400308642902360",
    "userName": "Current User",
    "points": 95,
    "isCurrentUser": true
  }
]
```

**Features:**
- ✅ Ordered by `totalPoints DESC, joinedAt ASC` (tiebreaker)
- ✅ Handles tied rankings properly
- ✅ Updates rank in database during calculation
- ✅ Includes user names for display

---

### 3. Get User's Contests
**GET** `/api/users/{userId}/contests`

Returns all contests the user has joined, optionally filtered by match.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `matchId` (optional) - Filter contests for specific match

**Response:**
```json
[
  {
    "contestId": "contest_1",
    "contestName": "Mega Contest", 
    "entryFee": 25,
    "totalPrizePool": 10000,
    "maxSpots": 1000,
    "joinedUsers": 856,
    "userTeams": [
      {
        "teamId": "team_1",
        "teamName": "Team 1", 
        "points": 85,
        "rank": 23
      },
      {
        "teamId": "team_2",
        "teamName": "Team 2",
        "points": 92, 
        "rank": 15
      }
    ],
    "status": "live",
    "matchId": "match_1"
  }
]
```

**Use Cases:**
- 📱 My Contests tab (all contests)
- 🏐 Match-specific contests (with `matchId` filter)
- 📊 User contest history and performance

---

### 4. Get Contest Details  
**GET** `/api/contests/{contestId}`

Returns complete contest information including prize distribution.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "contestId": "contest_1",
  "matchId": "match_1",
  "name": "Mega Contest",
  "description": "Win big prizes!",
  "entryFee": 25,
  "totalPrizePool": 10000,
  "maxSpots": 1000,
  "spotsLeft": 144,
  "joinedUsers": 856,
  "maxTeamsPerUser": 3,
  "isGuaranteed": true,
  "prizeDistribution": [
    {
      "rankStart": 1,
      "rankEnd": 1,
      "prizeAmount": 5000,
      "prizeType": "cash",
      "prizeDesc": "Winner"
    },
    {
      "rankStart": 2,
      "rankEnd": 3,
      "prizeAmount": 1500,
      "prizeType": "cash", 
      "prizeDesc": "Runner Up"
    }
  ],
  "status": "live"
}
```

## 🔄 Frontend Integration

### Updated Contest Joining Flow

```typescript
// 1. Check if user has teams for match
const userTeams = await fetch(`/api/users/${userId}/teams`);

// 2. Show team selection modal if teams exist
if (userTeams.length > 0) {
  showTeamSelectionModal(contest, userTeams);
} else {
  // Redirect to create team
  navigate(`/match/${matchId}/create-team?contestId=${contestId}`);
}

// 3. Join contest with selected teams
const joinResponse = await fetch(`/api/contests/${contestId}/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    teamIds: selectedTeamIds,
    userId: user.uid,
    matchId: matchId
  })
});
```

### My Contests Implementation

```typescript
// Fetch user's contests (optionally filtered by match)
const contests = await fetch(`/api/users/${userId}/contests?matchId=${matchId}`);

// For each contest, show:
// - Contest name and prize pool
// - User's teams with points and ranks
// - Link to leaderboard

// Leaderboard view
const leaderboard = await fetch(`/api/contests/${contestId}/leaderboard`);
// User's teams displayed at top with highlighting
// All teams shown in ranking order with prizes
```

## 🎯 Key Features Implemented

### ✅ Multi-Team Contest Joining
- Users can join contests with multiple teams (up to contest limit)
- Each team entry tracked separately in `contestTeams` collection
- Atomic batch operations ensure data consistency

### ✅ Real-Time Leaderboards  
- Dynamic ranking calculation with tiebreaker logic
- User teams prominently displayed at top
- Rank updates stored in database for performance

### ✅ Complete Contest History
- My Contests tab with Live/Upcoming/Completed filtering
- Match-specific contest views
- User team performance tracking

### ✅ Prize Integration
- Contest prize distribution display
- Winner calculations based on final rankings
- Prize amounts shown in leaderboard

## 🚀 Deployment Instructions

1. **Deploy Backend:**
   ```bash
   ./deploy-backend.sh
   ```

2. **Initialize Database:**
   ```bash
   node init-contest-system.js
   ```

3. **Create Firestore Indexes:**
   - Go to Firebase Console → Firestore → Indexes
   - Create the composite indexes shown in initialization script

4. **Update Frontend:**
   - Frontend code already updated and deployed
   - Contest joining flow automatically uses new API

## 🔍 Testing the System

### Test Contest Joining:
1. Navigate to a match's contests page
2. Click "Join Contest" 
3. Select multiple teams (if available)
4. Verify contest spots decrement properly
5. Check My Contests tab shows joined contest

### Test Leaderboard:
1. Join a contest with multiple teams
2. Navigate to contest leaderboard
3. Verify user teams appear at top with highlighting
4. Check ranking order and prize distribution

### Test Contest History:
1. Join contests for multiple matches
2. Check My Contests tab shows proper categorization
3. Test Live/Upcoming/Completed filtering
4. Verify match-specific contest views

## 📊 Database Performance

The new schema is optimized for:
- **Fast Leaderboard Queries** - Single compound index query
- **Efficient User Lookups** - Direct user + match filtering  
- **Scalable Architecture** - Each contest team tracked individually
- **Real-time Updates** - Batch operations for consistency

Contest system is now production-ready! 🎉