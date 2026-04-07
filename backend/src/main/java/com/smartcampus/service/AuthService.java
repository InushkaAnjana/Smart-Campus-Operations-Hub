package com.smartcampus.service;

import com.smartcampus.dto.AuthDTO;

/**
 * ================================================================
 * AuthService Interface
 * ================================================================
 * Owner: Member 1 - Auth Module
 *
 * TODO Member 1:
 *  - Implement login with JWT generation
 *  - Implement register with BCrypt password encoding
 *  - Add token refresh logic
 *  - Add logout/token blacklist mechanism
 * ================================================================
 */
public interface AuthService {

    AuthDTO.AuthResponse login(AuthDTO.LoginRequest request);

    AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request);
}
