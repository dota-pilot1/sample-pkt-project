package com.cj.novabss.plan.presentation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** 요금제 생성 API의 입력 계약이다. */
public record CreateRatePlanRequest(
    @NotBlank
    @Size(max = 50)
    String ratePlanCode,
    @NotBlank
    @Size(max = 150)
    String name,
    @NotBlank
    @Size(max = 30)
    String categoryCode,
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false)
    @Digits(integer = 10, fraction = 2)
    BigDecimal monthlyFee,
    @NotNull
    OffsetDateTime saleStartAt,
    @Size(max = 5000)
    String description
) {
}
