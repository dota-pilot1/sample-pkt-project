package com.cj.mesprototype.common.upload;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws.s3")
public record S3Properties(
        String accessKey,
        String secretKey,
        String bucket,
        String region,
        String prefix,
        int presignExpiresSeconds
) {
    public boolean isConfigured() {
        return hasConfiguredValue(bucket) && hasConfiguredValue(region);
    }

    /** EC2/ECS 등의 IAM 역할 대신 로컬 키를 사용할 때만 정적 자격 증명을 사용한다. */
    public boolean hasStaticCredentials() {
        return hasConfiguredValue(accessKey) && hasConfiguredValue(secretKey);
    }

    private boolean hasConfiguredValue(String value) {
        if (value == null || value.isBlank()) return false;
        String normalized = value.trim().toLowerCase();
        return !normalized.startsWith("your_")
                && !normalized.startsWith("your-")
                && !normalized.startsWith("<");
    }
}
