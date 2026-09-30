package com.cj.novabss.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

/** Authorization Bearer token을 검증하고 최신 DB 권한을 SecurityContext에 등록한다. */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenService jwtTokenService;
    private final UserAuthorityService userAuthorityService;
    private final SecurityErrorResponseWriter errorResponseWriter;

    public JwtAuthenticationFilter(
        JwtTokenService jwtTokenService,
        UserAuthorityService userAuthorityService,
        SecurityErrorResponseWriter errorResponseWriter
    ) {
        this.jwtTokenService = jwtTokenService;
        this.userAuthorityService = userAuthorityService;
        this.errorResponseWriter = errorResponseWriter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (!StringUtils.hasText(authorization)) {
            filterChain.doFilter(request, response);
            return;
        }
        if (!authorization.startsWith("Bearer ") || !StringUtils.hasText(authorization.substring(7))) {
            errorResponseWriter.writeUnauthorized(response);
            return;
        }

        try {
            Long userId = jwtTokenService.validateAndGetUserId(authorization.substring(7));
            SecurityContextHolder.getContext().setAuthentication(userAuthorityService.authenticate(userId));
            filterChain.doFilter(request, response);
        } catch (InvalidAccessTokenException exception) {
            SecurityContextHolder.clearContext();
            errorResponseWriter.writeUnauthorized(response);
        }
    }
}
