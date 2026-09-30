package com.cj.novabss.role.infrastructure;

import com.cj.novabss.role.domain.Permission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    @EntityGraph(attributePaths = "category")
    List<Permission> findAllByOrderByPermissionCodeAsc();
    @Override
    @EntityGraph(attributePaths = "category")
    Optional<Permission> findById(Long id);
    Optional<Permission> findByPermissionCode(String permissionCode);
    boolean existsByPermissionCode(String permissionCode);
}
