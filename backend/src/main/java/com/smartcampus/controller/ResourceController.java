package com.smartcampus.controller;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * ResourceController — Facilities & Assets REST API
 * ================================================================
 * Base URL : /api/resources
 *
 * ROLE RULES (enforced via @PreAuthorize + Spring Method Security):
 * ADMIN → POST, PUT, DELETE (create / update / remove resources)
 * USER → GET (view / search resources)
 *
 * Note: @EnableMethodSecurity(prePostEnabled = true) is already set
 * in SecurityConfig so @PreAuthorize works out of the box.
 * The SecurityConfig JWT filter populates the SecurityContext with
 * GrantedAuthority "ROLE_ADMIN" or "ROLE_USER" from the JWT claims.
 *
 * FILTERING (GET /api/resources):
 * All query params are optional. Combine freely:
 * ?type=ROOM
 * ?type=LAB&capacity=30
 * ?location=block+a&status=ACTIVE
 * ?type=ROOM&capacity=50&location=block+b&status=ACTIVE
 *
 * When no params are provided → returns all resources (unfiltered).
 *
 * VALIDATION:
 * 
 * @Valid on @RequestBody triggers Bean Validation (Jakarta).
 *        Errors bubble to GlobalExceptionHandler → 422 response.
 *        Invalid enum strings (e.g. type=INVALID) are caught by Spring's
 *        ConversionFailedException → 400 response.
 *        ================================================================
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ResourceController {

    private final ResourceService resourceService;

    // ─────────────────────────────────────────────────────────────
    // POST /api/resources — Create a new resource [ADMIN ONLY]
    // ─────────────────────────────────────────────────────────────

    /**
     * ADMIN creates a new campus resource (room, lab, or equipment).
     *
     * Request body must include: name (required), type (required).
     * Optional: description, location, capacity, availabilityWindows,
     * isAvailable, status.
     *
     * Validation errors → 422 Unprocessable Entity (GlobalExceptionHandler).
     * Duplicate name → 409 Conflict (ResourceException).
     *
     * Returns 201 Created with the persisted resource DTO.
     *
     * Example:
     * POST /api/resources
     * Authorization: Bearer <admin-jwt>
     * {
     * "name": "Computer Lab B-201",
     * "type": "LAB",
     * "location": "Block B, Floor 2",
     * "capacity": 40,
     * "availabilityWindows": ["MON 08:00-20:00", "WED 08:00-20:00"],
     * "status": "ACTIVE"
     * }
     *
     * @param request validated request body
     * @return 201 with the created resource
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO request) {

        ResourceResponseDTO created = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resources — List all / filter [ANY AUTHENTICATED]
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns all resources, optionally filtered by any combination of:
     * type → ROOM | LAB | EQUIPMENT
     * capacity → minimum capacity (e.g. 50 means "≥ 50 seats")
     * location → partial, case-insensitive match
     * status → ACTIVE | OUT_OF_SERVICE
     *
     * If none of the params are supplied, returns the full list.
     * Invalid enum values produce a 400 Bad Request automatically
     * because Spring cannot convert the string to the enum.
     *
     * Examples:
     * GET /api/resources
     * GET /api/resources?type=ROOM
     * GET /api/resources?type=ROOM&capacity=50
     * GET /api/resources?location=block+a&status=ACTIVE
     * GET /api/resources?type=LAB&capacity=30&status=ACTIVE
     *
     * @param type        (optional) filter by resource type
     * @param minCapacity (optional) filter by minimum capacity
     * @param location    (optional) partial location match
     * @param status      (optional) filter by operational status
     * @return 200 with list of matching resources
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ResourceResponseDTO>> getResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {

        // Delegate to the unified filter method.
        // If all params are null → filterResources returns findAll().
        List<ResourceResponseDTO> resources = resourceService.filterResources(type, capacity, location, status);
        return ResponseEntity.ok(resources);
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resources/available — Available resources [ALL]
    // ─────────────────────────────────────────────────────────────

    /**
     * Convenience endpoint: returns only resources where
     * isAvailable == true (legacy flag used by BookingService).
     *
     * Kept for backward-compatibility. Frontend can also achieve this
     * via GET /api/resources?status=ACTIVE.
     *
     * Example:
     * GET /api/resources/available
     *
     * @return 200 with list of available resources
     */
    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ResourceResponseDTO>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.getAvailableResources());
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/resources/{id} — Get by ID [ANY AUTHENTICATED]
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns a single resource by its MongoDB ObjectId.
     *
     * Not found → 404 (ResourceNotFoundException → GlobalExceptionHandler).
     *
     * Example:
     * GET /api/resources/663f1e2b4a5c8d1234abcd99
     *
     * @param id MongoDB document id
     * @return 200 with the resource DTO
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // ─────────────────────────────────────────────────────────────
    // PUT /api/resources/{id} — Full update [ADMIN ONLY]
    // ─────────────────────────────────────────────────────────────

    /**
     * ADMIN fully updates (replaces) a resource.
     *
     * All fields in the request body are applied. Fields not provided
     * retain their existing values (null-safe update in service layer).
     *
     * Not found → 404.
     * Duplicate name → 409 (ResourceException).
     * Validation failure → 422.
     *
     * Example:
     * PUT /api/resources/663f1e2b4a5c8d1234abcd99
     * Authorization: Bearer <admin-jwt>
     * {
     * "name": "Updated Lab Name",
     * "type": "LAB",
     * "capacity": 60,
     * "status": "OUT_OF_SERVICE"
     * }
     *
     * @param id      resource id
     * @param request validated update body
     * @return 200 with the updated resource DTO
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequestDTO request) {

        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/resources/{id} — Remove [ADMIN ONLY]
    // ─────────────────────────────────────────────────────────────

    /**
     * ADMIN permanently removes a resource.
     *
     * Not found → 404.
     * Returns 204 No Content on success (no body).
     *
     * Example:
     * DELETE /api/resources/663f1e2b4a5c8d1234abcd99
     * Authorization: Bearer <admin-jwt>
     *
     * @param id resource id
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
