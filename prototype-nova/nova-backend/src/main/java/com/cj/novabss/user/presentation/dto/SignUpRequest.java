package com.cj.novabss.user.presentation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** POST /signup 요청 계약. 사내 이메일을 계정 식별자로 사용한다. */
public record SignUpRequest(
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 주소를 입력해 주세요.")
    @Size(max = 254, message = "이메일은 254자 이하여야 합니다.")
    String email,
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S{8,72}$", message = "비밀번호는 공백 없이 8~72자이며 영문, 숫자, 특수문자를 각각 포함해야 합니다.")
    String password,
    @NotBlank(message = "표시명은 필수입니다.")
    @Size(min = 2, max = 100, message = "표시명은 2~100자여야 합니다.")
    String displayName
) {
}
