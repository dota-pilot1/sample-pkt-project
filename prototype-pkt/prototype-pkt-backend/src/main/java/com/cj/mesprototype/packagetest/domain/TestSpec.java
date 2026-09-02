package com.cj.mesprototype.packagetest.domain;

import com.cj.mesprototype.lot.domain.Product;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pt_test_specs", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "spec_name", "version"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TestSpec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "spec_name", nullable = false, length = 150)
    private String specName;

    @Column(nullable = false)
    private Integer version;

    @Column(name = "test_stage", nullable = false, length = 50)
    private String testStage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TestSpecStatus status;

    @OneToMany(mappedBy = "testSpec", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceNo asc, testNumber asc")
    private final List<TestCondition> conditions = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public static TestSpec create(Product product, String specName, Integer version, String testStage, TestSpecStatus status) {
        TestSpec spec = new TestSpec();
        spec.product = product;
        spec.specName = specName.trim();
        spec.version = version == null ? 1 : version;
        spec.testStage = testStage.trim();
        spec.status = status == null ? TestSpecStatus.DRAFT : status;
        return spec;
    }

    public void update(String specName, String testStage, TestSpecStatus status) {
        this.specName = specName.trim();
        this.testStage = testStage.trim();
        if (status != null) this.status = status;
    }

    public void addCondition(TestCondition condition) {
        if (status == TestSpecStatus.APPROVED) {
            throw new IllegalStateException("승인된 테스트 스펙은 검사 조건을 변경할 수 없습니다.");
        }
        conditions.add(condition);
    }

    public void removeCondition(TestCondition condition) {
        if (status == TestSpecStatus.APPROVED) {
            throw new IllegalStateException("승인된 테스트 스펙은 검사 조건을 변경할 수 없습니다.");
        }
        conditions.remove(condition);
    }
}
