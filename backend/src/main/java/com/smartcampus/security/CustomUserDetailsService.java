package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ================================================================
 * CustomUserDetailsService - Spring Security UserDetailsService
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth / Security Module
 *
 * Spring Security uses this to load user details during authentication.
 *
 * TODO Member 1:
 *  - Wire role to GrantedAuthority properly for @PreAuthorize support
 *  - Add "ROLE_" prefix to role string (e.g., "ROLE_ADMIN")
 * ================================================================
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // TODO: Member 1 - Map roles properly if using role hierarchy
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole())))
                .build();
    }
}
