package com.cj.novabss.user.presentation.dto;

import jakarta.validation.constraints.NotNull;

/** 계정 활성화 또는 비활성화 요청이다. */
public record UpdateUserActiveRequest(
    @NotNull(message = "active는 필수입니다.")
    Boolean active
) {
}
