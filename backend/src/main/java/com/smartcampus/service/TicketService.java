package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TicketService {

    List<TicketDTO.TicketResponse> getAllTickets(String status, String priority, String assignedTo);

    TicketDTO.TicketResponse getTicketById(String id);

    List<TicketDTO.TicketResponse> getTicketsByUser(String userId);

    TicketDTO.TicketResponse createTicket(String userId, TicketDTO.TicketRequest request, List<MultipartFile> images);

    TicketDTO.TicketResponse updateTicketStatus(String id, String status, String rejectReason, String userId);

    TicketDTO.TicketResponse assignTechnician(String id, String technicianId);

    TicketDTO.TicketResponse addComment(String id, String userId, TicketDTO.CommentDTO request);
    
    TicketDTO.TicketResponse updateComment(String id, String commentId, String userId, TicketDTO.CommentDTO request);
    
    TicketDTO.TicketResponse deleteComment(String id, String commentId, String userId);

    void deleteTicket(String id);

}
