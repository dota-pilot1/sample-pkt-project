package com.cj.mesprototype.lotquality.presentation;

import com.cj.mesprototype.lotquality.application.LotQualityStandardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lot-quality-standards")
@RequiredArgsConstructor
public class LotQualityStandardController {
    private final LotQualityStandardService service;
    @GetMapping public List<LotQualityStandardService.StandardResponse> getAll() { return service.getAll(); }
    @GetMapping("/{id}") public LotQualityStandardService.StandardResponse getOne(@PathVariable Long id) { return service.getOne(id); }
    @PostMapping @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<LotQualityStandardService.StandardResponse> create(@Valid @RequestBody LotQualityStandardService.CreateRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request)); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public LotQualityStandardService.StandardResponse update(@PathVariable Long id, @Valid @RequestBody LotQualityStandardService.UpdateRequest request) { return service.update(id, request); }
    @PostMapping("/{id}/approve") @PreAuthorize("hasRole('ADMIN')") public LotQualityStandardService.StandardResponse approve(@PathVariable Long id) { return service.approve(id); }
    @PostMapping("/{id}/inactivate") @PreAuthorize("hasRole('ADMIN')") public LotQualityStandardService.StandardResponse inactivate(@PathVariable Long id) { return service.inactivate(id); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
