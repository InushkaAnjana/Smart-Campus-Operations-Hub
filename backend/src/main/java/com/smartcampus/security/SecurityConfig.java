package com.smartcampus.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
 *
 *  NOTE: OAuth2 login requires a brief session to store the OAuth state/code,
 *  so we use IF_REQUIRED for the session around the OAuth2 flow only.
 * ================================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // Enables @PreAuthorize on controller methods
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final GoogleOAuthSuccessHandler googleOAuthSuccessHandler;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Constructor injection with @Lazy on GoogleOAuthSuccessHandler to break
     * the circular dependency:
     *   SecurityConfig → GoogleOAuthSuccessHandler → JwtUtils (fine)
     *   GoogleOAuthSuccessHandler is @Component and is injected here lazily
     *   to avoid the circular initialization problem.
     */
    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthFilter jwtAuthFilter,
            @Lazy GoogleOAuthSuccessHandler googleOAuthSuccessHandler,
            PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
        this.googleOAuthSuccessHandler = googleOAuthSuccessHandler;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Main Security Filter Chain.
     *
     * Configures:
     *  - CORS (delegated to corsConfigurationSource())
     *  - CSRF disabled (stateless JWT — no cookie-based sessions)
     *  - Session management: STATELESS for API; OAuth2 flow needs a transient session
     *  - URL-based authorization rules (see access matrix above)
     *  - JWT pre-authentication filter injected before UsernamePasswordAuthenticationFilter
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // OAuth2 login requires a short-lived session to store the OAuth state param.
            // We use IF_REQUIRED so that the stateless JWT flow still works for API
            // requests, while the OAuth redirect dance can use a transient session.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth

                // ── Public endpoints (no JWT needed) ─────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()        // CORS preflight
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/oauth/**").permitAll()             // OAuth placeholder REST
                .requestMatchers("/actuator/**").permitAll()                   // Health/metrics (dev)
                .requestMatchers("/h2-console/**").permitAll()                 // H2 console (dev only)

                // ── OAuth2 redirect endpoints (handled by Spring Security internally) ─
                .requestMatchers("/login/oauth2/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()

                // ── Resources: ADMIN writes, any auth user reads ──────
                .requestMatchers(HttpMethod.POST,   "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/resources/**").authenticated()

                // ── Users (admin management) ─────────────────────────
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/auth/users/**").hasRole("ADMIN")

                // ── File serving: public so <img> tags load without a JWT ────
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()

                // ── Tickets: TECHNICIAN and ADMIN can update status ───
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/**")
                    .hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers("/api/tickets/**").authenticated()

                // ── Notifications: all authenticated; SEND restricted ─
                .requestMatchers("/api/notifications/**").authenticated()

                // ── Bookings: all authenticated ───────────────────────
                .requestMatchers("/api/bookings/**").authenticated()

                // ── Catch-all: require authentication for anything else ─
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(googleOAuthSuccessHandler)
            )
            .headers(headers ->
                headers.frameOptions(frame -> frame.disable()))  // Allows H2 console iframe (dev)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS Configuration Source.
     *
     * Covers all paths including OAuth2 redirect paths so that preflight
     * requests to /oauth2/** and /login/oauth2/** don't get rejected.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed frontend origins (localhost for dev; update for production deployment)
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

        // All standard HTTP methods + OPTIONS for preflight
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow all headers including Authorization (JWT) and Content-Type
        config.setAllowedHeaders(List.of("*"));

        // Expose Authorization header so frontend can read token from response headers
        config.setExposedHeaders(List.of("Authorization"));

        // Required for sending cookies in OAuth flows and cross-origin authenticated requests
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour (reduces OPTIONS request overhead)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply CORS to all paths — includes /api/**, /oauth2/**, /login/oauth2/**
        source.registerCorsConfiguration("/**", config);
        return source;
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
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    /**
     * AuthenticationManager Bean.
     *
     * Exposes Spring Security's AuthenticationManager as a Spring Bean
     * so it can be injected into service classes if needed.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
