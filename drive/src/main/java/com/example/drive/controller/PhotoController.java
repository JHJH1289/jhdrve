package com.example.drive.controller;

import com.example.drive.dto.DuplicatePhotoGroupResponse;
import com.example.drive.dto.FolderCreateRequest;
import com.example.drive.dto.FolderOrderUpdateRequest;
import com.example.drive.dto.FolderRenameRequest;
import com.example.drive.dto.FolderResponse;
import com.example.drive.dto.PhotoResponse;
import com.example.drive.dto.PhotoTagUpdateRequest;
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
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam("files") MultipartFile[] files
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.upload(username, folderPath, tags, files));
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
    public ResponseEntity<List<FolderResponse>> getFolders(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.getFolders(username));
    }

    @GetMapping("/storage")
    public ResponseEntity<Map<String, Long>> getStorage(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.getStorageStatus(username));
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

    @DeleteMapping("/folders")
    public ResponseEntity<Map<String, String>> deleteFolder(
            Authentication authentication,
            @RequestBody FolderCreateRequest request
    ) {
        String username = authentication.getName();
        photoService.deleteEmptyFolder(username, request.getFolderPath());
        return ResponseEntity.ok(Map.of("message", "폴더 삭제 완료"));
    }

    @PostMapping("/folders/rename")
    public ResponseEntity<Map<String, String>> renameFolder(
            Authentication authentication,
            @RequestBody FolderRenameRequest request
    ) {
        String username = authentication.getName();
        String folderPath = photoService.renameFolder(
                username,
                request.getCurrentFolderPath(),
                request.getNextFolderPath()
        );
        return ResponseEntity.ok(Map.of("folderPath", folderPath));
    }

    @PostMapping("/folders/order")
    public ResponseEntity<List<FolderResponse>> updateFolderOrder(
            Authentication authentication,
            @RequestBody FolderOrderUpdateRequest request
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.updateFolderOrder(username, request.getFolderPaths()));
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

    @GetMapping("/trash")
    public ResponseEntity<List<PhotoResponse>> getTrash(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.getTrashPhotos(username));
    }

    @PostMapping("/trash/{id}/restore")
    public ResponseEntity<Map<String, String>> restoreTrash(
            Authentication authentication,
            @PathVariable("id") Long id
    ) {
        String username = authentication.getName();
        photoService.restorePhoto(username, id);
        return ResponseEntity.ok(Map.of("message", "복원 완료"));
    }

    @DeleteMapping("/trash/{id}")
    public ResponseEntity<Map<String, String>> deleteTrashPermanently(
            Authentication authentication,
            @PathVariable("id") Long id
    ) {
        String username = authentication.getName();
        photoService.deleteTrashPhotoPermanently(username, id);
        return ResponseEntity.ok(Map.of("message", "영구 삭제 완료"));
    }

    @DeleteMapping("/trash")
    public ResponseEntity<Map<String, Object>> emptyTrash(Authentication authentication) {
        String username = authentication.getName();
        int deletedCount = photoService.emptyTrash(username);
        return ResponseEntity.ok(Map.of(
                "message", "휴지통 비우기 완료",
                "deletedCount", deletedCount
        ));
    }

    @PostMapping("/tags")
    public ResponseEntity<List<PhotoResponse>> addTags(
            Authentication authentication,
            @RequestBody PhotoTagUpdateRequest request
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.addTags(username, request.getPhotoIds(), request.getTags()));
    }

    @PostMapping("/tags/remove")
    public ResponseEntity<List<PhotoResponse>> removeTags(
            Authentication authentication,
            @RequestBody PhotoTagUpdateRequest request
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.removeTags(username, request.getPhotoIds(), request.getTags()));
    }

    @PostMapping("/duplicates/delete")
    public ResponseEntity<Map<String, Object>> deleteDuplicates(Authentication authentication) {
        String username = authentication.getName();
        int deletedCount = photoService.deleteDuplicatePhotos(username);
        return ResponseEntity.ok(Map.of(
                "message", "중복 사진 삭제 완료",
                "deletedCount", deletedCount
        ));
    }

    @GetMapping("/duplicates")
    public ResponseEntity<List<DuplicatePhotoGroupResponse>> getDuplicates(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(photoService.getDuplicatePhotoGroups(username));
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

    @GetMapping("/thumbnail/{id}")
    public ResponseEntity<Resource> thumbnail(
            Authentication authentication,
            @PathVariable("id") Long id
    ) {
        String username = authentication.getName();
        PhotoFile photoFile = photoService.getPhotoThumbnailFile(username, id, isAdmin(authentication));

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
