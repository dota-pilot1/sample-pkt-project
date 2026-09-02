package com.cj.mesprototype.packagetest.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "pt_test_conditions", uniqueConstraints = @UniqueConstraint(columnNames = {"test_spec_id", "test_number"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TestCondition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_spec_id", nullable = false)
    private TestSpec testSpec;

    @Column(name = "test_number", nullable = false)
    private Integer testNumber;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_type", nullable = false, length = 20)
    private TestConditionType conditionType;

    @Column(name = "lower_limit", precision = 18, scale = 6)
    private BigDecimal lowerLimit;

    @Column(name = "upper_limit", precision = 18, scale = 6)
    private BigDecimal upperLimit;

    @Column(length = 30)
    private String unit;

    @Column(name = "fail_bin_code", length = 50)
    private String failBinCode;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(nullable = false)
    private boolean active;

    public static TestCondition create(TestSpec testSpec, Integer testNumber, String testName,
                                       TestConditionType conditionType, BigDecimal lowerLimit,
                                       BigDecimal upperLimit, String unit, String failBinCode,
                                       Integer sequenceNo) {
        TestCondition condition = new TestCondition();
        condition.testSpec = testSpec;
        condition.update(testNumber, testName, conditionType, lowerLimit, upperLimit, unit, failBinCode, sequenceNo);
        condition.active = true;
        return condition;
    }

    public void update(Integer testNumber, String testName, TestConditionType conditionType,
                       BigDecimal lowerLimit, BigDecimal upperLimit, String unit,
                       String failBinCode, Integer sequenceNo) {
        this.testNumber = testNumber;
        this.testName = testName.trim();
        this.conditionType = conditionType;
        this.lowerLimit = lowerLimit;
        this.upperLimit = upperLimit;
        this.unit = unit == null || unit.isBlank() ? null : unit.trim();
        this.failBinCode = failBinCode == null || failBinCode.isBlank() ? null : failBinCode.trim();
        this.sequenceNo = sequenceNo == null ? testNumber : sequenceNo;
    }

    public void deactivate() { this.active = false; }
    public void activate() { this.active = true; }
}
