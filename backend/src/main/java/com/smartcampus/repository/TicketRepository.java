package com.smartcampus.repository;

import com.smartcampus.model.Priority;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Maintenance Tickets
 */
@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    
    List<Ticket> findByStatus(TicketStatus status);
    
    List<Ticket> findByAssignedToId(String assignedToId);
    
    List<Ticket> findByResourceId(String resourceId);

    List<Ticket> findByCreatedById(String createdById);

    // Supporting multiple filters
    List<Ticket> findByStatusAndPriority(TicketStatus status, Priority priority);
    
    List<Ticket> findByStatusAndAssignedToId(TicketStatus status, String assignedToId);
    
    List<Ticket> findByPriority(Priority priority);
}
