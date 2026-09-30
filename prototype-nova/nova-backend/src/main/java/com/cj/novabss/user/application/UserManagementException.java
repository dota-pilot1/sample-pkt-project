package com.cj.novabss.user.application;

import org.springframework.http.HttpStatus;

/** 사용자 관리 API가 반환하는 조회·상태 변경 오류다. */
public class UserManagementException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public UserManagementException(HttpStatus status, String code, String message) {
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
