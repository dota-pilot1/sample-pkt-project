package com.cj.novabss.user.domain;

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

/** NOVA BSS에 로그인하는 사용자 계정이다. 역할은 UserRole을 통해 부여한다. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * API와 도메인에서는 이메일을 계정 식별자로 사용한다. 기존 로컬 DB의 login_id
     * 컬럼은 무중단 호환을 위해 유지하며, 물리 컬럼명 변경은 별도 DB 마이그레이션으로 수행한다.
     */
    @Column(name = "login_id", nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    // 원문 비밀번호가 아닌 BCrypt 단방향 해시만 보관한다.
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public static User create(String email, String passwordHash, String displayName, OffsetDateTime now) {
        User user = new User();
        user.email = email;
        user.passwordHash = passwordHash;
        user.displayName = displayName;
        user.active = true;
        user.createdAt = now;
        user.updatedAt = now;
        return user;
    }

    /** 운영자 비활성화 등으로 로그인할 수 없는 계정 상태를 표현한다. */
    public void deactivate(OffsetDateTime now) {
        this.active = false;
        this.updatedAt = now;
    }
}
