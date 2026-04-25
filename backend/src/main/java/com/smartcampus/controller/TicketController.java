package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.dto.TicketUpdateDTO;
import com.smartcampus.model.Priority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.service.TicketService;
import com.smartcampus.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

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
    private final UserRepository userRepository;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestPart("ticket") @Valid TicketRequestDTO ticketRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        String userId = resolveUserId();
        TicketResponseDTO response = ticketService.createTicket(ticketRequest, images, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String assignedTo) {
        
        String role = resolveRole();
        if ("ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(ticketService.getAllTickets(status, priority, assignedTo));
        } else {
            return ResponseEntity.ok(ticketService.getUserTickets(resolveUserId()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets() {
        return ResponseEntity.ok(ticketService.getUserTickets(resolveUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable String id,
            @RequestBody TicketUpdateDTO updateDTO) {
        return ResponseEntity.ok(ticketService.updateTicket(id, updateDTO));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, reason, resolveUserId()));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable String id,
            @RequestParam String technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PatchMapping("/{id}/comment")
    public ResponseEntity<TicketResponseDTO> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentDTO commentDTO) {
        User user = resolveUser();
        return ResponseEntity.ok(ticketService.addComment(id, commentDTO, user.getId(), user.getName()));
    }

    @PutMapping("/{id}/comment/{index}")
    public ResponseEntity<TicketResponseDTO> editComment(
            @PathVariable String id,
            @PathVariable int index,
            @RequestBody String message) {
        return ResponseEntity.ok(ticketService.editComment(id, index, message, resolveUserId()));
    }

    @DeleteMapping("/{id}/comment/{index}")
    public ResponseEntity<TicketResponseDTO> deleteComment(
            @PathVariable String id,
            @PathVariable int index) {
        return ResponseEntity.ok(ticketService.deleteComment(id, index, resolveUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id, resolveUserId());
        return ResponseEntity.noContent().build();
    }

    // ════════════════════════════════════════════════════════════
    // SECURITY HELPERS
    // ════════════════════════════════════════════════════════════

    private User resolveUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            throw new RuntimeException("Unauthenticated user cannot perform this action");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + auth.getName()));
    }

    private String resolveUserId() {
        return resolveUser().getId();
    }

    private String resolveRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            throw new RuntimeException("Unauthenticated user cannot access roles");
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.replace("ROLE_", ""))
                .findFirst()
                .orElse("USER");
    }
}
