package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"crypto/rand"
	"math/big"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"google.golang.org/api/option"
)

type Server struct {
	firestoreClient *firestore.Client
	authClient      *auth.Client
	jwtSecret       []byte
	otpStore        map[string]OTPData // In production, use Redis or database
}

type OTPData struct {
	OTP       string
	ExpiresAt time.Time
	Phone     string
}

type League struct {
	LeagueID    string `json:"leagueId" firestore:"leagueId"`
	Name        string `json:"name" firestore:"name"`
	Description string `json:"description" firestore:"description"`
	StartDate   string `json:"startDate" firestore:"startDate"`
	EndDate     string `json:"endDate" firestore:"endDate"`
	Status      string `json:"status" firestore:"status"`
	CreatedAt   string `json:"createdAt" firestore:"createdAt"`
}

type Team struct {
	TeamID      string `json:"teamId" firestore:"teamId"`
	Name        string `json:"name" firestore:"name"`
	Code        string `json:"code" firestore:"code"`
	Logo        string `json:"logo" firestore:"logo"`
	LeagueID    string `json:"leagueId" firestore:"leagueId"`
	HomeCity    string `json:"homeCity" firestore:"homeCity"`
	Captain     string `json:"captain" firestore:"captain"`
	Coach       string `json:"coach" firestore:"coach"`
	CreatedAt   string `json:"createdAt" firestore:"createdAt"`
}

type Squad struct {
	SquadID     string   `json:"squadId" firestore:"squadId"`
	TeamID      string   `json:"teamId" firestore:"teamId"`
	PlayerIDs   []string `json:"playerIds" firestore:"playerIds"`
	MatchID     string   `json:"matchId" firestore:"matchId"`
	Starting6   []string `json:"starting6" firestore:"starting6"`
	Substitutes []string `json:"substitutes" firestore:"substitutes"`
	CreatedAt   string   `json:"createdAt" firestore:"createdAt"`
}

type Match struct {
	MatchID     string   `json:"matchId" firestore:"matchId"`
	LeagueID    string   `json:"leagueId" firestore:"leagueId"`
	Team1ID     string   `json:"team1Id" firestore:"team1Id"`
	Team2ID     string   `json:"team2Id" firestore:"team2Id"`
	Team1       TeamInfo `json:"team1" firestore:"team1"`
	Team2       TeamInfo `json:"team2" firestore:"team2"`
	StartTime   string   `json:"startTime" firestore:"startTime"`
	Status      string   `json:"status" firestore:"status"`
	Venue       string   `json:"venue" firestore:"venue"`
	Round       string   `json:"round" firestore:"round"`
	CreatedAt   string   `json:"createdAt" firestore:"createdAt"`
}

type TeamInfo struct {
	Name string `json:"name" firestore:"name"`
	Code string `json:"code" firestore:"code"`
	Logo string `json:"logo" firestore:"logo"`
}

type ContestTemplate struct {
	TemplateID       string           `json:"templateId" firestore:"templateId"`
	Name             string           `json:"name" firestore:"name"`
	Description      string           `json:"description" firestore:"description"`
	EntryFee         int              `json:"entryFee" firestore:"entryFee"`
	TotalPrizePool   int              `json:"totalPrizePool" firestore:"totalPrizePool"`
	MaxSpots         int              `json:"maxSpots" firestore:"maxSpots"`
	MaxTeamsPerUser  int              `json:"maxTeamsPerUser" firestore:"maxTeamsPerUser"`
	IsGuaranteed     bool             `json:"isGuaranteed" firestore:"isGuaranteed"`
	PrizeDistribution []PrizeRank     `json:"prizeDistribution" firestore:"prizeDistribution"`
	CreatedAt        string           `json:"createdAt" firestore:"createdAt"`
}

type PrizeRank struct {
	RankStart    int    `json:"rankStart" firestore:"rankStart"`       // Starting rank (e.g., 1 for rank 1, 2 for rank 2-3)
	RankEnd      int    `json:"rankEnd" firestore:"rankEnd"`           // Ending rank (e.g., 1 for rank 1, 3 for rank 2-3)
	PrizeAmount  int    `json:"prizeAmount" firestore:"prizeAmount"`   // Cash prize amount (0 if kind)
	PrizeType    string `json:"prizeType" firestore:"prizeType"`       // "cash" or "kind"
	PrizeDesc    string `json:"prizeDesc" firestore:"prizeDesc"`       // Description for kind prizes
}


// Base player information - unique and permanent
type Player struct {
	PlayerID         string  `json:"playerId" firestore:"playerId"`
	Name             string  `json:"name" firestore:"name"`
	ImageURL         string  `json:"imageUrl" firestore:"imageUrl"`
	DefaultCategory  string  `json:"defaultCategory" firestore:"defaultCategory"`
	DefaultCredits   float64 `json:"defaultCredits" firestore:"defaultCredits"`
	DateOfBirth      string  `json:"dateOfBirth" firestore:"dateOfBirth"`
	Nationality      string  `json:"nationality" firestore:"nationality"`
	CreatedAt        string  `json:"createdAt" firestore:"createdAt"`
}

// Team-Player association for a season/league
type TeamPlayer struct {
	AssociationID string  `json:"associationId" firestore:"associationId"`
	PlayerID      string  `json:"playerId" firestore:"playerId"`
	TeamID        string  `json:"teamId" firestore:"teamId"`
	LeagueID      string  `json:"leagueId" firestore:"leagueId"`
	Season        string  `json:"season" firestore:"season"`
	JerseyNumber  int     `json:"jerseyNumber" firestore:"jerseyNumber"`
	Role          string  `json:"role" firestore:"role"` // captain, vice-captain, player
	StartDate     string  `json:"startDate" firestore:"startDate"`
	EndDate       string  `json:"endDate" firestore:"endDate"`
	IsActive      bool    `json:"isActive" firestore:"isActive"`
	CreatedAt     string  `json:"createdAt" firestore:"createdAt"`
}

