package com.example.drive.service;

import com.example.drive.dto.PhotoMetadata;
import com.example.drive.dto.PhotoResponse;
import com.example.drive.dto.PhotoUploadBatchResponse;
import com.example.drive.dto.PhotoUploadItemResponse;
import com.example.drive.dto.StoredFile;
import com.example.drive.entity.Photo;
import com.example.drive.entity.PhotoFolder;
import com.example.drive.repository.PhotoFolderRepository;
import com.example.drive.repository.PhotoRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;

@Service
public class PhotoService {

    private static final String DEFAULT_FOLDER = "\uAE30\uBCF8";

    private final StorageService storageService;
    private final PhotoRepository photoRepository;
    private final PhotoFolderRepository photoFolderRepository;
    private final PhotoMetadataService photoMetadataService;

    public PhotoService(
            StorageService storageService,
            PhotoRepository photoRepository,
            PhotoFolderRepository photoFolderRepository,
            PhotoMetadataService photoMetadataService
    ) {
        this.storageService = storageService;
        this.photoRepository = photoRepository;
        this.photoFolderRepository = photoFolderRepository;
        this.photoMetadataService = photoMetadataService;
    }

    @Transactional
    public PhotoUploadBatchResponse upload(String ownerId, String folderPath, MultipartFile[] files) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files were provided.");
        }

        String normalizedFolderPath = normalizeFolderPath(folderPath);
        ensureFolder(normalizedOwnerId, normalizedFolderPath);

        List<PhotoUploadItemResponse> items = Arrays.stream(files)
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> uploadOne(normalizedOwnerId, normalizedFolderPath, file))
                .toList();

        if (items.isEmpty()) {
            throw new IllegalArgumentException("No files were provided.");
        }

        return new PhotoUploadBatchResponse(items.size(), items);
    }

    public PhotoFile getPhotoFile(String ownerId, Long id, boolean admin) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        Photo photo = findAccessiblePhoto(normalizedOwnerId, id, admin);

        Resource resource = storageService.loadAsResource(photo.getStorageKey());
        String contentType = photo.getContentType() != null
                ? photo.getContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return new PhotoFile(resource, contentType);
    }

    public List<PhotoResponse> getPhotos(String ownerId, String folderPath) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        String normalizedFolderPath = normalizeFolderPath(folderPath);

        return photoRepository.findAllByOwnerIdAndFolderPath(normalizedOwnerId, normalizedFolderPath)
                .stream()
                .sorted(photoComparator())
                .map(this::toPhotoResponse)
                .toList();
    }

    public List<PhotoResponse> getAllPhotos() {
        return photoRepository.findAll()
                .stream()
                .sorted(photoComparator())
                .map(this::toPhotoResponse)
                .toList();
    }

    public List<String> getFolders(String ownerId) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);

        TreeSet<String> folders = new TreeSet<>();
        folders.add(DEFAULT_FOLDER);
        photoFolderRepository.findAllByOwnerId(normalizedOwnerId)
                .stream()
                .map(PhotoFolder::getFolderPath)
                .map(this::normalizeFolderPath)
                .forEach(folders::add);
        photoRepository.findDistinctFolderPathByOwnerId(normalizedOwnerId)
                .stream()
                .map(this::normalizeFolderPath)
                .forEach(folders::add);

        return List.copyOf(folders);
    }

    @Transactional
    public String createFolder(String ownerId, String folderPath) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        String normalizedFolderPath = normalizeFolderPath(folderPath);
        ensureFolder(normalizedOwnerId, normalizedFolderPath);
        return normalizedFolderPath;
    }

    @Transactional
    public void deletePhoto(String ownerId, Long id, boolean admin) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        Photo photo = findAccessiblePhoto(normalizedOwnerId, id, admin);

        storageService.delete(photo.getStorageKey());
        photoRepository.delete(photo);
    }

    @Transactional
    public PhotoResponse updatePhotoFolder(String ownerId, Long id, String folderPath, boolean admin) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        Photo photo = findAccessiblePhoto(normalizedOwnerId, id, admin);

        String normalizedFolderPath = normalizeFolderPath(folderPath);
        ensureFolder(photo.getOwnerId(), normalizedFolderPath);
        photo.changeFolderPath(normalizedFolderPath);
        Photo savedPhoto = photoRepository.saveAndFlush(photo);
        return toPhotoResponse(savedPhoto);
    }

    private PhotoUploadItemResponse uploadOne(String ownerId, String folderPath, MultipartFile file) {
        PhotoMetadata metadata = photoMetadataService.extract(file);
        StoredFile storedFile = storageService.store(file);

        Photo photo = new Photo(
                ownerId,
                storedFile.getOriginalName(),
                storedFile.getStorageKey(),
                storedFile.getContentType(),
                storedFile.getSize(),
                LocalDateTime.now(),
                folderPath,
                metadata.getWidth(),
                metadata.getHeight(),
                metadata.getTakenAt(),
                metadata.getCameraMake(),
                metadata.getCameraModel(),
                metadata.getFocalLength(),
                metadata.getFNumber(),
                metadata.getExposureTime(),
                metadata.getIso(),
                metadata.getLensModel()
        );

        Photo savedPhoto = photoRepository.save(photo);
        return new PhotoUploadItemResponse(
                savedPhoto.getId(),
                savedPhoto.getOwnerId(),
                savedPhoto.getFolderPath(),
                savedPhoto.getOriginalName(),
                savedPhoto.getStorageKey(),
                savedPhoto.getFileSize(),
                buildImageUrl(savedPhoto.getId()),
                savedPhoto.getWidth(),
                savedPhoto.getHeight(),
                savedPhoto.getTakenAt(),
                savedPhoto.getCameraMake(),
                savedPhoto.getCameraModel(),
                savedPhoto.getFocalLength(),
                savedPhoto.getFNumber(),
                savedPhoto.getExposureTime(),
                savedPhoto.getIso(),
                savedPhoto.getLensModel()
        );
    }

    private PhotoResponse toPhotoResponse(Photo photo) {
        return new PhotoResponse(
                photo.getId(),
                photo.getOwnerId(),
                photo.getFolderPath(),
                photo.getOriginalName(),
                photo.getStorageKey(),
                photo.getContentType(),
                photo.getFileSize(),
                buildImageUrl(photo.getId()),
                photo.getCreatedAt(),
                photo.getWidth(),
                photo.getHeight(),
                photo.getTakenAt(),
                photo.getCameraMake(),
                photo.getCameraModel(),
                photo.getFocalLength(),
                photo.getFNumber(),
                photo.getExposureTime(),
                photo.getIso(),
                photo.getLensModel()
        );
    }

    private Photo findOwnedPhoto(String ownerId, Long id) {
        return photoRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found. id=" + id));
    }

    private Photo findAccessiblePhoto(String ownerId, Long id, boolean admin) {
        if (admin) {
            return photoRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Photo not found. id=" + id));
        }

        return findOwnedPhoto(ownerId, id);
    }

    private Comparator<Photo> photoComparator() {
        return Comparator
                .comparing(Photo::getTakenAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Photo::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Photo::getId, Comparator.reverseOrder());
    }

    private String buildImageUrl(Long photoId) {
        return "/api/photos/view/" + photoId;
    }

    private void ensureFolder(String ownerId, String folderPath) {
        if (photoFolderRepository.existsByOwnerIdAndFolderPath(ownerId, folderPath)) {
            return;
        }

        photoFolderRepository.saveAndFlush(new PhotoFolder(ownerId, folderPath, LocalDateTime.now()));
    }

    private String normalizeOwnerId(String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new IllegalArgumentException("ownerId is required.");
        }
        return ownerId.trim();
    }

    private String normalizeFolderPath(String folderPath) {
        if (folderPath == null || folderPath.isBlank()) {
            return DEFAULT_FOLDER;
        }

        String normalized = folderPath.trim().replace('\\', '/');
        normalized = normalized.replaceAll("/+", "/");
        normalized = normalized.replaceAll("^/+|/+$", "");

        if (normalized.isBlank()) {
            return DEFAULT_FOLDER;
        }

        return normalized;
    }

    public record PhotoFile(Resource resource, String contentType) {
    }
}
