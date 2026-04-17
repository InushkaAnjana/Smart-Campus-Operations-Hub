package com.smartcampus.model;

/**
 * ================================================================
 * ResourceType — Enum for Campus Resource Categories
 * ================================================================
 * Used by the Resource document to classify resources:
 *   ROOM      → Lecture halls, seminar rooms, meeting rooms
 *   LAB       → Computer labs, science labs, research labs
 *   EQUIPMENT → Projectors, cameras, sports gear, tools, etc.
 *
 * Stored as a String in MongoDB for readability (via @Enumerated).
 * Validated at the controller layer via @Valid + DTO constraints.
 * ================================================================
 */
public enum ResourceType {

    /** A physical room: lecture hall, meeting room, seminar room */
    ROOM,

    /** A laboratory: computer lab, science lab, research lab */
    LAB,

    /** A piece of equipment: projector, camera, sports gear */
    EQUIPMENT
}
