package com.cj.novabss.role.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 역할 코드와 연결 이력은 유지하면서 화면 표시 이름만 바꾸는 요청 계약이다. */
public record UpdateRoleRequest(
    @NotBlank(message = "역할 이름은 필수입니다.")
    @Size(max = 100, message = "역할 이름은 100자 이하여야 합니다.")
    String name
) {
}
