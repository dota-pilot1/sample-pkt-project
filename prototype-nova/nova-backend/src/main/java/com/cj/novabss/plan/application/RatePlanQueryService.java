package com.cj.novabss.plan.application;

import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import com.cj.novabss.plan.infrastructure.RatePlanCategoryRepository;
import com.cj.novabss.plan.infrastructure.RatePlanListRow;
import com.cj.novabss.plan.infrastructure.RatePlanQueryMapper;
import com.cj.novabss.plan.presentation.dto.RatePlanCategoryResponse;
import com.cj.novabss.plan.presentation.dto.RatePlanPageResponse;
import com.cj.novabss.plan.presentation.dto.RatePlanSearchCondition;
import com.cj.novabss.plan.presentation.dto.RatePlanSummaryResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RatePlanQueryService {
    private final RatePlanCategoryRepository categoryRepository;
    private final RatePlanQueryMapper ratePlanQueryMapper;

    public RatePlanQueryService(
        RatePlanCategoryRepository categoryRepository,
        RatePlanQueryMapper ratePlanQueryMapper
    ) {
        this.categoryRepository = categoryRepository;
        this.ratePlanQueryMapper = ratePlanQueryMapper;
    }

    public List<RatePlanCategoryResponse> findActiveCategories() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(category -> new RatePlanCategoryResponse(category.getId(), category.getCode(), category.getName(), category.getSortOrder()))
                .toList();
    }

    public RatePlanPageResponse findRatePlans(RatePlanSearchCondition condition) {
        String status = condition.getStatus();
        int page = condition.getPage();
        int size = condition.getSize();
        String sort = condition.getSort();
        String direction = condition.getDirection();

        // Controller의 @Valid를 거치지 않는 배치·다른 Service 호출도 같은 페이지 계약을 지키도록 방어 검증한다.
        if (page < 1) throw new RatePlanQueryException("INVALID_PAGE", "page는 1 이상이어야 합니다.");
        if (size < 1 || size > 100) throw new RatePlanQueryException("INVALID_SIZE", "size는 1 이상 100 이하여야 합니다.");

        // 문자열 query를 허용된 enum 값으로 변환해 이후 로직에서 임의의 값을 사용하지 못하게 한다.
        RatePlanSalesStatus statusFilter = parseStatus(status);
        RatePlanSortField sortField = RatePlanSortField.fromParameter(sort);
        RatePlanSortDirection sortDirection = RatePlanSortDirection.fromParameter(direction);

        List<RatePlanListRow> rows = ratePlanQueryMapper.findRatePlans(
            condition, statusFilter, sortField, sortDirection
        );

        long total = ratePlanQueryMapper.countRatePlans(condition, statusFilter);

        return new RatePlanPageResponse(
            rows.stream().map(row -> new RatePlanSummaryResponse(
                row.id(), row.ratePlanCode(), row.name(), row.categoryCode(), row.categoryName(),
                row.monthlyFee(), row.salesStatus(), row.updatedAt()
            )).toList(),
            page, size, total, (int) Math.ceil((double) total / size)
        );
    }

    private RatePlanSalesStatus parseStatus(String status) {
        // status가 없으면 전체 판매 상태를 조회하고, 값이 있으면 API에 공개된 enum만 허용한다.
        if (status == null || status.isBlank()) return null;
        try {
            return RatePlanSalesStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new RatePlanQueryException("INVALID_STATUS", "판매 상태가 올바르지 않습니다.");
        }
    }

}
