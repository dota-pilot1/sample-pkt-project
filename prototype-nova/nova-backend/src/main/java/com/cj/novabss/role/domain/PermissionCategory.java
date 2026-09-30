package com.cj.novabss.role.domain;

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

/** 권한을 업무 영역별로 묶는 1단계 마스터다. 역할은 분류가 아니라 개별 권한에 연결된다. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "permission_categories")
public class PermissionCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_code", nullable = false, unique = true, length = 50)
    private String categoryCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 300)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public static PermissionCategory create(String categoryCode, String name, String description, int sortOrder, OffsetDateTime now) {
        PermissionCategory category = new PermissionCategory();
        category.categoryCode = requiredText(categoryCode, "categoryCode");
        category.name = requiredText(name, "name");
        category.description = requiredText(description, "description");
        category.sortOrder = sortOrder;
        category.enabled = true;
        category.createdAt = now;
        return category;
    }

    public void changeDetails(String name, String description, int sortOrder) {
        this.name = requiredText(name, "name");
        this.description = requiredText(description, "description");
        this.sortOrder = sortOrder;
    }

    public void changeEnabled(boolean enabled) { this.enabled = enabled; }

    private static String requiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(fieldName + "은(는) 필수입니다.");
        return value.trim();
    }
}