// Single match squad document containing all players for that match
type MatchSquad struct {
	MatchSquadID string             `json:"matchSquadId" firestore:"matchSquadId"`
	MatchID      string             `json:"matchId" firestore:"matchId"`
	Team1ID      string             `json:"team1Id" firestore:"team1Id"`
	Team2ID      string             `json:"team2Id" firestore:"team2Id"`
	Team1Players []MatchSquadPlayer `json:"team1Players" firestore:"team1Players"`
	Team2Players []MatchSquadPlayer `json:"team2Players" firestore:"team2Players"`
	CreatedAt    string             `json:"createdAt" firestore:"createdAt"`
	UpdatedAt    string             `json:"updatedAt" firestore:"updatedAt"`
}

// Player information within a match squad
type MatchSquadPlayer struct {
	PlayerID            string            `json:"playerId" firestore:"playerId"`
	PlayerName          string            `json:"playerName" firestore:"playerName"`
	PlayerImageURL      string            `json:"playerImageUrl" firestore:"playerImageUrl"`
	Category            string            `json:"category" firestore:"category"`
	Credits             float64           `json:"credits" firestore:"credits"`
	IsStarting6         bool              `json:"isStarting6" firestore:"isStarting6"`
	JerseyNumber        int               `json:"jerseyNumber" firestore:"jerseyNumber"`
	LastMatchPoints     int               `json:"lastMatchPoints" firestore:"lastMatchPoints"`
	SelectionPercentage float64           `json:"selectionPercentage" firestore:"selectionPercentage"`
	LiveStats           PlayerLiveStats   `json:"liveStats" firestore:"liveStats"`
}

type PlayerLiveStats struct {
	Attacks            int     `json:"attacks" firestore:"attacks"`
	Aces               int     `json:"aces" firestore:"aces"`
	Blocks             int     `json:"blocks" firestore:"blocks"`
	ReceptionsSuccess  int     `json:"receptionsSuccess" firestore:"receptionsSuccess"`
	ReceptionErrors    int     `json:"receptionErrors" firestore:"receptionErrors"`
	SetsPlayed         []int   `json:"setsPlayed" firestore:"setsPlayed"`
	SetsAsStarter      []int   `json:"setsAsStarter" firestore:"setsAsStarter"`
	SetsAsSubstitute   []int   `json:"setsAsSubstitute" firestore:"setsAsSubstitute"`
	TotalPoints        int     `json:"totalPoints" firestore:"totalPoints"`
}

type Contest struct {
	ContestID         string       `json:"contestId" firestore:"contestId"`
	MatchID           string       `json:"matchId" firestore:"matchId"`
	TemplateID        string       `json:"templateId" firestore:"templateId"`
	Name              string       `json:"name" firestore:"name"`
	Description       string       `json:"description" firestore:"description"`
	EntryFee          int          `json:"entryFee" firestore:"entryFee"`
	TotalPrizePool    int          `json:"totalPrizePool" firestore:"totalPrizePool"`
	MaxSpots          int          `json:"maxSpots" firestore:"maxSpots"`
	SpotsLeft         int          `json:"spotsLeft" firestore:"spotsLeft"`
	JoinedUsers       int          `json:"joinedUsers" firestore:"joinedUsers"`
	MaxTeamsPerUser   int          `json:"maxTeamsPerUser" firestore:"maxTeamsPerUser"`
	IsGuaranteed      bool         `json:"isGuaranteed" firestore:"isGuaranteed"`
	PrizeDistribution []PrizeRank  `json:"prizeDistribution" firestore:"prizeDistribution"`
	Status            string       `json:"status" firestore:"status"`
	CreatedAt         string       `json:"createdAt" firestore:"createdAt"`
}

type UserTeam struct {
	TeamID        string   `json:"teamId" firestore:"teamId"`
	UserID        string   `json:"userId" firestore:"userId"`
	MatchID       string   `json:"matchId" firestore:"matchId"`
	ContestID     string   `json:"contestId" firestore:"contestId"`
	TeamName      string   `json:"teamName" firestore:"teamName"`
	Players       []string `json:"players" firestore:"players"`
	CaptainID     string   `json:"captainId" firestore:"captainId"`
	ViceCaptainID string   `json:"viceCaptainId" firestore:"viceCaptainId"`
	TotalPoints   int      `json:"totalPoints" firestore:"totalPoints"`
	Rank          int      `json:"rank" firestore:"rank"`
}

type User struct {
	UID                  string    `json:"uid" firestore:"uid"`
	Phone                string    `json:"phone" firestore:"phone"`
	Name                 string    `json:"name" firestore:"name"`
	Email                string    `json:"email" firestore:"email"`
	CreatedAt            time.Time `json:"createdAt" firestore:"createdAt"`
	TotalContestsJoined  int       `json:"totalContestsJoined" firestore:"totalContestsJoined"`
	TotalWins            int       `json:"totalWins" firestore:"totalWins"`
}

