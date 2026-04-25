package com.smartcampus.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * FileController – Serves uploaded ticket image attachments.
 *
 * Files are stored on disk at: uploads/tickets/<filename>
 * This endpoint exposes them at:  GET /api/files/tickets/<filename>
 *
 * The Vite dev proxy forwards /api/* → http://localhost:9090,
 * so the frontend can load images via /api/files/tickets/<filename>
 * without any CORS issues.
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private static final String UPLOAD_DIR = "uploads/tickets";

    /**
     * Serve a file stored in the uploads/tickets directory.
     *
     * @param filename  The UUID-prefixed filename saved during ticket creation
     */
    @GetMapping("/tickets/{filename:.+}")
    public ResponseEntity<Resource> serveTicketFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type from file extension
            String contentType = resolveContentType(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String resolveContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".gif"))  return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg"))  return "image/svg+xml";
        // Default to jpeg for .jpg / .jpeg and unknown types
        return "image/jpeg";
    }
}
