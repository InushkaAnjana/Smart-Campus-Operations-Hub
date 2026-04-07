package com.smartcampus.service.impl;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ================================================================
 * BookingServiceImpl - Booking Management Implementation
 * ================================================================
 * Owner: Member 2 - Booking Management Module
 *
 * TODO Member 2:
 *  1. Implement overlap detection using findOverlappingBookings()
 *  2. Implement booking status machine (PENDING→CONFIRMED→COMPLETED)
 *  3. Call NotificationService after booking is created/updated
 *  4. Add admin approval flow (approveBooking, rejectBooking)
 *  5. Add email confirmation trigger
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    // TODO: Member 2 - Inject NotificationService after Member 4 implements it
    // private final NotificationService notificationService;

    @Override
    public List<BookingDTO.BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public BookingDTO.BookingResponse getBookingById(String id) {
        return mapToResponse(findBookingById(id));
    }

    @Override
    public List<BookingDTO.BookingResponse> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO.BookingResponse> getBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceId(resourceId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public BookingDTO.BookingResponse createBooking(String userId, BookingDTO.BookingRequest request) {
        // Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        // TODO: Member 2 - Implement overlap check before saving
        // List<Booking> conflicts = bookingRepository.findOverlappingBookings(
        //     request.getResourceId(), request.getStartTime(), request.getEndTime());
        // if (!conflicts.isEmpty()) throw new BadRequestException("Resource already booked for this time slot");

        Booking booking = Booking.builder()
                .userId(user.getId())
                .resourceId(resource.getId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendeeCount(request.getAttendeeCount())
                .status("PENDING")
                .build();

        booking.onCreate();
        booking = bookingRepository.save(booking);

        // TODO: Member 2 - Notify user after booking is created
        // notificationService.sendNotification(userId, "Booking Created",
        //     "Your booking for " + resource.getName() + " is pending approval.", "BOOKING_PENDING");

        return mapToResponse(booking, user, resource);
    }

    @Override
    public BookingDTO.BookingResponse updateBookingStatus(String id, String status) {
        Booking booking = findBookingById(id);
        // TODO: Member 2 - Add status transition validation
        booking.setStatus(status);
        booking.onUpdate();
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public void cancelBooking(String id) {
        Booking booking = findBookingById(id);
        booking.setStatus("CANCELLED");
        booking.onUpdate();
        bookingRepository.save(booking);
    }

    // ---- Helpers ----
    private Booking findBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    /** Used for creating a new booking response when we already have User and Resource objects */
    private BookingDTO.BookingResponse mapToResponse(Booking booking, User user, Resource resource) {
        return BookingDTO.BookingResponse.builder()
                .id(booking.getId())
                .status(booking.getStatus())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendeeCount(booking.getAttendeeCount())
                .createdAt(booking.getCreatedAt())
                .user(new BookingDTO.UserSummary(user.getId(), user.getName(), user.getEmail()))
                .resource(new BookingDTO.ResourceSummary(resource.getId(), resource.getName(), resource.getLocation()))
                .build();
    }

    /** Used when reading existing bookings - looks up user and resource by stored IDs */
    private BookingDTO.BookingResponse mapToResponse(Booking booking) {
        User user = userRepository.findById(booking.getUserId())
                .orElse(null);
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElse(null);

        return BookingDTO.BookingResponse.builder()
                .id(booking.getId())
                .status(booking.getStatus())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendeeCount(booking.getAttendeeCount())
                .createdAt(booking.getCreatedAt())
                .user(user != null ? new BookingDTO.UserSummary(user.getId(), user.getName(), user.getEmail()) : null)
                .resource(resource != null ? new BookingDTO.ResourceSummary(resource.getId(), resource.getName(), resource.getLocation()) : null)
                .build();
    }
}
