package com.cj.novabss.role.presentation.dto;

import jakarta.validation.constraints.NotNull;

/** 역할을 삭제하지 않고 신규 할당 가능 여부만 바꾸는 요청 계약이다. */
public record UpdateRoleEnabledRequest(
    @NotNull(message = "사용 여부는 필수입니다.")
    Boolean enabled
) {
}
