package com.smartcampus.service;

import com.smartcampus.dto.AuthDTO;

/**
 * ================================================================
 * AuthService Interface
 * ================================================================
 * Owner: Member 1 - Auth Module
 *
 * Contract for authentication operations:
 *  - login()              → Validate credentials and return JWT
 *  - register()           → Create a new user account and return JWT
 *  - getUserProfile()     → Fetch authenticated user's profile by email
 *  - simulateGoogleLogin() → OAuth2 Google login placeholder
 * ================================================================
 */
public interface AuthService {

    /**
     * Authenticate a user with email + password.
     * Returns an AuthResponse containing the JWT and user info.
     * Throws AuthException (401) on invalid credentials.
     */
    AuthDTO.AuthResponse login(AuthDTO.LoginRequest request);

    /**
     * Register a new user account.
     * Validates role, checks email uniqueness, encodes password, persists the user,
     * and returns an AuthResponse with the JWT.
     * Throws AuthException (409) if email is already registered.
     * Throws AuthException (400) if the role is not USER/ADMIN/TECHNICIAN.
     */
    AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request);

    /**
     * Retrieve the full profile of the currently-authenticated user by their email.
     * Called by GET /api/auth/me after the JWT filter resolves the email from the token.
     * Throws ResourceNotFoundException (404) if the user does not exist.
     */
    AuthDTO.UserProfileResponse getUserProfile(String email);

    /**
     * Placeholder for Google OAuth2 sign-in flow.
     * Accepts a Google ID token and returns a standard JWT-based AuthResponse.
     *
     * PRODUCTION TODO: Replace simulation with actual token verification via
     * Google's tokeninfo endpoint or the google-auth-library-java SDK.
     */
    AuthDTO.AuthResponse simulateGoogleLogin(String googleIdToken);
}
