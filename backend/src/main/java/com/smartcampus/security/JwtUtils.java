package com.smartcampus.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * ================================================================
 * JwtUtils - JWT Token Generation & Validation
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth / Security Module
 *
 * ── JWT FLOW ────────────────────────────────────────────────────
 *
 *  1. GENERATION (on login/register):
 *     Client sends credentials → AuthServiceImpl validates them →
 *     JwtUtils.generateToken(email, role) creates a signed JWT →
 *     JWT is returned to the client inside AuthResponse.
 *
 *  2. TOKEN STRUCTURE:
 *     Header:  { "alg": "HS256", "typ": "JWT" }
 *     Payload: {
 *        "sub":  "user@email.com",   ← subject is the user's email
 *        "role": "ADMIN",            ← custom claim; used by JwtAuthFilter
 *        "iat":  1713000000,         ← issued-at (epoch seconds)
 *        "exp":  1713086400          ← expiry (iat + expiration-ms)
 *     }
 *     Signature: HMAC-SHA256(Base64(header) + "." + Base64(payload), secret)
 *
 *  3. VERIFICATION (on every protected request):
 *     JwtAuthFilter extracts token → JwtUtils.validateToken() verifies
 *     signature + expiry → JwtUtils.getUsernameFromToken() extracts email →
 *     CustomUserDetailsService.loadUserByUsername(email) loads user from DB →
 *     Authentication is set in SecurityContextHolder.
 *
 *  4. SECURITY PROPERTIES:
 *     - HS256 (HMAC-SHA256): symmetric algorithm; same key signs and verifies.
 *     - Secret key MUST be ≥ 256 bits (32 chars); configured in application.properties.
 *     - Tokens are stateless; the server does not store issued tokens.
 *     - Expiry is enforced by the JJWT library during parseClaimsJws().
 *
 * ── CONFIGURATION (application.properties) ──────────────────────
 *     app.jwt.secret         = <256-bit secret key>
 *     app.jwt.expiration-ms  = 86400000  (24 hours)
 * ================================================================
 */
@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Builds an HMAC-SHA256 signing key from the configured secret string.
     * The secret must be at least 256 bits (32 ASCII characters) for HS256.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generates a signed JWT token for the given user data.
     *
     * Claims included:
     *   sub    = email        (standard claim; used as the unique user identifier)
     *   userId = MongoDB ID   (custom claim)
     *   name   = Display name (custom claim)
     *   role   = role string  (custom claim; e.g. "ADMIN", "USER", "TECHNICIAN")
     *   iat    = now          (issued at)
     *   exp    = now + expiration-ms
     */
    public String generateToken(String userId, String email, String name, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("name", name)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Legacy method preserved for compatibility with existing service calls.
     * @deprecated Use {@link #generateToken(String, String, String, String)}
     */
    @Deprecated
    public String generateToken(String email, String role) {
        return generateToken(null, email, "User", role);
    }

    /**
     * Extracts the username (email) from a JWT token.
     *
     * The email is stored as the JWT subject ('sub' standard claim).
     * This method is called by JwtAuthFilter to identify the authenticated user.
     *
     * @param token The compact JWT string
     * @return The email address (username) embedded in the token
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Extracts the 'userId' custom claim from a validated JWT token.
     */
    public String getUserIdFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userId", String.class);
    }

    /**
     * Extracts the 'name' custom claim from a validated JWT token.
     */
    public String getNameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("name", String.class);
    }

    /**
     * Extracts the 'role' custom claim from a validated JWT token.
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }

    /**
     * Validates a JWT token — checks both signature integrity and expiry.
     *
     * Returns true  if the token is syntactically correct, properly signed,
     *               and has not yet expired.
     * Returns false if any of the following occur:
     *   - Signature mismatch (token was tampered with)
     *   - Token has expired (exp claim is in the past)
     *   - Token is malformed or null
     *
     * NOTE: Does NOT check a token blacklist. Add a Redis-backed blacklist
     * here if logout / token revocation is required in a future iteration.
     *
     * @param token The compact JWT string to validate
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Covers: ExpiredJwtException, MalformedJwtException, SignatureException, etc.
            return false;
        }
    }

    /**
     * Returns the configured token expiry duration in seconds.
     * Used to populate AuthResponse.expiresIn so the client knows when to refresh.
     *
     * @return Token validity in seconds (e.g. 86400 for 24 hours)
     */
    public long getExpirationSeconds() {
        return jwtExpirationMs / 1000;
    }
}
