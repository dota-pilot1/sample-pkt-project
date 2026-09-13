package com.cj.novabss.role.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 권한 코드는 불변으로 두고 이름과 설명만 수정한다. */
public record UpdatePermissionRequest(
    @NotBlank(message = "권한 이름은 필수입니다.")
    @Size(max = 100, message = "권한 이름은 100자 이하여야 합니다.")
    String name,
    @NotBlank(message = "권한 설명은 필수입니다.")
    @Size(max = 500, message = "권한 설명은 500자 이하여야 합니다.")
    String description
) {
}
