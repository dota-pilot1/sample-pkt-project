package com.cj.novabss.user.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** POST /login 요청 계약. 가입 시 사용한 로그인 ID 형식을 그대로 적용한다. */
public record LoginRequest(
    @NotBlank(message = "로그인 ID는 필수입니다.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z0-9._-]{3,29}$", message = "로그인 ID는 영문으로 시작하는 4~30자의 영문·숫자·._- 조합이어야 합니다.")
    String loginId,
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(max = 72, message = "비밀번호는 72자 이하여야 합니다.")
    String password
) {
}
