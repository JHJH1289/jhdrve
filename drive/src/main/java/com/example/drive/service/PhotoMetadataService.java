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

            String cameraMake = extractCameraMake(metadata);
            String cameraModel = extractCameraModel(metadata);
            String fNumber = extractFNumber(metadata);
            String exposureTime = extractExposureTime(metadata);
            Integer iso = extractIso(metadata);
            String lensModel = extractLensModel(metadata);

            return new PhotoMetadata(
                    width,
                    height,
                    takenAt,
                    cameraMake,
                    cameraModel,
                    fNumber,
                    exposureTime,
                    iso,
                    lensModel
            );
        } catch (Exception e) {
            return new PhotoMetadata(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
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

        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub != null && exifSub.containsTag(ExifSubIFDDirectory.TAG_EXIF_IMAGE_WIDTH)) {
            return exifSub.getInteger(ExifSubIFDDirectory.TAG_EXIF_IMAGE_WIDTH);
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

        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub != null && exifSub.containsTag(ExifSubIFDDirectory.TAG_EXIF_IMAGE_HEIGHT)) {
            return exifSub.getInteger(ExifSubIFDDirectory.TAG_EXIF_IMAGE_HEIGHT);
        }

        return null;
    }

    private LocalDateTime extractTakenAt(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }

        Date date = exifSub.getDateOriginal();
        if (date == null) {
            return null;
        }

        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

    private String extractCameraMake(Metadata metadata) {
        ExifIFD0Directory exif0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
        if (exif0 == null) {
            return null;
        }
        return exif0.getString(ExifIFD0Directory.TAG_MAKE);
    }

    private String extractCameraModel(Metadata metadata) {
        ExifIFD0Directory exif0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
        if (exif0 == null) {
            return null;
        }
        return exif0.getString(ExifIFD0Directory.TAG_MODEL);
    }

    private String extractFNumber(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }
        return exifSub.getDescription(ExifSubIFDDirectory.TAG_FNUMBER);
    }

    private String extractExposureTime(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }
        return exifSub.getDescription(ExifSubIFDDirectory.TAG_EXPOSURE_TIME);
    }

    private Integer extractIso(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }
        return exifSub.getInteger(ExifSubIFDDirectory.TAG_ISO_EQUIVALENT);
    }

    private String extractLensModel(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }
        return exifSub.getDescription(ExifSubIFDDirectory.TAG_LENS_MODEL);
    }
}