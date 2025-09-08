# Fantasy Volleyball Platform

A mobile-first web application for daily fantasy volleyball with free-to-play contests, built with React.js, Go backend, and Firebase.

## Features

- **Free-to-play contests only** - No entry fees, just prize pools
- **Mobile-first responsive design** - Optimized for mobile devices
- **Phone number authentication** - Secure login with OTP verification
- **Real-time scoring** - Live updates during matches
- **Team creation with validation** - Strategic team building with constraints
- **Admin panel** - Match and player management
- **Volleyball-specific scoring system** - Attacking, defending, and gameplay points

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Firebase Authentication
- Firebase Firestore for real-time data
- Vite for build tooling
- React Router for navigation

### Backend
- Go with Gorilla Mux
- Firebase Admin SDK
- Cloud Firestore for database
- Google Cloud Run for deployment

### Deployment
- Frontend: Netlify
- Backend: Google Cloud Run
- Database: Firebase Firestore

## Project Structure

```
fantasy-volleyball-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── config/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── netlify.toml
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── Dockerfile
│   ├── app.yaml
│   └── cloudbuild.yaml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Go (v1.21 or higher)
- Firebase project
- Google Cloud Platform account

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Phone number sign-in
3. Enable Firestore Database
4. Download the service account key and place it as `backend/serviceAccountKey.json`
5. Get your Firebase web app configuration

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

3. Add your Firebase service account key as `serviceAccountKey.json`

4. Run the backend:
   ```bash
   go run main.go
   ```

   The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Database Schema

### Collections

#### `users`
```typescript
{
  uid: string,
  phone: string,
  name: string,
  email: string,
  createdAt: timestamp,
  totalContestsJoined: number,
  totalWins: number
}
```

#### `matches`
```typescript
{
  matchId: string,
  team1: { name: string, code: string, logo: string },
  team2: { name: string, code: string, logo: string },
  startTime: timestamp,
  status: 'upcoming' | 'live' | 'completed',
  league: string
}
```

#### `players`
```typescript
{
  playerId: string,
  matchId: string,
  name: string,
  team: string,
  category: 'setter' | 'blocker' | 'attacker' | 'universal',
  credits: number,
  imageUrl: string,
  isStarting6: boolean,
  liveStats: PlayerLiveStats
}
```

#### `contests`
```typescript
{
  contestId: string,
  matchId: string,
  name: string,
  prizePool: number,
  totalSpots: number,
  spotsLeft: number,
  maxTeamsPerUser: 6,
  status: 'open' | 'live' | 'completed'
}
```

#### `userTeams`
```typescript
{
  teamId: string,
  userId: string,
  matchId: string,
  contestId: string,
  players: string[6],
  captainId: string,
  viceCaptainId: string,
  totalPoints: number,
  rank: number
}
```

## Volleyball Scoring System

### Point Categories

1. **Attacking**
   - Successful Attack/Kill/Spike: 3 points
   - Ace: 20 points

2. **Defending**
   - Block: 20 points
   - Reception (Success - Errors): 3 points per net reception

3. **Gameplay**
   - Starting a set: 6 points
   - Substitute in a set: 3 points
   - Winning set: 6 points (Starting 6 only)
   - Losing set: -3 points (Starting 6 only)

4. **Multipliers**
   - Captain: 2x points
   - Vice-Captain: 1.5x points

### Special Rules

- Winning/Losing set points only apply to Starting 6 players
- Liberos get starter points if they played in a set
- No points for starter/substitute/winning/losing in Golden Sets
- No points for transferred players still showing in old team

## Deployment

### Backend Deployment (Google Cloud Run)

1. Build and deploy using Cloud Build:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

2. Or deploy directly:
   ```bash
   gcloud run deploy fantasy-volleyball-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Frontend Deployment (Netlify)

1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy automatically on Git push

## API Endpoints

### Public Endpoints

- `GET /api/matches` - Get all matches
- `GET /api/matches/{matchId}/players` - Get players for a match
- `GET /api/matches/{matchId}/contests` - Get contests for a match

### User Endpoints

- `POST /api/teams` - Create a new team
- `POST /api/contests/{contestId}/join` - Join a contest
- `GET /api/users/{userId}/teams` - Get user's teams

### Admin Endpoints

- `POST /api/admin/matches` - Create a match
- `POST /api/admin/players` - Create a player
- `POST /api/admin/contests` - Create a contest
- `PUT /api/admin/scores` - Update player scores

## Team Composition Rules

1. **Team Size**: Exactly 6 players
2. **Team Constraint**: Maximum 4 players from one team
3. **Category Requirements**: 
   - Minimum 1 Setter (S)
   - Minimum 1 Blocker (B)
   - Minimum 1 Attacker (A)
   - Minimum 1 Universal (U)
4. **Budget**: Total 100 credits
5. **Captain Selection**: 1 Captain (2x points), 1 Vice-Captain (1.5x points)
6. **Contest Limit**: Maximum 6 teams per user per contest

## Mobile-First Features

- Touch-optimized interface
- Swipe gestures for navigation
- Pull-to-refresh functionality
- Responsive breakpoints
- Optimized loading states
- Skeleton screens for better UX

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.