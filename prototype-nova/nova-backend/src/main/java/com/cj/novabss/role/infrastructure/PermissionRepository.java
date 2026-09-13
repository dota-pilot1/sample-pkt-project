package com.cj.novabss.role.infrastructure;

import com.cj.novabss.role.domain.Permission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findAllByOrderByPermissionCodeAsc();
    Optional<Permission> findByPermissionCode(String permissionCode);
    boolean existsByPermissionCode(String permissionCode);
}
