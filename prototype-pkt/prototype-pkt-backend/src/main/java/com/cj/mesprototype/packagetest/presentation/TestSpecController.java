package com.cj.mesprototype.packagetest.presentation;

import com.cj.mesprototype.packagetest.application.TestSpecService;
import com.cj.mesprototype.packagetest.presentation.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/package-test/specs")
@RequiredArgsConstructor
@Tag(name = "PackageTest", description = "P&T 테스트 스펙과 검사 조건 관리")
public class TestSpecController {
    private final TestSpecService testSpecService;

    @GetMapping
    @Operation(summary = "P&T 테스트 스펙 목록 조회")
    public List<TestSpecResponse> getSpecs() { return testSpecService.getSpecs(); }

    @GetMapping("/{id}")
    @Operation(summary = "P&T 테스트 스펙 상세 조회")
    public TestSpecResponse getSpec(@PathVariable Long id) { return testSpecService.getSpec(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "P&T 테스트 스펙 등록")
    public ResponseEntity<TestSpecResponse> createSpec(@Valid @RequestBody CreateTestSpecRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testSpecService.createSpec(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TestSpecResponse updateSpec(@PathVariable Long id, @Valid @RequestBody UpdateTestSpecRequest request) {
        return testSpecService.updateSpec(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSpec(@PathVariable Long id) {
        testSpecService.deleteSpec(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{specId}/conditions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TestConditionResponse> addCondition(@PathVariable Long specId, @Valid @RequestBody CreateTestConditionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testSpecService.addCondition(specId, request));
    }

    @PutMapping("/conditions/{conditionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public TestConditionResponse updateCondition(@PathVariable Long conditionId, @RequestBody UpdateTestConditionRequest request) {
        return testSpecService.updateCondition(conditionId, request);
    }

    @DeleteMapping("/conditions/{conditionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCondition(@PathVariable Long conditionId) {
        testSpecService.deleteCondition(conditionId);
        return ResponseEntity.noContent().build();
    }
}
