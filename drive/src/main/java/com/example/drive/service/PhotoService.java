package com.example.drive.service;

import com.example.drive.dto.PhotoMetadata;
import com.example.drive.dto.PhotoResponse;
import com.example.drive.dto.PhotoUploadBatchResponse;
import com.example.drive.dto.PhotoUploadItemResponse;
import com.example.drive.dto.StoredFile;
import com.example.drive.entity.Photo;
import com.example.drive.repository.PhotoRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
public class PhotoService {

    private final StorageService storageService;
    private final PhotoRepository photoRepository;
    private final PhotoMetadataService photoMetadataService;

    public PhotoService(
            StorageService storageService,
            PhotoRepository photoRepository,
            PhotoMetadataService photoMetadataService
    ) {
        this.storageService = storageService;
        this.photoRepository = photoRepository;
        this.photoMetadataService = photoMetadataService;
    }

    @Transactional
    public PhotoUploadBatchResponse upload(String ownerId, String folderPath, MultipartFile[] files) {
        validateOwnerId(ownerId);

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String normalizedFolderPath = normalizeFolderPath(folderPath);

        List<PhotoUploadItemResponse> items = Arrays.stream(files)
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> {
                    PhotoMetadata metadata = photoMetadataService.extract(file);
                    StoredFile storedFile = storageService.store(file);

                    Photo photo = new Photo(
                            ownerId.trim(),
                            storedFile.getOriginalName(),
                            storedFile.getStorageKey(),
                            storedFile.getContentType(),
                            storedFile.getSize(),
                            LocalDateTime.now(),
                            normalizedFolderPath,
                            metadata.getWidth(),
                            metadata.getHeight(),
                            metadata.getTakenAt(),
                            metadata.getCameraModel(),
                            metadata.getIso()
                    );

                    Photo savedPhoto = photoRepository.save(photo);
                    String imageUrl = buildImageUrl(savedPhoto.getStorageKey());

                    return new PhotoUploadItemResponse(
                            savedPhoto.getId(),
                            savedPhoto.getOwnerId(),
                            savedPhoto.getFolderPath(),
                            savedPhoto.getOriginalName(),
                            savedPhoto.getStorageKey(),
                            savedPhoto.getFileSize(),
                            imageUrl,
                            savedPhoto.getWidth(),
                            savedPhoto.getHeight(),
                            savedPhoto.getTakenAt(),
                            savedPhoto.getCameraModel(),
                            savedPhoto.getIso()
                    );
                })
                .toList();

        if (items.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        return new PhotoUploadBatchResponse(items.size(), items);
    }

    public Resource getPhoto(String storageKey) {
        return storageService.loadAsResource(storageKey);
    }

    public String getPhotoContentType(String storageKey) {
        return photoRepository.findByStorageKey(storageKey)
                .map(Photo::getContentType)
                .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    }

    public List<PhotoResponse> getPhotos(String ownerId, String folderPath) {
        validateOwnerId(ownerId);

        String normalizedFolderPath = normalizeFolderPath(folderPath);

        return photoRepository.findAllByOwnerId(ownerId.trim())
                .stream()
                .filter(photo -> normalizedFolderPath.equals(photo.getFolderPath()))
                .sorted(photoComparator())
                .map(photo -> new PhotoResponse(
                        photo.getId(),
                        photo.getOwnerId(),
                        photo.getFolderPath(),
                        photo.getOriginalName(),
                        photo.getStorageKey(),
                        photo.getContentType(),
                        photo.getFileSize(),
                        buildImageUrl(photo.getStorageKey()),
                        photo.getCreatedAt(),
                        photo.getWidth(),
                        photo.getHeight(),
                        photo.getTakenAt(),
                        photo.getCameraModel(),
                        photo.getIso()
                ))
                .toList();
    }

    public List<String> getFolders(String ownerId) {
        validateOwnerId(ownerId);

        return photoRepository.findDistinctFolderPathByOwnerId(ownerId.trim())
                .stream()
                .map(this::normalizeFolderPath)
                .distinct()
                .toList();
    }

    @Transactional
    public void deletePhoto(String ownerId, Long id) {
        validateOwnerId(ownerId);

        Photo photo = photoRepository.findByIdAndOwnerId(id, ownerId.trim())
                .orElseThrow(() -> new IllegalArgumentException("해당 사진이 존재하지 않습니다. id=" + id));

        storageService.delete(photo.getStorageKey());
        photoRepository.delete(photo);
    }

    private Comparator<Photo> photoComparator() {
        return Comparator
                .comparing(Photo::getTakenAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Photo::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Photo::getId, Comparator.reverseOrder());
    }

    private String buildImageUrl(String storageKey) {
        String encodedKey = URLEncoder.encode(storageKey, StandardCharsets.UTF_8);
        return "/api/photos/view?key=" + encodedKey;
    }

    private void validateOwnerId(String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("ownerId가 필요합니다.");
        }
    }

    private String normalizeFolderPath(String folderPath) {
        if (folderPath == null || folderPath.isBlank()) {
            return "기본";
        }

        String normalized = folderPath.trim().replace('\\', '/');
        normalized = normalized.replaceAll("/+", "/");
        normalized = normalized.replaceAll("^/+|/+$", "");

        if (normalized.isBlank()) {
            return "기본";
        }

        return normalized;
    }
}