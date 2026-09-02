package com.cj.mesprototype.lotquality.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "lot_quality_rules", uniqueConstraints = @UniqueConstraint(columnNames = {"quality_standard_id", "display_order"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LotQualityRule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "quality_standard_id", nullable = false) private LotQualityStandard standard;
    @Column(name = "display_order", nullable = false) private Integer displayOrder;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private LotQualityMetric metric;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private LotQualityOperator operator;
    @Column(name = "threshold_decimal", precision = 12, scale = 4) private BigDecimal thresholdDecimal;
    @Column(name = "threshold_text", length = 50) private String thresholdText;
    @Column(nullable = false, length = 150) private String label;
    public static LotQualityRule create(LotQualityStandard standard, int order, LotQualityMetric metric, LotQualityOperator operator, BigDecimal decimal, String text, String label) {
        LotQualityRule rule = new LotQualityRule(); rule.standard = standard; rule.displayOrder = order; rule.metric = metric; rule.operator = operator; rule.thresholdDecimal = decimal; rule.thresholdText = text; rule.label = label.trim(); return rule;
    }
}
