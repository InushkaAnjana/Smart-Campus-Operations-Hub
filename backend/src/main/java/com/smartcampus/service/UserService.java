package com.smartcampus.service;

import com.smartcampus.dto.AuthDTO;

import java.util.List;

/**
 * ================================================================
 * UserService Interface
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth / User Management Module
 *
 * Provides user-management operations distinct from authentication.
 *  - getUserById()  → Fetch a user profile by their MongoDB ID
 *  - getAllUsers()  → Admin-only: list all registered users
 *  - deleteUser()  → Admin-only: remove a user by ID
 * ================================================================
 */
public interface UserService {

    /**
     * Retrieve a user's profile by their MongoDB document ID.
     * Throws ResourceNotFoundException (404) if the ID does not match any user.
     *
     * @param id MongoDB ObjectId string of the user
     * @return UserProfileResponse DTO (no password, no token)
     */
    AuthDTO.UserProfileResponse getUserById(String id);

    /**
     * Retrieve all registered users (ADMIN only).
     * Returns a list of UserProfileResponse DTOs — passwords are never included.
     *
     * @return List of all user profiles
     */
    List<AuthDTO.UserProfileResponse> getAllUsers();

    /**
     * Delete a user by ID (ADMIN only).
     * Throws ResourceNotFoundException (404) if the user does not exist.
     *
     * @param id MongoDB ObjectId string of the user to delete
     */
    void deleteUser(String id);
}
