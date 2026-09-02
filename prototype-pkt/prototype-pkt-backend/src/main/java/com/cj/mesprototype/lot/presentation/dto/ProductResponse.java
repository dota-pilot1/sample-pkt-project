package com.cj.mesprototype.lot.presentation.dto;

import com.cj.mesprototype.lot.domain.Product;
import com.cj.mesprototype.lot.domain.ProductClassification;

import java.time.Instant;

public record ProductResponse(
        Long id,
        String productCode,
        String productName,
        String packageType,
        ProductClassification classification,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getProductCode(),
                product.getProductName(),
                product.getPackageType(),
                product.getClassification() == null ? ProductClassification.SEMI_FINISHED : product.getClassification(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
