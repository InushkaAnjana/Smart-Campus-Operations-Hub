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
 * BookingRepository — MongoDB data access for Booking documents
 * ================================================================
 *
 * FILTERING QUERIES:
 *   Spring Data derives these from method names — no @Query needed.
 *   Caller (service) decides which method to call based on which
 *   filter parameters are present in the request.
 *
 * CONFLICT DETECTION QUERY (findOverlappingApprovedBookings):
 *   Checks Allen's interval-overlap condition:
 *     existingStart < newEnd  AND  existingEnd > newStart
 *   Only APPROVED bookings block a slot; PENDING/REJECTED/CANCELLED do not.
 *   The excludeId param lets us skip the booking being edited so it
 *   doesn't falsely conflict with itself. Pass "NONE" when not editing.
 *
 * SOFT DELETE SAFETY:
 *   Queries that drive the live UI should exclude DELETED bookings.
 *   The service layer is responsible for filtering those out when needed.
 * ================================================================
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // ─── Basic Lookups ─────────────────────────────────────────

    /** All bookings for a specific user (used by /my endpoint) */
    List<Booking> findByUserId(String userId);

    /** All bookings for a specific resource */
    List<Booking> findByResourceId(String resourceId);

    /** All bookings with a given status (e.g., fetch all PENDING for admin queue) */
    List<Booking> findByStatus(BookingStatus status);

    /** All bookings for a user with a given status */
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    // ─── Filtering Queries (used by admin GET /api/bookings) ───

    /**
     * Filter by resource and status combined.
     * Example: GET /api/bookings?resourceId=X&status=APPROVED
     */
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    /**
     * Filter by user and status combined.
     * Example: GET /api/bookings?userId=X&status=PENDING
     */
    List<Booking> findByUserIdAndStatusAndResourceId(String userId, BookingStatus status, String resourceId);

    /**
     * Filter by start time range — used for date-based filtering.
     * The service converts a LocalDate into a [startOfDay, endOfDay] range.
     * Example: GET /api/bookings?date=2026-04-10
     *   → startTime >= 2026-04-10T00:00  AND  startTime < 2026-04-11T00:00
     */
    List<Booking> findByStartTimeBetween(LocalDateTime from, LocalDateTime to);

    /**
     * Filter by resourceId and start time range (date + resource combined).
     * Example: GET /api/bookings?resourceId=X&date=2026-04-10
     */
    List<Booking> findByResourceIdAndStartTimeBetween(String resourceId, LocalDateTime from, LocalDateTime to);

    /**
     * Filter by status and start time range (status + date combined).
     * Example: GET /api/bookings?status=APPROVED&date=2026-04-10
     */
    List<Booking> findByStatusAndStartTimeBetween(BookingStatus status, LocalDateTime from, LocalDateTime to);

    /**
     * Filter by userId and start time range (user + date combined).
     * Example: GET /api/bookings?userId=X&date=2026-04-10
     */
    List<Booking> findByUserIdAndStartTimeBetween(String userId, LocalDateTime from, LocalDateTime to);

    // ─── Conflict Detection ────────────────────────────────────

    /**
     * Find APPROVED bookings for a resource whose time window overlaps
     * with [newStart, newEnd], excluding a specific booking by ID.
     *
     * OVERLAP FORMULA (Allen's interval algebra):
     *   Two intervals [A_start, A_end] and [B_start, B_end] overlap when:
     *     A_start < B_end  AND  A_end > B_start
     *
     * In MongoDB query terms (where A = existing, B = new):
     *   - 'startTime' { $lt: newEnd }   → existing starts before new one ends
     *   - 'endTime'   { $gt: newStart } → existing ends after new one starts
     *
     * Why only APPROVED?
     *   PENDING bookings don't block slots yet — they are just requests.
     *   The slot is only "locked" once APPROVED. This prevents phantom
     *   conflicts where two users submit PENDING requests at the same time.
     *
     * Why excludeId?
     *   When an admin re-approves or an edit flow re-validates, we must
     *   not conflict with the same booking. Pass "NONE" when creating new.
     */
    @Query("{ 'resourceId': ?0, 'status': 'APPROVED', " +
           "'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 }, " +
           "'_id': { $ne: ?3 } }")
    List<Booking> findOverlappingApprovedBookings(
            String resourceId,
            LocalDateTime newStart,
            LocalDateTime newEnd,
            String excludeId
    );
}
