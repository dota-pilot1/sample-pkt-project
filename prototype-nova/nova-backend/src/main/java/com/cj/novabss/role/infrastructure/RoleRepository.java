package com.cj.novabss.role.infrastructure;

import com.cj.novabss.role.domain.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleCode(String roleCode);

    boolean existsByRoleCode(String roleCode);

    List<Role> findAllByOrderByRoleCodeAsc();
}
