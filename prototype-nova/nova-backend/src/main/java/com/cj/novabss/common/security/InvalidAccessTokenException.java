package com.cj.novabss.common.security;

/** 서명·만료 검증은 통과했어도 현재 사용자 상태가 유효하지 않을 때 사용한다. */
public class InvalidAccessTokenException extends RuntimeException {
    public InvalidAccessTokenException(String message) {
        super(message);
    }
}
