package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.model.Priority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * ================================================================
 * TicketController - Maintenance & Incident Ticketing Endpoints
 * ================================================================
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust for production
public class TicketController {

    private final TicketService ticketService;

    /**
     * POST /api/tickets - Create a new ticket with up to 3 images
     */
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestPart("ticket") @Valid TicketRequestDTO ticketRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader(value = "X-User-Id", defaultValue = "user123") String userId // Placeholder for Auth
    ) {
        TicketResponseDTO response = ticketService.createTicket(ticketRequest, images, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/tickets - Admin view with filters
     */
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String assignedTo
    ) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority, assignedTo));
    }

    /**
     * GET /api/tickets/my - Current user's tickets
     */
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @RequestHeader(value = "X-User-Id", defaultValue = "user123") String userId
    ) {
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }

    /**
     * GET /api/tickets/{id} - Get single ticket details
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    /**
     * PUT /api/tickets/{id}/status - Update ticket status (Workflow Enforcement)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String reason,
            @RequestHeader(value = "X-User-Id", defaultValue = "admin123") String userId
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, reason, userId));
    }

    /**
     * PUT /api/tickets/{id}/assign - Assign a technician to a ticket
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable String id,
            @RequestParam String technicianId
    ) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    /**
     * PATCH /api/tickets/{id}/comment - Add a comment to the ticket
     */
    @PatchMapping("/{id}/comment")
    public ResponseEntity<TicketResponseDTO> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentDTO commentDTO,
            @RequestHeader(value = "X-User-Id", defaultValue = "user123") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "John Doe") String userName
    ) {
        return ResponseEntity.ok(ticketService.addComment(id, commentDTO, userId, userName));
    }

    /**
     * PUT /api/tickets/{id}/comment/{index} - Edit a comment
     */
    @PutMapping("/{id}/comment/{index}")
    public ResponseEntity<TicketResponseDTO> editComment(
            @PathVariable String id,
            @PathVariable int index,
            @RequestBody String message,
            @RequestHeader(value = "X-User-Id", defaultValue = "user123") String userId
    ) {
        return ResponseEntity.ok(ticketService.editComment(id, index, message, userId));
    }

    /**
     * DELETE /api/tickets/{id}/comment/{index} - Delete a comment
     */
    @DeleteMapping("/{id}/comment/{index}")
    public ResponseEntity<TicketResponseDTO> deleteComment(
            @PathVariable String id,
            @PathVariable int index,
            @RequestHeader(value = "X-User-Id", defaultValue = "user123") String userId
    ) {
        return ResponseEntity.ok(ticketService.deleteComment(id, index, userId));
    }

    /**
     * DELETE /api/tickets/{id} - Delete a ticket
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", defaultValue = "user123") String userId
    ) {
        ticketService.deleteTicket(id, userId);
        return ResponseEntity.noContent().build();
    }
}
