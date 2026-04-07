package com.smartcampus.service.impl;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * TicketServiceImpl - Maintenance & Tickets Implementation
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets Module
 *
 * TODO Member 4:
 *  1. Implement createTicket with notification to admin
 *  2. Implement updateTicket with status transitions
 *  3. Implement ticket assignment to staff member
 *  4. Add closeTicket with resolvedAt timestamp
 *  5. Add statistics aggregation method
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    @Override
    public List<TicketDTO.TicketResponse> getAllTickets() {
        return ticketRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
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
    public List<TicketDTO.TicketResponse> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TicketDTO.TicketResponse createTicket(String userId, TicketDTO.TicketRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + request.getResourceId()));

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status("OPEN")
                .createdById(user.getId())
                .resourceId(resource.getId())
                .build();

        ticket.onCreate();
        ticket = ticketRepository.save(ticket);

        // TODO: Member 4 - Notify admin on new ticket
        // notificationService.sendNotification(adminId, "New Ticket",
        //     "A new ticket has been raised: " + ticket.getTitle(), "NEW_TICKET");

        return mapToResponse(ticket, user, resource);
    }

    @Override
    public TicketDTO.TicketResponse updateTicket(String id, TicketDTO.TicketUpdateRequest request) {
        Ticket ticket = findTicketById(id);

        // TODO: Member 4 - Add status transition validation
        if (request.getStatus() != null) ticket.setStatus(request.getStatus());
        if (request.getPriority() != null) ticket.setPriority(request.getPriority());

        ticket.onUpdate();
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    public void closeTicket(String id) {
        Ticket ticket = findTicketById(id);
        ticket.setStatus("CLOSED");
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.onUpdate();
        ticketRepository.save(ticket);
    }

    // ---- Helpers ----
    private Ticket findTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    /** Used when creating a ticket — we already have User and Resource objects */
    private TicketDTO.TicketResponse mapToResponse(Ticket ticket, User user, Resource resource) {
        return TicketDTO.TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .createdBy(new TicketDTO.CreatorSummary(user.getId(), user.getName(), user.getEmail()))
                .resource(resource != null ? new TicketDTO.ResourceSummary(resource.getId(), resource.getName()) : null)
                .build();
    }

    /** Used when reading existing tickets — looks up user and resource by stored IDs */
    private TicketDTO.TicketResponse mapToResponse(Ticket ticket) {
        User user = userRepository.findById(ticket.getCreatedById()).orElse(null);
        Resource resource = ticket.getResourceId() != null
                ? resourceRepository.findById(ticket.getResourceId()).orElse(null)
                : null;

        return TicketDTO.TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .createdBy(user != null ? new TicketDTO.CreatorSummary(user.getId(), user.getName(), user.getEmail()) : null)
                .resource(resource != null ? new TicketDTO.ResourceSummary(resource.getId(), resource.getName()) : null)
                .build();
    }
}
