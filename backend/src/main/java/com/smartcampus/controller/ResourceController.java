package com.smartcampus.controller;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * ResourceController - Facilities & Resources Endpoints
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 * Base URL: /api/resources
 *
 * TODO Member 3:
 *  - GET    /api/resources              → List all resources
 *  - GET    /api/resources/{id}         → Get single resource
 *  - GET    /api/resources/available    → List only available resources
 *  - GET    /api/resources/type/{type}  → Filter by type
 *  - POST   /api/resources              → Create new resource (ADMIN only)
 *  - PUT    /api/resources/{id}         → Update resource (ADMIN only)
 *  - DELETE /api/resources/{id}         → Delete resource (ADMIN only)
 *  - PATCH  /api/resources/{id}/availability → Toggle availability
 * ================================================================
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ResourceController {

    private final ResourceService resourceService;

    /** GET /api/resources - Return all campus resources */
    @GetMapping
    public ResponseEntity<List<ResourceDTO.ResourceResponse>> getAllResources() {
        // TODO: Member 3 - Add @PreAuthorize if needed
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    /** GET /api/resources/{id} - Get resource by ID */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO.ResourceResponse> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    /** GET /api/resources/available - Get only available resources */
    @GetMapping("/available")
    public ResponseEntity<List<ResourceDTO.ResourceResponse>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.getAvailableResources());
    }

    /** GET /api/resources/type/{type} - Filter resources by type */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTO.ResourceResponse>> getResourcesByType(@PathVariable String type) {
        // TODO: Member 3 - Validate type against enum
        return ResponseEntity.ok(resourceService.getResourcesByType(type));
    }

    /** POST /api/resources - Create new resource (Admin only) */
    @PostMapping
    // TODO: Member 3 - Add @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO.ResourceResponse> createResource(
            @Valid @RequestBody ResourceDTO.ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    /** PUT /api/resources/{id} - Update existing resource (Admin only) */
    @PutMapping("/{id}")
    // TODO: Member 3 - Add @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO.ResourceResponse> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceDTO.ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    /** DELETE /api/resources/{id} - Delete a resource (Admin only) */
    @DeleteMapping("/{id}")
    // TODO: Member 3 - Add @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
