package com.smartcampus.controller;

import com.smartcampus.dto.AuthDTO;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * AuthController - Authentication & User Management Endpoints
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 * Base URL: /api/auth
 *
 * ── PUBLIC ENDPOINTS (no JWT required) ──────────────────────────
 *   POST /api/auth/register         → Register new user account
 *   POST /api/auth/login            → Login and receive JWT
 *   POST /api/auth/oauth/google     → OAuth Google login (placeholder)
 *
 * ── AUTHENTICATED ENDPOINTS (JWT required) ──────────────────────
 *   GET  /api/auth/me               → Get current user's profile
 *
 * ── ADMIN-ONLY ENDPOINTS (JWT + ROLE_ADMIN required) ────────────
 *   GET  /api/auth/users            → List all registered users
 *   GET  /api/auth/users/{id}       → Get user profile by ID
 *   DELETE /api/auth/users/{id}     → Delete a user by ID
 *
 * ── JWT FLOW REMINDER ────────────────────────────────────────────
 *   1. Client calls POST /login or POST /register
 *   2. Receives { token, userId, name, email, role, expiresIn }
 *   3. Stores token client-side (localStorage / sessionStorage)
 *   4. Sends "Authorization: Bearer <token>" header on all subsequent requests
 *   5. JwtAuthFilter validates and populates SecurityContext
 *   6. @PreAuthorize / SecurityConfig enforces role-based access
 *
 * ── CORS NOTE ────────────────────────────────────────────────────
 *   CORS is handled globally in SecurityConfig.corsConfigurationSource().
 *   No @CrossOrigin annotation is used here — per-controller @CrossOrigin
 *   conflicts with SecurityConfig's centralized CORS policy.
 * ================================================================
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    // ─── PUBLIC: Register ───────────────────────────────────────

    /**
     * POST /api/auth/register
     *
     * Registers a new user with name, email, password, and role.
     * Role must be one of: USER | ADMIN | TECHNICIAN (defaults to USER).
     * Returns a JWT in the AuthResponse — the client is immediately logged in.
     *
     * Validation errors (422):
     *   - Email already registered → 409
     *   - Invalid role string      → 400
     *   - Missing/invalid fields   → 422
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        // AuthServiceImpl validates role, checks email uniqueness, BCrypt-encodes password
        AuthDTO.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── PUBLIC: Login ──────────────────────────────────────────

    /**
     * POST /api/auth/login
     *
     * Authenticates a user with email + password.
     * Returns a signed JWT + user info on success.
     * Returns 401 on invalid credentials (without revealing which field is wrong
     * to prevent user-enumeration attacks).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        AuthDTO.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // ─── PUBLIC: OAuth Google Placeholder ──────────────────────

    /**
     * POST /api/auth/oauth/google
     *
     * Simulates Google OAuth2 sign-in by accepting a Google ID token.
     *
     * CURRENT BEHAVIOUR (development/demo):
     *   Creates or retrieves a placeholder Google user and returns a JWT.
     *   The idToken is accepted but NOT verified against Google's servers.
     *
     * PRODUCTION IMPLEMENTATION (TODO):
     *   1. POST idToken to https://oauth2.googleapis.com/tokeninfo?id_token=<token>
     *   2. Verify 'aud' matches your Google OAuth client ID
     *   3. Extract email + name from verified response
     *   4. Upsert user in MongoDB (create with role=USER on first sign-in)
     *   5. Return standard AuthResponse with a JWT
     */
    @PostMapping("/oauth/google")
    public ResponseEntity<AuthDTO.AuthResponse> googleOAuth(
            @Valid @RequestBody AuthDTO.GoogleOAuthRequest request) {
        AuthDTO.AuthResponse response = authService.simulateGoogleLogin(request.getIdToken());
        return ResponseEntity.ok(response);
    }

    // ─── AUTHENTICATED: Get Current User ────────────────────────

    /**
     * GET /api/auth/me
     *
     * Returns the profile of the currently authenticated user.
     * The user is identified from the JWT subject (email) resolved by
     * JwtAuthFilter and available via Spring Security's Authentication object.
     *
     * No role restriction — any authenticated user can call this.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthDTO.UserProfileResponse> getCurrentUser(Authentication authentication) {
        // Authentication.getName() returns the JWT subject (email set by JwtAuthFilter)
        String email = authentication.getName();
        AuthDTO.UserProfileResponse profile = authService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    // ─── ADMIN: Get All Users ────────────────────────────────────

    /**
     * GET /api/auth/users
     *
     * Returns a list of all registered users.
     * Restricted to ADMIN role via @PreAuthorize.
     * Passwords are never included in the response.
     *
     * Role-based security:
     *   @PreAuthorize checks the GrantedAuthority built by CustomUserDetailsService
     *   from the user's role field (ROLE_ADMIN → hasRole("ADMIN")).
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuthDTO.UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ─── ADMIN: Get User by ID ───────────────────────────────────

    /**
     * GET /api/auth/users/{id}
     *
     * Returns the profile of a specific user by their MongoDB ID.
     * Restricted to ADMIN role.
     */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthDTO.UserProfileResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ─── ADMIN: Delete User ──────────────────────────────────────

    /**
     * DELETE /api/auth/users/{id}
     *
     * Permanently removes a user from the system.
     * Restricted to ADMIN role.
     * Returns 204 No Content on success.
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
