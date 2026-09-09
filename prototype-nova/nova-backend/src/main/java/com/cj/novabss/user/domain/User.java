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

    @Column(name = "login_id", nullable = false, unique = true, length = 100)
    private String loginId;

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

    public static User create(String loginId, String passwordHash, String displayName, OffsetDateTime now) {
        User user = new User();
        user.loginId = loginId;
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
