package com.cj.novabss.plan.presentation;

import com.cj.novabss.plan.application.RatePlanCommandService;
import com.cj.novabss.plan.presentation.dto.CreateRatePlanRequest;
import com.cj.novabss.plan.presentation.dto.CreateRatePlanResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class RatePlanCommandController {
    private final RatePlanCommandService ratePlanCommandService;

    public RatePlanCommandController(RatePlanCommandService ratePlanCommandService) {
        this.ratePlanCommandService = ratePlanCommandService;
    }

    @PostMapping
    // @Valid 검증 실패는 MethodArgumentNotValidException으로 전달되어 공통 예외 처리기가 400 응답으로 변환한다.
    public ResponseEntity<CreateRatePlanResponse> create(@Valid @RequestBody CreateRatePlanRequest request) {
        // HTTP 계층은 업무 규칙을 직접 처리하지 않고 Service에 생성을 위임한다.
        CreateRatePlanResponse response = ratePlanCommandService.create(request);

        // TODO: GET /api/plans/{id} 단건 조회 API 구현 후 Location 헤더를 포함한 ResponseEntity.created(...) 응답으로 전환한다.
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
