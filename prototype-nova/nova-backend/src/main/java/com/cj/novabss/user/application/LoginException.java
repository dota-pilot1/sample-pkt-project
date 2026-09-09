package com.cj.novabss.user.application;

import org.springframework.http.HttpStatus;

/** 로그인 실패를 계정 존재 여부와 무관한 동일한 HTTP 계약으로 반환한다. */
public class LoginException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public LoginException(HttpStatus status, String code, String message) {
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
