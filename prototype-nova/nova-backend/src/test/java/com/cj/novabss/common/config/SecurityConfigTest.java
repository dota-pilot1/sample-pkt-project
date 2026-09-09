package com.cj.novabss.common.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

/** 현재 공개 API와 기본 차단 경계가 의도한 대로 유지되는지 검증한다. */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {
    private static final String FRONTEND_ORIGIN = "http://localhost:3000";

    @Autowired private MockMvc mockMvc;

    @Test
    void allowsCurrentPublicDashboardApi() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
            .andExpect(status().isOk());
    }

    @Test
    void deniesUnlistedApiWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/internal-only"))
            .andExpect(status().isForbidden());
    }

    @Test
    void acceptsCorsPreflightFromConfiguredFrontend() throws Exception {
        mockMvc.perform(options("/api/dashboard")
                .header(HttpHeaders.ORIGIN, FRONTEND_ORIGIN)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization"))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, FRONTEND_ORIGIN))
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, org.hamcrest.Matchers.containsString("GET")))
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, org.hamcrest.Matchers.containsString("Authorization")));
    }
}
