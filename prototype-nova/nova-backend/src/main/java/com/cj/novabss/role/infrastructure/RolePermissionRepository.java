package com.cj.novabss.role.infrastructure;

import com.cj.novabss.role.domain.RolePermission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findAllByRoleId(Long roleId);
    List<RolePermission> findAllByPermissionId(Long permissionId);
    Optional<RolePermission> findByRoleIdAndPermissionId(Long roleId, Long permissionId);
    boolean existsByRoleId(Long roleId);
    boolean existsByPermissionId(Long permissionId);
    boolean existsByRoleIdAndPermissionId(Long roleId, Long permissionId);
    /** 역할에 연결된 권한을 모두 삭제한다. */
    void deleteAllByRoleId(Long roleId);

    /** 역할-권한 연결 행 목록을 저장한다. */
    default List<RolePermission> saveRolePermissionMappings(List<RolePermission> mappings) {
        return saveAll(mappings);
    }
}
