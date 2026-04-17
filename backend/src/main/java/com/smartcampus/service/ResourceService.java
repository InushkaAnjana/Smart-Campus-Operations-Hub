package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;

import java.util.List;

/**
 * ================================================================
 * ResourceService — Interface for Facilities & Assets Module
 * ================================================================
 * Defines the business-logic contract for resource management.
 * Implemented by ResourceServiceImpl.
 *
 * ROLE RULES (enforced in controller via @PreAuthorize):
 *   ADMIN → createResource, updateResource, deleteResource
 *   USER  → getAllResources, getResourceById, filterResources
 *
 * FILTERING:
 *   filterResources() accepts nullable parameters. When a param is
 *   null it is treated as "no filter on that field", allowing any
 *   combination of type / location / capacity / status to be used.
 * ================================================================
 */
public interface ResourceService {

    /**
     * Create a new campus resource.
     * Called by: POST /api/resources (ADMIN only)
     *
     * @param request validated inbound DTO
     * @return the persisted resource as a response DTO
     */
    ResourceResponseDTO createResource(ResourceRequestDTO request);

    /**
     * Retrieve every resource (no filter).
     * Called by: GET /api/resources (with no query params)
     *
     * @return unfiltered list of all resources
     */
    List<ResourceResponseDTO> getAllResources();

    /**
     * Retrieve a single resource by its MongoDB ObjectId.
     * Called by: GET /api/resources/{id}
     *
     * @param id MongoDB document id
     * @return resource DTO if found, throws ResourceNotFoundException otherwise
     */
    ResourceResponseDTO getResourceById(String id);

    /**
     * Full update (replace) an existing resource.
     * Called by: PUT /api/resources/{id} (ADMIN only)
     *
     * @param id      MongoDB document id
     * @param request validated update payload
     * @return updated resource DTO
     */
    ResourceResponseDTO updateResource(String id, ResourceRequestDTO request);

    /**
     * Permanently delete a resource.
     * Called by: DELETE /api/resources/{id} (ADMIN only)
     *
     * @param id MongoDB document id
     */
    void deleteResource(String id);

    /**
     * Multi-parameter filtering — the main search endpoint.
     * Called by: GET /api/resources?type=&capacity=&location=&status=
     *
     * All parameters are optional (nullable). The service applies
     * only the filters that are non-null, enabling any combination:
     *   ?type=ROOM                        → type filter only
     *   ?type=LAB&capacity=30             → type + capacity
     *   ?location=block+a&status=ACTIVE   → location + status
     *   ?type=ROOM&capacity=50&status=ACTIVE → all three + status
     *
     * @param type        filter by ResourceType enum (nullable)
     * @param minCapacity filter by minimum capacity (nullable)
     * @param location    partial/case-insensitive location match (nullable)
     * @param status      filter by ResourceStatus enum (nullable)
     * @return filtered list (empty list if nothing matches)
     */
    List<ResourceResponseDTO> filterResources(
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status
    );

    /**
     * Convenience method — return only resources marked as available.
     * Kept for backward-compatibility with BookingService callers.
     * Called by: GET /api/resources/available
     *
     * @return list of resources where isAvailable == true
     */
    List<ResourceResponseDTO> getAvailableResources();
}
