package com.cj.novabss.plan.infrastructure;

import com.cj.novabss.plan.domain.RatePlanCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatePlanCategoryRepository extends JpaRepository<RatePlanCategory, Long> {
    List<RatePlanCategory> findByActiveTrueOrderBySortOrderAsc();

    // 시더를 다시 실행해도 같은 카테고리를 추가하지 않기 위한 조회다.
    Optional<RatePlanCategory> findByCode(String code);
}
