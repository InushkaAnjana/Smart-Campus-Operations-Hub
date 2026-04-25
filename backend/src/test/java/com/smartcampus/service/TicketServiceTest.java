package com.smartcampus.service;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.exception.TicketException;
import com.smartcampus.model.Priority;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private Ticket testTicket;

    @BeforeEach
    void setUp() {
        testTicket = Ticket.builder()
                .id("1")
                .description("Test Description")
                .status(TicketStatus.OPEN)
                .priority(Priority.MEDIUM)
                .createdById("user123")
                .build();
    }

    @Test
    void createTicket_Success() {
        TicketRequestDTO request = TicketRequestDTO.builder()
                .description("Leak in Room 101")
                .category("Plumbing")
                .priority(Priority.HIGH)
                .contactDetails("0771234567")
                .build();

        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        TicketResponseDTO response = ticketService.createTicket(request, null, "user123");

        assertNotNull(response);
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    void updateTicketStatus_ValidTransition_Success() {
        when(ticketRepository.findById("1")).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);

        TicketResponseDTO response = ticketService.updateTicketStatus("1", TicketStatus.IN_PROGRESS, null, "admin123");

        assertEquals(TicketStatus.IN_PROGRESS, response.getStatus());
    }

    @Test
    void updateTicketStatus_InvalidTransition_ThrowsException() {
        testTicket.setStatus(TicketStatus.OPEN);
        when(ticketRepository.findById("1")).thenReturn(Optional.of(testTicket));

        // OPEN to CLOSED is invalid (must go through IN_PROGRESS and RESOLVED)
        assertThrows(TicketException.class, () -> {
            ticketService.updateTicketStatus("1", TicketStatus.CLOSED, null, "admin123");
        });
    }

    @Test
    void updateTicketStatus_Rejected_RequiresReason() {
        when(ticketRepository.findById("1")).thenReturn(Optional.of(testTicket));

        assertThrows(TicketException.class, () -> {
            ticketService.updateTicketStatus("1", TicketStatus.REJECTED, null, "admin123");
        });
    }
}
