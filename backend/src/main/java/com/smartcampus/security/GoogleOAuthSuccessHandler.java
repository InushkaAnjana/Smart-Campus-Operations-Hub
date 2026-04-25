package com.smartcampus.security;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * ================================================================
 * GoogleOAuthSuccessHandler - OAuth2 Login Success Handler
 * ================================================================
 */
@Slf4j
@Component
public class GoogleOAuthSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.oauth.frontend-redirect-url}")
    private String frontendRedirectUrl;

    @Value("${app.oauth.allowed-domain:}")
    private String allowedDomain;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        // ── Extract Google user attributes ────────────────────────────────────
        String  email         = null;
        String  name          = null;
        String  givenName     = null;
        String  familyName    = null;
        Boolean emailVerified = null;

        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            email         = oidcUser.getEmail();
            name          = oidcUser.getFullName();
            givenName     = oidcUser.getGivenName();
            familyName    = oidcUser.getFamilyName();
            emailVerified = oidcUser.getEmailVerified();
        } else if (principal instanceof OAuth2User oAuth2User) {
            email         = oAuth2User.getAttribute("email");
            name          = oAuth2User.getAttribute("name");
            givenName     = oAuth2User.getAttribute("given_name");
            familyName    = oAuth2User.getAttribute("family_name");
            emailVerified = oAuth2User.getAttribute("email_verified");
        }

        // ── Validation ────────────────────────────────────────────────────────
        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendRedirectUrl + "?error=missing_email");
            return;
        }

        if (Boolean.FALSE.equals(emailVerified)) {
            response.sendRedirect(frontendRedirectUrl + "?error=email_not_verified");
            return;
        }

        if (allowedDomain != null && !allowedDomain.isBlank()) {
            if (!email.toLowerCase().endsWith("@" + allowedDomain.toLowerCase().trim())) {
                response.sendRedirect(frontendRedirectUrl + "?error=invalid_domain");
                return;
            }
        }

        // ── Resolve Display Name ─────────────────────────────────────────────
        String resolvedName = resolveDisplayName(name, givenName, familyName, email);
        log.info("Google OAuth: resolved display name '{}' for email {}", resolvedName, email);

        // ── Upsert user: find existing or create a new one ───────────────────
        final String userEmail = email;
        final String finalName = resolvedName;

        User user = userRepository.findByEmail(userEmail)
                .map(existingUser -> {
                    // Update name if it's currently a placeholder or blank
                    String currentName = existingUser.getName();
                    if (currentName == null || 
                        currentName.isBlank() || 
                        currentName.equalsIgnoreCase("Google User") || 
                        currentName.equalsIgnoreCase("User")) {
                        
                        log.info("Updating placeholder name '{}' to '{}' for existing user {}", 
                                currentName, finalName, userEmail);
                        existingUser.setName(finalName);
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    log.info("First Google login — creating account for email={}", userEmail);
                    User newUser = User.builder()
                            .name(finalName)
                            .email(userEmail)
                            .password(UUID.randomUUID().toString())
                            .role(Role.USER.name())
                            .build();
                    newUser.onCreate();
                    return userRepository.save(newUser);
                });

        // ── Generate JWT with full user info ────────────────────────────────
        String jwt = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getName(), user.getRole());

        // ── Redirect to frontend ─────────────────────────────────────────────
        response.sendRedirect(frontendRedirectUrl + "?token=" + jwt);
    }

    /**
     * Resolves a user's display name with the following priority:
     * 1. Full name (name claim)
     * 2. Given Name + Family Name
     * 3. Email prefix (part before @)
     * 4. Fallback to "User"
     */
    private String resolveDisplayName(String name, String givenName, String familyName, String email) {
        if (name != null && !name.isBlank()) return name.trim();
        
        if (givenName != null && !givenName.isBlank()) {
            if (familyName != null && !familyName.isBlank()) {
                return (givenName.trim() + " " + familyName.trim());
            }
            return givenName.trim();
        }
        
        if (email != null && email.contains("@")) {
            return email.split("@")[0];
        }
        
        return "User";
    }
}
