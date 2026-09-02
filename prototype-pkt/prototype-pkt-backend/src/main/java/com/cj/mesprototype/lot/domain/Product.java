package com.cj.mesprototype.lot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Locale;

/** LOT 흐름에서만 사용하는 제품 마스터. BOM/MRP의 items와 책임을 분리한다. */
@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "product_code", nullable = false, unique = true, length = 100)
    private String productCode;
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "package_type", length = 50)
    private String packageType;

    @Enumerated(EnumType.STRING)
    @Column(name = "classification", length = 30)
    private ProductClassification classification = ProductClassification.SEMI_FINISHED;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    private Product(String productCode, String productName) {
        this.productCode = normalizeCode(productCode);
        this.productName = productName.trim();
        this.classification = ProductClassification.SEMI_FINISHED;
    }

    public static Product of(String productCode, String productName) {
        return new Product(productCode, productName);
    }

    public static Product create(String productCode, String productName, String packageType, ProductClassification classification) {
        Product product = new Product(productCode, productName);
        product.packageType = normalizeOptional(packageType);
        product.classification = classification == null ? ProductClassification.SEMI_FINISHED : classification;
        return product;
    }

    public void update(String productName, String packageType, ProductClassification classification, boolean active) {
        this.productName = productName.trim();
        this.packageType = normalizeOptional(packageType);
        this.classification = classification == null ? ProductClassification.SEMI_FINISHED : classification;
        this.active = active;
    }

    /** 기존 LOT 시드의 패키지 타입을 제품 마스터로 승격할 때 이미 직접 입력한 값은 보존한다. */
    public void fillPackageTypeIfMissing(String packageType) {
        if (this.packageType == null) this.packageType = normalizeOptional(packageType);
    }

    public void fillClassificationIfMissing() {
        if (this.classification == null) this.classification = ProductClassification.SEMI_FINISHED;
    }

    private static String normalizeCode(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private static String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase(Locale.ROOT);
    }
}
