package com.cj.novabss.plan.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 요금제 분류를 저장하는 기준 테이블이다.
 */
@Entity
@Getter
// JPA가 리플렉션으로 Entity를 생성할 때 사용하는 기본 생성자다.
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "rate_plan_categories")
public class RatePlanCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * 초기 시드와 등록 기능에서 사용할 카테고리를 만든다.
     */
    public static RatePlanCategory create(String code, String name, int sortOrder, OffsetDateTime now) {
        RatePlanCategory category = new RatePlanCategory();
        category.code = code;
        category.name = name;
        category.active = true;
        category.sortOrder = sortOrder;
        category.createdAt = now;
        category.updatedAt = now;
        return category;
    }

}
