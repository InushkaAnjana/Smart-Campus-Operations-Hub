package com.smartcampus.service.impl;

import com.smartcampus.dto.AuthDTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtils;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * ================================================================
 * AuthServiceImpl - Authentication Service Implementation
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth Module
 *
 * TODO Member 1:
 *  1. Wire up Spring Security UserDetailsService here
 *  2. Implement login: validate credentials → generate JWT
 *  3. Implement register: check email uniqueness → encode password → save
 *  4. Add token refresh endpoint support
 *  5. Add logout/token invalidation logic
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        // TODO: Member 1 - Implement authentication logic
        // Step 1: Find user by email or throw exception
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Step 2: Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        // Step 3: Generate JWT token
        // TODO: Member 1 - Implement JwtUtils.generateToken()
        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthDTO.AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @Override
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        // TODO: Member 1 - Implement registration logic
        // Step 1: Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        // Step 2: Encode password and save user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        user.onCreate(); // Set createdAt / updatedAt (no @PrePersist in MongoDB)
        user = userRepository.save(user);

        // Step 3: Generate JWT and return
        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthDTO.AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
