package com.smartcampus.controller;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * TicketController - Maintenance & Tickets Endpoints
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets Module
 * Base URL: /api/tickets
 *
 * TODO Member 4:
 *  - GET    /api/tickets                → All tickets (ADMIN)
 *  - GET    /api/tickets/{id}           → Get single ticket
 *  - GET    /api/tickets/user/{userId}  → Tickets by reporter
 *  - GET    /api/tickets/status/{status} → Filter by status
 *  - POST   /api/tickets                → Create/report new ticket
 *  - PUT    /api/tickets/{id}           → Update ticket (ADMIN/STAFF)
 *  - DELETE /api/tickets/{id}           → Close/delete ticket
 *  - GET    /api/tickets/stats          → Ticket statistics for dashboard
 * ================================================================
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class TicketController {

    private final TicketService ticketService;

    /** GET /api/tickets - Get all tickets (Admin/Staff only) */
    @GetMapping
    // TODO: Member 4 - Add @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<List<TicketDTO.TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    /** GET /api/tickets/{id} - Get ticket by ID */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO.TicketResponse> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    /** GET /api/tickets/user/{userId} - Get tickets reported by user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketDTO.TicketResponse>> getTicketsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUser(userId));
    }

    /** GET /api/tickets/status/{status} - Get tickets by status */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketDTO.TicketResponse>> getTicketsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
    }

    /**
     * POST /api/tickets - Report a new maintenance ticket
     * TODO: Member 4 - Replace userId param with @AuthenticationPrincipal
     */
    @PostMapping
    public ResponseEntity<TicketDTO.TicketResponse> createTicket(
            @RequestParam String userId, // TODO: Member 4 → Replace with JWT principal
            @Valid @RequestBody TicketDTO.TicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(userId, request));
    }

    /** PUT /api/tickets/{id} - Update ticket (status, priority, assignment) */
    @PutMapping("/{id}")
    // TODO: Member 4 - Add @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<TicketDTO.TicketResponse> updateTicket(
            @PathVariable String id,
            @RequestBody TicketDTO.TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    /** DELETE /api/tickets/{id} - Close a ticket */
    @DeleteMapping("/{id}")
    // TODO: Member 4 - Add @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Void> closeTicket(@PathVariable String id) {
        ticketService.closeTicket(id);
        return ResponseEntity.noContent().build();
    }
}
