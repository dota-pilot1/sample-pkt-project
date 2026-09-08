package com.cj.novabss.plan.presentation;

import com.cj.novabss.plan.application.RatePlanQueryService;
import com.cj.novabss.plan.presentation.dto.RatePlanCategoryResponse;
import com.cj.novabss.plan.presentation.dto.RatePlanPageResponse;
import com.cj.novabss.plan.presentation.dto.RatePlanSearchCondition;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class RatePlanQueryController {
    private final RatePlanQueryService ratePlanQueryService;

    public RatePlanQueryController(RatePlanQueryService ratePlanQueryService) {
        this.ratePlanQueryService = ratePlanQueryService;
    }

    @GetMapping("/plan-categories")
    public List<RatePlanCategoryResponse> getPlanCategories() {
        return ratePlanQueryService.findActiveCategories();
    }

    // 선택 필터와 페이지·정렬 기본값을 GET /api/plans의 query 계약으로 받는다.
    @GetMapping("/plans")
    public RatePlanPageResponse getPlans(
        @Valid @ModelAttribute RatePlanSearchCondition condition
    ) {
        // Controller는 HTTP query를 DTO로 묶어 검증하고, 조회는 Service에 위임한다.
        return ratePlanQueryService.findRatePlans(condition);
    }
}
