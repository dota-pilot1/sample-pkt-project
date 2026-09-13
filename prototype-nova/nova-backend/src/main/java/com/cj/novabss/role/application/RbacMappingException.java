package com.cj.novabss.role.application;

import org.springframework.http.HttpStatus;

/** 사용자·역할·권한 연결 요청에서 반환할 수 있는 업무 오류다. */
public class RbacMappingException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public RbacMappingException(HttpStatus status, String code, String message) {
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
