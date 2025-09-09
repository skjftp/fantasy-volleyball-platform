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

type Match struct {
	MatchID   string    `json:"matchId" firestore:"matchId"`
	Team1     Team      `json:"team1" firestore:"team1"`
	Team2     Team      `json:"team2" firestore:"team2"`
	StartTime time.Time `json:"startTime" firestore:"startTime"`
	Status    string    `json:"status" firestore:"status"`
	League    string    `json:"league" firestore:"league"`
}

type Team struct {
	Name string `json:"name" firestore:"name"`
	Code string `json:"code" firestore:"code"`
	Logo string `json:"logo" firestore:"logo"`
}

type Player struct {
	PlayerID             string            `json:"playerId" firestore:"playerId"`
	MatchID              string            `json:"matchId" firestore:"matchId"`
	Name                 string            `json:"name" firestore:"name"`
	Team                 string            `json:"team" firestore:"team"`
	Category             string            `json:"category" firestore:"category"`
	Credits              int               `json:"credits" firestore:"credits"`
	ImageURL             string            `json:"imageUrl" firestore:"imageUrl"`
	IsStarting6          bool              `json:"isStarting6" firestore:"isStarting6"`
	IsSubstitute         bool              `json:"isSubstitute" firestore:"isSubstitute"`
	LastMatchPoints      int               `json:"lastMatchPoints" firestore:"lastMatchPoints"`
	SelectionPercentage  float64           `json:"selectionPercentage" firestore:"selectionPercentage"`
	LiveStats            PlayerLiveStats   `json:"liveStats" firestore:"liveStats"`
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
	ContestID        string  `json:"contestId" firestore:"contestId"`
	MatchID          string  `json:"matchId" firestore:"matchId"`
	Name             string  `json:"name" firestore:"name"`
	PrizePool        int     `json:"prizePool" firestore:"prizePool"`
	TotalSpots       int     `json:"totalSpots" firestore:"totalSpots"`
	SpotsLeft        int     `json:"spotsLeft" firestore:"spotsLeft"`
	JoinedUsers      int     `json:"joinedUsers" firestore:"joinedUsers"`
	MaxTeamsPerUser  int     `json:"maxTeamsPerUser" firestore:"maxTeamsPerUser"`
	TotalWinners     int     `json:"totalWinners" firestore:"totalWinners"`
	WinnerPercentage float64 `json:"winnerPercentage" firestore:"winnerPercentage"`
	IsGuaranteed     bool    `json:"isGuaranteed" firestore:"isGuaranteed"`
	Status           string  `json:"status" firestore:"status"`
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

	// Public routes
	router.HandleFunc("/api/matches", server.getMatches).Methods("GET")
	router.HandleFunc("/api/matches/{matchId}/players", server.getPlayersByMatch).Methods("GET")
	router.HandleFunc("/api/matches/{matchId}/contests", server.getContestsByMatch).Methods("GET")
	
	// Protected routes (require authentication)
	router.HandleFunc("/api/contests/{contestId}/join", server.authMiddleware(server.joinContest)).Methods("POST")
	router.HandleFunc("/api/teams", server.authMiddleware(server.createTeam)).Methods("POST")
	router.HandleFunc("/api/users/{userId}/teams", server.authMiddleware(server.getUserTeams)).Methods("GET")
	router.HandleFunc("/api/users/{userId}", server.authMiddleware(server.getUserProfile)).Methods("GET")
	
	// Admin routes (require admin authentication)
	router.HandleFunc("/api/admin/matches", server.adminAuthMiddleware(server.createMatch)).Methods("POST")
	router.HandleFunc("/api/admin/players", server.adminAuthMiddleware(server.createPlayer)).Methods("POST")
	router.HandleFunc("/api/admin/contests", server.adminAuthMiddleware(server.createContest)).Methods("POST")
	router.HandleFunc("/api/admin/scores", server.adminAuthMiddleware(server.updatePlayerScores)).Methods("PUT")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler(router)))
}

// Get upcoming matches only
func (s *Server) getMatches(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	
	// Query for upcoming matches only
	iter := s.firestoreClient.Collection("matches").Where("status", "==", "upcoming").Documents(ctx)
	var matches []Match
	
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		
		var match Match
		doc.DataTo(&match)
		
		// Double-check that match hasn't started yet
		if time.Now().Before(match.StartTime) {
			matches = append(matches, match)
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
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
	
	ctx := context.Background()
	_, _, err := s.firestoreClient.Collection("matches").Add(ctx, match)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// Admin: Create player
func (s *Server) createPlayer(w http.ResponseWriter, r *http.Request) {
	var player Player
	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	ctx := context.Background()
	_, _, err := s.firestoreClient.Collection("players").Add(ctx, player)
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
	
	ctx := context.Background()
	_, _, err := s.firestoreClient.Collection("contests").Add(ctx, contest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
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
	if request.Username != "primevadmin" || request.Password != "PrimeV2024!Admin" {
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