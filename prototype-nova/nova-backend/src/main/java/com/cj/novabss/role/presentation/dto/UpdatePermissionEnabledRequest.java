package com.cj.novabss.role.presentation.dto;

import jakarta.validation.constraints.NotNull;

/** 권한의 사용 여부만 변경하는 요청 계약이다. */
public record UpdatePermissionEnabledRequest(
    @NotNull(message = "사용 여부는 필수입니다.")
    Boolean enabled
) {
}
