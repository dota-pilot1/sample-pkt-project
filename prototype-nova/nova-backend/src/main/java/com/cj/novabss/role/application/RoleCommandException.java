package com.cj.novabss.role.application;

import org.springframework.http.HttpStatus;

/** 역할 생성 요청에서 클라이언트가 처리할 수 있는 업무 오류다. */
public class RoleCommandException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public RoleCommandException(HttpStatus status, String code, String message) {
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
