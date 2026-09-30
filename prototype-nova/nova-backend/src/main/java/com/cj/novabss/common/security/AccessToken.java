package com.cj.novabss.common.security;

import java.time.Instant;

/** 로그인 성공 시 반환하는 짧은 수명의 access token 값과 만료 시각이다. */
public record AccessToken(String value, Instant expiresAt) {
}
