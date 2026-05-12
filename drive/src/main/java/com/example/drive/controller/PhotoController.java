package com.example.drive.controller;

import com.example.drive.dto.FolderCreateRequest;
import com.example.drive.dto.PhotoResponse;
import com.example.drive.dto.PhotoFolderUpdateRequest;
import com.example.drive.dto.PhotoUploadBatchResponse;
import com.example.drive.service.PhotoService;
import com.example.drive.service.PhotoService.PhotoFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
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

    @PostMapping("/folders")
    public ResponseEntity<Map<String, String>> createFolder(
            Authentication authentication,
            @RequestBody FolderCreateRequest request
    ) {
        String username = authentication.getName();
        String folderPath = photoService.createFolder(username, request.getFolderPath());
        return ResponseEntity.ok(Map.of("folderPath", folderPath));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            Authentication authentication,
            @PathVariable("id") Long id
    ) {
        String username = authentication.getName();
        photoService.deletePhoto(username, id, isAdmin(authentication));
        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }

    @PatchMapping("/{id}/folder")
    public ResponseEntity<PhotoResponse> updateFolder(
            Authentication authentication,
            @PathVariable("id") Long id,
            @RequestBody PhotoFolderUpdateRequest request
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.updatePhotoFolder(
                username,
                id,
                request.getFolderPath(),
                isAdmin(authentication)
        ));
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> view(
            Authentication authentication,
            @PathVariable("id") Long id
    ) {
        String username = authentication.getName();
        PhotoFile photoFile = photoService.getPhotoFile(username, id, isAdmin(authentication));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photoFile.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(photoFile.resource());
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
