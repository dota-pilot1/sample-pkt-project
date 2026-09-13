package com.cj.novabss.role.presentation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import com.cj.novabss.role.presentation.dto.CreatePermissionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** 권한 목록·상세 조회 API의 응답 계약을 H2에서 검증한다. */
@SpringBootTest
@AutoConfigureMockMvc
class PermissionControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PermissionRepository permissionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // 각 테스트가 기존 권한 데이터에 의존하지 않도록 H2 저장소를 초기화한다.
        permissionRepository.deleteAll();
    }

    @Test
    // 목록 조회 API의 정상 응답을 검증하는 테스트임을 표시한다.
    @DisplayName("권한 목록을 코드 오름차순으로 조회한다")
    // 목록 응답의 정렬 계약만 검증한다.
    void listsPermissionsByPermissionCode() throws Exception {
        // 목록 조회에 필요한 두 권한을 테스트 데이터로 저장한다.
        permissionRepository.saveAll(List.of(
            // 코드가 뒤에 오는 USER_READ를 먼저 저장해 저장 순서와 응답 순서가 다름을 확인한다.
            Permission.create("USER_READ", "사용자 조회", "사용자 정보를 조회합니다.", OffsetDateTime.now()),
            // 코드가 앞서는 PLAN_READ를 두 번째로 저장해 오름차순 정렬을 검증한다.
            Permission.create("PLAN_READ", "요금제 조회", "요금제 정보를 조회합니다.", OffsetDateTime.now())
        ));

        // 권한 목록 조회 API를 호출한다.
        mockMvc.perform(get("/api/permissions"))
            // 목록 조회가 성공했는지 확인한다.
            .andExpect(status().isOk())
            // 첫 번째 항목이 코드 오름차순으로 가장 앞선 PLAN_READ인지 확인한다.
            .andExpect(jsonPath("$[0].permissionCode").value("PLAN_READ"))
            // 첫 번째 항목의 이름이 저장한 값과 같은지 확인한다.
            .andExpect(jsonPath("$[0].name").value("요금제 조회"))
            // 두 번째 항목이 USER_READ인지 확인해 목록 정렬을 마무리한다.
            .andExpect(jsonPath("$[1].permissionCode").value("USER_READ"))
            // 목록 응답이 권한의 활성 상태를 포함하는지 확인한다.
            .andExpect(jsonPath("$[1].enabled").value(true));
    }

    @Test
    @DisplayName("단건 권한 생성 후 상세 조회 결과를 확인한다")
    void createsPermissionAndReadsDetail() throws Exception {
        // 리뷰 포인트 1: 요청 DTO를 ObjectMapper로 직렬화해 API 요청 계약을 검증한다.
        CreatePermissionRequest createRequest = new CreatePermissionRequest(
            "PLAN_READ",
            "요금제 조회",
            "요금제 목록을 조회합니다."
        );
        // 생성 API로 상세 조회에 사용할 권한을 준비한다.
        mockMvc.perform(
                post("/api/permissions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createRequest))
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.permissionCode").value("PLAN_READ"))
            .andExpect(jsonPath("$.enabled").value(true));

        Long permissionId = permissionRepository
            .findByPermissionCode("PLAN_READ")
            .orElseThrow()
            .getId();

        // 리뷰 포인트 2: 단건 상세 조회가 생성 시 입력한 권한 정보를 그대로 반환한다.
        mockMvc.perform(get("/api/permissions/{id}", permissionId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(permissionId))
            .andExpect(jsonPath("$.permissionCode").value("PLAN_READ"))
            .andExpect(jsonPath("$.name").value("요금제 조회"))
            .andExpect(jsonPath("$.description").value("요금제 목록을 조회합니다."))
            .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    @DisplayName("없는 권한을 상세 조회하면 권한 없음 오류를 반환한다")
    void returnsNotFoundForMissingPermission() throws Exception {
        // 리뷰 포인트 3: HTTP 상태와 오류 코드를 함께 확인해 클라이언트의 404 분기 계약을 고정한다.
        mockMvc.perform(get("/api/permissions/{id}", 9999))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("PERMISSION_NOT_FOUND"));
    }
}
