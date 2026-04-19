package com.smartcampus.model;

/**
 * ================================================================
 * Role - User Role Enumeration
 * ================================================================
 * Owner: Member 1 (Team Lead) - Auth & Security Module
 *
 * ROLE HIERARCHY & ACCESS RIGHTS:
 *
 *  ADMIN      → Full system access. Can approve/reject bookings,
 *               manage resources, view all data, and perform all
 *               operations available to USER and TECHNICIAN.
 *
 *  TECHNICIAN → Specialized role for maintenance staff.
 *               Can update ticket statuses, add comments to tickets,
 *               and view assigned maintenance tasks.
 *
 *  USER       → Standard campus user (student/staff).
 *               Can create bookings, raise tickets, view own data,
 *               and receive notifications about their interactions.
 *
 * ROLE-BASED SECURITY FLOW:
 *   1. User registers with a role (defaults to USER).
 *   2. Role is stored in MongoDB and encoded into the JWT claims.
 *   3. JwtAuthFilter extracts the role from the JWT on each request.
 *   4. Spring Security maps the role to a GrantedAuthority (ROLE_<name>).
 *   5. @PreAuthorize / SecurityConfig rules enforce per-endpoint access.
 * ================================================================
 */
public enum Role {

    /**
     * Standard campus user — students, faculty, or general staff.
     * Default role assigned during registration.
     */
    USER,

    /**
     * System administrator — full access to all resources.
     * Can manage resources, approve bookings, and manage users.
     */
    ADMIN,

    /**
     * Maintenance technician — specialized access for ticket management.
     * Can update ticket statuses and add resolution comments.
     */
    TECHNICIAN
}
