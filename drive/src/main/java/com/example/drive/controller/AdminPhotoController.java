package com.example.drive.controller;

import com.example.drive.dto.AdminFolderDeleteRequest;
import com.example.drive.dto.FolderResponse;
import com.example.drive.dto.PhotoResponse;
import com.example.drive.service.PhotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/folders")
    public ResponseEntity<List<FolderResponse>> getAllFolders() {
        return ResponseEntity.ok(photoService.getAllFoldersForAdmin());
    }

    @DeleteMapping("/folders")
    public ResponseEntity<Map<String, String>> deleteFolder(@RequestBody AdminFolderDeleteRequest request) {
        photoService.deleteFolderAsAdmin(request.getOwnerId(), request.getFolderPath());
        return ResponseEntity.ok(Map.of("message", "폴더 삭제 완료"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(Authentication authentication, @PathVariable("id") Long id) {
        photoService.deletePhoto(authentication.getName(), id, true);
        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }
}
