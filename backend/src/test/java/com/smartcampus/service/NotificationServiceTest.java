package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ================================================================
 * NotificationServiceTest - Unit Tests for NotificationServiceImpl
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * TEST STRATEGY:
 *  - Pure unit tests using Mockito (no Spring context, no MongoDB).
 *  - MongoTemplate is mocked for updateMulti() tests.
 *  - Each test verifies one specific behaviour.
 *
 * CASES COVERED:
 *  1.  getNotificationsForUser_ReturnsList    → Returns notifications newest-first
 *  2.  getUnreadCount_ReturnsCount           → Returns correct unread badge count
 *  3.  markAsRead_Success                    → Sets isRead=true and returns DTO
 *  4.  markAsRead_NotFound                   → 404 when notification ID missing
 *  5.  markAllAsRead_CallsMongoTemplate      → Bulk update invoked via MongoTemplate
 *  6.  deleteNotification_Success            → Document is deleted from repository
 *  7.  deleteNotification_NotFound           → 404 when notification ID missing
 *  8.  sendNotification_Success              → Notification built and saved
 *  9.  sendNotification_UserNotFound         → 404 when recipientId missing
 *  10. getNotificationsForUser_EmptyList     → Returns empty list (no error)
 * ================================================================
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository         userRepository;
    @Mock private MongoTemplate          mongoTemplate;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    // ─── Shared test fixtures ────────────────────────────────────

    private Notification testNotification;
    private User         testUser;

    private static final String NOTIF_ID   = "notif-id-001";
    private static final String USER_ID    = "user-id-001";
    private static final String TITLE      = "Booking Approved";
    private static final String MESSAGE    = "Your booking for Lab A has been approved.";
    private static final String TYPE       = "BOOKING_APPROVED";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .name("Alice")
                .email("alice@campus.edu")
                .role("USER")
                .build();

        testNotification = Notification.builder()
                .id(NOTIF_ID)
                .recipientId(USER_ID)
                .title(TITLE)
                .message(MESSAGE)
                .type(TYPE)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ════════════════════════════════════════════════════════════
    // GET NOTIFICATIONS FOR USER
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("1. getNotificationsForUser → returns list of notification DTOs")
    void getNotificationsForUser_ReturnsList() {
        // Arrange
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(USER_ID))
                .thenReturn(List.of(testNotification));

        // Act
        List<NotificationDTO.NotificationResponse> result =
                notificationService.getNotificationsForUser(USER_ID);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(NOTIF_ID);
        assertThat(result.get(0).getTitle()).isEqualTo(TITLE);
        assertThat(result.get(0).getMessage()).isEqualTo(MESSAGE);
        assertThat(result.get(0).getType()).isEqualTo(TYPE);
        assertThat(result.get(0).getIsRead()).isFalse();
        assertThat(result.get(0).getRecipientId()).isEqualTo(USER_ID);
    }

    @Test
    @DisplayName("10. getNotificationsForUser → returns empty list when no notifications exist")
    void getNotificationsForUser_EmptyList_ReturnsEmpty() {
        // Arrange
        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(USER_ID))
                .thenReturn(List.of());

        // Act
        List<NotificationDTO.NotificationResponse> result =
                notificationService.getNotificationsForUser(USER_ID);

        // Assert
        assertThat(result).isEmpty();
    }

    // ════════════════════════════════════════════════════════════
    // GET UNREAD COUNT
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("2. getUnreadCount → returns correct count from repository")
    void getUnreadCount_ReturnsCount() {
        // Arrange
        when(notificationRepository.countByRecipientIdAndIsReadFalse(USER_ID)).thenReturn(5L);

        // Act
        long count = notificationService.getUnreadCount(USER_ID);

        // Assert
        assertThat(count).isEqualTo(5L);
    }

    // ════════════════════════════════════════════════════════════
    // MARK AS READ
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("3. markAsRead → sets isRead=true and returns updated DTO")
    void markAsRead_Success_ReturnsUpdatedDto() {
        // Arrange
        when(notificationRepository.findById(NOTIF_ID))
                .thenReturn(Optional.of(testNotification));

        Notification saved = Notification.builder()
                .id(NOTIF_ID)
                .recipientId(USER_ID)
                .title(TITLE)
                .message(MESSAGE)
                .type(TYPE)
                .isRead(true)        // Updated
                .createdAt(testNotification.getCreatedAt())
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        // Act
        NotificationDTO.NotificationResponse result = notificationService.markAsRead(NOTIF_ID);

        // Assert
        assertThat(result.getIsRead()).isTrue();
        assertThat(result.getId()).isEqualTo(NOTIF_ID);
        verify(notificationRepository).save(argThat(n -> Boolean.TRUE.equals(n.getIsRead())));
    }

    @Test
    @DisplayName("4. markAsRead → throws ResourceNotFoundException when ID not found (404)")
    void markAsRead_NotFound_ThrowsException() {
        // Arrange
        when(notificationRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() -> notificationService.markAsRead("invalid-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("invalid-id");

        verify(notificationRepository, never()).save(any());
    }

    // ════════════════════════════════════════════════════════════
    // MARK ALL AS READ
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("5. markAllAsRead → calls MongoTemplate.updateMulti() once")
    void markAllAsRead_CallsMongoTemplateUpdateMulti() {
        // Act
        notificationService.markAllAsRead(USER_ID);

        // Assert — MongoTemplate.updateMulti invoked with some Query and Update targeting Notification
        verify(mongoTemplate).updateMulti(
                any(Query.class),
                any(Update.class),
                eq(Notification.class)
        );
        // NotificationRepository.save() should NOT be called (bulk update, not individual)
        verify(notificationRepository, never()).save(any());
    }

    // ════════════════════════════════════════════════════════════
    // DELETE NOTIFICATION
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("6. deleteNotification → deletes document from repository")
    void deleteNotification_Success_DeletesFromRepo() {
        // Arrange
        when(notificationRepository.findById(NOTIF_ID))
                .thenReturn(Optional.of(testNotification));

        // Act
        notificationService.deleteNotification(NOTIF_ID);

        // Assert
        verify(notificationRepository).delete(testNotification);
    }

    @Test
    @DisplayName("7. deleteNotification → throws ResourceNotFoundException when ID not found (404)")
    void deleteNotification_NotFound_ThrowsException() {
        // Arrange
        when(notificationRepository.findById("ghost-id")).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() -> notificationService.deleteNotification("ghost-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ghost-id");

        verify(notificationRepository, never()).delete(any());
    }

    // ════════════════════════════════════════════════════════════
    // SEND NOTIFICATION
    // ════════════════════════════════════════════════════════════

    @Test
    @DisplayName("8. sendNotification → builds and saves notification document")
    void sendNotification_ValidRecipient_SavesNotification() {
        // Arrange
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> inv.getArgument(0)); // Return the object passed to save()

        // Act
        notificationService.sendNotification(USER_ID, TITLE, MESSAGE, TYPE);

        // Assert — a Notification document was saved with correct fields
        verify(notificationRepository).save(argThat(n ->
                USER_ID.equals(n.getRecipientId())
                        && TITLE.equals(n.getTitle())
                        && MESSAGE.equals(n.getMessage())
                        && TYPE.equals(n.getType())
                        && Boolean.FALSE.equals(n.getIsRead())
                        && n.getCreatedAt() != null
        ));
    }

    @Test
    @DisplayName("9. sendNotification → throws ResourceNotFoundException when recipientId missing (404)")
    void sendNotification_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById("unknown-user")).thenReturn(Optional.empty());

        // Act + Assert — notification must NOT be saved for a non-existent user
        assertThatThrownBy(() ->
                notificationService.sendNotification("unknown-user", TITLE, MESSAGE, TYPE))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("unknown-user");

        verify(notificationRepository, never()).save(any());
    }
}
