package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ================================================================
 * BookingRepository
 * ================================================================
 * Custom queries:
 *  - findOverlappingApprovedBookings: Core conflict-detection query.
 *    Returns APPROVED bookings for a resource whose time window overlaps
 *    with [newStart, newEnd].
 *
 *    Overlap condition (Allen's interval algebra):
 *      existingStart < newEnd  AND  existingEnd > newStart
 *
 *    An optional excludeId is used when checking conflicts for an edit
 *    so the booking being edited doesn't conflict with itself.
 * ================================================================
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    /** All bookings for a specific user */
    List<Booking> findByUserId(String userId);

    /** All bookings for a specific resource */
    List<Booking> findByResourceId(String resourceId);

    /** All bookings with a given status */
    List<Booking> findByStatus(BookingStatus status);

    /** All bookings for a user with a given status */
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    /**
     * Conflict detection: Find APPROVED bookings for a resource that
     * overlap with the given [startTime, endTime] window.
     *
     * MongoDB query logic:
     *   - status = APPROVED              (only confirmed slots are blocked)
     *   - resourceId matches             (same resource)
     *   - startTime < newEnd             (existing booking starts before new one ends)
     *   - endTime > newStart             (existing booking ends after new one starts)
     *   - id != excludeId                (skip self when editing — pass "NONE" if not editing)
     */
    @Query("{ 'resourceId': ?0, 'status': 'APPROVED', 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 }, '_id': { $ne: ?3 } }")
    List<Booking> findOverlappingApprovedBookings(String resourceId, LocalDateTime newStart, LocalDateTime newEnd, String excludeId);
}
