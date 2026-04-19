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
     * Generates a signed JWT token for the given email and role.
     *
     * Claims included:
     *   sub  = email        (standard claim; used as the unique user identifier)
     *   role = role string  (custom claim; e.g. "ADMIN", "USER", "TECHNICIAN")
     *   iat  = now          (issued at)
     *   exp  = now + expiration-ms
     *
     * @param email The user's email address (stored as JWT subject)
     * @param role  The user's role string (e.g. "ADMIN")
     * @return Signed, compact JWT string
     */
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)          // Embed role so filter can read it without a DB call
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Overloaded variant kept for backwards-compatibility with code that calls
     * generateToken(email) without a role. Embeds an empty role claim.
     *
     * @deprecated Prefer {@link #generateToken(String, String)} to embed the role claim.
     */
    @Deprecated
    public String generateToken(String email) {
        return generateToken(email, "");
    }

    /**
     * Extracts the subject (user email) from a validated JWT token.
     *
     * @param token The compact JWT string (without "Bearer " prefix)
     * @return The email stored as the JWT subject
     * @throws JwtException if the token cannot be parsed
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
     * Extracts the 'role' custom claim from a validated JWT token.
     * Used by JwtAuthFilter to rebuild the GrantedAuthority without a DB call.
     *
     * @param token The compact JWT string
     * @return The role string (e.g. "ADMIN"), or null if absent
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
