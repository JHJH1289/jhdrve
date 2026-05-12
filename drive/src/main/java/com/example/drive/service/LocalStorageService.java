package com.example.drive.service;

import com.example.drive.dto.StoredFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final List<StorageRoot> storageRoots;
    private final Map<String, StorageRoot> storageRootsById;

    public LocalStorageService(
            @Value("${app.storage.local.base-paths:${app.storage.local.base-path:./uploads}}") String basePaths
    ) {
        this.storageRoots = parseStorageRoots(basePaths);
        this.storageRootsById = storageRoots.stream()
                .collect(Collectors.toUnmodifiableMap(StorageRoot::id, Function.identity()));
    }

    @Override
    public StoredFile store(MultipartFile file) {
        validate(file);

        try {
            StorageRoot storageRoot = selectStorageRoot(file.getSize());
            LocalDate now = LocalDate.now();

            String ext = extractExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + (ext.isBlank() ? "" : "." + ext);
            String relativeKey = now.getYear()
                    + "/" + now.getMonthValue()
                    + "/" + now.getDayOfMonth()
                    + "/" + filename;

            Path target = resolveInRoot(storageRoot, relativeKey);
            Files.createDirectories(target.getParent());
            file.transferTo(target);

            return new StoredFile(
                    file.getOriginalFilename(),
                    storageRoot.id() + "/" + relativeKey,
                    file.getContentType(),
                    file.getSize()
            );
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file.", e);
        }
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        try {
            Path filePath = resolveStorageKey(storageKey);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new IllegalArgumentException("File not found.");
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Failed to load file.", e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Path filePath = resolveStorageKey(storageKey);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete file.", e);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file.");
        }

        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only image files can be uploaded.");
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }

        return originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
    }

    private List<StorageRoot> parseStorageRoots(String basePaths) {
        List<StorageRoot> roots = new ArrayList<>(Arrays.stream(basePaths.split(","))
                .map(String::trim)
                .filter(path -> !path.isBlank())
                .map(this::parseStorageRoot)
                .toList());

        if (roots.isEmpty()) {
            throw new IllegalStateException("At least one storage path must be configured.");
        }

        for (int i = 0; i < roots.size(); i++) {
            StorageRoot root = roots.get(i);
            if (root.id() == null || root.id().isBlank()) {
                roots.set(i, new StorageRoot("local" + (i + 1), root.path()));
            }
        }

        return List.copyOf(roots);
    }

    private StorageRoot parseStorageRoot(String pathConfig) {
        int separator = pathConfig.indexOf('=');
        if (separator > 0) {
            String id = pathConfig.substring(0, separator).trim();
            String rootPath = pathConfig.substring(separator + 1).trim();
            return new StorageRoot(id, Paths.get(rootPath).toAbsolutePath().normalize());
        }

        return new StorageRoot(null, Paths.get(pathConfig).toAbsolutePath().normalize());
    }

    private StorageRoot selectStorageRoot(long fileSize) throws IOException {
        for (StorageRoot root : storageRoots) {
            Files.createDirectories(root.path());
        }

        return storageRoots.stream()
                .filter(root -> root.path().toFile().getUsableSpace() >= fileSize)
                .max(Comparator.comparingLong(root -> root.path().toFile().getUsableSpace()))
                .orElseThrow(() -> new IllegalStateException("No storage path has enough free space."));
    }

    private Path resolveStorageKey(String storageKey) {
        String normalizedKey = normalizeStorageKey(storageKey);
        int separator = normalizedKey.indexOf('/');

        if (separator > 0) {
            String rootId = normalizedKey.substring(0, separator);
            StorageRoot root = storageRootsById.get(rootId);
            if (root != null) {
                return resolveInRoot(root, normalizedKey.substring(separator + 1));
            }
        }

        return resolveInRoot(storageRoots.get(0), normalizedKey);
    }

    private Path resolveInRoot(StorageRoot root, String relativeKey) {
        Path target = root.path().resolve(normalizeStorageKey(relativeKey)).normalize();
        if (!target.startsWith(root.path())) {
            throw new IllegalArgumentException("Invalid storage key.");
        }
        return target;
    }

    private String normalizeStorageKey(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException("Storage key is required.");
        }

        return storageKey.trim()
                .replace('\\', '/')
                .replaceAll("^/+", "");
    }

    private record StorageRoot(String id, Path path) {
    }
}
