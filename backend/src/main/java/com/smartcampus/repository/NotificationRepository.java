package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ================================================================
 * NotificationRepository (MongoDB)
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * TODO Member 4:
 *  - Add mark-all-as-read bulk update
 *  - Add unread count query for badge count on UI
 *  - Add pagination for notification list (Pageable)
 * ================================================================
 */
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);

    List<Notification> findByRecipientIdAndIsReadFalse(String recipientId);

    long countByRecipientIdAndIsReadFalse(String recipientId);

    // TODO: Member 4 - Implement bulk mark-as-read via MongoTemplate or update query
    // Note: @Modifying JPQL is not available in MongoDB; use MongoTemplate.updateMulti() in a service
}
