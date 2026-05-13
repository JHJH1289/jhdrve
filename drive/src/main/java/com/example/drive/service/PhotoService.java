package com.example.drive.service;

import com.example.drive.dto.DuplicatePhotoGroupResponse;
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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

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
    public PhotoUploadBatchResponse upload(String ownerId, String folderPath, String tags, MultipartFile[] files) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        String normalizedTags = String.join(",", normalizeTags(tags));

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files were provided.");
        }

        String normalizedFolderPath = normalizeFolderPath(folderPath);
        PhotoFolder folder = ensureFolder(normalizedOwnerId, normalizedFolderPath);
        folder.touch(LocalDateTime.now());

        List<PhotoUploadItemResponse> items = Arrays.stream(files)
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> uploadOne(normalizedOwnerId, normalizedFolderPath, normalizedTags, file))
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
    public List<FolderResponse> getAllFoldersForAdmin() {
        Set<String> ownerIds = new LinkedHashSet<>();
        photoFolderRepository.findAll()
                .stream()
                .map(PhotoFolder::getOwnerId)
                .map(this::normalizeOwnerId)
                .forEach(ownerIds::add);
        photoRepository.findDistinctOwnerId()
                .stream()
                .map(this::normalizeOwnerId)
                .forEach(ownerIds::add);

        for (String ownerId : ownerIds) {
            photoRepository.findDistinctFolderPathByOwnerId(ownerId)
                    .stream()
                    .map(this::normalizeFolderPath)
                    .forEach(folderPath -> ensureFolder(ownerId, folderPath));
        }

        return ownerIds.stream()
                .flatMap(ownerId -> photoFolderRepository.findAllByOwnerId(ownerId)
                        .stream()
                        .sorted(folderComparator())
                        .map(folder -> toFolderResponse(ownerId, folder)))
                .toList();
    }

    @Transactional
    public List<FolderResponse> getFolders(String ownerId) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);

        Set<String> folderPaths = new LinkedHashSet<>();
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

        long photoCount = photoRepository.countByOwnerIdAndFolderPath(normalizedOwnerId, normalizedFolderPath);
        if (photoCount > 0) {
            throw new IllegalArgumentException("폴더가 비어있지 않습니다.");
        }

        PhotoFolder folder = photoFolderRepository.findByOwnerIdAndFolderPath(normalizedOwnerId, normalizedFolderPath)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found. folderPath=" + normalizedFolderPath));
        photoFolderRepository.delete(folder);
    }

    @Transactional
    public void deleteFolderAsAdmin(String ownerId, String folderPath) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        String normalizedFolderPath = normalizeFolderPath(folderPath);

        List<Photo> photos = photoRepository.findAllByOwnerIdAndFolderPath(normalizedOwnerId, normalizedFolderPath);
        for (Photo photo : photos) {
            storageService.delete(photo.getStorageKey());
        }
        photoRepository.deleteAll(photos);

        photoFolderRepository.findByOwnerIdAndFolderPath(normalizedOwnerId, normalizedFolderPath)
                .ifPresent(photoFolderRepository::delete);
    }

    @Transactional
    public String renameFolder(String ownerId, String currentFolderPath, String nextFolderPath) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        String normalizedCurrentFolderPath = normalizeFolderPath(currentFolderPath);

        if (nextFolderPath == null || nextFolderPath.isBlank()) {
            throw new IllegalArgumentException("Folder name is required.");
        }

        String normalizedNextFolderPath = normalizeFolderPath(nextFolderPath);

        if (normalizedCurrentFolderPath.equals(normalizedNextFolderPath)) {
            return normalizedCurrentFolderPath;
        }

        if (photoFolderRepository.findByOwnerIdAndFolderPath(normalizedOwnerId, normalizedNextFolderPath).isPresent()) {
            throw new IllegalArgumentException("Folder already exists. folderPath=" + normalizedNextFolderPath);
        }

        PhotoFolder folder = photoFolderRepository
                .findByOwnerIdAndFolderPath(normalizedOwnerId, normalizedCurrentFolderPath)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Folder not found. folderPath=" + normalizedCurrentFolderPath
                ));
        folder.rename(normalizedNextFolderPath, LocalDateTime.now());
        photoRepository.updateFolderPathByOwnerId(
                normalizedOwnerId,
                normalizedCurrentFolderPath,
                normalizedNextFolderPath
        );

        return normalizedNextFolderPath;
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

    @Transactional
    public List<PhotoResponse> addTags(String ownerId, List<Long> photoIds, String tags) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        List<String> nextTags = normalizeTags(tags);

        if (photoIds == null || photoIds.isEmpty()) {
            throw new IllegalArgumentException("Photo ids are required.");
        }

        if (nextTags.isEmpty()) {
            throw new IllegalArgumentException("Tags are required.");
        }

        List<Photo> photos = photoRepository.findAllById(photoIds)
                .stream()
                .filter(photo -> normalizedOwnerId.equals(normalizeOwnerId(photo.getOwnerId())))
                .toList();

        if (photos.isEmpty()) {
            throw new IllegalArgumentException("No accessible photos were found.");
        }

        Set<String> touchedFolders = new LinkedHashSet<>();
        for (Photo photo : photos) {
            LinkedHashSet<String> mergedTags = new LinkedHashSet<>(splitTags(photo.getTags()));
            mergedTags.addAll(nextTags);
            photo.changeTags(String.join(",", mergedTags));
            touchedFolders.add(photo.getFolderPath());
        }

        LocalDateTime now = LocalDateTime.now();
        for (String folderPath : touchedFolders) {
            ensureFolder(normalizedOwnerId, folderPath).touch(now);
        }

        return photos.stream()
                .sorted(photoComparator())
                .map(this::toPhotoResponse)
                .toList();
    }

    @Transactional
    public List<PhotoResponse> removeTags(String ownerId, List<Long> photoIds, String tags) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        Set<String> tagsToRemove = new LinkedHashSet<>(normalizeTags(tags));

        if (photoIds == null || photoIds.isEmpty()) {
            throw new IllegalArgumentException("Photo ids are required.");
        }

        if (tagsToRemove.isEmpty()) {
            throw new IllegalArgumentException("Tags are required.");
        }

        List<Photo> photos = photoRepository.findAllById(photoIds)
                .stream()
                .filter(photo -> normalizedOwnerId.equals(normalizeOwnerId(photo.getOwnerId())))
                .toList();

        if (photos.isEmpty()) {
            throw new IllegalArgumentException("No accessible photos were found.");
        }

        Set<String> touchedFolders = new LinkedHashSet<>();
        for (Photo photo : photos) {
            List<String> remainingTags = splitTags(photo.getTags())
                    .stream()
                    .filter(tag -> !tagsToRemove.contains(tag))
                    .toList();
            photo.changeTags(String.join(",", remainingTags));
            touchedFolders.add(photo.getFolderPath());
        }

        LocalDateTime now = LocalDateTime.now();
        for (String folderPath : touchedFolders) {
            ensureFolder(normalizedOwnerId, folderPath).touch(now);
        }

        return photos.stream()
                .sorted(photoComparator())
                .map(this::toPhotoResponse)
                .toList();
    }

    @Transactional
    public int deleteDuplicatePhotos(String ownerId) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);
        List<DuplicatePhotoGroup> groups = findDuplicatePhotoGroups(normalizedOwnerId);
        List<Photo> duplicates = groups.stream()
                .flatMap(group -> group.duplicatePhotos().stream())
                .toList();

        Set<String> touchedFolders = new LinkedHashSet<>();
        for (Photo duplicate : duplicates) {
            touchedFolders.add(duplicate.getFolderPath());
            storageService.delete(duplicate.getStorageKey());
        }

        photoRepository.deleteAll(duplicates);
        LocalDateTime now = LocalDateTime.now();
        for (String folderPath : touchedFolders) {
            ensureFolder(normalizedOwnerId, folderPath).touch(now);
        }

        return duplicates.size();
    }

    public List<DuplicatePhotoGroupResponse> getDuplicatePhotoGroups(String ownerId) {
        String normalizedOwnerId = normalizeOwnerId(ownerId);

        return findDuplicatePhotoGroups(normalizedOwnerId)
                .stream()
                .map(group -> new DuplicatePhotoGroupResponse(
                        toPhotoResponse(group.keepPhoto()),
                        group.duplicatePhotos().stream().map(this::toPhotoResponse).toList()
                ))
                .toList();
    }

    private List<DuplicatePhotoGroup> findDuplicatePhotoGroups(String ownerId) {
        List<Photo> photos = photoRepository.findAllByOwnerId(ownerId);
        Map<Long, List<Photo>> photosBySize = new HashMap<>();
        for (Photo photo : photos) {
            photosBySize.computeIfAbsent(photo.getFileSize(), ignored -> new ArrayList<>()).add(photo);
        }

        List<DuplicatePhotoGroup> groups = new ArrayList<>();
        for (List<Photo> sameSizePhotos : photosBySize.values()) {
            if (sameSizePhotos.size() < 2) {
                continue;
            }

            Map<String, List<Photo>> photosByHash = new HashMap<>();
            for (Photo photo : sameSizePhotos) {
                photosByHash.computeIfAbsent(fileHash(photo), ignored -> new ArrayList<>()).add(photo);
            }

            for (List<Photo> sameHashPhotos : photosByHash.values()) {
                if (sameHashPhotos.size() < 2) {
                    continue;
                }

                sameHashPhotos.sort(Comparator
                        .comparing(Photo::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Photo::getId));
                groups.add(new DuplicatePhotoGroup(
                        sameHashPhotos.get(0),
                        List.copyOf(sameHashPhotos.subList(1, sameHashPhotos.size()))
                ));
            }
        }

        return groups;
    }

    private PhotoUploadItemResponse uploadOne(String ownerId, String folderPath, String tags, MultipartFile file) {
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
        photo.changeTags(tags);

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
                savedPhoto.getLensModel(),
                splitTags(savedPhoto.getTags())
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
                photo.getLensModel(),
                splitTags(photo.getTags())
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

    private String fileHash(Photo photo) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            Resource resource = storageService.loadAsResource(photo.getStorageKey());
            try (InputStream inputStream = new DigestInputStream(resource.getInputStream(), digest)) {
                inputStream.transferTo(OutputStream.nullOutputStream());
            }
            return Base64.getEncoder().encodeToString(digest.digest());
        } catch (NoSuchAlgorithmException | IOException e) {
            throw new IllegalStateException("Failed to inspect duplicate photo.", e);
        }
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

        List<Photo> folderPhotos = photoRepository.findAllByOwnerIdAndFolderPath(ownerId, folder.getFolderPath());

        return new FolderResponse(
                ownerId,
                folder.getFolderPath(),
                updatedAt,
                folder.getSortOrder(),
                folderPhotos.size(),
                folderPhotos.stream()
                        .flatMap(photo -> splitTags(photo.getTags()).stream())
                        .distinct()
                        .sorted()
                        .toList(),
                folderPhotos
                        .stream()
                        .sorted(photoComparator())
                        .limit(3)
                        .map(photo -> buildImageUrl(photo.getId()))
                        .toList()
        );
    }

    private List<String> normalizeTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }

        return Stream.of(tags.split("[,#\\s]+"))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .limit(20)
                .toList();
    }

    private List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }

        return Stream.of(tags.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .toList();
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

    private record DuplicatePhotoGroup(Photo keepPhoto, List<Photo> duplicatePhotos) {
    }
}
