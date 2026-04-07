package com.smartcampus.service.impl;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * ResourceServiceImpl - Facilities & Resources Implementation
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 *
 * TODO Member 3:
 *  1. Implement full CRUD with validation
 *  2. Add availability toggle method
 *  3. Add search and filter logic
 *  4. Integrate with BookingService to check resource conflicts
 *  5. Add image upload support (see Spring multipart docs)
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public List<ResourceDTO.ResourceResponse> getAllResources() {
        // TODO: Member 3 - Add pagination support
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceDTO.ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponse(resource);
    }

    @Override
    public List<ResourceDTO.ResourceResponse> getAvailableResources() {
        return resourceRepository.findByIsAvailableTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceDTO.ResourceResponse> getResourcesByType(String type) {
        return resourceRepository.findByType(type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceDTO.ResourceResponse createResource(ResourceDTO.ResourceRequest request) {
        // TODO: Member 3 - Add validation (e.g., duplicate name check)
        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .build();

        resource.onCreate();
        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceDTO.ResourceResponse updateResource(String id, ResourceDTO.ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        // TODO: Member 3 - Add field-level null checks for partial updates
        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType());
        resource.setLocation(request.getLocation());
        resource.setCapacity(request.getCapacity());
        if (request.getIsAvailable() != null) resource.setIsAvailable(request.getIsAvailable());

        resource.onUpdate();
        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    // ---- Helper: Entity → DTO ----
    private ResourceDTO.ResourceResponse mapToResponse(Resource resource) {
        return ResourceDTO.ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .location(resource.getLocation())
                .capacity(resource.getCapacity())
                .isAvailable(resource.getIsAvailable())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
