package com.cj.novabss.role.infrastructure;

import com.cj.novabss.role.domain.PermissionCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionCategoryRepository extends JpaRepository<PermissionCategory, Long> {
    List<PermissionCategory> findAllByOrderBySortOrderAscCategoryCodeAsc();
    Optional<PermissionCategory> findByCategoryCode(String categoryCode);
    boolean existsByCategoryCode(String categoryCode);
}
