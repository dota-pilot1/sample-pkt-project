package com.cj.novabss.plan.presentation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.plan.domain.RatePlanCategory;
import com.cj.novabss.plan.infrastructure.RatePlanCategoryRepository;
import com.cj.novabss.plan.infrastructure.RatePlanRepository;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;


// src/test/resources/application.yaml의 H2 인메모리 DB로 실행한다.
// 개발·운영 PostgreSQL에는 연결하거나 데이터를 만들지 않는 API 통합 테스트다.
@SpringBootTest
@AutoConfigureMockMvc
class RatePlanCommandControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RatePlanRepository ratePlanRepository;

    @Autowired
    private RatePlanCategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        // 테스트마다 이전 요금제와 카테고리를 비워, 코드 중복·저장 결과가 서로 영향을 주지 않게 한다.
        ratePlanRepository.deleteAll();
        categoryRepository.deleteAll();
        // 생성 요청의 categoryCode=MOBILE이 실제 활성 카테고리를 찾도록 기준 데이터를 준비한다.
        categoryRepository.save(RatePlanCategory.create("MOBILE", "휴대폰", 1, OffsetDateTime.now()));
    }

    // 정상 생성 요청: 201 Created, 반환 요금제 코드와 기본 판매 상태(DRAFT)를 검증한다.
    @Test
    void createsRatePlanWithValidRequest() throws Exception {
        mockMvc.perform(post("/api/plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestBody("MOBILE-START")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.ratePlanCode").value("MOBILE-START"))
            .andExpect(jsonPath("$.salesStatus").value("DRAFT"));
    }

    // 요청값 검증: 필수값 누락·금액 범위 오류를 400과 INVALID_REQUEST, 필드별 오류로 반환하는지 검증한다.
    @Test
    void returnsFieldErrorsForMissingOrInvalidValues() throws Exception {
        String invalidBody = """
            {"ratePlanCode":"", "name":"", "categoryCode":"", "monthlyFee":0, "saleStartAt":null}
            """;

        mockMvc.perform(post("/api/plans").contentType(MediaType.APPLICATION_JSON).content(invalidBody))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.ratePlanCode").exists())
            .andExpect(jsonPath("$.fieldErrors.monthlyFee").exists())
            .andExpect(jsonPath("$.fieldErrors.saleStartAt").exists());
    }

    // 업무 규칙 검증: 같은 요금제 코드를 두 번 생성하면 409와 중복 코드 오류 형식으로 반환하는지 검증한다.
    @Test
    void returnsConsistentConflictForDuplicateCode() throws Exception {
        String request = validRequestBody("MOBILE-DUPLICATE");
        mockMvc.perform(post("/api/plans").contentType(MediaType.APPLICATION_JSON).content(request))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/plans").contentType(MediaType.APPLICATION_JSON).content(request))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("DUPLICATE_RATE_PLAN_CODE"))
            .andExpect(jsonPath("$.fieldErrors").isEmpty());
    }

    @Test
    void listsPlansWithStableDefaultSortAndPageMetadata() throws Exception {
        mockMvc.perform(post("/api/plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestBody("MOBILE-Z")))
            .andExpect(status().isCreated());
        mockMvc.perform(post("/api/plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestBody("MOBILE-A")))
            .andExpect(status().isCreated());

        mockMvc.perform(get("/api/plans")
                .param("page", "1")
                .param("size", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].ratePlanCode").value("MOBILE-A"))
            .andExpect(jsonPath("$.page").value(1))
            .andExpect(jsonPath("$.size").value(1))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.totalPages").value(2));

        // MyBatis 동적 조건은 입력 대소문자를 정규화하고, 허용된 정렬 enum만 SQL에 반영한다.
        mockMvc.perform(get("/api/plans")
                .param("keyword", "요금제")
                .param("categoryCode", "mobile")
                .param("status", "draft")
                .param("sort", "ratePlanCode")
                .param("direction", "desc"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(2))
            .andExpect(jsonPath("$.items[0].ratePlanCode").value("MOBILE-Z"))
            .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void returnsEmptyItemsWhenNoPlanMatches() throws Exception {
        mockMvc.perform(get("/api/plans").param("keyword", "does-not-exist"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.totalPages").value(0));
    }

    @Test
    void rejectsInvalidListQuery() throws Exception {
        mockMvc.perform(get("/api/plans").param("status", "UNKNOWN"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_STATUS"));

        mockMvc.perform(get("/api/plans").param("sort", "createdAt"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_SORT"));

        mockMvc.perform(get("/api/plans").param("size", "101"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.fieldErrors.size").exists());
    }

    private String validRequestBody(String code) {
        // 각 테스트에서 코드만 바꿔 재사용하는 정상 생성 요청 본문이다.
        return """
            {"ratePlanCode":"%s", "name":"요금제 이름", "categoryCode":"MOBILE", "monthlyFee":12000.00, "saleStartAt":"2026-09-05T09:00:00+09:00", "description":"생성 테스트"}
            """.formatted(code);
    }
}
