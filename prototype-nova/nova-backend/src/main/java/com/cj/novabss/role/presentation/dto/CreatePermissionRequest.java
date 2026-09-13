package com.cj.novabss.role.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 새 권한의 고정 식별 코드와 화면 표시 정보를 받는 요청 계약이다. */
public record CreatePermissionRequest(
    @NotBlank(message = "권한 코드는 필수입니다.")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]{2,99}$", message = "권한 코드는 대문자, 숫자, 밑줄을 사용하는 3~100자여야 합니다.")
    String permissionCode,
    @NotBlank(message = "권한 이름은 필수입니다.")
    @Size(max = 100, message = "권한 이름은 100자 이하여야 합니다.")
    String name,
    @NotBlank(message = "권한 설명은 필수입니다.")
    @Size(max = 500, message = "권한 설명은 500자 이하여야 합니다.")
    String description
) {
}
