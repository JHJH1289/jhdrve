package com.example.drive.controller;

import com.example.drive.dto.SharedFolderResponse;
import com.example.drive.service.PhotoService;
import com.example.drive.service.PhotoService.PhotoFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/share")
public class ShareController {

    private final PhotoService photoService;

    public ShareController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping("/{token}")
    public ResponseEntity<SharedFolderResponse> getSharedFolder(@PathVariable("token") String token) {
        return ResponseEntity.ok(photoService.getSharedFolder(token));
    }

    @GetMapping("/{token}/download")
    public ResponseEntity<StreamingResponseBody> downloadSharedFolder(@PathVariable("token") String token) {
        String filename = photoService.sharedFolderZipFilename(token);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition(filename))
                .body(outputStream -> photoService.writeSharedFolderZip(token, outputStream));
    }

    @GetMapping("/{token}/view/{id}")
    public ResponseEntity<Resource> viewSharedPhoto(
            @PathVariable("token") String token,
            @PathVariable("id") Long id
    ) {
        PhotoFile photoFile = photoService.getSharedPhotoFile(token, id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photoFile.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(photoFile.resource());
    }

    @GetMapping("/{token}/thumbnail/{id}")
    public ResponseEntity<Resource> viewSharedThumbnail(
            @PathVariable("token") String token,
            @PathVariable("id") Long id
    ) {
        PhotoFile photoFile = photoService.getSharedPhotoThumbnailFile(token, id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photoFile.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(photoFile.resource());
    }

    private String contentDisposition(String filename) {
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        return "attachment; filename=\"download.zip\"; filename*=UTF-8''" + encodedFilename;
    }
}
