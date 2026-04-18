package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.model.Priority;
import com.smartcampus.model.TicketStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for Maintenance Tickets
 */
public interface TicketService {
    
    TicketResponseDTO createTicket(TicketRequestDTO request, List<MultipartFile> images, String currentUserId);
    
    List<TicketResponseDTO> getAllTickets(TicketStatus status, Priority priority, String assignedTo);
    
    List<TicketResponseDTO> getUserTickets(String userId);
    
    TicketResponseDTO getTicketById(String id);
    
    TicketResponseDTO updateTicketStatus(String id, TicketStatus newStatus, String rejectionReason, String currentUserId);
    
    TicketResponseDTO assignTechnician(String id, String technicianId);
    
    TicketResponseDTO addComment(String id, CommentDTO commentDTO, String currentUserId, String currentUserName);

    TicketResponseDTO editComment(String ticketId, int commentIndex, String newMessage, String currentUserId);

    TicketResponseDTO deleteComment(String ticketId, int commentIndex, String currentUserId);

    void deleteTicket(String id, String currentUserId);
}
