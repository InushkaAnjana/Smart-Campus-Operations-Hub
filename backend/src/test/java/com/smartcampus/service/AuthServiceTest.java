package com.smartcampus.service;

import com.smartcampus.dto.AuthDTO;
import com.smartcampus.exception.AuthException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtils;
import com.smartcampus.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ================================================================
 * AuthServiceTest - Unit Tests for AuthServiceImpl
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * TEST STRATEGY:
 *  - Uses Mockito to isolate the service from MongoDB and JwtUtils.
 *  - Each test covers one specific behaviour (happy path or error path).
 *  - AssertJ fluent assertions for readable, expressive test output.
 *
 * CASES COVERED:
 *  1.  register_Success              → Valid registration returns AuthResponse with JWT
 *  2.  register_DuplicateEmail       → 409 thrown when email already exists
 *  3.  register_InvalidRole          → 400 thrown for unknown role string
 *  4.  register_DefaultsToUserRole   → Missing role defaults to "USER"
 *  5.  login_Success                 → Valid credentials return AuthResponse with JWT
 *  6.  login_WrongPassword           → 401 thrown for incorrect password
 *  7.  login_EmailNotFound           → 401 thrown (same error; no user enumeration)
 *  8.  getUserProfile_Success        → Returns profile DTO for a valid email
 *  9.  getUserProfile_NotFound       → 404 thrown for unknown email
 *  10. simulateGoogleLogin_Returns   → Returns AuthResponse for OAuth placeholder
 * ================================================================
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository  userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtils        jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    // ─── Shared test fixtures ────────────────────────────────────

    private User testUser;
    private static final String TEST_EMAIL    = "alice@campus.edu";
    private static final String TEST_NAME     = "Alice Smith";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_ENCODED  = "$2a$10$encodedHash";
    private static final String TEST_USER_ID  = "user-mongo-id-001";
    private static final String TEST_ROLE     = "USER";
    private static final String FAKE_JWT      = "eyJhbGciOiJIUzI1NiJ9.fake.token";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(TEST_USER_ID)
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .password(TEST_ENCODED)
                .role(TEST_ROLE)
                .build();
    }

    // ════════════════════════════════════════════════════════════
    // REGISTER — Happy Path
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("1. register → success returns AuthResponse with JWT token")
    void register_Success_ReturnsAuthResponse() {
        // Arrange
        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setName(TEST_NAME);
        request.setEmail(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);
        request.setRole(TEST_ROLE);

        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(TEST_ENCODED);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtils.generateToken(TEST_EMAIL, TEST_ROLE)).thenReturn(FAKE_JWT);
        when(jwtUtils.getExpirationSeconds()).thenReturn(86400L);

        // Act
        AuthDTO.AuthResponse response = authService.register(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo(FAKE_JWT);
        assertThat(response.getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(response.getRole()).isEqualTo(TEST_ROLE);
        assertThat(response.getUserId()).isEqualTo(TEST_USER_ID);
        assertThat(response.getExpiresIn()).isEqualTo(86400L);

        // Verify password was BCrypt-encoded (raw password NEVER saved directly)
        verify(passwordEncoder).encode(TEST_PASSWORD);
        verify(userRepository).save(any(User.class));
        verify(jwtUtils).generateToken(TEST_EMAIL, TEST_ROLE);
    }

    // ════════════════════════════════════════════════════════════
    // REGISTER — Duplicate Email
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("2. register → duplicate email throws AuthException (409 DUPLICATE_EMAIL)")
    void register_DuplicateEmail_ThrowsAuthException() {
        // Arrange
        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setName(TEST_NAME);
        request.setEmail(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);
        request.setRole(TEST_ROLE);

        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(true);

        // Act + Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining(TEST_EMAIL)
                .extracting(ex -> ((AuthException) ex).getErrorCode())
                .isEqualTo("DUPLICATE_EMAIL");

        // Verify no user was saved
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    // ════════════════════════════════════════════════════════════
    // REGISTER — Invalid Role
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("3. register → invalid role string throws AuthException (400 INVALID_ROLE)")
    void register_InvalidRole_ThrowsAuthException() {
        // Arrange
        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setName(TEST_NAME);
        request.setEmail(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);
        request.setRole("SUPERADMIN");  // Not a valid Role enum value

        // Act + Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AuthException.class)
                .hasMessageContaining("SUPERADMIN")
                .extracting(ex -> ((AuthException) ex).getErrorCode())
                .isEqualTo("INVALID_ROLE");

        verify(userRepository, never()).save(any());
    }

    // ════════════════════════════════════════════════════════════
    // REGISTER — Role defaults to USER
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("4. register → null role defaults to USER")
    void register_NullRole_DefaultsToUser() {
        // Arrange
        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setName(TEST_NAME);
        request.setEmail(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);
        // role field has default value "USER" in the DTO

        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn(TEST_ENCODED);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtils.generateToken(TEST_EMAIL, "USER")).thenReturn(FAKE_JWT);
        when(jwtUtils.getExpirationSeconds()).thenReturn(86400L);

        // Act
        AuthDTO.AuthResponse response = authService.register(request);

        // Assert — role must be USER
        assertThat(response.getRole()).isEqualTo("USER");
    }

    // ════════════════════════════════════════════════════════════
    // LOGIN — Happy Path
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("5. login → correct credentials return AuthResponse with JWT")
    void login_ValidCredentials_ReturnsAuthResponse() {
        // Arrange
        AuthDTO.LoginRequest request = new AuthDTO.LoginRequest();
        request.setEmail(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(TEST_PASSWORD, TEST_ENCODED)).thenReturn(true);
        when(jwtUtils.generateToken(TEST_EMAIL, TEST_ROLE)).thenReturn(FAKE_JWT);
        when(jwtUtils.getExpirationSeconds()).thenReturn(86400L);

        // Act
        AuthDTO.AuthResponse response = authService.login(request);

        // Assert
        assertThat(response.getToken()).isEqualTo(FAKE_JWT);
        assertThat(response.getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(response.getRole()).isEqualTo(TEST_ROLE);
        assertThat(response.getUserId()).isEqualTo(TEST_USER_ID);
    }

    // ════════════════════════════════════════════════════════════
    // LOGIN — Wrong Password
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("6. login → wrong password throws AuthException (401 INVALID_CREDENTIALS)")
    void login_WrongPassword_ThrowsAuthException() {
        // Arrange
        AuthDTO.LoginRequest request = new AuthDTO.LoginRequest();
        request.setEmail(TEST_EMAIL);
        request.setPassword("wrongPassword");

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", TEST_ENCODED)).thenReturn(false);

        // Act + Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthException.class)
                .extracting(ex -> ((AuthException) ex).getErrorCode())
                .isEqualTo("INVALID_CREDENTIALS");

        // JWT must NOT be generated on failed login
        verify(jwtUtils, never()).generateToken(anyString(), anyString());
    }

    // ════════════════════════════════════════════════════════════
    // LOGIN — Email Not Found
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("7. login → unknown email throws AuthException (401 INVALID_CREDENTIALS — no user enumeration)")
    void login_EmailNotFound_ThrowsAuthException() {
        // Arrange
        AuthDTO.LoginRequest request = new AuthDTO.LoginRequest();
        request.setEmail("unknown@campus.edu");
        request.setPassword(TEST_PASSWORD);

        when(userRepository.findByEmail("unknown@campus.edu")).thenReturn(Optional.empty());

        // Act + Assert
        // SECURITY: Error message is deliberately generic — same as wrong-password
        // to prevent attackers from learning which emails are registered.
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthException.class)
                .extracting(ex -> ((AuthException) ex).getErrorCode())
                .isEqualTo("INVALID_CREDENTIALS");
    }

    // ════════════════════════════════════════════════════════════
    // GET USER PROFILE
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("8. getUserProfile → returns profile DTO for valid email")
    void getUserProfile_ValidEmail_ReturnsProfile() {
        // Arrange
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        // Act
        AuthDTO.UserProfileResponse profile = authService.getUserProfile(TEST_EMAIL);

        // Assert
        assertThat(profile.getId()).isEqualTo(TEST_USER_ID);
        assertThat(profile.getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(profile.getName()).isEqualTo(TEST_NAME);
        assertThat(profile.getRole()).isEqualTo(TEST_ROLE);
    }

    @Test
    @DisplayName("9. getUserProfile → unknown email throws ResourceNotFoundException (404)")
    void getUserProfile_UnknownEmail_ThrowsNotFoundException() {
        // Arrange
        when(userRepository.findByEmail("ghost@campus.edu")).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() -> authService.getUserProfile("ghost@campus.edu"))
                .isInstanceOf(com.smartcampus.exception.ResourceNotFoundException.class);
    }

    // ════════════════════════════════════════════════════════════
    // OAUTH PLACEHOLDER
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("10. simulateGoogleLogin → returns AuthResponse (OAuth placeholder)")
    void simulateGoogleLogin_ReturnsAuthResponse() {
        // Arrange — simulate the OAuth user already existing in the DB
        User oauthUser = User.builder()
                .id("oauth-user-001")
                .name("Google OAuth User")
                .email("oauth.user@google.com")
                .password("oauth-placeholder")
                .role("USER")
                .build();

        when(userRepository.findByEmail("oauth.user@google.com"))
                .thenReturn(Optional.of(oauthUser));
        when(jwtUtils.generateToken("oauth.user@google.com", "USER")).thenReturn(FAKE_JWT);
        when(jwtUtils.getExpirationSeconds()).thenReturn(86400L);

        // Act
        AuthDTO.AuthResponse response = authService.simulateGoogleLogin("google-id-token-xyz");

        // Assert — a valid AuthResponse is returned with the expected JWT
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo(FAKE_JWT);
        assertThat(response.getEmail()).isEqualTo("oauth.user@google.com");
    }
}
