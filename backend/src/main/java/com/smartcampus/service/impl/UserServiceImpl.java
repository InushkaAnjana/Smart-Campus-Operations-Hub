package com.smartcampus.service.impl;

import com.smartcampus.dto.AuthDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * UserServiceImpl - User Management Implementation
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth / User Management Module
 *
 * Provides CRUD-like user operations for:
 *   - Individual user profile retrieval (by ID)
 *   - Admin-level user listing (all users)
 *   - Admin-level user deletion
 *
 * SECURITY NOTE:
 *   All methods here return UserProfileResponse DTOs that NEVER include
 *   password hashes. Raw passwords are protected by BCrypt and are not
 *   accessible via any API endpoint.
 *
 *   Admin-only endpoints (getAllUsers, deleteUser) are further protected
 *   at the SecurityConfig / @PreAuthorize level — these service methods
 *   do not perform role checks themselves (separation of concerns).
 * ================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    // ════════════════════════════════════════════════════════════
    // GET USER BY ID
    // ════════════════════════════════════════════════════════════

    /**
     * Retrieves a user profile by their MongoDB document ID.
     *
     * @param id MongoDB ObjectId string
     * @return UserProfileResponse without any sensitive fields
     * @throws ResourceNotFoundException (404) if no user matches the given ID
     */
    @Override
    public AuthDTO.UserProfileResponse getUserById(String id) {
        log.debug("Fetching user by id={}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToProfile(user);
    }

    // ════════════════════════════════════════════════════════════
    // GET ALL USERS (ADMIN)
    // ════════════════════════════════════════════════════════════

    /**
     * Returns a list of all registered users as profile DTOs.
     * Intended for ADMIN use only — the endpoint is protected by SecurityConfig.
     *
     * @return List of UserProfileResponse (passwords excluded)
     */
    @Override
    public List<AuthDTO.UserProfileResponse> getAllUsers() {
        log.debug("Admin: fetching all users");
        return userRepository.findAll()
                .stream()
                .map(this::mapToProfile)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════
    // DELETE USER (ADMIN)
    // ════════════════════════════════════════════════════════════

    /**
     * Permanently deletes the user document from MongoDB.
     * Authorization is enforced at the SecurityConfig / controller level.
     *
     * @param id MongoDB ObjectId string of the user to delete
     * @throws ResourceNotFoundException (404) if the user does not exist
     */
    @Override
    public void deleteUser(String id) {
        log.info("Admin: deleting user id={}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
        log.info("User deleted: id={} email={}", user.getId(), user.getEmail());
    }

    // ─── Helper ─────────────────────────────────────────────────

    /**
     * Maps a User document to a safe UserProfileResponse DTO.
     * Password and internal fields are intentionally excluded.
     */
    private AuthDTO.UserProfileResponse mapToProfile(User user) {
        return new AuthDTO.UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
