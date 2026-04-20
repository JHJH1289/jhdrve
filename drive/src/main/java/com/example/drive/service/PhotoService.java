package com.example.drive.service;

import com.example.drive.dto.PhotoMetadata;
import com.example.drive.dto.PhotoResponse;
import com.example.drive.dto.PhotoUploadBatchResponse;
import com.example.drive.dto.PhotoUploadItemResponse;
import com.example.drive.dto.StoredFile;
import com.example.drive.entity.Photo;
import com.example.drive.repository.PhotoRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
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
    public PhotoUploadBatchResponse upload(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        List<PhotoUploadItemResponse> items = java.util.Arrays.stream(files)
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> {
                    PhotoMetadata metadata = photoMetadataService.extract(file);
                    StoredFile storedFile = storageService.store(file);

                    Photo photo = new Photo(
                            storedFile.getOriginalName(),
                            storedFile.getStorageKey(),
                            storedFile.getContentType(),
                            storedFile.getSize(),
                            LocalDateTime.now(),
                            metadata.getWidth(),
                            metadata.getHeight(),
                            metadata.getTakenAt(),
                            metadata.getCameraModel(),
                            metadata.getIso()
                    );

                    Photo savedPhoto = photoRepository.save(photo);

                    String encodedKey = URLEncoder.encode(savedPhoto.getStorageKey(), StandardCharsets.UTF_8);
                    String imageUrl = "/api/photos/view?key=" + encodedKey;

                    return new PhotoUploadItemResponse(
                            savedPhoto.getId(),
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

    public List<PhotoResponse> getPhotos() {
        return photoRepository.findAll()
                .stream()
                .map(photo -> {
                    String encodedKey = URLEncoder.encode(photo.getStorageKey(), StandardCharsets.UTF_8);
                    String imageUrl = "/api/photos/view?key=" + encodedKey;

                    return new PhotoResponse(
                            photo.getId(),
                            photo.getOriginalName(),
                            photo.getStorageKey(),
                            photo.getContentType(),
                            photo.getFileSize(),
                            imageUrl,
                            photo.getCreatedAt(),
                            photo.getWidth(),
                            photo.getHeight(),
                            photo.getTakenAt(),
                            photo.getCameraModel(),
                            photo.getIso()
                    );
                })
                .toList();
    }

    @Transactional
    public void deletePhoto(Long id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 사진이 존재하지 않습니다. id=" + id));

        storageService.delete(photo.getStorageKey());
        photoRepository.delete(photo);
    }
}