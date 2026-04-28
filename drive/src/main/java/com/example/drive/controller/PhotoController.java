package com.example.drive.controller;

import com.example.drive.dto.PhotoResponse;
import com.example.drive.dto.PhotoUploadBatchResponse;
import com.example.drive.service.PhotoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoUploadBatchResponse> upload(
            Authentication authentication,
            @RequestParam(value = "folderPath", required = false) String folderPath,
            @RequestParam("files") MultipartFile[] files
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.upload(username, folderPath, files));
    }

    @GetMapping
    public ResponseEntity<List<PhotoResponse>> getPhotos(
            Authentication authentication,
            @RequestParam(value = "folderPath", required = false) String folderPath
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.getPhotos(username, folderPath));
    }

    @GetMapping("/folders")
    public ResponseEntity<List<String>> getFolders(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.getFolders(username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            Authentication authentication,
            @PathVariable("id") Long id
    ) {
        String username = authentication.getName();
        photoService.deletePhoto(username, id);
        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> view(
            Authentication authentication,
            @PathVariable("id") Long id
    ) {
        String username = authentication.getName();
        Resource resource = photoService.getPhotoById(username, id);
        String contentType = photoService.getPhotoContentTypeById(username, id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }
}