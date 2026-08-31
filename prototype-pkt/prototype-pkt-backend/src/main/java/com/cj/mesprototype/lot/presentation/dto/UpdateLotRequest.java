package com.cj.mesprototype.lot.presentation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** 대기 상태 LOT에서 수정할 수 있는 제품·공정·배정·계획 수량 계약이다. */
public record UpdateLotRequest(
        @NotNull Long productId,
        @NotNull Long processId,
        @Size(max = 100) String tester,
        @NotNull @Positive Integer quantity
) {
}
