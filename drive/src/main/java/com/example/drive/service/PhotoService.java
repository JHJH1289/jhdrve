package com.example.drive.service;

import com.example.drive.dto.FolderResponse;
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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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
        PhotoFolder folder = ensureFolder(normalizedOwnerId, normalizedFolderPath);
        folder.touch(LocalDateTime.now());

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

    @Transactional
    public List<FolderResponse> getFolders(String ownerId) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);

        Set<String> folderPaths = new LinkedHashSet<>();
        folderPaths.add(DEFAULT_FOLDER);
        photoRepository.findDistinctFolderPathByOwnerId(normalizedOwnerId)
                .stream()
                .map(this::normalizeFolderPath)
                .forEach(folderPaths::add);
        folderPaths.forEach(folderPath -> ensureFolder(normalizedOwnerId, folderPath));

        return photoFolderRepository.findAllByOwnerId(normalizedOwnerId)
                .stream()
                .sorted(folderComparator())
                .map(folder -> toFolderResponse(normalizedOwnerId, folder))
                .toList();
    }

    @Transactional
    public String createFolder(String ownerId, String folderPath) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        String normalizedFolderPath = normalizeFolderPath(folderPath);
        ensureFolder(normalizedOwnerId, normalizedFolderPath);
        return normalizedFolderPath;
    }

    @Transactional
    public void deleteEmptyFolder(String ownerId, String folderPath) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        String normalizedFolderPath = normalizeFolderPath(folderPath);

        if (DEFAULT_FOLDER.equals(normalizedFolderPath)) {
            throw new IllegalArgumentException("Default folder cannot be deleted.");
        }

        long photoCount = photoRepository.countByOwnerIdAndFolderPath(normalizedOwnerId, normalizedFolderPath);
        if (photoCount > 0) {
            throw new IllegalArgumentException("Only empty folders can be deleted.");
        }

        PhotoFolder folder = photoFolderRepository.findByOwnerIdAndFolderPath(normalizedOwnerId, normalizedFolderPath)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found. folderPath=" + normalizedFolderPath));
        photoFolderRepository.delete(folder);
    }

    @Transactional
    public List<FolderResponse> updateFolderOrder(String ownerId, List<String> folderPaths) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);

        if (folderPaths == null || folderPaths.isEmpty()) {
            return getFolders(normalizedOwnerId);
        }

        int order = 0;
        for (String folderPath : folderPaths) {
            String normalizedFolderPath = normalizeFolderPath(folderPath);
            PhotoFolder folder = ensureFolder(normalizedOwnerId, normalizedFolderPath);
            folder.changeSortOrder(order++);
        }

        return getFolders(normalizedOwnerId);
    }

    @Transactional
    public void deletePhoto(String ownerId, Long id, boolean admin) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        Photo photo = findAccessiblePhoto(normalizedOwnerId, id, admin);

        ensureFolder(photo.getOwnerId(), photo.getFolderPath()).touch(LocalDateTime.now());
        storageService.delete(photo.getStorageKey());
        photoRepository.delete(photo);
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

    private PhotoFolder ensureFolder(String ownerId, String folderPath) {
        return photoFolderRepository.findByOwnerIdAndFolderPath(ownerId, folderPath)
                .orElseGet(() -> {
                    PhotoFolder folder = new PhotoFolder(ownerId, folderPath, LocalDateTime.now());
                    folder.changeSortOrder(nextFolderSortOrder(ownerId));
                    return photoFolderRepository.saveAndFlush(folder);
                });
    }

    private FolderResponse toFolderResponse(String ownerId, PhotoFolder folder) {
        LocalDateTime latestPhotoCreatedAt = photoRepository
                .findLatestCreatedAtByOwnerIdAndFolderPath(ownerId, folder.getFolderPath())
                .orElse(null);
        LocalDateTime updatedAt = latestDate(folder.getUpdatedAt(), latestPhotoCreatedAt);

        return new FolderResponse(
                folder.getFolderPath(),
                updatedAt,
                folder.getSortOrder(),
                photoRepository.countByOwnerIdAndFolderPath(ownerId, folder.getFolderPath())
        );
    }

    private LocalDateTime latestDate(LocalDateTime first, LocalDateTime second) {
        if (first == null) return second;
        if (second == null) return first;
        return first.isAfter(second) ? first : second;
    }

    private Comparator<PhotoFolder> folderComparator() {
        return Comparator
                .comparing(PhotoFolder::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(PhotoFolder::getFolderPath);
    }

    private int nextFolderSortOrder(String ownerId) {
        return photoFolderRepository.findAllByOwnerId(ownerId)
                .stream()
                .map(PhotoFolder::getSortOrder)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .map(order -> order + 1)
                .orElse(0);
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