func main() {
	ctx := context.Background()

	// Initialize Firebase
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	config := &firebase.Config{ProjectID: "fantasy-volleyball-21364"}
	app, err := firebase.NewApp(ctx, config, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	// Initialize Firestore client
	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer client.Close()

	// Initialize Auth client
	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	// JWT secret - in production, use environment variable
	jwtSecret := []byte("your-secret-key-change-this-in-production")
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		jwtSecret = []byte(secret)
	}

	server := &Server{
		firestoreClient: client,
		authClient:      authClient,
		jwtSecret:       jwtSecret,
		otpStore:        make(map[string]OTPData),
	}

	router := mux.NewRouter()

	// CORS middleware
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{
			"https://fantasy-volleyball.netlify.app",
			"https://primev-admin.netlify.app",
			"http://localhost:5173",
			"http://localhost:3000",
			"*",
		}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{
			"Content-Type", 
			"Authorization", 
			"X-Requested-With",
			"Accept",
			"Origin",
		}),
		handlers.AllowCredentials(),
	)

	// User Authentication routes
	router.HandleFunc("/api/auth/send-otp", server.sendOTP).Methods("POST")
	router.HandleFunc("/api/auth/verify-otp", server.verifyOTP).Methods("POST")
	router.HandleFunc("/api/auth/logout", server.logout).Methods("POST")
	
	// Admin Authentication routes
	router.HandleFunc("/api/admin/auth/login", server.adminLogin).Methods("POST")
	router.HandleFunc("/api/admin/auth/logout", server.adminLogout).Methods("POST")

	// Public routes (no authentication required)
	router.HandleFunc("/api/matches", server.getMatches).Methods("GET")
	router.HandleFunc("/api/contests", server.getPublicContests).Methods("GET")
	router.HandleFunc("/api/match-squads/match/{matchId}", server.getPublicMatchSquad).Methods("GET")
	router.HandleFunc("/api/matches/{matchId}/players", server.getPlayersByMatch).Methods("GET")
	router.HandleFunc("/api/matches/{matchId}/contests", server.getContestsByMatch).Methods("GET")
	
	// Protected routes (require authentication)
	router.HandleFunc("/api/contests/{contestId}/join", server.authMiddleware(server.joinContest)).Methods("POST")
	router.HandleFunc("/api/teams", server.authMiddleware(server.createTeam)).Methods("POST")
	router.HandleFunc("/api/users/{userId}/teams", server.authMiddleware(server.getUserTeams)).Methods("GET")
	router.HandleFunc("/api/users/{userId}", server.authMiddleware(server.getUserProfile)).Methods("GET")
	
	// Admin routes (require admin authentication) - Hierarchical structure
	router.HandleFunc("/api/admin/leagues", server.adminAuthMiddleware(server.createLeague)).Methods("POST")
	router.HandleFunc("/api/admin/leagues", server.adminAuthMiddleware(server.getLeagues)).Methods("GET")
	router.HandleFunc("/api/admin/leagues/{leagueId}", server.adminAuthMiddleware(server.updateLeague)).Methods("PUT")
	router.HandleFunc("/api/admin/leagues/{leagueId}", server.adminAuthMiddleware(server.deleteLeague)).Methods("DELETE")
	router.HandleFunc("/api/admin/teams", server.adminAuthMiddleware(server.createAdminTeam)).Methods("POST")  
	router.HandleFunc("/api/admin/teams", server.adminAuthMiddleware(server.getTeams)).Methods("GET")
	router.HandleFunc("/api/admin/teams/{teamId}", server.adminAuthMiddleware(server.updateTeam)).Methods("PUT")
	router.HandleFunc("/api/admin/teams/{teamId}", server.adminAuthMiddleware(server.deleteTeam)).Methods("DELETE")
	router.HandleFunc("/api/admin/squads", server.adminAuthMiddleware(server.createSquad)).Methods("POST")
	router.HandleFunc("/api/admin/squads/{teamId}", server.adminAuthMiddleware(server.getTeamSquads)).Methods("GET")
	router.HandleFunc("/api/admin/matches", server.adminAuthMiddleware(server.createMatch)).Methods("POST")
	router.HandleFunc("/api/admin/matches", server.adminAuthMiddleware(server.getAdminMatches)).Methods("GET")
	router.HandleFunc("/api/admin/contest-templates", server.adminAuthMiddleware(server.createContestTemplate)).Methods("POST")
	router.HandleFunc("/api/admin/contest-templates", server.adminAuthMiddleware(server.getContestTemplates)).Methods("GET")
	router.HandleFunc("/api/admin/contest-templates/{templateId}", server.adminAuthMiddleware(server.updateContestTemplate)).Methods("PUT")
	router.HandleFunc("/api/admin/contest-templates/{templateId}", server.adminAuthMiddleware(server.deleteContestTemplate)).Methods("DELETE")
	router.HandleFunc("/api/admin/contests", server.adminAuthMiddleware(server.createContest)).Methods("POST")
	router.HandleFunc("/api/admin/contests", server.adminAuthMiddleware(server.getContests)).Methods("GET")
	router.HandleFunc("/api/admin/contests/{contestId}", server.adminAuthMiddleware(server.updateContest)).Methods("PUT")
	router.HandleFunc("/api/admin/contests/{contestId}", server.adminAuthMiddleware(server.deleteContest)).Methods("DELETE")
	
	// Player management - new normalized schema
	router.HandleFunc("/api/admin/players", server.adminAuthMiddleware(server.createPlayer)).Methods("POST")
	router.HandleFunc("/api/admin/players", server.adminAuthMiddleware(server.getAllPlayers)).Methods("GET")
	router.HandleFunc("/api/admin/players/{playerId}", server.adminAuthMiddleware(server.getPlayerById)).Methods("GET")
	router.HandleFunc("/api/admin/players/{playerId}", server.adminAuthMiddleware(server.updatePlayer)).Methods("PUT")
	router.HandleFunc("/api/admin/players/{playerId}", server.adminAuthMiddleware(server.deletePlayer)).Methods("DELETE")
	
	// Team-Player associations
	router.HandleFunc("/api/admin/team-players", server.adminAuthMiddleware(server.createTeamPlayer)).Methods("POST")
	router.HandleFunc("/api/admin/team-players/team/{teamId}", server.adminAuthMiddleware(server.getTeamAssociations)).Methods("GET")
	router.HandleFunc("/api/admin/team-players/{associationId}", server.adminAuthMiddleware(server.deleteTeamPlayer)).Methods("DELETE")
	
	// Match squads (single document per match)
	router.HandleFunc("/api/admin/match-squads", server.adminAuthMiddleware(server.createMatchSquad)).Methods("POST")
	router.HandleFunc("/api/admin/match-squads/match/{matchId}", server.adminAuthMiddleware(server.getMatchSquad)).Methods("GET")
	router.HandleFunc("/api/admin/match-squads/match/{matchId}", server.adminAuthMiddleware(server.updateMatchSquad)).Methods("PUT")
	router.HandleFunc("/api/admin/match-squads/match/{matchId}/auto-assign", server.adminAuthMiddleware(server.autoAssignMatchSquad)).Methods("POST")
	router.HandleFunc("/api/admin/match-squads/match/{matchId}/cleanup", server.adminAuthMiddleware(server.cleanupOldMatchPlayers)).Methods("DELETE")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler(router)))
}

