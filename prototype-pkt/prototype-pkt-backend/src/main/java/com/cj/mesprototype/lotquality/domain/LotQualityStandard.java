package com.cj.mesprototype.lotquality.domain;

import com.cj.mesprototype.lot.domain.Product;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name = "lot_quality_standards", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "standard_name", "version"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LotQualityStandard {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id", nullable = false) private Product product;
    @Column(name = "standard_name", nullable = false, length = 150) private String standardName;
    @Column(nullable = false) private Integer version;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private LotQualityStandardStatus status;
    @Column(name = "required_lot_status", nullable = false, length = 30) private String requiredLotStatus;
    @Column(name = "pass_disposition", nullable = false, length = 20) private String passDisposition;
    @Column(name = "fail_disposition", nullable = false, length = 20) private String failDisposition;
    @Column(length = 500) private String description;
    @Column(name = "approved_at") private Instant approvedAt;
    @Column(name = "minimum_yield_rate", nullable = false, precision = 7, scale = 4) private BigDecimal minimumYieldRate;
    @Column(name = "minimum_good_quantity", nullable = false) private Integer minimumGoodQuantity;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @UpdateTimestamp @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public static LotQualityStandard create(Product product, String name, Integer version, String requiredLotStatus, BigDecimal minimumYieldRate, Integer minimumGoodQuantity, String passDisposition, String failDisposition, String description) {
        LotQualityStandard standard = new LotQualityStandard();
        standard.product = product;
        standard.standardName = name.trim();
        standard.version = version == null ? 1 : version;
        standard.status = LotQualityStandardStatus.DRAFT;
        standard.requiredLotStatus = requiredLotStatus.trim();
        standard.minimumYieldRate = minimumYieldRate;
        standard.minimumGoodQuantity = minimumGoodQuantity;
        standard.passDisposition = passDisposition.trim();
        standard.failDisposition = failDisposition.trim();
        standard.description = description == null || description.isBlank() ? null : description.trim();
        return standard;
    }

    public void update(String name, String requiredLotStatus, BigDecimal minimumYieldRate, Integer minimumGoodQuantity, String passDisposition, String failDisposition, String description) {
        ensureDraft();
        standardName = name.trim(); requiredLotStatus = requiredLotStatus.trim();
        this.minimumYieldRate = minimumYieldRate; this.minimumGoodQuantity = minimumGoodQuantity;
        this.passDisposition = passDisposition.trim(); this.failDisposition = failDisposition.trim();
        this.description = description == null || description.isBlank() ? null : description.trim();
    }
    public void approve() { status = LotQualityStandardStatus.APPROVED; approvedAt = Instant.now(); }
    public void inactivate() { status = LotQualityStandardStatus.INACTIVE; }
    public void ensureDraft() { if (status != LotQualityStandardStatus.DRAFT) throw new IllegalStateException("초안 상태의 품질 기준만 수정할 수 있습니다."); }
}
