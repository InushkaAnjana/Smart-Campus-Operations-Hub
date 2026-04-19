package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ================================================================
 * CustomUserDetailsService - Spring Security UserDetailsService
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth / Security Module
 *
 * ── PURPOSE ──────────────────────────────────────────────────────
 *  Spring Security calls loadUserByUsername() at two points:
 *
 *   1. During direct login via DaoAuthenticationProvider
 *      (if AuthenticationManager.authenticate() is used — currently not,
 *       since AuthServiceImpl validates credentials manually.)
 *
 *   2. During EVERY authenticated request, called by JwtAuthFilter
 *      after extracting the email from the JWT subject claim.
 *      The returned UserDetails is set into the SecurityContext so that
 *      @PreAuthorize and SecurityConfig rules can evaluate it.
 *
 * ── ROLE MAPPING ─────────────────────────────────────────────────
 *  The user's 'role' field in MongoDB is a plain string: "USER", "ADMIN", or "TECHNICIAN".
 *
 *  Spring Security requires GrantedAuthority objects prefixed with "ROLE_".
 *  We manually add this prefix:
 *    "USER"       → SimpleGrantedAuthority("ROLE_USER")
 *    "ADMIN"      → SimpleGrantedAuthority("ROLE_ADMIN")
 *    "TECHNICIAN" → SimpleGrantedAuthority("ROLE_TECHNICIAN")
 *
 *  This enables expressions like:
 *    .hasRole("ADMIN")           → checks for "ROLE_ADMIN"
 *    .hasAnyRole("ADMIN", "TECHNICIAN")
 *    @PreAuthorize("hasRole('TECHNICIAN')")
 *
 * ── SECURITY CONTEXT FLOW ────────────────────────────────────────
 *  Request arrives with "Authorization: Bearer <token>"
 *    → JwtAuthFilter.doFilterInternal()
 *       → jwtUtils.validateToken(token)        [signature + expiry]
 *       → jwtUtils.getUsernameFromToken(token) [extract email from 'sub' claim]
 *       → loadUserByUsername(email)            [this method]
 *       → UsernamePasswordAuthenticationToken  [built with UserDetails + authorities]
 *       → SecurityContextHolder.setAuthentication(token)
 *    → SecurityConfig / @PreAuthorize evaluates the authorities
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads a user from MongoDB by their email address.
     *
     * Called by JwtAuthFilter on every authenticated request.
     * The email is extracted from the JWT 'sub' (subject) claim.
     *
     * Steps:
     *  1. Query MongoDB for the user document by email.
     *  2. Build a Spring Security UserDetails object with:
     *       - username  = user.email
     *       - password  = user.password (BCrypt hash; not re-validated here)
     *       - authority = ROLE_<user.role>
     *
     * @param email The JWT subject (user email)
     * @return Spring Security UserDetails for the matching user
     * @throws UsernameNotFoundException if no user with this email exists in MongoDB
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));

        /*
         * Build the GrantedAuthority list.
         *
         * Spring Security's hasRole("ADMIN") internally checks for "ROLE_ADMIN".
         * We must prepend "ROLE_" to the stored role string.
         *
         *   user.getRole() = "ADMIN"
         *   → "ROLE_" + "ADMIN" = "ROLE_ADMIN"
         *   → SimpleGrantedAuthority("ROLE_ADMIN")
         *
         * If future requirements need multiple roles per user,
         * change the User.role field to List<String> and map each here.
         */
        String grantedRole = "ROLE_" + user.getRole().toUpperCase();

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())       // BCrypt hash — not re-encoded here
                .authorities(List.of(new SimpleGrantedAuthority(grantedRole)))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
