package com.cj.mesprototype.lot.presentation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** LOT 등록 화면이 보내는, 생산 시작 전 기본 정보 계약이다. */
public record CreateLotRequest(
        @NotNull Long productId,
        @NotNull Long processId,
        @Size(max = 100) String tester,
        @NotNull @Positive Integer quantity
) {
}
