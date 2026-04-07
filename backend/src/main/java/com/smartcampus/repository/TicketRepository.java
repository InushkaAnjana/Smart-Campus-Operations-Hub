package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 * TicketRepository (MongoDB)
 * ================================================================
 * Owner: Member 4 - Maintenance & Tickets Module
 *
 * TODO Member 4:
 *  - Add findByAssignedToId(String staffId) once assignee is added
 *  - Add findByPriority() for urgency-based filtering
 *  - Add statistics queries (count by status, count by priority)
 * ================================================================
 */
@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByStatus(String status);

    List<Ticket> findByCreatedById(String createdById);

    List<Ticket> findByResourceId(String resourceId);

    List<Ticket> findByPriority(String priority);

    List<Ticket> findByStatusAndPriority(String status, String priority);

    // TODO: Member 4 - Add count queries for dashboard statistics
    // long countByStatus(String status);
    // long countByPriority(String priority);
}
