package com.cj.mesprototype.lot.presentation.dto;

import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lot.domain.LotStatus;

public record LotSummaryResponse(
        Long id,
        String lotCode,
        String productCode,
        String productName,
        String tester,
        Integer quantity,
        Integer goodQuantity,
        Integer defectQuantity,
        Double yieldRate,
        LotStatus status,
        String process
) {
    public static LotSummaryResponse from(Lot lot) {
        int quantity = lot.getQuantity() == null ? 0 : lot.getQuantity();
        Integer goodQuantity = lot.getYieldRate() == null ? null : (int) Math.round(quantity * lot.getYieldRate() / 100.0);
        Integer defectQuantity = goodQuantity == null ? null : quantity - goodQuantity;
        return new LotSummaryResponse(
                lot.getId(), lot.getLotCode(),
                lot.getProduct() == null ? lot.getProductCode() : lot.getProduct().getProductCode(),
                lot.getProduct() == null ? lot.getProductName() : lot.getProduct().getProductName(),
                lot.getCurrentEquipment() == null ? lot.getTester() : lot.getCurrentEquipment().getCode(),
                lot.getQuantity(), goodQuantity, defectQuantity, lot.getYieldRate(),
                lot.getStatus(), lot.getCurrentProcess() == null ? lot.getProcess() : lot.getCurrentProcess().getProcessName());
    }
}
