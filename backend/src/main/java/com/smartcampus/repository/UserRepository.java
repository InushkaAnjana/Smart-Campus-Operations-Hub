package com.smartcampus.repository;

import com.smartcampus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ================================================================
 * UserRepository (MongoDB)
 * ================================================================
 * Owner: Member 1 - Auth Module
 *
 * TODO Member 1:
 *  - Add findByRole(String role) for admin listing
 *  - Add exists check for registration email validation
 * ================================================================
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // TODO: Member 1 - Add more query methods as needed
    // List<User> findByRole(String role);
}
