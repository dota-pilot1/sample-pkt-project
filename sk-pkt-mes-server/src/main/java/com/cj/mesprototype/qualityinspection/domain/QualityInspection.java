package com.cj.mesprototype.qualityinspection.domain;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quality_inspections")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QualityInspection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lot_code", nullable = false, unique = true, length = 100)
    private String lotCode;

    @Column(name = "work_order_code", nullable = false, length = 100)
    private String workOrderCode;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "produced_at", nullable = false)
    private Instant producedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InspectionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private InspectionResult result;

    @Column(precision = 8, scale = 2)
    private BigDecimal dimension;

    @Column(name = "appearance_issue")
    private Boolean appearanceIssue;

    @Column(name = "defect_reason", length = 1000)
    private String defectReason;

    @ElementCollection
    @CollectionTable(name = "quality_inspection_photos", joinColumns = @jakarta.persistence.JoinColumn(name = "quality_inspection_id"))
    @Column(name = "photo_url", nullable = false, length = 2000)
    private final List<String> photoUrls = new ArrayList<>();

    @Column(name = "inspected_at")
    private Instant inspectedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public static QualityInspection waiting(String lotCode, String workOrderCode, String itemName,
                                             Integer quantity, Instant producedAt) {
        QualityInspection inspection = new QualityInspection();
        inspection.lotCode = lotCode;
        inspection.workOrderCode = workOrderCode;
        inspection.itemName = itemName;
        inspection.quantity = quantity;
        inspection.producedAt = producedAt;
        inspection.status = InspectionStatus.WAITING;
        return inspection;
    }

    public void recordResult(BigDecimal dimension, boolean appearanceIssue, InspectionResult result,
                             String defectReason, List<String> photoUrls) {
        this.dimension = dimension;
        this.appearanceIssue = appearanceIssue;
        this.result = result;
        this.defectReason = normalize(defectReason);
        this.photoUrls.clear();
        if (photoUrls != null) {
            photoUrls.stream()
                    .map(this::normalize)
                    .filter(java.util.Objects::nonNull)
                    .limit(3)
                    .forEach(this.photoUrls::add);
        }
        this.status = InspectionStatus.COMPLETED;
        this.inspectedAt = Instant.now();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
