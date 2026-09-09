package com.cj.novabss.role.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 역할에 부여된 권한 하나를 나타낸다. 같은 역할에 같은 권한을 두 번 부여할 수 없다. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "role_permissions",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_role_permissions_role_permission",
        columnNames = {"role_id", "permission_id"}
    )
)
public class RolePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private OffsetDateTime assignedAt;

    public static RolePermission assign(Role role, Permission permission, OffsetDateTime now) {
        RolePermission rolePermission = new RolePermission();
        rolePermission.role = role;
        rolePermission.permission = permission;
        rolePermission.assignedAt = now;
        return rolePermission;
    }

}
