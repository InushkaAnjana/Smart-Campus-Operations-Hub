package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;

import java.util.List;

/**
 * ================================================================
 * ResourceService Interface
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 *
 * TODO Member 3:
 *  - Implement all CRUD methods
 *  - Add availability check before booking integration
 *  - Add search/filter capabilities
 * ================================================================
 */
public interface ResourceService {

    List<ResourceDTO.ResourceResponse> getAllResources();

    ResourceDTO.ResourceResponse getResourceById(String id);

    List<ResourceDTO.ResourceResponse> getAvailableResources();

    List<ResourceDTO.ResourceResponse> getResourcesByType(String type);

    ResourceDTO.ResourceResponse createResource(ResourceDTO.ResourceRequest request);

    ResourceDTO.ResourceResponse updateResource(String id, ResourceDTO.ResourceRequest request);

    void deleteResource(String id);

    // TODO: Member 3 - Add method to toggle availability
    // ResourceDTO.ResourceResponse setAvailability(String id, boolean available);
}
