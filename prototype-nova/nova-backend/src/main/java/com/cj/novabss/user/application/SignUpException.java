package com.cj.novabss.user.application;

import org.springframework.http.HttpStatus;

/** 회원 가입 과정의 중복·기준정보 오류를 API 계약에 맞춰 반환한다. */
public class SignUpException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public SignUpException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
