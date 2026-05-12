package com.example.drive.controller;

import com.example.drive.dto.PhotoFolderUpdateRequest;
import com.example.drive.dto.PhotoResponse;
import com.example.drive.service.PhotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/photos")
public class AdminPhotoController {

    private final PhotoService photoService;

    public AdminPhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping
    public ResponseEntity<List<PhotoResponse>> getAllPhotos() {
        return ResponseEntity.ok(photoService.getAllPhotos());
    }

    @PatchMapping("/{id}/folder")
    public ResponseEntity<PhotoResponse> updateFolder(
            @PathVariable("id") Long id,
            @RequestBody PhotoFolderUpdateRequest request
    ) {
        return ResponseEntity.ok(photoService.updatePhotoFolder("admin", id, request.getFolderPath(), true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(Authentication authentication, @PathVariable("id") Long id) {
        photoService.deletePhoto(authentication.getName(), id, true);
        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }
}
