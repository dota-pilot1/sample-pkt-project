package com.cj.mesprototype.lot.presentation.dto;

import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lot.domain.LotStatus;

import java.time.Instant;

public record LotSummaryResponse(
        Long id,
        String lotCode,
        String productCode,
        String productName,
        LotStatus status,
        String process,
        Instant updatedAt
) {
    public static LotSummaryResponse from(Lot lot) {
        return new LotSummaryResponse(
                lot.getId(), lot.getLotCode(), lot.getProductCode(), lot.getProductName(),
                lot.getStatus(), lot.getProcess(), lot.getUpdatedAt());
    }
}
