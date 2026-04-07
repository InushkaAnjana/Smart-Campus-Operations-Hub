package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 * ResourceRepository (MongoDB)
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 *
 * TODO Member 3:
 *  - Add findByType(String type) for filtering by resource category
 *  - Add findByIsAvailableTrue() for availability search
 *  - Add custom query for searching by location
 *  - Add pagination support via Pageable parameter
 * ================================================================
 */
@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByIsAvailableTrue();

    List<Resource> findByType(String type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    // TODO: Member 3 - Add capacity filter query
    // List<Resource> findByCapacityGreaterThanEqual(Integer minCapacity);

    // TODO: Member 3 - Add full-text search via @TextIndexed on Resource.name
    // List<Resource> findByNameContainingIgnoreCase(String keyword);
}
