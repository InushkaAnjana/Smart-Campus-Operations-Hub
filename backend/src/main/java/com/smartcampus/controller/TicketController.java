package com.smartcampus.controller;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class TicketController {

    private final TicketService ticketService;

    // TODO: Add proper Spring Security @PreAuthorize rules. For now, simulated with RequestParams where needed.

    /** GET /api/tickets - Get all tickets (ADMIN view with filters) */
    @GetMapping
    public ResponseEntity<List<TicketDTO.TicketResponse>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assignedTo) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority, assignedTo));
    }

    /** GET /api/tickets/my - Get user tickets */
    @GetMapping("/my")
    public ResponseEntity<List<TicketDTO.TicketResponse>> getMyTickets(@RequestParam String userId) {
        // Here userId should come from JWT @AuthenticationPrincipal. For demo, it is explicitly passed.
        return ResponseEntity.ok(ticketService.getTicketsByUser(userId));
    }

    /** GET /api/tickets/{id} - Get single ticket */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO.TicketResponse> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    /** POST /api/tickets - Create ticket (with images) */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketDTO.TicketResponse> createTicket(
            @RequestParam String userId,
            @Valid @RequestPart("ticket") TicketDTO.TicketRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(userId, request, images));
    }

    /** PUT /api/tickets/{id}/status - Update ticket status */
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketDTO.TicketResponse> updateTicketStatus(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestBody TicketDTO.TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request.getStatus() != null ? request.getStatus().name() : null, request.getRejectReason(), userId));
    }

    /** PUT /api/tickets/{id}/assign - Assign technician */
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketDTO.TicketResponse> assignTechnician(
            @PathVariable String id,
            @RequestBody TicketDTO.TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.getTechnicianId()));
    }

    /** PATCH /api/tickets/{id}/comment - Add comment */
    @PatchMapping("/{id}/comment")
    public ResponseEntity<TicketDTO.TicketResponse> addComment(
            @PathVariable String id,
            @RequestParam String userId,
            @Valid @RequestBody TicketDTO.CommentDTO request) {
        return ResponseEntity.ok(ticketService.addComment(id, userId, request));
    }
    
    /** PATCH /api/tickets/{id}/comment/{commentId} - Update comment */
    @PatchMapping("/{id}/comment/{commentId}")
    public ResponseEntity<TicketDTO.TicketResponse> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestParam String userId,
            @Valid @RequestBody TicketDTO.CommentDTO request) {
        return ResponseEntity.ok(ticketService.updateComment(id, commentId, userId, request));
    }

    /** DELETE /api/tickets/{id}/comment/{commentId} - Delete comment */
    @DeleteMapping("/{id}/comment/{commentId}")
    public ResponseEntity<TicketDTO.TicketResponse> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestParam String userId) {
        return ResponseEntity.ok(ticketService.deleteComment(id, commentId, userId));
    }

    /** DELETE /api/tickets/{id} - Delete ticket */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
