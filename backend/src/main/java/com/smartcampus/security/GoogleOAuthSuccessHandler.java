package com.smartcampus.security;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import org.springframework.beans.factory.annotation.Autowired;
import java.io.IOException;
import java.util.UUID;


import org.springframework.context.annotation.Lazy;

/**
 * ================================================================
 * GoogleOAuthSuccessHandler - OAuth2 Login Success Handler
 * ================================================================
 */
@Slf4j
@Component
public class GoogleOAuthSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository  userRepository;
    
    @Autowired
    private JwtUtils        jwtUtils;

    @Value("${app.oauth.frontend-redirect-url}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        // ── Extract Google user attributes ────────────────────────────────────
        String email = null;
        String name  = null;

        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            email = oidcUser.getEmail();
            name  = oidcUser.getFullName();
        } else if (principal instanceof OAuth2User oAuth2User) {
            email = oAuth2User.getAttribute("email");
            name  = oAuth2User.getAttribute("name");
        }

        if (email == null) {
            log.error("Google OAuth success but email claim is missing — aborting.");
            response.sendRedirect(frontendRedirectUrl + "?error=missing_email");
            return;
        }

        // ── Upsert user: find existing or create a new one ───────────────────
        final String resolvedEmail = email;
        final String resolvedName  = name != null ? name : "Google User";

        User user = userRepository.findByEmail(resolvedEmail)
                .orElseGet(() -> {
                    log.info("First Google OAuth login — creating user for email={}", resolvedEmail);
                    User newUser = User.builder()
                            .name(resolvedName)
                            .email(resolvedEmail)
                            .password(UUID.randomUUID().toString())
                            .role(Role.USER.name())
                            .build();
                    newUser.onCreate();
                    return userRepository.save(newUser);
                });

        // ── Generate JWT (same structure as email/password login) ────────────
        String jwt = jwtUtils.generateToken(user.getEmail(), user.getRole());
        log.info("Google OAuth login successful: userId={} role={}", user.getId(), user.getRole());

        // ── Redirect to frontend with token in query param ───────────────────
        response.sendRedirect(frontendRedirectUrl + "?token=" + jwt);
    }
}
