package com.smartcampus.service.impl;

import com.smartcampus.dto.AuthDTO;
import com.smartcampus.exception.AuthException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtils;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * ================================================================
 * AuthServiceImpl - Authentication Service Implementation
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * ── REGISTRATION FLOW ────────────────────────────────────────────
 *  1. Validate role is a member of the Role enum (USER/ADMIN/TECHNICIAN)
 *  2. Check email uniqueness against MongoDB (throws 409 if duplicate)
 *  3. BCrypt-encode the raw password — raw password is NEVER stored
 *  4. Persist the User document via UserRepository
 *  5. Generate a JWT embedding the email (subject) and role (claim)
 *  6. Return AuthResponse with token, user info, and expiry seconds
 *
 * ── LOGIN FLOW ──────────────────────────────────────────────────
 *  1. Look up the User document by email (throws 401 if not found)
 *  2. Compare the supplied password against the BCrypt hash
 *     (throws 401 if it does not match — uses safe message to prevent enumeration)
 *  3. Generate JWT for the authenticated user
 *  4. Return AuthResponse identical in structure to registration
 *
 * ── OAUTH PLACEHOLDER ───────────────────────────────────────────
 *  simulateGoogleLogin() is a stub that demonstrates where Google OAuth2
 *  integration would fit. In production:
 *  1. Verify the Google idToken via Google's tokeninfo endpoint
 *  2. Extract the user's email and name from the verified payload
 *  3. Upsert the user (create if first OAuth sign-in)
 *  4. Return a standard JWT via AuthResponse
 *
 * ── PASSWORD SECURITY ────────────────────────────────────────────
 *  BCryptPasswordEncoder (strength 10) is used. A unique salt is applied
 *  per hash, making brute-force attacks computationally expensive.
 * ================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils        jwtUtils;

    // ════════════════════════════════════════════════════════════
    // LOGIN
    // ════════════════════════════════════════════════════════════

    @Override
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Step 1: Look up user by email
        // Throws AuthException (401) if not found.
        // NOTE: We do NOT distinguish "user not found" from "wrong password"
        // in the API response — this prevents user-enumeration attacks.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(AuthException::invalidCredentials);

        // Step 2: Validate password against the stored BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Failed login: incorrect password for email={}", request.getEmail());
            throw AuthException.invalidCredentials();
        }

        // Step 3: Generate JWT embedding email (subject) and role (claim)
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        log.info("Login successful for userId={} role={}", user.getId(), user.getRole());

        return new AuthDTO.AuthResponse(
                token,
                jwtUtils.getExpirationSeconds(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    // ════════════════════════════════════════════════════════════
    // REGISTER
    // ════════════════════════════════════════════════════════════

    @Override
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        // Step 1: Validate role — must match the Role enum exactly
        // @Pattern on the DTO catches most invalid values before reaching here,
        // but we double-check here for belt-and-suspenders safety.
        String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
        try {
            Role.valueOf(roleStr); // Throws IllegalArgumentException if not a valid enum value
        } catch (IllegalArgumentException e) {
            throw AuthException.invalidRole(roleStr);
        }

        // Step 2: Enforce email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration blocked: email already exists  email={}", request.getEmail());
            throw AuthException.duplicateEmail(request.getEmail());
        }

        // Step 3: Build the User document
        // Password is BCrypt-encoded; raw value is never written to the DB.
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .role(roleStr)
                .build();

        user.onCreate(); // Set createdAt + updatedAt (no @PrePersist in MongoDB)
        user = userRepository.save(user);
        log.info("User registered: id={} role={}", user.getId(), user.getRole());

        // Step 4: Generate JWT and return
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());

        return new AuthDTO.AuthResponse(
                token,
                jwtUtils.getExpirationSeconds(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    // ════════════════════════════════════════════════════════════
    // GET PROFILE (for /api/auth/me)
    // ════════════════════════════════════════════════════════════

    @Override
    public AuthDTO.UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return new AuthDTO.UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    // ════════════════════════════════════════════════════════════
    // OAUTH GOOGLE PLACEHOLDER
    // ════════════════════════════════════════════════════════════

    /**
     * Simulates Google OAuth login for development/demo purposes.
     *
     * THIS IS A PLACEHOLDER — NOT PRODUCTION SAFE.
     *
     * Production implementation steps:
     *   1. POST the idToken to https://oauth2.googleapis.com/tokeninfo?id_token=<token>
     *   2. Verify 'aud' matches your Google client ID
     *   3. Extract 'email' and 'name' from the verified response
     *   4. Upsert user in MongoDB (create with role=USER if new)
     *   5. Return a standard AuthResponse with a JWT
     *
     * @param googleIdToken The OAuth ID token received from Google Sign-In on the frontend
     * @return AuthResponse with a JWT for the simulated user
     */
    @Override
    public AuthDTO.AuthResponse simulateGoogleLogin(String googleIdToken) {
        log.info("OAuth Google login placeholder invoked (simulation only)");

        // SIMULATION: Create or fetch a placeholder OAuth user
        String simulatedEmail = "oauth.user@google.com";
        String simulatedName  = "Google OAuth User";
        String simulatedRole  = Role.USER.name();

        User oauthUser = userRepository.findByEmail(simulatedEmail)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .name(simulatedName)
                            .email(simulatedEmail)
                            .password(passwordEncoder.encode("oauth-placeholder")) // not used for login
                            .role(simulatedRole)
                            .build();
                    newUser.onCreate();
                    return userRepository.save(newUser);
                });

        String token = jwtUtils.generateToken(oauthUser.getEmail(), oauthUser.getRole());

        return new AuthDTO.AuthResponse(
                token,
                jwtUtils.getExpirationSeconds(),
                oauthUser.getId(),
                oauthUser.getName(),
                oauthUser.getEmail(),
                oauthUser.getRole()
        );
    }
}
