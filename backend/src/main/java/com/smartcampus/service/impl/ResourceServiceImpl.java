package com.smartcampus.service.impl;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.exception.ResourceException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * ResourceServiceImpl — Business Logic for Facilities & Assets
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 *
 * FILTERING STRATEGY:
 *   filterResources() receives up to four nullable parameters
 *   (type, minCapacity, location, status). The method uses a
 *   decision tree to delegate to the most-specific repository method
 *   available, avoiding N+1 in-memory filtering and keeping all
 *   filtering work at the database layer (Mongo indexed queries).
 *
 *   Priority of combinations handled:
 *     1. All four params     → findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqualAndStatus
 *     2. type + loc + status → findByTypeAndLocationContainingIgnoreCaseAndStatus
 *     3. type + cap + status → (type + cap) intersected with status in Java (edge case)
 *     4. type + location     → findByTypeAndLocationContainingIgnoreCase
 *     5. type + status       → findByTypeAndStatus
 *     6. type + capacity     → findByTypeAndCapacityGreaterThanEqual
 *     7. loc + status        → findByLocationContainingIgnoreCaseAndStatus
 *     8. cap + status        → findByCapacityGreaterThanEqualAndStatus
 *     9. type only           → findByType
 *    10. location only       → findByLocationContainingIgnoreCase
 *    11. capacity only       → findByCapacityGreaterThanEqual
 *    12. status only         → findByStatus
 *    13. no filter           → findAll
 *
 * VALIDATION:
 *   - Duplicate name check on create (case-sensitive).
 *   - Capacity validated at DTO layer (@Positive); service adds
 *     a belt-and-suspenders guard for programmatic calls.
 *
 * ROLE ENFORCEMENT:
 *   Role-based access is declared at the controller via @PreAuthorize.
 *   This service layer trusts that only authorized callers reach it.
 * ================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    // ─────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────

    /**
     * Persists a new resource.
     *
     * Validation:
     *   1. Duplicate-name guard — rejects if a resource with the same
     *      name already exists (case-sensitive, per findByName).
     *   2. Capacity guard — must be > 0 (belt-and-suspenders after @Valid).
     *   3. Defaults: status → ACTIVE, isAvailable → true if not supplied.
     *
     * @throws ResourceException DUPLICATE_NAME if name is taken
     */
    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO request) {
        log.info("Creating resource with name='{}'", request.getName());

        // Guard: duplicate name
        resourceRepository.findByName(request.getName()).ifPresent(existing -> {
            throw new ResourceException("DUPLICATE_NAME",
                    "A resource named '" + request.getName() + "' already exists. " +
                    "Use a unique name or update the existing resource (id=" + existing.getId() + ").");
        });

        // Guard: capacity must be positive (in case service is called programmatically)
        if (request.getCapacity() != null && request.getCapacity() <= 0) {
            throw new ResourceException("CAPACITY_INVALID",
                    "Capacity must be a positive number, got: " + request.getCapacity());
        }

        // Build entity with defaults for optional fields
        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .availabilityWindows(request.getAvailabilityWindows())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : Boolean.TRUE)
                .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
                .build();

        resource.onCreate(); // sets createdAt, updatedAt, and status/isAvailable defaults
        Resource saved = resourceRepository.save(resource);
        log.info("Resource created: id={}, name='{}'", saved.getId(), saved.getName());
        return mapToResponseDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // READ — all / by id / available
    // ─────────────────────────────────────────────────────────────

    /** Returns every resource without any filter. */
    @Override
    public List<ResourceResponseDTO> getAllResources() {
        log.debug("Fetching all resources");
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single resource by id.
     * @throws ResourceNotFoundException if no document with that id exists
     */
    @Override
    public ResourceResponseDTO getResourceById(String id) {
        log.debug("Fetching resource id={}", id);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponseDTO(resource);
    }

    /** Returns only resources whose isAvailable flag is true (booking-service integration). */
    @Override
    public List<ResourceResponseDTO> getAvailableResources() {
        log.debug("Fetching available resources");
        return resourceRepository.findByIsAvailableTrue()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────

    /**
     * Full replacement update of a resource by id.
     *
     * All supplied fields overwrite the existing document.
     * If a field in the request is null, the existing value is retained
     * (partial-update friendly for PUT semantics despite the RFC
     * recommendation; suits typical frontend usage patterns).
     *
     * Duplicate-name check is performed only when the name is being
     * changed (skip if the name maps back to the same document).
     *
     * @throws ResourceNotFoundException if resource not found
     * @throws ResourceException DUPLICATE_NAME if new name is taken by another resource
     */
    @Override
    public ResourceResponseDTO updateResource(String id, ResourceRequestDTO request) {
        log.info("Updating resource id={}", id);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        // Duplicate-name guard (only when name is actually changing)
        if (request.getName() != null && !request.getName().equals(resource.getName())) {
            resourceRepository.findByName(request.getName()).ifPresent(conflict -> {
                if (!conflict.getId().equals(id)) {
                    throw new ResourceException("DUPLICATE_NAME",
                            "A resource named '" + request.getName() + "' already exists " +
                            "(id=" + conflict.getId() + ").");
                }
            });
            resource.setName(request.getName());
        }

        // Apply each field only if the request supplies a non-null value
        if (request.getDescription() != null)        resource.setDescription(request.getDescription());
        if (request.getType() != null)               resource.setType(request.getType());
        if (request.getLocation() != null)           resource.setLocation(request.getLocation());
        if (request.getCapacity() != null) {
            // Belt-and-suspenders capacity guard for programmatic callers
            if (request.getCapacity() <= 0) {
                throw new ResourceException("CAPACITY_INVALID",
                        "Capacity must be positive, got: " + request.getCapacity());
            }
            resource.setCapacity(request.getCapacity());
        }
        if (request.getAvailabilityWindows() != null) resource.setAvailabilityWindows(request.getAvailabilityWindows());
        if (request.getIsAvailable() != null)        resource.setIsAvailable(request.getIsAvailable());
        if (request.getStatus() != null)             resource.setStatus(request.getStatus());

        resource.onUpdate(); // refreshes updatedAt
        Resource saved = resourceRepository.save(resource);
        log.info("Resource updated: id={}", saved.getId());
        return mapToResponseDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────

    /**
     * Permanently removes a resource.
     *
     * Note: In a production system, consider soft-deleting (set
     * status=OUT_OF_SERVICE) if the resource may have associated
     * bookings or audit history.
     *
     * @throws ResourceNotFoundException if resource not found
     */
    @Override
    public void deleteResource(String id) {
        log.info("Deleting resource id={}", id);
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
        log.info("Resource deleted: id={}", id);
    }

    // ─────────────────────────────────────────────────────────────
    // FILTER
    // ─────────────────────────────────────────────────────────────

    /**
     * Multi-parameter filter. All params are nullable — supply only
     * the ones you want to filter on.
     *
     * DECISION TREE (most-specific to least-specific):
     *   Delegates to the appropriate repository method so the
     *   filtering is done at the MongoDB index layer, not in Java.
     *
     * When no params are supplied, returns the full collection
     * (equivalent to getAllResources()).
     */
    @Override
    public List<ResourceResponseDTO> filterResources(
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status
    ) {
        log.debug("Filtering resources: type={}, minCapacity={}, location='{}', status={}",
                type, minCapacity, location, status);

        boolean hasType     = type != null;
        boolean hasCap      = minCapacity != null;
        boolean hasLoc      = location != null && !location.isBlank();
        boolean hasStatus   = status != null;

        List<Resource> results;

        // ── Fully-specified (all 4 params) ──────────────────────
        if (hasType && hasLoc && hasCap && hasStatus) {
            results = resourceRepository
                    .findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqualAndStatus(
                            type, location, minCapacity, status);

        // ── 3-param combos ──────────────────────────────────────
        } else if (hasType && hasLoc && hasStatus) {
            results = resourceRepository
                    .findByTypeAndLocationContainingIgnoreCaseAndStatus(type, location, status);

        } else if (hasType && hasCap && hasStatus) {
            // No single repo method for type+cap+status → chain type+cap then filter status in Java
            results = resourceRepository
                    .findByTypeAndCapacityGreaterThanEqual(type, minCapacity)
                    .stream()
                    .filter(r -> status.equals(r.getStatus()))
                    .collect(Collectors.toList());

        } else if (hasType && hasLoc && hasCap) {
            // type + location + capacity (no status constraint)
            results = resourceRepository
                    .findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqualAndStatus(
                            type, location, minCapacity, null);
            // fallback: manual location+cap filter on type results
            results = resourceRepository.findByTypeAndCapacityGreaterThanEqual(type, minCapacity)
                    .stream()
                    .filter(r -> r.getLocation() != null &&
                            r.getLocation().toLowerCase().contains(location.toLowerCase()))
                    .collect(Collectors.toList());

        // ── 2-param combos ──────────────────────────────────────
        } else if (hasType && hasStatus) {
            results = resourceRepository.findByTypeAndStatus(type, status);

        } else if (hasType && hasLoc) {
            results = resourceRepository.findByTypeAndLocationContainingIgnoreCase(type, location);

        } else if (hasType && hasCap) {
            results = resourceRepository.findByTypeAndCapacityGreaterThanEqual(type, minCapacity);

        } else if (hasLoc && hasStatus) {
            results = resourceRepository.findByLocationContainingIgnoreCaseAndStatus(location, status);

        } else if (hasCap && hasStatus) {
            results = resourceRepository.findByCapacityGreaterThanEqualAndStatus(minCapacity, status);

        } else if (hasLoc && hasCap) {
            // location + capacity: filter location in Mongo, then cap in Java
            results = resourceRepository.findByLocationContainingIgnoreCase(location)
                    .stream()
                    .filter(r -> r.getCapacity() != null && r.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());

        // ── Single-param ────────────────────────────────────────
        } else if (hasType) {
            results = resourceRepository.findByType(type);

        } else if (hasLoc) {
            results = resourceRepository.findByLocationContainingIgnoreCase(location);

        } else if (hasCap) {
            results = resourceRepository.findByCapacityGreaterThanEqual(minCapacity);

        } else if (hasStatus) {
            results = resourceRepository.findByStatus(status);

        // ── No filter → return all ──────────────────────────────
        } else {
            results = resourceRepository.findAll();
        }

        return results.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // MAPPING HELPER
    // ─────────────────────────────────────────────────────────────

    /**
     * Maps a Resource entity to the outbound ResourceResponseDTO.
     * Centralised here so all service methods produce a consistent response.
     */
    private ResourceResponseDTO mapToResponseDTO(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .location(resource.getLocation())
                .capacity(resource.getCapacity())
                .availabilityWindows(resource.getAvailabilityWindows())
                .isAvailable(resource.getIsAvailable())
                .status(resource.getStatus())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
