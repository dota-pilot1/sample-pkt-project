package com.cj.novabss.plan.application;

import com.cj.novabss.plan.domain.RatePlan;
import com.cj.novabss.plan.domain.RatePlanCategory;
import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import com.cj.novabss.plan.infrastructure.RatePlanCategoryRepository;
import com.cj.novabss.plan.infrastructure.RatePlanRepository;
import com.cj.novabss.plan.presentation.dto.CreateRatePlanRequest;
import com.cj.novabss.plan.presentation.dto.CreateRatePlanResponse;
import java.time.OffsetDateTime;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RatePlanCommandService {
    private final RatePlanCategoryRepository categoryRepository;
    private final RatePlanRepository ratePlanRepository;

    public RatePlanCommandService(RatePlanCategoryRepository categoryRepository, RatePlanRepository ratePlanRepository) {
        this.categoryRepository = categoryRepository;
        this.ratePlanRepository = ratePlanRepository;
    }

    public CreateRatePlanResponse create(CreateRatePlanRequest request) {
        // 조회·중복 검사의 기준을 하나로 맞추기 위해 입력 코드의 공백을 제거하고 대문자로 정규화한다.
        String categoryCode = request.categoryCode().trim().toUpperCase();
        String ratePlanCode = request.ratePlanCode().trim().toUpperCase();

        // 조회된 분류가 활성 상태일 때만 Optional에 유지한다.
        // 분류가 없거나 비활성이면 빈 Optional이 되어 아래 orElseThrow에서 오류로 처리된다.
        RatePlanCategory category = categoryRepository.findByCode(categoryCode)
            .filter(RatePlanCategory::isActive)
            .orElseThrow(() -> new RatePlanCommandException(HttpStatus.BAD_REQUEST, "INVALID_RATE_PLAN_CATEGORY", "사용 가능한 요금제 분류가 없습니다."));

        // 서비스 계층에서 동일한 요금제 코드가 이미 저장됐는지 먼저 확인하고 오류를 반환한다.
        // 동시 요청에 대한 최종 무결성은 DB UNIQUE 제약과 예외 처리로 보장한다.
        if (ratePlanRepository.existsByRatePlanCode(ratePlanCode)) {
            throw new RatePlanCommandException(HttpStatus.CONFLICT, "DUPLICATE_RATE_PLAN_CODE", "이미 사용 중인 요금제 코드입니다.");
        }

        // 검증된 입력을 판매 전 상태(DRAFT)의 RatePlan 도메인 객체로 변환한다.
        // 저장 결과는 API 응답 계약에 맞게 아래에서 CreateRatePlanResponse DTO로 변환한다.
        RatePlan ratePlan = RatePlan.create(
            category,
            ratePlanCode,
            request.name().trim(),
            request.monthlyFee(),
            RatePlanSalesStatus.DRAFT,
            request.saleStartAt(),
            request.description(),
            OffsetDateTime.now()
        );
        try {
            // flush 시점에 UNIQUE 제약 조건을 확인해 동시 요청도 같은 오류 형식으로 변환한다.
            return CreateRatePlanResponse.from(ratePlanRepository.saveAndFlush(ratePlan));
        } catch (DataIntegrityViolationException exception) {
            throw new RatePlanCommandException(HttpStatus.CONFLICT, "DUPLICATE_RATE_PLAN_CODE", "이미 사용 중인 요금제 코드입니다.");
        }
    }
}
