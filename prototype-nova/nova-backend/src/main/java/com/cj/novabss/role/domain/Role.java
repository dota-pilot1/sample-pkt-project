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

/** 시스템 관리자, 상품 운영 담당자, 고객처럼 시스템에서 부여할 역할의 기준 정보다. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_code", nullable = false, unique = true, length = 50)
    private String roleCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public static Role create(String roleCode, String name, OffsetDateTime now) {
        Role role = new Role();
        role.roleCode = roleCode;
        role.name = name;
        role.enabled = true;
        role.createdAt = now;
        return role;
    }

    /** 역할 코드는 이미 사용자·권한 연결의 기준이므로 바꾸지 않고 표시 이름만 수정한다. */
    public void changeName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name은(는) 필수입니다.");
        }
        this.name = name.trim();
    }

    /** 비활성 역할은 기존 연결 이력은 보존하되 새 역할 부여 대상에서는 제외한다. */
    public void changeEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
