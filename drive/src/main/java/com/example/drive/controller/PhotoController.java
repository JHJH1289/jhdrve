package com.example.drive.controller;

import com.example.drive.dto.PhotoResponse;
import com.example.drive.dto.PhotoUploadBatchResponse;
import com.example.drive.service.PhotoService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<PhotoUploadBatchResponse> upload(@RequestParam("files") MultipartFile[] files) {
        return ResponseEntity.ok(photoService.upload(files));
    }

    @GetMapping
    public ResponseEntity<List<PhotoResponse>> getPhotos() {
        return ResponseEntity.ok(photoService.getPhotos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        photoService.deletePhoto(id);
        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }

    @GetMapping("/view")
    public ResponseEntity<Resource> view(@RequestParam("key") String key) {
        Resource resource = photoService.getPhoto(key);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }
}