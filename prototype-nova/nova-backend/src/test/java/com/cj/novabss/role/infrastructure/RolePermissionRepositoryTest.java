package com.cj.novabss.role.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.domain.RolePermission;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

/** H2 인메모리 DB에서 역할·권한 연결의 조회와 중복 방지 규칙을 검증한다. */
@SpringBootTest
@Transactional
class RolePermissionRepositoryTest {
    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Test
    void assignsPermissionToRoleAndFindsTheConnection() {

        // 기준 시간 설정
        OffsetDateTime assignedAt = OffsetDateTime.parse("2026-09-09T11:00:00+09:00");

        // 역할 데이터 생성
        Role role = roleRepository.save(Role.create("CATALOG_MANAGER", "카탈로그 관리자", assignedAt));

        // 권한 데이터 생성
        Permission permission = permissionRepository.save(
            Permission.create("CATALOG_READ", "카탈로그 조회", "카탈로그 목록과 상세를 조회한다.", assignedAt)
        );

        // 역할과 권한을 연결
        RolePermission assigned = rolePermissionRepository.saveAndFlush(
            RolePermission.assign(role, permission, assignedAt)
        );

        // 이후 권한 부여 서비스가 사용할 역할·권한 조합 조회를 검증한다.
        RolePermission found = rolePermissionRepository
            .findByRoleIdAndPermissionId(role.getId(), permission.getId())
            .orElseThrow();

        // DB에서 다시 찾은 연결 행이 방금 저장한 연결 행과 같은지 확인한다.
        assertThat(found.getId()).isEqualTo(assigned.getId());

        // 조회한 연결이 처음 저장한 역할을 가리키는지 확인한다.
        assertThat(found.getRole().getId()).isEqualTo(role.getId());

        // 조회한 연결이 처음 저장한 권한을 가리키는지 확인한다.
        assertThat(found.getPermission().getId()).isEqualTo(permission.getId());

        // 권한을 부여한 시간이 저장 과정에서 바뀌지 않았는지 확인한다.
        assertThat(found.getAssignedAt()).isEqualTo(assignedAt);

        // 역할 ID와 권한 ID 조합으로 연결의 존재 여부를 확인할 수 있는지 검증한다.
        assertThat(rolePermissionRepository.existsByRoleIdAndPermissionId(role.getId(), permission.getId())).isTrue();
    }

    @Test
    void rejectsDuplicatePermissionAssignmentForSameRole() {
        OffsetDateTime assignedAt = OffsetDateTime.parse("2026-09-09T11:00:00+09:00");
        Role role = roleRepository.save(Role.create("ORDER_MANAGER", "주문 관리자", assignedAt));
        Permission permission = permissionRepository.save(
            Permission.create("ORDER_READ", "주문 조회", "주문 목록과 상세를 조회한다.", assignedAt)
        );

        rolePermissionRepository.saveAndFlush(RolePermission.assign(role, permission, assignedAt));

        // 이 테스트의 핵심: 같은 role_id·permission_id 조합은 DB 복합 유니크 제약조건에서 거부해야 한다.
        assertThatThrownBy(() -> rolePermissionRepository.saveAndFlush(
            RolePermission.assign(role, permission, assignedAt.plusMinutes(1))
        )).isInstanceOf(DataIntegrityViolationException.class);
    }
}
