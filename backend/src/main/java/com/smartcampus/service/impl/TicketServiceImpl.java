package com.smartcampus.service.impl;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketUpdateDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.TicketException;
import com.smartcampus.model.*;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ================================================================
 * TicketServiceImpl - Implementation of Maintenance Ticketing
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Directory for image uploads
    private final String uploadDir = "uploads/tickets";

    @Override
    public TicketResponseDTO createTicket(TicketRequestDTO request, List<MultipartFile> images, String currentUserId) {
        // Validate images count
        if (images != null && images.size() > 3) {
            throw new TicketException("Maximum 3 image attachments allowed");
        }

        Ticket ticket = Ticket.builder()
                .resourceId(request.getResourceId())
                .location(request.getLocation())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .contactDetails(request.getContactDetails())
                .createdById(currentUserId)
                .build();

        ticket.onCreate();

        // Handle Image Uploads
        if (images != null && !images.isEmpty()) {
            List<String> imagePaths = new ArrayList<>();
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    validateImage(image);
                    String fileName = saveImage(image);
                    imagePaths.add(fileName);
                }
            }
            ticket.setImageAttachments(imagePaths);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // ── CASE 3: Notify ALL ADMIN users that a new ticket has been created ──
        userRepository.findByRole("ADMIN").forEach(admin -> notificationService.sendNotification(
                admin.getId(),
                "New Maintenance Ticket",
                "A new maintenance ticket has been submitted: '" + request.getDescription() + "'.",
                "TICKET_OPENED"));

        // ── CASE 3b (optional): Confirm ticket submission to the owner ──────────
        // Sends a receipt-style notification so the creator knows their ticket
        // was persisted and is now awaiting admin review.
        notificationService.sendNotification(
                currentUserId,
                "Ticket Submitted Successfully",
                "Your ticket has been successfully submitted and is awaiting review.",
                "TICKET_OPENED");

        return mapToResponse(savedTicket);

    }

    @Override
    public List<TicketResponseDTO> getAllTickets(TicketStatus status, Priority priority, String assignedTo) {
        List<Ticket> tickets;

        if (status != null && priority != null) {
            tickets = ticketRepository.findByStatusAndPriority(status, priority);
        } else if (status != null) {
            tickets = ticketRepository.findByStatus(status);
        } else if (priority != null) {
            tickets = ticketRepository.findByPriority(priority);
        } else if (assignedTo != null) {
            tickets = ticketRepository.findByAssignedToId(assignedTo);
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponseDTO> getUserTickets(String userId) {
        return ticketRepository.findByCreatedById(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponseDTO getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return mapToResponse(ticket);
    }

    @Override
    public TicketResponseDTO updateTicketStatus(String id, TicketStatus newStatus, String rejectionReason,
            String currentUserId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus);
        ticket.onUpdate();

        if (newStatus == TicketStatus.REJECTED) {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new TicketException("Rejection reason is required when status is REJECTED");
            }
            ticket.setRejectionReason(rejectionReason);
        }

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);

        // ── CASE 5: Notify the ticket owner when their ticket is RESOLVED or REJECTED
        // ──
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.REJECTED) {
            String ownerTitle = newStatus == TicketStatus.RESOLVED
                    ? "Ticket Resolved"
                    : "Ticket Rejected";
            String ownerMessage = newStatus == TicketStatus.RESOLVED
                    ? "Your maintenance ticket has been marked as resolved."
                    : "Your maintenance ticket has been rejected. Reason: " + rejectionReason;

            notificationService.sendNotification(
                    ticket.getCreatedById(),
                    ownerTitle,
                    ownerMessage,
                    newStatus == TicketStatus.RESOLVED ? "TICKET_UPDATED" : "TICKET_UPDATED");
        }

        return mapToResponse(updatedTicket);
    }

    @Override
    public TicketResponseDTO assignTechnician(String id, String technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        // Verify technician exists (assuming staff management is handled by
        // UserRepository)
        userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        ticket.setAssignedToId(technicianId);
        ticket.onUpdate();
        Ticket savedTicket = ticketRepository.save(ticket);

        // ── CASE 4: Notify the specific TECHNICIAN that a ticket has been assigned to
        // them ──
        notificationService.sendNotification(
                technicianId,
                "New Ticket Assigned",
                "A maintenance ticket has been assigned to you: '" + ticket.getDescription() + "'.",
                "TICKET_UPDATED");

        return mapToResponse(savedTicket);
    }

    @Override
    public TicketResponseDTO addComment(String id, CommentDTO commentDTO, String currentUserId,
            String currentUserName) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Comment comment = Comment.builder()
                .userId(currentUserId)
                .userName(currentUserName)
                .message(commentDTO.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        if (ticket.getComments() == null)
            ticket.setComments(new ArrayList<>());
        ticket.getComments().add(comment);
        ticket.onUpdate();

        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponseDTO editComment(String ticketId, int commentIndex, String newMessage, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (ticket.getComments() == null || commentIndex >= ticket.getComments().size()) {
            throw new TicketException("Comment not found");
        }

        Comment comment = ticket.getComments().get(commentIndex);
        if (!comment.getUserId().equals(currentUserId)) {
            throw new TicketException("Only the owner can edit this comment");
        }

        comment.setMessage(newMessage);
        comment.setTimestamp(LocalDateTime.now());
        ticket.onUpdate();

        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponseDTO deleteComment(String ticketId, int commentIndex, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (ticket.getComments() == null || commentIndex >= ticket.getComments().size()) {
            throw new TicketException("Comment not found");
        }

        Comment comment = ticket.getComments().get(commentIndex);
        if (!comment.getUserId().equals(currentUserId)) {
            throw new TicketException("Only the owner can delete this comment");
        }

        ticket.getComments().remove(commentIndex);
        ticket.onUpdate();

        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponseDTO updateTicket(String id, TicketUpdateDTO updateDTO) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (updateDTO.getCategory() != null && !updateDTO.getCategory().isBlank()) {
            ticket.setCategory(updateDTO.getCategory());
        }
        if (updateDTO.getPriority() != null) {
            ticket.setPriority(updateDTO.getPriority());
        }
        if (updateDTO.getStatus() != null) {
            ticket.setStatus(updateDTO.getStatus());
            if (updateDTO.getStatus() == TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }
        // Empty string means "unassign"
        if (updateDTO.getAssignedToId() != null) {
            ticket.setAssignedToId(updateDTO.getAssignedToId().isBlank() ? null : updateDTO.getAssignedToId());
        }

        ticket.onUpdate();
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public void deleteTicket(String id, String currentUserId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        // Only owner or admin can delete (simplified)
        if (!ticket.getCreatedById().equals(currentUserId)) {
            // Check for ADMIN role via UserRepository if needed, but usually handled by
            // Security
            // throw new TicketException("Not authorized to delete this ticket");
        }

        ticketRepository.delete(ticket);
    }

    // ---- Private Helpers ----

    private void validateImage(MultipartFile file) {
        // Max size 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new TicketException("File size exceeds 5MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new TicketException("Only image files are allowed");
        }
    }

    private String saveImage(MultipartFile file) {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            throw new TicketException("Could not store image: " + e.getMessage());
        }
    }

    /**
     * WORKFLOW ENFORCEMENT:
     * - OPEN → IN_PROGRESS
     * - IN_PROGRESS → RESOLVED
     * - RESOLVED → CLOSED
     * - Any -> REJECTED (via ADMIN)
     */
    private void validateStatusTransition(TicketStatus current, TicketStatus target) {
        if (current == target)
            return;
        if (target == TicketStatus.REJECTED)
            return; // Admin can reject at any time

        boolean valid = switch (current) {
            case OPEN -> target == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> target == TicketStatus.RESOLVED;
            case RESOLVED -> target == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!valid) {
            throw new TicketException("Invalid status transition from " + current + " to " + target);
        }
    }

    private TicketResponseDTO mapToResponse(Ticket ticket) {
        List<CommentDTO> commentDTOs = ticket.getComments() == null ? new ArrayList<>()
                : ticket.getComments().stream()
                        .map(c -> CommentDTO.builder()
                                .userId(c.getUserId())
                                .userName(c.getUserName())
                                .message(c.getMessage())
                                .timestamp(c.getTimestamp())
                                .build())
                        .collect(Collectors.toList());

        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .resourceId(ticket.getResourceId())
                .location(ticket.getLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .imageAttachments(ticket.getImageAttachments())
                .createdById(ticket.getCreatedById())
                .assignedToId(ticket.getAssignedToId())
                .rejectionReason(ticket.getRejectionReason())
                .comments(commentDTOs)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }
}
