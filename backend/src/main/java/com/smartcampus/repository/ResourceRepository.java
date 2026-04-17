package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ================================================================
 * ResourceRepository — Spring Data MongoDB Repository
 * ================================================================
 * Owner: Member 3 – Facilities & Assets Module
 *
 * Provides both derived-query methods (resolved by Spring Data from
 * the method name) and custom @Query methods for flexible filtering.
 *
 * Index strategy (declared on Resource):
 *   - @Indexed on name, type, location, status
 *   These support all common filter combinations at O(log n).
 *
 * Filtering API used by ResourceServiceImpl.filterResources():
 *   The service builds filter combinations by chaining these methods
 *   based on which query params were supplied. For multi-param
 *   combinations, the @Query methods accept nullable fields and
 *   use $exists/$gte/$regex accordingly.
 * ================================================================
 */
@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    // ── Single-field finders ────────────────────────────────────

    /**
     * Find all resources of a given type (ROOM, LAB, EQUIPMENT).
     * Used when only `type` filter is supplied.
     */
    List<Resource> findByType(ResourceType type);

    /**
     * Find resources whose capacity is at least minCapacity.
     * Supports the `capacity` query param (e.g. ?capacity=50).
     */
    List<Resource> findByCapacityGreaterThanEqual(Integer minCapacity);

    /**
     * Case-insensitive partial match on location.
     * Supports the `location` query param (e.g. ?location=block+a).
     */
    List<Resource> findByLocationContainingIgnoreCase(String location);

    /**
     * Find by operational status (ACTIVE or OUT_OF_SERVICE).
     * Supports the `status` query param.
     */
    List<Resource> findByStatus(ResourceStatus status);

    /**
     * Find resources that are flagged as available (legacy flag).
     * Used by the /available convenience endpoint kept for
     * backward-compatibility with BookingService.
     */
    List<Resource> findByIsAvailableTrue();

    /**
     * Check for an existing resource by exact name (case-sensitive).
     * Used for duplicate-name validation on create/update.
     */
    Optional<Resource> findByName(String name);

    // ── Multi-field combination filters ────────────────────────

    /**
     * Filter by type AND status.
     * Example: ?type=ROOM&status=ACTIVE
     */
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    /**
     * Filter by type AND minimum capacity.
     * Example: ?type=LAB&capacity=30
     */
    List<Resource> findByTypeAndCapacityGreaterThanEqual(ResourceType type, Integer minCapacity);

    /**
     * Filter by location (partial, ignore-case) AND status.
     * Example: ?location=block+c&status=ACTIVE
     */
    List<Resource> findByLocationContainingIgnoreCaseAndStatus(String location, ResourceStatus status);

    /**
     * Filter by type AND location (partial, ignore-case).
     * Example: ?type=EQUIPMENT&location=gym
     */
    List<Resource> findByTypeAndLocationContainingIgnoreCase(ResourceType type, String location);

    /**
     * Full combination: type + location (partial) + status.
     * Example: ?type=ROOM&location=block+a&status=ACTIVE
     */
    List<Resource> findByTypeAndLocationContainingIgnoreCaseAndStatus(
            ResourceType type, String location, ResourceStatus status);

    /**
     * Full combination: type + location + capacity + status.
     * The most specific filter — all four params supplied.
     * Example: ?type=LAB&location=block+b&capacity=40&status=ACTIVE
     */
    List<Resource> findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqualAndStatus(
            ResourceType type, String location, Integer minCapacity, ResourceStatus status);

    /**
     * Filter by capacity AND status (no type or location constraint).
     * Example: ?capacity=50&status=ACTIVE
     */
    List<Resource> findByCapacityGreaterThanEqualAndStatus(Integer minCapacity, ResourceStatus status);

    /**
     * Search resources by keyword in the name field (case-insensitive).
     * Useful for a generic search bar in the frontend.
     * Uses MongoDB regex via Spring Data's Containing keyword.
     */
    List<Resource> findByNameContainingIgnoreCase(String keyword);
}
