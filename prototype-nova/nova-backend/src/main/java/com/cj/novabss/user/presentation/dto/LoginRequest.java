package com.cj.novabss.user.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/** POST /login 요청 계약. 가입 시 사용한 이메일을 계정 식별자로 사용한다. */
public record LoginRequest(
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 주소를 입력해 주세요.")
    @Size(max = 254, message = "이메일은 254자 이하여야 합니다.")
    String email,
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(max = 72, message = "비밀번호는 72자 이하여야 합니다.")
    String password
) {
}