// Get upcoming matches only (public endpoint)
func (s *Server) getMatches(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	
	// Get all matches and filter for upcoming ones
	iter := s.firestoreClient.Collection("matches").Documents(ctx)
	var matches []Match
	
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var match Match
		doc.DataTo(&match)
		
		// Check if match is upcoming (assuming string dates in RFC3339 format)
		if match.StartTime != "" {
			if startTime, parseErr := time.Parse(time.RFC3339, match.StartTime); parseErr == nil && time.Now().Before(startTime) {
				matches = append(matches, match)
			}
		} else {
			// If no start time, include it (for testing)
			matches = append(matches, match)
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

// Get contests (public endpoint)
func (s *Server) getPublicContests(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	iter := s.firestoreClient.Collection("contests").Documents(ctx)
	
	var contests []Contest
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var contest Contest
		doc.DataTo(&contest)
		contests = append(contests, contest)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contests)
}

// Get match squad (public endpoint)
func (s *Server) getPublicMatchSquad(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchId := vars["matchId"]
	
	ctx := context.Background()
	doc, err := s.firestoreClient.Collection("matchSquads").Doc(matchId).Get(ctx)
	if err != nil {
		// No squad exists yet, return empty
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{})
		return
	}
	
	if !doc.Exists() {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{})
		return
	}
	
	var matchSquad MatchSquad
	doc.DataTo(&matchSquad)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matchSquad)
}

// Get players for a specific match
func (s *Server) getPlayersByMatch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchID := vars["matchId"]
	
	ctx := context.Background()
	iter := s.firestoreClient.Collection("players").Where("matchId", "==", matchID).Documents(ctx)
	
	var players []Player
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var player Player
		doc.DataTo(&player)
		players = append(players, player)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(players)
}

// Get contests for a specific match
func (s *Server) getContestsByMatch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchID := vars["matchId"]
	
	ctx := context.Background()
	iter := s.firestoreClient.Collection("contests").Where("matchId", "==", matchID).Documents(ctx)
	
	var contests []Contest
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var contest Contest
		doc.DataTo(&contest)
		contests = append(contests, contest)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contests)
}

// Create a new team
func (s *Server) createTeam(w http.ResponseWriter, r *http.Request) {
	var team UserTeam
	if err := json.NewDecoder(r.Body).Decode(&team); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Validate team composition
	if len(team.Players) != 6 {
		http.Error(w, "Team must have exactly 6 players", http.StatusBadRequest)
		return
	}
	
	// Add team to Firestore
	ctx := context.Background()
	_, _, err := s.firestoreClient.Collection("userTeams").Add(ctx, team)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// Join a contest
func (s *Server) joinContest(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contestID := vars["contestId"]
	
	var joinRequest struct {
		UserID string `json:"userId"`
		TeamID string `json:"teamId"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&joinRequest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	
	// Update contest spots
	contestRef := s.firestoreClient.Collection("contests").Doc(contestID)
	_, err := contestRef.Update(ctx, []firestore.Update{
		{Path: "spotsLeft", Value: firestore.Increment(-1)},
		{Path: "joinedUsers", Value: firestore.Increment(1)},
	})
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "joined"})
}

// Get user teams
func (s *Server) getUserTeams(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	
	ctx := context.Background()
	iter := s.firestoreClient.Collection("userTeams").Where("userId", "==", userID).Documents(ctx)
	
	var teams []UserTeam
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var team UserTeam
		doc.DataTo(&team)
		teams = append(teams, team)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

// Admin: Create match
func (s *Server) createMatch(w http.ResponseWriter, r *http.Request) {
	var match Match
	if err := json.NewDecoder(r.Body).Decode(&match); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Ensure required fields are set
	if match.MatchID == "" {
		match.MatchID = fmt.Sprintf("match_%d", time.Now().UnixNano())
	}
	if match.CreatedAt == "" {
		match.CreatedAt = time.Now().Format(time.RFC3339)
	}
	
	ctx := context.Background()
	// Use the matchId as the document ID
	_, err := s.firestoreClient.Collection("matches").Doc(match.MatchID).Set(ctx, match)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Create player (new normalized schema)
func (s *Server) createPlayer(w http.ResponseWriter, r *http.Request) {
	var player Player
	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Ensure all required fields are present for new schema
	if player.PlayerID == "" {
		player.PlayerID = fmt.Sprintf("player_%d", time.Now().UnixNano())
	}
	if player.CreatedAt == "" {
		player.CreatedAt = time.Now().Format(time.RFC3339)
	}
	if player.Nationality == "" {
		player.Nationality = "India"
	}
	
	ctx := context.Background()
	// Use the playerId as the document ID so we can reference it later
	_, err := s.firestoreClient.Collection("players").Doc(player.PlayerID).Set(ctx, player)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Create contest
func (s *Server) createContest(w http.ResponseWriter, r *http.Request) {
	var contest Contest
	if err := json.NewDecoder(r.Body).Decode(&contest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Ensure required fields are set
	if contest.ContestID == "" {
		contest.ContestID = fmt.Sprintf("contest_%d", time.Now().UnixNano())
	}
	if contest.CreatedAt == "" {
		contest.CreatedAt = time.Now().Format(time.RFC3339)
	}
	
	ctx := context.Background()
	// Use the contestId as the document ID
	_, err := s.firestoreClient.Collection("contests").Doc(contest.ContestID).Set(ctx, contest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Get contests
func (s *Server) getContests(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	iter := s.firestoreClient.Collection("contests").Documents(ctx)
	
	var contests []Contest
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var contest Contest
		doc.DataTo(&contest)
		contests = append(contests, contest)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contests)
}

// Admin: Update contest
func (s *Server) updateContest(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contestId := vars["contestId"]
	
	var contest Contest
	if err := json.NewDecoder(r.Body).Decode(&contest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	
	// Check if document exists first
	doc, err := s.firestoreClient.Collection("contests").Doc(contestId).Get(ctx)
	if err != nil {
		http.Error(w, "Contest not found", http.StatusNotFound)
		return
	}
	
	if !doc.Exists() {
		http.Error(w, "Contest not found", http.StatusNotFound)
		return
	}
	
	_, err = s.firestoreClient.Collection("contests").Doc(contestId).Set(ctx, contest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// Admin: Delete contest
func (s *Server) deleteContest(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contestId := vars["contestId"]
	
	ctx := context.Background()
	_, err := s.firestoreClient.Collection("contests").Doc(contestId).Delete(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

// Admin: Update player scores
func (s *Server) updatePlayerScores(w http.ResponseWriter, r *http.Request) {
	var updateRequest struct {
		PlayerID string `json:"playerId"`
		Stats    PlayerLiveStats `json:"stats"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Calculate volleyball points based on scoring system
	points := calculateVolleyballPoints(updateRequest.Stats)
	updateRequest.Stats.TotalPoints = points
	
	ctx := context.Background()
	playerRef := s.firestoreClient.Collection("players").Doc(updateRequest.PlayerID)
	_, err := playerRef.Update(ctx, []firestore.Update{
		{Path: "liveStats", Value: updateRequest.Stats},
	})
	
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "updated",
		"totalPoints": points,
	})
}

