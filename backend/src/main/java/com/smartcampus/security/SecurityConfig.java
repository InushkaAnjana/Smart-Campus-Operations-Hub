package com.smartcampus.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * ================================================================
 * SecurityConfig - Spring Security Configuration
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth / Security Module
 *
 * ── ROLE-BASED SECURITY ARCHITECTURE ────────────────────────────
 *
 *  Three roles exist: USER | ADMIN | TECHNICIAN
 *
 *  Spring Security maps the 'role' field from the User document to a
 *  GrantedAuthority by prepending "ROLE_":
 *    "USER"       → ROLE_USER
 *    "ADMIN"      → ROLE_ADMIN
 *    "TECHNICIAN" → ROLE_TECHNICIAN
 *
 *  This mapping is done in CustomUserDetailsService.loadUserByUsername().
 *  Authorization is then expressed using .hasRole("ADMIN") or via
 *  @PreAuthorize("hasRole('ADMIN')") at the method level.
 *
 * ── ENDPOINT ACCESS MATRIX ──────────────────────────────────────
 *
 *  Endpoint Pattern                        │ Who can access
 *  ─────────────────────────────────────   ┼────────────────────────────────
 *  POST /api/auth/login                    │ Public (no token needed)
 *  POST /api/auth/register                 │ Public
 *  POST /api/auth/oauth/google             │ Public
 *  GET  /api/auth/me                       │ Any authenticated user
 *  GET  /api/auth/users                    │ ADMIN only
 *  GET  /api/auth/users/{id}              │ ADMIN only
 *  DELETE /api/auth/users/{id}            │ ADMIN only
 *  GET  /api/resources/**                 │ Any authenticated user
 *  POST/PUT/DELETE /api/resources/**      │ ADMIN only
 *  GET/POST /api/bookings/**              │ Any authenticated user
 *  PUT/PATCH/DELETE /api/bookings/**      │ ADMIN or booking owner (checked in service)
 *  GET/POST /api/tickets/**              │ Any authenticated user
 *  PATCH /api/tickets/**                 │ ADMIN or TECHNICIAN (for status updates)
 *  GET  /api/notifications/**             │ Any authenticated user
 *  POST /api/notifications/send           │ ADMIN or TECHNICIAN
 *  DELETE /api/notifications/**           │ Any authenticated user (own notifications)
 *  GET  /actuator/**                      │ Public (dev only — lock down in production)
 *
 * ── JWT FILTER CHAIN ─────────────────────────────────────────────
 *  Every request passes through:
 *    1. CorsFilter        → Adds CORS headers (handles OPTIONS preflight too)
 *    2. JwtAuthFilter     → Extracts + validates JWT → populates SecurityContext
 *    3. SecurityFilterChain → Checks authorization rules defined in filterChain()
 *
 * ── CORS CONFIGURATION ────────────────────────────────────────────
 *  Centralized here — do NOT add @CrossOrigin on individual controllers.
 *  Allowed origins are configured in application.properties:
 *    app.cors.allowed-origins=http://localhost:3000,http://localhost:5173
 *
 * ── SESSION POLICY ─────────────────────────────────────────────
 *  STATELESS: No HTTP session is created. Every request must carry a valid JWT.
 *  This enables horizontal scaling and removes the need for session replication.
 * ================================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // Enables @PreAuthorize on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Main Security Filter Chain.
     *
     * Configures:
     *  - CORS (delegated to corsConfigurationSource())
     *  - CSRF disabled (stateless JWT — no cookie-based sessions)
     *  - Session management: STATELESS (no HttpSession created)
     *  - URL-based authorization rules (see access matrix above)
     *  - JWT pre-authentication filter injected before UsernamePasswordAuthenticationFilter
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Public endpoints (no JWT needed) ─────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()        // CORS preflight
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/oauth/**").permitAll()             // OAuth placeholder
                .requestMatchers("/actuator/**").permitAll()                   // Health/metrics (dev)
                .requestMatchers("/h2-console/**").permitAll()                 // H2 console (dev only)

                // ── Resources: ADMIN writes, any auth user reads ──────
                // Fine-grained per-method control via @PreAuthorize in ResourceController
                .requestMatchers(HttpMethod.POST,   "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/resources/**").authenticated()

                // ── Users (admin management) ─────────────────────────
                // GET /api/auth/me is permitted to all authenticated users
                // GET/DELETE /api/auth/users/** restricted to ADMIN via @PreAuthorize
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/auth/users/**").hasRole("ADMIN")

                // ── Tickets: TECHNICIAN and ADMIN can update status ───
                // Regular users can create/view tickets
                // PATCH (status update) restricted to ADMIN + TECHNICIAN
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/**")
                    .hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers("/api/tickets/**").authenticated()

                // ── Notifications: all authenticated; SEND restricted ─
                // POST /api/notifications/send → ADMIN + TECHNICIAN (enforced by @PreAuthorize)
                .requestMatchers("/api/notifications/**").authenticated()

                // ── Bookings: all authenticated ───────────────────────
                // Admin-only actions (approve/reject) enforced in @PreAuthorize + service
                .requestMatchers("/api/bookings/**").authenticated()

                // ── Catch-all: require authentication for anything else ─
                .anyRequest().authenticated()
            )
            .headers(headers ->
                headers.frameOptions(frame -> frame.disable()))  // Allows H2 console iframe (dev)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS Configuration Source.
     *
     * Centralizes CORS policy for the entire application.
     * Applied to all /api/** routes.
     *
     * Key settings:
     *  - allowedOrigins: configured in application.properties (comma-separated)
     *  - allowedMethods: includes OPTIONS for preflight requests
     *  - allowedHeaders: includes Authorization (for JWT) and Content-Type
     *  - allowCredentials: true (required for cookies in OAuth flows)
     *  - exposedHeaders: Authorization (allows frontend to read the token header)
     *
     * WHY NO @CrossOrigin on controllers?
     *  Mixing @CrossOrigin with this centralized CorsConfigurationSource
     *  causes conflicts — one overrides the other, leading to inconsistent
     *  preflight handling and 403 errors. All CORS is managed here only.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed frontend origins (localhost for dev; update for production deployment)
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        // All standard HTTP methods + OPTIONS for preflight
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow Authorization header (JWT), Content-Type, and common request headers
        config.setAllowedHeaders(List.of("*"));

        // Expose Authorization header so frontend can read token from response headers
        config.setExposedHeaders(List.of("Authorization"));

        // Required for sending cookies in OAuth flows and cross-origin authenticated requests
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour (reduces OPTIONS request overhead)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /**
     * BCryptPasswordEncoder Bean.
     *
     * Uses BCrypt with default strength 10 (2^10 = 1024 rounds).
     * Higher strength = slower hashing = more resistant to brute force.
     * Strength 10 produces a hash in ~100ms on modern hardware.
     *
     * Used by:
     *  - AuthServiceImpl.register()  → encode raw password before saving
     *  - AuthServiceImpl.login()    → matches(rawPassword, encodedPassword)
     *  - DaoAuthenticationProvider  → verifies credentials during authentication
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * DaoAuthenticationProvider Bean.
     *
     * Wires together:
     *  - CustomUserDetailsService  → fetches UserDetails from MongoDB by email
     *  - BCryptPasswordEncoder     → validates password hashes
     *
     * Used internally by AuthenticationManager during login.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * AuthenticationManager Bean.
     *
     * Exposes Spring Security's AuthenticationManager as a Spring Bean
     * so it can be injected into service classes if needed.
     * Not currently injected (AuthServiceImpl validates credentials manually),
     * but kept for conventional completeness and future use.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
