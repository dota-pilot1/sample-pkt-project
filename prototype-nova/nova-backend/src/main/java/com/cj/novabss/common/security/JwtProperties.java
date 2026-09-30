package com.cj.novabss.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** JWT 서명·검증에 필요한 환경 설정이다. 비밀키는 환경 변수에서만 공급한다. */
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
    String secret,
    String issuer,
    String audience,
    long accessTokenTtlSeconds
) {
}
