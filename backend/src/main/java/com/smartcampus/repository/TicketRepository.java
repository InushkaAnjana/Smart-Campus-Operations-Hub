package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.Priority;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByCreatedById(String createdById);

    List<Ticket> findByResourceId(String resourceId);

    List<Ticket> findByPriority(Priority priority);
    
    List<Ticket> findByTechnicianId(String technicianId);

    List<Ticket> findByStatusAndPriority(TicketStatus status, Priority priority);
}