// Calculate volleyball points based on the scoring system
func calculateVolleyballPoints(stats PlayerLiveStats) int {
	points := 0
	
	// Attacking points
	points += stats.Attacks * 3  // Successful attacks
	points += stats.Aces * 20    // Aces
	
	// Defending points
	points += stats.Blocks * 20  // Blocks
	points += (stats.ReceptionsSuccess - stats.ReceptionErrors) * 3  // Net receptions
	
	// Gameplay points
	for range stats.SetsAsStarter {
		points += 6  // Starter points per set
	}
	
	for range stats.SetsAsSubstitute {
		points += 3  // Substitute points per set
	}
	
	return points
}

// Authentication middleware
func (s *Server) authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, "Bearer token required", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), "userID", claims["uid"])
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// Send OTP
func (s *Server) sendOTP(w http.ResponseWriter, r *http.Request) {
	var request struct {
		PhoneNumber string `json:"phoneNumber"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate 6-digit OTP (or use test OTP for development)
	var otp string
	
	// Test phone number for easy testing
	if request.PhoneNumber == "+919999999999" || request.PhoneNumber == "+911234567890" {
		otp = "123456" // Test OTP
	} else {
		generatedOTP, err := generateOTP()
		if err != nil {
			http.Error(w, "Failed to generate OTP", http.StatusInternalServerError)
			return
		}
		otp = generatedOTP
	}

	// Store OTP (expires in 5 minutes)
	s.otpStore[request.PhoneNumber] = OTPData{
		OTP:       otp,
		ExpiresAt: time.Now().Add(5 * time.Minute),
		Phone:     request.PhoneNumber,
	}

	// Print OTP for development (in production, send SMS)
	fmt.Printf("OTP for %s: %s\n", request.PhoneNumber, otp)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"message": "OTP sent successfully",
	})
}

// Verify OTP and create user session
func (s *Server) verifyOTP(w http.ResponseWriter, r *http.Request) {
	var request struct {
		PhoneNumber string `json:"phoneNumber"`
		OTP         string `json:"otp"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Check OTP
	storedOTP, exists := s.otpStore[request.PhoneNumber]
	if !exists {
		http.Error(w, "OTP not found or expired", http.StatusUnauthorized)
		return
	}

	if time.Now().After(storedOTP.ExpiresAt) {
		delete(s.otpStore, request.PhoneNumber)
		http.Error(w, "OTP expired", http.StatusUnauthorized)
		return
	}

	if storedOTP.OTP != request.OTP {
		http.Error(w, "Invalid OTP", http.StatusUnauthorized)
		return
	}

	// Clear OTP
	delete(s.otpStore, request.PhoneNumber)

	ctx := context.Background()
	
	// Create or get user
	userID := fmt.Sprintf("user_%d", time.Now().UnixNano())
	userRef := s.firestoreClient.Collection("users").Doc(userID)
	
	user := User{
		UID:                  userID,
		Phone:                request.PhoneNumber,
		CreatedAt:            time.Now(),
		TotalContestsJoined:  0,
		TotalWins:            0,
	}

	// Check if user already exists
	existingUsers := s.firestoreClient.Collection("users").Where("phone", "==", request.PhoneNumber).Limit(1).Documents(ctx)
	docs, err := existingUsers.GetAll()
	if err == nil && len(docs) > 0 {
		// User exists
		userID = docs[0].Ref.ID
		docs[0].DataTo(&user)
	} else {
		// Create new user
		_, err = userRef.Set(ctx, user)
		if err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid":   userID,
		"phone": request.PhoneNumber,
		"exp":   time.Now().Add(24 * time.Hour * 7).Unix(), // 7 days
		"iat":   time.Now().Unix(),
	})

	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		http.Error(w, "Failed to create token", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"user": map[string]interface{}{
			"uid":         userID,
			"phoneNumber": request.PhoneNumber,
		},
		"token": tokenString,
		"profile": user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Get user profile
func (s *Server) getUserProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	
	// Verify user can access this profile (from JWT)
	contextUserID := r.Context().Value("userID")
	if contextUserID != userID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	ctx := context.Background()
	doc, err := s.firestoreClient.Collection("users").Doc(userID).Get(ctx)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	var user User
	doc.DataTo(&user)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// Logout
func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	// In a stateless JWT setup, logout is handled client-side
	// In production, you might want to maintain a blacklist of revoked tokens
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"message": "Logged out successfully",
	})
}

