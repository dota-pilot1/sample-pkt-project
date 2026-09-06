package com.cj.novabss.plan.application;

import com.cj.novabss.plan.domain.RatePlan;
import com.cj.novabss.plan.domain.RatePlanCategory;
import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import com.cj.novabss.plan.infrastructure.RatePlanCategoryRepository;
import com.cj.novabss.plan.infrastructure.RatePlanRepository;
import com.cj.novabss.plan.presentation.dto.RatePlanCategoryResponse;
import com.cj.novabss.plan.presentation.dto.RatePlanPageResponse;
import com.cj.novabss.plan.presentation.dto.RatePlanSummaryResponse;
import jakarta.persistence.criteria.Join;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RatePlanQueryService {
    private final RatePlanCategoryRepository categoryRepository;
    private final RatePlanRepository ratePlanRepository;

    public RatePlanQueryService(RatePlanCategoryRepository categoryRepository, RatePlanRepository ratePlanRepository) {
        this.categoryRepository = categoryRepository;
        this.ratePlanRepository = ratePlanRepository;
    }

    public List<RatePlanCategoryResponse> findActiveCategories() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc().stream()
            .map(category -> new RatePlanCategoryResponse(category.getId(), category.getCode(), category.getName(), category.getSortOrder()))
            .toList();
    }

    public RatePlanPageResponse findRatePlans(String keyword, String categoryCode, RatePlanSalesStatus status, int page, int size) {
        Specification<RatePlan> specification = (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicate = builder.and(predicate, builder.or(
                    builder.like(builder.lower(root.get("ratePlanCode")), pattern),
                    builder.like(builder.lower(root.get("name")), pattern)
                ));
            }
            if (categoryCode != null && !categoryCode.isBlank()) {
                Join<RatePlan, RatePlanCategory> category = root.join("category");
                predicate = builder.and(predicate, builder.equal(category.get("code"), categoryCode.trim().toUpperCase()));
            }
            if (status != null) predicate = builder.and(predicate, builder.equal(root.get("salesStatus"), status));
            return predicate;
        };
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Page<RatePlan> result = ratePlanRepository.findAll(specification, PageRequest.of(safePage - 1, safeSize, Sort.by("ratePlanCode").ascending()));
        return new RatePlanPageResponse(result.getContent().stream().map(RatePlanSummaryResponse::from).toList(), safePage, safeSize, result.getTotalElements(), result.getTotalPages());
    }

}
