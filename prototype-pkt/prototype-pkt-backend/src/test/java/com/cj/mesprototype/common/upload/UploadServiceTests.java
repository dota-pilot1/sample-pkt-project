package com.cj.mesprototype.common.upload;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class UploadServiceTests {
    private final UploadService uploadService = new UploadService(
            new S3Properties(null, null, "pkt-images", "ap-northeast-2", "sk-pkt-mes", 300),
            mock(S3Presigner.class)
    );

    @Test
    void rejectsImageLargerThanTenMegabytesBeforeIssuingUploadUrl() {
        BusinessException exception = assertThrows(BusinessException.class,
                () -> uploadService.presign(new UploadService.PresignCommand(
                        "defect.jpg", "image/jpeg", UploadService.MAX_IMAGE_SIZE_BYTES + 1, "quality-inspections")));

        assertEquals(ErrorCode.UPLOAD_FILE_TOO_LARGE, exception.getErrorCode());
    }

    @Test
    void recognizesOnlyObjectKeysUnderRequestedManagedFolder() {
        assertTrue(uploadService.isObjectKeyInFolder(
                "sk-pkt-mes/quality-inspections/defect.jpg", "quality-inspections"));
        assertFalse(uploadService.isObjectKeyInFolder(
                "sk-pkt-mes/profile-images/avatar.jpg", "quality-inspections"));
    }

    @Test
    void supportsIamRoleWhenOnlyBucketAndRegionAreConfigured() {
        S3Properties properties = new S3Properties(null, null, "pkt-images", "ap-northeast-2", "sk-pkt-mes", 300);

        assertTrue(properties.isConfigured());
        assertFalse(properties.hasStaticCredentials());
    }

    @Test
    void treatsExampleEnvironmentValuesAsUnconfigured() {
        S3Properties properties = new S3Properties(
                "YOUR_AWS_ACCESS_KEY_ID", "YOUR_AWS_SECRET_ACCESS_KEY",
                "your-bucket-name", "ap-northeast-2", "sk-pkt-mes", 300);

        assertFalse(properties.isConfigured());
        assertFalse(properties.hasStaticCredentials());
    }
}
