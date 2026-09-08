package com.cj.novabss.user.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** POST /signup 요청 계약. 로그인 ID는 영문으로 시작하는 4~30자의 소문자·숫자·._- 조합이다. */
public record SignUpRequest(
    @NotBlank(message = "로그인 ID는 필수입니다.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z0-9._-]{3,29}$", message = "로그인 ID는 영문으로 시작하는 4~30자의 영문·숫자·._- 조합이어야 합니다.")
    String loginId,
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S{8,72}$", message = "비밀번호는 공백 없이 8~72자이며 영문, 숫자, 특수문자를 각각 포함해야 합니다.")
    String password,
    @NotBlank(message = "표시명은 필수입니다.")
    @Size(min = 2, max = 100, message = "표시명은 2~100자여야 합니다.")
    String displayName
) {
}
