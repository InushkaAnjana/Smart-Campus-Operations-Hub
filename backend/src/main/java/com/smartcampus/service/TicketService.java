package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;

import java.util.List;

/**
 * ================================================================
 * TicketService Interface
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets Module
 *
 * TODO Member 4:
 *  - Implement all CRUD methods
 *  - Add notification trigger when ticket is created/updated
 *  - Add ticket assignment to staff
 *  - Add statistics method for dashboard (count by status)
 * ================================================================
 */
public interface TicketService {

    List<TicketDTO.TicketResponse> getAllTickets();

    TicketDTO.TicketResponse getTicketById(String id);

    List<TicketDTO.TicketResponse> getTicketsByUser(String userId);

    List<TicketDTO.TicketResponse> getTicketsByStatus(String status);

    TicketDTO.TicketResponse createTicket(String userId, TicketDTO.TicketRequest request);

    TicketDTO.TicketResponse updateTicket(String id, TicketDTO.TicketUpdateRequest request);

    void closeTicket(String id);

    // TODO: Member 4 - Add ticket statistics for dashboard
    // Map<String, Long> getTicketStatistics();
}
