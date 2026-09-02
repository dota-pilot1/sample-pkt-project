package com.cj.mesprototype.lotquality.application;

import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lotquality.domain.LotQualityStandard;
import com.cj.mesprototype.lotquality.domain.LotQualityStandardStatus;
import com.cj.mesprototype.lotquality.domain.LotQualityStatus;
import com.cj.mesprototype.lotquality.infrastructure.LotQualityStandardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** 저장된 LOT 결과값을 현재 활성 품질 기준과 비교한다. 결과는 이력이 아닌 조회 시점 계산값이다. */
@Service
@RequiredArgsConstructor
public class LotQualityEvaluationService {
    private final LotQualityStandardRepository standardRepository;

    public Map<Long, Evaluation> evaluateAll(List<Lot> lots) {
        Map<Long, LotQualityStandard> standardsByProductId = standardRepository
                .findAllByOrderByProductProductCodeAscStandardNameAscVersionDesc().stream()
                .filter(standard -> standard.getStatus() != LotQualityStandardStatus.INACTIVE)
                .collect(Collectors.toMap(
                        standard -> standard.getProduct().getId(),
                        standard -> standard,
                        (current, candidate) -> current.getVersion() >= candidate.getVersion() ? current : candidate));
        return lots.stream().collect(Collectors.toMap(
                Lot::getId,
                lot -> evaluate(lot, standardsByProductId.get(lot.getProduct() == null ? null : lot.getProduct().getId()))));
    }

    private Evaluation evaluate(Lot lot, LotQualityStandard standard) {
        if (standard == null) return new Evaluation(LotQualityStatus.CRITERIA_MISSING, "판정 기준 없음");
        if (standard.getMinimumYieldRate() == null || standard.getMinimumGoodQuantity() == null) {
            return new Evaluation(LotQualityStatus.CRITERIA_MISSING, "기준값 미설정");
        }
        if (!lot.getStatus().name().equals(standard.getRequiredLotStatus())) return new Evaluation(LotQualityStatus.WAITING, "대상 상태 대기");
        if (lot.getYieldRate() == null || lot.getQuantity() == null) return new Evaluation(LotQualityStatus.DATA_MISSING, "결과 데이터 없음");

        int goodQuantity = (int) Math.round(lot.getQuantity() * lot.getYieldRate() / 100.0);
        boolean yieldPassed = lot.getYieldRate() >= standard.getMinimumYieldRate().doubleValue();
        boolean quantityPassed = goodQuantity >= standard.getMinimumGoodQuantity();
        if (yieldPassed && quantityPassed) return new Evaluation(LotQualityStatus.PASS, "통과 · 출하 가능");
        if (!yieldPassed && !quantityPassed) return new Evaluation(LotQualityStatus.FAIL, "실패 · 수율·정상 수량 미달");
        return new Evaluation(LotQualityStatus.FAIL, yieldPassed ? "실패 · 정상 수량 미달" : "실패 · 수율 미달");
    }

    public record Evaluation(LotQualityStatus status, String message) {
    }
}
