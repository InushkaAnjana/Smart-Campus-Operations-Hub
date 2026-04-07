package com.smartcampus.controller;

import com.smartcampus.dto.AuthDTO;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ================================================================
 * AuthController - Authentication Endpoints
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 * Base URL: /api/auth
 *
 * TODO Member 1:
 *  - POST /api/auth/login   → Authenticate user, return JWT
 *  - POST /api/auth/register → Register new user
 *  - POST /api/auth/refresh  → Refresh JWT token
 *  - POST /api/auth/logout   → Invalidate token
 *  - GET  /api/auth/me       → Get current logged-in user info
 * ================================================================
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        // TODO: Member 1 - Ensure JWT is returned in response
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * POST /api/auth/register
     * Register a new user account
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        // TODO: Member 1 - Add email verification flow if needed
        return ResponseEntity.ok(authService.register(request));
    }

    // TODO: Member 1 - Add these endpoints
    // @PostMapping("/refresh") ...
    // @PostMapping("/logout") ...
    // @GetMapping("/me") ...
}
