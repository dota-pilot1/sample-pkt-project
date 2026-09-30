package com.cj.novabss.role.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 역할에 연결할 수 있는 시스템 행동의 기준 정보다. 역할 연결은 RolePermission에서 관리한다. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "permission_code", nullable = false, unique = true, length = 100)
    private String permissionCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 500)
    private String description;

    // 기존 권한 데이터도 단계적으로 이관할 수 있도록 DB 컬럼은 일시적으로 nullable로 둔다.
    @ManyToOne
    @JoinColumn(name = "category_id")
    private PermissionCategory category;

    // 기존 로컬 DB에 컬럼을 추가할 때도 기존 행이 유효하도록 기본값을 명시한다.
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public static Permission create(String permissionCode, String name, String description, PermissionCategory category, OffsetDateTime now) {
        Permission permission = new Permission();
        permission.permissionCode = requiredText(permissionCode, "permissionCode");
        permission.name = requiredText(name, "name");
        permission.description = requiredText(description, "description");
        permission.category = category;
        permission.enabled = true;
        permission.createdAt = now;
        return permission;
    }

    /** 분류 도입 전 테스트·기존 코드와의 호환용 생성 경로다. 새 권한 등록은 Service에서 분류를 반드시 받는다. */
    public static Permission create(String permissionCode, String name, String description, OffsetDateTime now) {
        return create(permissionCode, name, description, null, now);
    }

    public void changeDetails(String name, String description) {
        this.name = requiredText(name, "name");
        this.description = requiredText(description, "description");
    }

    public void changeEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void changeCategory(PermissionCategory category) { this.category = category; }

    private static String requiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + "은(는) 필수입니다.");
        }
        return value.trim();
    }
}
