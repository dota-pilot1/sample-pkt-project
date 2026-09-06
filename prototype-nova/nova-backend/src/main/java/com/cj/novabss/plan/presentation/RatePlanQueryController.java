package com.cj.novabss.plan.presentation;

import com.cj.novabss.plan.application.RatePlanQueryService;
import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import com.cj.novabss.plan.presentation.dto.RatePlanCategoryResponse;
import com.cj.novabss.plan.presentation.dto.RatePlanPageResponse;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/plans")
    public RatePlanPageResponse getPlans(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String categoryCode,
        @RequestParam(required = false) RatePlanSalesStatus status,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ratePlanQueryService.findRatePlans(keyword, categoryCode, status, page, size);
    }
}
