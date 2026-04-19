package com.smartcampus.repository;

import com.smartcampus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ================================================================
 * UserRepository (MongoDB)
 * ================================================================
 * Owner: Member 1 - Auth Module
 *
 * Spring Data MongoDB automatically implements all query methods
 * listed here based on method naming conventions.
 *
 * QUERY METHOD REFERENCE:
 *  findByEmail(email)         → SELECT * FROM users WHERE email = ?
 *  existsByEmail(email)       → SELECT COUNT(*) > 0 WHERE email = ?
 *  findByRole(role)           → SELECT * FROM users WHERE role = ?
 *  findByNameContaining(name) → Text search on the name field (case-insensitive
 *                               behaviour depends on MongoDB collation settings)
 *
 * INDEXING:
 *  The 'email' field is annotated with @Indexed(unique = true) on the User
 *  document, which creates a unique MongoDB index. This enforces email
 *  uniqueness at the DB level as a safety net on top of existsByEmail() checks.
 * ================================================================
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Find a user by their email address.
     * Used by:
     *  - CustomUserDetailsService.loadUserByUsername() (Spring Security authentication)
     *  - AuthServiceImpl.login()      (credential validation)
     *  - AuthServiceImpl.getUserProfile() (GET /api/auth/me)
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with the given email already exists.
     * Used by AuthServiceImpl.register() to enforce email uniqueness.
     *
     * @return true if a user document with this email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find all users with a specific role.
     * Useful for admin dashboards that filter users by role
     * (e.g., list all TECHNICIANs for ticket assignment).
     *
     * @param role One of "USER", "ADMIN", "TECHNICIAN"
     */
    List<User> findByRole(String role);

    /**
     * Case-insensitive name search for admin user lookup.
     * Finds users whose name contains the given substring.
     *
     * @param name Substring to search for within the name field
     */
    List<User> findByNameContainingIgnoreCase(String name);
}
