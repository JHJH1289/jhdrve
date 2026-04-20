package com.example.drive.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.jpeg.JpegDirectory;
import com.drew.metadata.png.PngDirectory;
import com.example.drive.dto.PhotoMetadata;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class PhotoMetadataService {

    public PhotoMetadata extract(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);

            Integer width = extractWidth(metadata);
            Integer height = extractHeight(metadata);
            LocalDateTime takenAt = extractTakenAt(metadata);
            String cameraModel = extractCameraModel(metadata);
            Integer iso = extractIso(metadata);

            return new PhotoMetadata(width, height, takenAt, cameraModel, iso);
        } catch (Exception e) {
            return new PhotoMetadata(null, null, null, null, null);
        }
    }

    private Integer extractWidth(Metadata metadata) {
        JpegDirectory jpegDirectory = metadata.getFirstDirectoryOfType(JpegDirectory.class);
        if (jpegDirectory != null && jpegDirectory.containsTag(JpegDirectory.TAG_IMAGE_WIDTH)) {
            return jpegDirectory.getInteger(JpegDirectory.TAG_IMAGE_WIDTH);
        }

        PngDirectory pngDirectory = metadata.getFirstDirectoryOfType(PngDirectory.class);
        if (pngDirectory != null) {
            try {
                return pngDirectory.getInt(PngDirectory.TAG_IMAGE_WIDTH);
            } catch (Exception ignored) {
            }
        }

        ExifSubIFDDirectory exifSubIFDDirectory = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSubIFDDirectory != null && exifSubIFDDirectory.containsTag(ExifSubIFDDirectory.TAG_EXIF_IMAGE_WIDTH)) {
            return exifSubIFDDirectory.getInteger(ExifSubIFDDirectory.TAG_EXIF_IMAGE_WIDTH);
        }

        return null;
    }

    private Integer extractHeight(Metadata metadata) {
        JpegDirectory jpegDirectory = metadata.getFirstDirectoryOfType(JpegDirectory.class);
        if (jpegDirectory != null && jpegDirectory.containsTag(JpegDirectory.TAG_IMAGE_HEIGHT)) {
            return jpegDirectory.getInteger(JpegDirectory.TAG_IMAGE_HEIGHT);
        }

        PngDirectory pngDirectory = metadata.getFirstDirectoryOfType(PngDirectory.class);
        if (pngDirectory != null) {
            try {
                return pngDirectory.getInt(PngDirectory.TAG_IMAGE_HEIGHT);
            } catch (Exception ignored) {
            }
        }

        ExifSubIFDDirectory exifSubIFDDirectory = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSubIFDDirectory != null && exifSubIFDDirectory.containsTag(ExifSubIFDDirectory.TAG_EXIF_IMAGE_HEIGHT)) {
            return exifSubIFDDirectory.getInteger(ExifSubIFDDirectory.TAG_EXIF_IMAGE_HEIGHT);
        }

        return null;
    }

    private LocalDateTime extractTakenAt(Metadata metadata) {
        ExifSubIFDDirectory exifSubIFDDirectory = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSubIFDDirectory == null) {
            return null;
        }

        Date date = exifSubIFDDirectory.getDateOriginal();
        if (date == null) {
            return null;
        }

        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

    private String extractCameraModel(Metadata metadata) {
        ExifIFD0Directory exifIFD0Directory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
        if (exifIFD0Directory == null) {
            return null;
        }

        return exifIFD0Directory.getString(ExifIFD0Directory.TAG_MODEL);
    }

    private Integer extractIso(Metadata metadata) {
        ExifSubIFDDirectory exifSubIFDDirectory = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSubIFDDirectory == null) {
            return null;
        }

        return exifSubIFDDirectory.getInteger(ExifSubIFDDirectory.TAG_ISO_EQUIVALENT);
    }
}