// Admin authentication middleware
func (s *Server) adminAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, "Bearer token required", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid admin token", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		// Check if user is admin
		role, ok := claims["role"].(string)
		if !ok || role != "admin" {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}

		// Add admin ID to request context
		ctx := context.WithValue(r.Context(), "adminID", claims["uid"])
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// Admin login
func (s *Server) adminLogin(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Simple hardcoded admin credentials (in production, use proper admin table)
	if request.Username != "primevadmin" || request.Password != "PrimeV2024Admin" {
		http.Error(w, "Invalid admin credentials", http.StatusUnauthorized)
		return
	}

	// Generate JWT token with admin role
	adminID := "admin_primev"
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid":   adminID,
		"role":  "admin",
		"username": request.Username,
		"exp":   time.Now().Add(24 * time.Hour * 7).Unix(), // 7 days
		"iat":   time.Now().Unix(),
	})

	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		http.Error(w, "Failed to create admin token", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"admin": map[string]interface{}{
			"uid":      adminID,
			"username": request.Username,
			"role":     "admin",
		},
		"token": tokenString,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Admin logout
func (s *Server) adminLogout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"message": "Admin logged out successfully",
	})
}

// Admin: Create league
func (s *Server) createLeague(w http.ResponseWriter, r *http.Request) {
	var league League
	if err := json.NewDecoder(r.Body).Decode(&league); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	// Use the leagueId as the document ID so we can reference it later
	_, err := s.firestoreClient.Collection("leagues").Doc(league.LeagueID).Set(ctx, league)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Get leagues
func (s *Server) getLeagues(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	iter := s.firestoreClient.Collection("leagues").Documents(ctx)
	var leagues []League
	
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var league League
		doc.DataTo(&league)
		leagues = append(leagues, league)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(leagues)
}

// Admin: Create team
func (s *Server) createAdminTeam(w http.ResponseWriter, r *http.Request) {
	var team Team
	if err := json.NewDecoder(r.Body).Decode(&team); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	// Use the teamId as the document ID so we can reference it later
	_, err := s.firestoreClient.Collection("teams").Doc(team.TeamID).Set(ctx, team)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Get teams
func (s *Server) getTeams(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	iter := s.firestoreClient.Collection("teams").Documents(ctx)
	var teams []Team
	
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var team Team
		doc.DataTo(&team)
		teams = append(teams, team)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

// Admin: Create contest template
func (s *Server) createContestTemplate(w http.ResponseWriter, r *http.Request) {
	var template ContestTemplate
	if err := json.NewDecoder(r.Body).Decode(&template); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	// Use the templateId as the document ID so we can reference it later
	_, err := s.firestoreClient.Collection("contestTemplates").Doc(template.TemplateID).Set(ctx, template)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Get contest templates
func (s *Server) getContestTemplates(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	iter := s.firestoreClient.Collection("contestTemplates").Documents(ctx)
	var templates []ContestTemplate
	
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var template ContestTemplate
		doc.DataTo(&template)
		templates = append(templates, template)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(templates)
}

// Admin: Create squad (placeholder)
func (s *Server) createSquad(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created", "message": "Squad creation coming soon"})
}

// Admin: Get team squads (placeholder)
func (s *Server) getTeamSquads(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]interface{}{})
}

// Admin: Get admin matches
func (s *Server) getAdminMatches(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	iter := s.firestoreClient.Collection("matches").Documents(ctx)
	
	var matches []Match
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var match Match
		doc.DataTo(&match)
		matches = append(matches, match)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

// Admin: Update league
func (s *Server) updateLeague(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	leagueId := vars["leagueId"]
	
	var league League
	if err := json.NewDecoder(r.Body).Decode(&league); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	
	// Check if document exists first
	doc, err := s.firestoreClient.Collection("leagues").Doc(leagueId).Get(ctx)
	if err != nil {
		http.Error(w, "League not found", http.StatusNotFound)
		return
	}
	
	if !doc.Exists() {
		http.Error(w, "League not found", http.StatusNotFound)
		return
	}
	
	// Use complete document replacement - this ensures all fields are consistent
	_, err = s.firestoreClient.Collection("leagues").Doc(leagueId).Set(ctx, league)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// Admin: Delete league
func (s *Server) deleteLeague(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	leagueId := vars["leagueId"]
	
	ctx := context.Background()
	_, err := s.firestoreClient.Collection("leagues").Doc(leagueId).Delete(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

// Admin: Update team
func (s *Server) updateTeam(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamId := vars["teamId"]
	
	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	
	// Check if document exists first
	doc, err := s.firestoreClient.Collection("teams").Doc(teamId).Get(ctx)
	if err != nil {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}
	
	if !doc.Exists() {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}
	
	// Prepare updates
	updateData := []firestore.Update{}
	if name, ok := updates["name"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "name", Value: name})
	}
	if code, ok := updates["code"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "code", Value: code})
	}
	if logo, ok := updates["logo"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "logo", Value: logo})
	}
	if homeCity, ok := updates["homeCity"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "homeCity", Value: homeCity})
	}
	if captain, ok := updates["captain"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "captain", Value: captain})
	}
	if coach, ok := updates["coach"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "coach", Value: coach})
	}
	
	_, err = s.firestoreClient.Collection("teams").Doc(teamId).Update(ctx, updateData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// Admin: Delete team
func (s *Server) deleteTeam(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamId := vars["teamId"]
	
	ctx := context.Background()
	_, err := s.firestoreClient.Collection("teams").Doc(teamId).Delete(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

// Admin: Update contest template
func (s *Server) updateContestTemplate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	templateId := vars["templateId"]
	
	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	
	// Check if document exists first
	doc, err := s.firestoreClient.Collection("contestTemplates").Doc(templateId).Get(ctx)
	if err != nil {
		http.Error(w, "Template not found", http.StatusNotFound)
		return
	}
	
	if !doc.Exists() {
		http.Error(w, "Template not found", http.StatusNotFound)
		return
	}
	
	// Prepare updates
	updateData := []firestore.Update{}
	if name, ok := updates["name"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "name", Value: name})
	}
	if desc, ok := updates["description"].(string); ok {
		updateData = append(updateData, firestore.Update{Path: "description", Value: desc})
	}
	if entryFee, ok := updates["entryFee"].(float64); ok {
		updateData = append(updateData, firestore.Update{Path: "entryFee", Value: int(entryFee)})
	}
	if prizePool, ok := updates["prizePool"].(float64); ok {
		updateData = append(updateData, firestore.Update{Path: "prizePool", Value: int(prizePool)})
	}
	if maxSpots, ok := updates["maxSpots"].(float64); ok {
		updateData = append(updateData, firestore.Update{Path: "maxSpots", Value: int(maxSpots)})
	}
	if maxTeamsPerUser, ok := updates["maxTeamsPerUser"].(float64); ok {
		updateData = append(updateData, firestore.Update{Path: "maxTeamsPerUser", Value: int(maxTeamsPerUser)})
	}
	if winnerPercentage, ok := updates["winnerPercentage"].(float64); ok {
		updateData = append(updateData, firestore.Update{Path: "winnerPercentage", Value: winnerPercentage})
	}
	if isGuaranteed, ok := updates["isGuaranteed"].(bool); ok {
		updateData = append(updateData, firestore.Update{Path: "isGuaranteed", Value: isGuaranteed})
	}
	
	_, err = s.firestoreClient.Collection("contestTemplates").Doc(templateId).Update(ctx, updateData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// Admin: Delete contest template
func (s *Server) deleteContestTemplate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	templateId := vars["templateId"]
	
	ctx := context.Background()
	_, err := s.firestoreClient.Collection("contestTemplates").Doc(templateId).Delete(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

// Admin: Get all players (master database)
func (s *Server) getAllPlayers(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	iter := s.firestoreClient.Collection("players").Documents(ctx)
	
	var players []Player
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var player Player
		doc.DataTo(&player)
		players = append(players, player)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(players)
}

// Admin: Get player by ID
func (s *Server) getPlayerById(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	playerId := vars["playerId"]
	
	ctx := context.Background()
	doc, err := s.firestoreClient.Collection("players").Doc(playerId).Get(ctx)
	if err != nil {
		http.Error(w, "Player not found", http.StatusNotFound)
		return
	}
	
	if !doc.Exists() {
		http.Error(w, "Player not found", http.StatusNotFound)
		return
	}
	
	var player Player
	doc.DataTo(&player)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(player)
}

// Admin: Update player
func (s *Server) updatePlayer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	playerId := vars["playerId"]
	
	var player Player
	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	
	// Check if document exists first
	doc, err := s.firestoreClient.Collection("players").Doc(playerId).Get(ctx)
	if err != nil {
		http.Error(w, "Player not found", http.StatusNotFound)
		return
	}
	
	if !doc.Exists() {
		http.Error(w, "Player not found", http.StatusNotFound)
		return
	}
	
	_, err = s.firestoreClient.Collection("players").Doc(playerId).Set(ctx, player)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// Admin: Delete player
func (s *Server) deletePlayer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	playerId := vars["playerId"]
	
	ctx := context.Background()
	_, err := s.firestoreClient.Collection("players").Doc(playerId).Delete(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

// Admin: Create team-player association
func (s *Server) createTeamPlayer(w http.ResponseWriter, r *http.Request) {
	var association TeamPlayer
	if err := json.NewDecoder(r.Body).Decode(&association); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	_, err := s.firestoreClient.Collection("teamPlayers").Doc(association.AssociationID).Set(ctx, association)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Get team associations
func (s *Server) getTeamAssociations(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	teamId := vars["teamId"]
	
	ctx := context.Background()
	iter := s.firestoreClient.Collection("teamPlayers").Where("teamId", "==", teamId).Where("isActive", "==", true).Documents(ctx)
	
	var associations []TeamPlayer
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var association TeamPlayer
		doc.DataTo(&association)
		associations = append(associations, association)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(associations)
}

// Admin: Delete team-player association
func (s *Server) deleteTeamPlayer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	associationId := vars["associationId"]
	
	ctx := context.Background()
	_, err := s.firestoreClient.Collection("teamPlayers").Doc(associationId).Delete(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

// Admin: Create match squad (single document)
func (s *Server) createMatchSquad(w http.ResponseWriter, r *http.Request) {
	var matchSquad MatchSquad
	if err := json.NewDecoder(r.Body).Decode(&matchSquad); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Ensure required fields are set
	if matchSquad.MatchSquadID == "" {
		matchSquad.MatchSquadID = fmt.Sprintf("squad_%s", matchSquad.MatchID)
	}
	if matchSquad.CreatedAt == "" {
		matchSquad.CreatedAt = time.Now().Format(time.RFC3339)
	}
	matchSquad.UpdatedAt = time.Now().Format(time.RFC3339)
	
	ctx := context.Background()
	// Use the matchId as the document ID for easy retrieval
	_, err := s.firestoreClient.Collection("matchSquads").Doc(matchSquad.MatchID).Set(ctx, matchSquad)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Get match squad (single document)
func (s *Server) getMatchSquad(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchId := vars["matchId"]
	
	ctx := context.Background()
	doc, err := s.firestoreClient.Collection("matchSquads").Doc(matchId).Get(ctx)
	if err != nil {
		// No squad exists yet, return empty
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{})
		return
	}
	
	if !doc.Exists() {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{})
		return
	}
	
	var matchSquad MatchSquad
	doc.DataTo(&matchSquad)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matchSquad)
}

// Admin: Update match squad (single document update)
func (s *Server) updateMatchSquad(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchId := vars["matchId"]
	
	var matchSquad MatchSquad
	if err := json.NewDecoder(r.Body).Decode(&matchSquad); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Set update timestamp
	matchSquad.UpdatedAt = time.Now().Format(time.RFC3339)
	
	ctx := context.Background()
	// Update the entire squad document
	_, err := s.firestoreClient.Collection("matchSquads").Doc(matchId).Set(ctx, matchSquad)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// Admin: Auto-assign squad from team players (backend logic)
func (s *Server) autoAssignMatchSquad(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchId := vars["matchId"]
	
	ctx := context.Background()
	
	// Get match details by searching for matchId field
	matchIter := s.firestoreClient.Collection("matches").Where("matchId", "==", matchId).Documents(ctx)
	matchDoc, err := matchIter.Next()
	if err != nil {
		http.Error(w, "Match not found", http.StatusNotFound)
		return
	}
	
	var match Match
	matchDoc.DataTo(&match)
	
	// Get team players for both teams
	team1Iter := s.firestoreClient.Collection("teamPlayers").Where("teamId", "==", match.Team1ID).Where("isActive", "==", true).Documents(ctx)
	team2Iter := s.firestoreClient.Collection("teamPlayers").Where("teamId", "==", match.Team2ID).Where("isActive", "==", true).Documents(ctx)
	
	var team1Players []MatchSquadPlayer
	var team2Players []MatchSquadPlayer
	
	// Process team 1 players
	for {
		doc, err := team1Iter.Next()
		if err != nil {
			break
		}
		
		var teamPlayer TeamPlayer
		doc.DataTo(&teamPlayer)
		
		// Get player details
		playerDoc, playerErr := s.firestoreClient.Collection("players").Doc(teamPlayer.PlayerID).Get(ctx)
		if playerErr != nil || !playerDoc.Exists() {
			continue
		}
		
		var player Player
		playerDoc.DataTo(&player)
		
		squadPlayer := MatchSquadPlayer{
			PlayerID:            player.PlayerID,
			PlayerName:          player.Name,
			PlayerImageURL:      player.ImageURL,
			Category:            player.DefaultCategory,
			Credits:             player.DefaultCredits,
			IsStarting6:         teamPlayer.Role == "captain" || len(team1Players) < 6, // First 6 are starting
			JerseyNumber:        teamPlayer.JerseyNumber,
			LastMatchPoints:     0,
			SelectionPercentage: 50.0,
			LiveStats: PlayerLiveStats{
				Attacks: 0, Aces: 0, Blocks: 0, ReceptionsSuccess: 0, ReceptionErrors: 0,
				SetsPlayed: []int{}, SetsAsStarter: []int{}, SetsAsSubstitute: []int{}, TotalPoints: 0,
			},
		}
		team1Players = append(team1Players, squadPlayer)
	}
	
	// Process team 2 players
	for {
		doc, err := team2Iter.Next()
		if err != nil {
			break
		}
		
		var teamPlayer TeamPlayer
		doc.DataTo(&teamPlayer)
		
		// Get player details
		playerDoc, playerErr := s.firestoreClient.Collection("players").Doc(teamPlayer.PlayerID).Get(ctx)
		if playerErr != nil || !playerDoc.Exists() {
			continue
		}
		
		var player Player
		playerDoc.DataTo(&player)
		
		squadPlayer := MatchSquadPlayer{
			PlayerID:            player.PlayerID,
			PlayerName:          player.Name,
			PlayerImageURL:      player.ImageURL,
			Category:            player.DefaultCategory,
			Credits:             player.DefaultCredits,
			IsStarting6:         teamPlayer.Role == "captain" || len(team2Players) < 6, // First 6 are starting
			JerseyNumber:        teamPlayer.JerseyNumber,
			LastMatchPoints:     0,
			SelectionPercentage: 50.0,
			LiveStats: PlayerLiveStats{
				Attacks: 0, Aces: 0, Blocks: 0, ReceptionsSuccess: 0, ReceptionErrors: 0,
				SetsPlayed: []int{}, SetsAsStarter: []int{}, SetsAsSubstitute: []int{}, TotalPoints: 0,
			},
		}
		team2Players = append(team2Players, squadPlayer)
	}
	
	if len(team1Players) == 0 && len(team2Players) == 0 {
		http.Error(w, "No team players found. Please assign players to teams first.", http.StatusBadRequest)
		return
	}
	
	// Create match squad document
	matchSquad := MatchSquad{
		MatchSquadID: fmt.Sprintf("squad_%s", matchId),
		MatchID:      matchId,
		Team1ID:      match.Team1ID,
		Team2ID:      match.Team2ID,
		Team1Players: team1Players,
		Team2Players: team2Players,
		CreatedAt:    time.Now().Format(time.RFC3339),
		UpdatedAt:    time.Now().Format(time.RFC3339),
	}
	
	// Save to database
	_, err = s.firestoreClient.Collection("matchSquads").Doc(matchId).Set(ctx, matchSquad)
	if err != nil {
		http.Error(w, "Failed to create match squad", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"message": fmt.Sprintf("Auto-assigned %d players (%d team1, %d team2) to match squad", 
			len(team1Players)+len(team2Players), len(team1Players), len(team2Players)),
		"squad": matchSquad,
	})
}

// Admin: Cleanup old matchPlayers documents
func (s *Server) cleanupOldMatchPlayers(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchId := vars["matchId"]
	
	ctx := context.Background()
	
	// Delete all old matchPlayers documents for this match
	iter := s.firestoreClient.Collection("matchPlayers").Where("matchId", "==", matchId).Documents(ctx)
	deletedCount := 0
	
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		_, deleteErr := doc.Ref.Delete(ctx)
		if deleteErr == nil {
			deletedCount++
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "cleaned",
		"deletedCount": deletedCount,
	})
}

// Admin: Update match player stats (placeholder)
func (s *Server) updateMatchPlayerStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated", "message": "Match stats update coming soon"})
}

// Admin: Update player stats (placeholder)  
func (s *Server) updatePlayerStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated", "message": "Stats update coming soon"})
}

// Generate 6-digit OTP
func generateOTP() (string, error) {
	otp := ""
	for i := 0; i < 6; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		otp += num.String()
	}
	return otp, nil
}