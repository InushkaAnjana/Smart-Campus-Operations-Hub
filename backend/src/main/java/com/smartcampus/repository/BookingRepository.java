package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ================================================================
 * BookingRepository (MongoDB)
 * ================================================================
 * Owner: Member 2 - Booking Management Module
 *
 * TODO Member 2:
 *  - Implement the overlapping bookings query
 *  - Add findByStatus() for admin filtering
 *  - Add findByUserIdAndStatus() for user's booking history
 *  - Add date range queries for calendar view
 * ================================================================
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(String resourceId);

    List<Booking> findByStatus(String status);

    List<Booking> findByUserIdAndStatus(String userId, String status);

    /**
     * TODO: Member 2 - Implement this to detect conflicting bookings
     * Finds bookings for a resource that overlap with the given time range (excluding CANCELLED).
     */
    @Query("{ 'resourceId': ?0, 'status': { $ne: 'CANCELLED' }, 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Booking> findOverlappingBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime);

    // TODO: Member 2 - Add upcoming bookings query for user dashboard
    // @Query("{ 'userId': ?0, 'startTime': { $gt: ?1 } }")
    // List<Booking> findUpcomingBookingsByUser(String userId, LocalDateTime now);
}
