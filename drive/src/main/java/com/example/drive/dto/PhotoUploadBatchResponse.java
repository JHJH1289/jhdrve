    package com.example.drive.dto;

    import java.util.List;

    public class PhotoUploadBatchResponse {

        private final int count;
        private final List<PhotoUploadItemResponse> items;

        public PhotoUploadBatchResponse(int count, List<PhotoUploadItemResponse> items) {
            this.count = count;
            this.items = items;
        }

        public int getCount() {
            return count;
        }

        public List<PhotoUploadItemResponse> getItems() {
            return items;
        }
    }