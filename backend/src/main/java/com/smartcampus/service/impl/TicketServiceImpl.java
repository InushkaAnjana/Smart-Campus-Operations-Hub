package com.smartcampus.service.impl;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.TicketException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.*;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
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

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String UPLOAD_DIR = "uploads/tickets/";

    @Override
    public List<TicketDTO.TicketResponse> getAllTickets(String statusStr, String priorityStr, String assignedTo) {
        List<Ticket> tickets = ticketRepository.findAll();

        // Apply filters
        if (StringUtils.hasText(statusStr)) {
            try {
                TicketStatus status = TicketStatus.valueOf(statusStr.toUpperCase());
                tickets = tickets.stream().filter(t -> t.getStatus() == status).collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Ignore invalid filter or handle error, let's ignore or throw
            }
        }
        if (StringUtils.hasText(priorityStr)) {
            try {
                Priority priority = Priority.valueOf(priorityStr.toUpperCase());
                tickets = tickets.stream().filter(t -> t.getPriority() == priority).collect(Collectors.toList());
            } catch (IllegalArgumentException e) {}
        }
        if (StringUtils.hasText(assignedTo)) {
            tickets = tickets.stream().filter(t -> assignedTo.equals(t.getTechnicianId())).collect(Collectors.toList());
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TicketDTO.TicketResponse getTicketById(String id) {
        return mapToResponse(findTicketById(id));
    }

    @Override
    public List<TicketDTO.TicketResponse> getTicketsByUser(String userId) {
        return ticketRepository.findByCreatedById(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TicketDTO.TicketResponse createTicket(String userId, TicketDTO.TicketRequest request, List<MultipartFile> images) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Resource resource = null;
        if (StringUtils.hasText(request.getResourceId())) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + request.getResourceId()));
        }

        List<String> imagePaths = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            if (images.size() > 3) {
                throw new TicketException("Maximum 3 images allowed", "VALIDATION_ERROR");
            }
            for (MultipartFile file : images) {
                imagePaths.add(saveImage(file));
            }
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .category(request.getCategory())
                .contactDetails(request.getContactDetails())
                .status(TicketStatus.OPEN)
                .createdById(user.getId())
                .resourceId(resource != null ? resource.getId() : null)
                .location(request.getLocation())
                .images(imagePaths)
                .comments(new ArrayList<>())
                .build();

        ticket.onCreate();
        ticket = ticketRepository.save(ticket);

        return mapToResponse(ticket, user, resource, null); // no technician initially
    }

    @Override
    public TicketDTO.TicketResponse updateTicketStatus(String id, String statusStr, String rejectReason, String userId) {
        Ticket ticket = findTicketById(id);
        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus;
        try {
            newStatus = TicketStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new TicketException("Invalid status value", "VALIDATION_ERROR");
        }

        // Validate transitions
        // OPEN → IN_PROGRESS → RESOLVED → CLOSED
        // ADMIN can set REJECTED with reason
        if (newStatus == TicketStatus.REJECTED) {
            if (!StringUtils.hasText(rejectReason)) {
                throw new TicketException("Reject reason is required", "VALIDATION_ERROR");
            }
            ticket.setRejectReason(rejectReason);
        } else {
            boolean valid = false;
            if (currentStatus == TicketStatus.OPEN && newStatus == TicketStatus.IN_PROGRESS) valid = true;
            else if (currentStatus == TicketStatus.IN_PROGRESS && newStatus == TicketStatus.RESOLVED) valid = true;
            else if (currentStatus == TicketStatus.RESOLVED && newStatus == TicketStatus.CLOSED) valid = true;
            
            if (!valid && currentStatus != newStatus) {
                throw new TicketException("Invalid status transition from " + currentStatus + " to " + newStatus, "INVALID_TRANSITION");
            }
        }

        ticket.setStatus(newStatus);
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) ticket.setResolvedAt(LocalDateTime.now());
        }

        ticket.onUpdate();
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketDTO.TicketResponse assignTechnician(String id, String technicianId) {
        Ticket ticket = findTicketById(id);
        
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + technicianId));
                
        ticket.setTechnicianId(technician.getId());
        ticket.onUpdate();
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketDTO.TicketResponse addComment(String id, String userId, TicketDTO.CommentDTO request) {
        Ticket ticket = findTicketById(id);
        
        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .message(request.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
        ticket.getComments().add(comment);
        ticket.onUpdate();
        return mapToResponse(ticketRepository.save(ticket));
    }
    
    @Override
    public TicketDTO.TicketResponse updateComment(String id, String commentId, String userId, TicketDTO.CommentDTO request) {
        Ticket ticket = findTicketById(id);
        
        Comment comment = ticket.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
            
        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }
        
        comment.setMessage(request.getMessage());
        ticket.onUpdate();
        return mapToResponse(ticketRepository.save(ticket));
    }
    
    @Override
    public TicketDTO.TicketResponse deleteComment(String id, String commentId, String userId) {
        Ticket ticket = findTicketById(id);
        
        Comment comment = ticket.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
            
        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        
        ticket.getComments().remove(comment);
        ticket.onUpdate();
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public void deleteTicket(String id) {
        Ticket ticket = findTicketById(id);
        ticketRepository.delete(ticket);
    }

    // ---- Helpers ----
    private Ticket findTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private String saveImage(MultipartFile file) {
        try {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new TicketException("File size exceeds 5MB limit", "VALIDATION_ERROR");
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new TicketException("Invalid file type. Only images are allowed.", "VALIDATION_ERROR");
            }
            
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return a mock URL or local path
            return "/api/images/tickets/" + filename;
        } catch (IOException e) {
            throw new TicketException("Failed to save image", "INTERNAL_ERROR");
        }
    }

    private TicketDTO.TicketResponse mapToResponse(Ticket ticket, User user, Resource resource, User technician) {
        List<TicketDTO.CommentResponse> commentResponses = new ArrayList<>();
        if (ticket.getComments() != null) {
            for (Comment c : ticket.getComments()) {
                String uName = "Unknown";
                User cUser = userRepository.findById(c.getUserId()).orElse(null);
                if (cUser != null) uName = cUser.getName();
                
                commentResponses.add(TicketDTO.CommentResponse.builder()
                        .id(c.getId())
                        .userId(c.getUserId())
                        .message(c.getMessage())
                        .timestamp(c.getTimestamp())
                        .userName(uName)
                        .build());
            }
        }
    
        return TicketDTO.TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .category(ticket.getCategory())
                .contactDetails(ticket.getContactDetails())
                .images(ticket.getImages())
                .rejectReason(ticket.getRejectReason())
                .location(ticket.getLocation())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .createdBy(user != null ? new TicketDTO.CreatorSummary(user.getId(), user.getName(), user.getEmail()) : null)
                .technician(technician != null ? new TicketDTO.CreatorSummary(technician.getId(), technician.getName(), technician.getEmail()) : null)
                .resource(resource != null ? new TicketDTO.ResourceSummary(resource.getId(), resource.getName()) : null)
                .comments(commentResponses)
                .build();
    }

    private TicketDTO.TicketResponse mapToResponse(Ticket ticket) {
        User user = null;
        if (StringUtils.hasText(ticket.getCreatedById())) {
            user = userRepository.findById(ticket.getCreatedById()).orElse(null);
        }
        
        Resource resource = null;
        if (StringUtils.hasText(ticket.getResourceId())) {
            resource = resourceRepository.findById(ticket.getResourceId()).orElse(null);
        }
        
        User technician = null;
        if (StringUtils.hasText(ticket.getTechnicianId())) {
            technician = userRepository.findById(ticket.getTechnicianId()).orElse(null);
        }

        return mapToResponse(ticket, user, resource, technician);
    }
}
