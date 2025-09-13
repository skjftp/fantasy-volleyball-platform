# Fantasy Volleyball Platform - Project Structure

## Overview
This is a fantasy volleyball platform for the Prime Volleyball League (PVL) with separate frontend and admin applications.

## Project Architecture

### 🏠 Main User Frontend
**Location**: `/frontend/`
**Purpose**: User-facing fantasy volleyball application
**Technology**: React + TypeScript + Vite
**Deployment**: Netlify (main website)

**Key Features**:
- User registration and authentication
- Team creation and management
- Contest participation
- Match viewing and statistics
- Player selection with 5-category system (libero, setter, attacker, blocker, universal)

**Important Files**:
- `src/pages/HomePage.tsx` - Main homepage with match listings
- `src/pages/TeamCreatePage.tsx` - Team selection interface
- `src/pages/ContestsPage.tsx` - Contest listings
- `src/pages/MyTeamsPage.tsx` - User team management
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/assets/pvl-logo.svg` - Official PVL logo
- `src/assets/team-logos/` - PVL team logos (local assets)

### 🛠️ Admin Portal
**Location**: `/admin-portal/`
**Purpose**: Administrative interface for managing platform data
**Technology**: React + TypeScript + Vite
**Deployment**: Separate admin deployment

**Key Features**:
- League management
- Team creation and editing (with logo upload)
- Player management with all 5 categories including libero
- Squad assignment
- Match creation and management
- Contest template management
- Statistics updates

**Important Files**:
- `src/AdminDashboard.tsx` - Main admin dashboard with team management
- `src/MatchManagement.tsx` - Match creation and squad assignment
- `src/PlayerManagement.tsx` - Player creation and editing
- `src/SquadManagement.tsx` - Squad composition management
- `src/SquadAssignment.tsx` - Team-player assignment

### 🔧 Backend
**Location**: `/backend/`
**Purpose**: Go API server with Firebase Firestore
**Technology**: Go + Firebase
**Deployment**: Google Cloud Run

**Key Endpoints**:
- `/api/matches` - Match data
- `/api/admin/teams` - Team management (CRUD)
- `/api/admin/players` - Player management
- `/api/admin/match-squads` - Squad assignment

### 📊 Database (Firebase Firestore)

**Collections**:
- `teams` - Team information with logos
- `players` - Player database with numeric IDs (1, 2, 3...)
- `teamPlayers` - Team-player associations with numeric IDs
- `matches` - Match fixtures
- `matchSquads` - Squad assignments per match
- `contests` - Contest information
- `userTeams` - User fantasy teams

**Key Data Structures**:
- **Players**: Numeric IDs (1-131), 5-category system, random credits (16, 16.5, 17)
- **Teams**: Direct logo URLs (no file paths), team codes, cities
- **Categories**: libero, setter, attacker, blocker, universal

## ⚠️ Important Notes

### Admin vs Frontend Confusion
- **NEVER edit** `frontend/src/pages/AdminPanel.tsx` - this is NOT the real admin panel
- **ALWAYS edit** files in `admin-portal/src/` for admin functionality
- The admin portal is a completely separate React application

### Team Logo Handling
- **Database**: Stores direct URLs (PVL external URLs or base64 data URLs)
- **Frontend**: Uses `match.team1.logo` directly (no utility functions needed)
- **Admin Portal**: Uses `team.logo` directly (no utility functions needed)
- **Upload Methods**: URL input or file upload with base64 conversion

### Player Categories
- **All 5 categories** must be supported: libero, setter, attacker, blocker, universal
- **Libero is required** in squad assignment (exactly 1 libero per team)
- **Position mapping**: Middle Blocker → blocker, Outside Hitter → attacker

### Team Data
- **10 PVL teams** with official logos and data
- **Numeric player IDs** (1-131) for clean database structure
- **Team codes**: AMD, BT, CH, CB, DT, GG, HBH, KBS, KTB, MM

## 🚀 Deployment Structure

### Frontend (Main Website)
- **Build**: `frontend/dist/`
- **Config**: `frontend/netlify.toml`
- **URL**: Main user-facing website

### Admin Portal
- **Build**: `admin-portal/dist/`
- **Config**: `admin-portal/netlify.toml`
- **URL**: Separate admin interface

### Backend
- **Deploy**: Google Cloud Run
- **Config**: `backend/app.yaml`
- **API**: Serves both frontend and admin portal

## 📝 Development Guidelines

1. **Frontend changes**: Edit files in `frontend/src/`
2. **Admin changes**: Edit files in `admin-portal/src/`
3. **Logo display**: Use direct database URLs, no utility functions
4. **Player categories**: Always include libero in dropdowns and interfaces
5. **Team management**: Use admin portal for all team/player CRUD operations

## 🔄 Recent Changes

- Imported 131 real PVL players with clean numeric IDs
- Fixed libero category support across all admin portal files
- Added team logo upload (URL + file) to admin portal team management
- Simplified logo display logic to match admin portal approach
- Updated all headers to black theme with PVL branding
- Cleaned up incorrect admin panel files to avoid confusion

---
**Last Updated**: September 13, 2025
**Version**: 2.0 (PVL Integration Complete)