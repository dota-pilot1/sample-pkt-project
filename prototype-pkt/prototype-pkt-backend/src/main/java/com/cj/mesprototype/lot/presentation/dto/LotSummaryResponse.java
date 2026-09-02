package com.cj.mesprototype.lot.presentation.dto;

import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lot.domain.LotStatus;
import com.cj.mesprototype.lot.domain.ProductClassification;
import com.cj.mesprototype.lotquality.application.LotQualityEvaluationService;
import com.cj.mesprototype.lotquality.domain.LotQualityStatus;

public record LotSummaryResponse(
        Long id,
        String lotCode,
        String workOrderCode,
        String productCode,
        String productName,
        ProductClassification productClassification,
        String tester,
        Integer quantity,
        Integer goodQuantity,
        Integer defectQuantity,
        Double yieldRate,
        LotStatus status,
        String process,
        LotQualityStatus qualityStatus,
        String qualityMessage
) {
    public static LotSummaryResponse from(Lot lot) {
        return from(lot, null);
    }

    public static LotSummaryResponse from(Lot lot, LotQualityEvaluationService.Evaluation evaluation) {
        int quantity = lot.getQuantity() == null ? 0 : lot.getQuantity();
        Integer goodQuantity = lot.getYieldRate() == null ? null : (int) Math.round(quantity * lot.getYieldRate() / 100.0);
        Integer defectQuantity = goodQuantity == null ? null : quantity - goodQuantity;
        return new LotSummaryResponse(
                lot.getId(), lot.getLotCode(), lot.getWorkOrder() == null ? null : lot.getWorkOrder().getCode(),
                lot.getProduct() == null ? lot.getProductCode() : lot.getProduct().getProductCode(),
                lot.getProduct() == null ? lot.getProductName() : lot.getProduct().getProductName(),
                lot.getProduct() == null || lot.getProduct().getClassification() == null
                        ? ProductClassification.SEMI_FINISHED : lot.getProduct().getClassification(),
                lot.getCurrentEquipment() == null ? lot.getTester() : lot.getCurrentEquipment().getCode(),
                lot.getQuantity(), goodQuantity, defectQuantity, lot.getYieldRate(),
                lot.getStatus(), lot.getCurrentProcess() == null ? lot.getProcess() : lot.getCurrentProcess().getProcessName(),
                evaluation == null ? null : evaluation.status(), evaluation == null ? null : evaluation.message());
    }
}
