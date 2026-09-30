package com.cj.novabss.role.presentation;

import com.cj.novabss.role.application.PermissionCategoryService;
import com.cj.novabss.role.presentation.dto.CreatePermissionCategoryRequest;
import com.cj.novabss.role.presentation.dto.PermissionCategoryResponse;
import com.cj.novabss.role.presentation.dto.UpdatePermissionCategoryRequest;
import com.cj.novabss.role.presentation.dto.UpdatePermissionEnabledRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/permission-categories")
public class PermissionCategoryController {
    private final PermissionCategoryService service;
    public PermissionCategoryController(PermissionCategoryService service) { this.service = service; }
    @GetMapping public List<PermissionCategoryResponse> findAll() { return service.findAll().stream().map(PermissionCategoryResponse::from).toList(); }
    @PostMapping public ResponseEntity<PermissionCategoryResponse> create(@Valid @RequestBody CreatePermissionCategoryRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(PermissionCategoryResponse.from(service.create(request))); }
    @PatchMapping("/{id}") public PermissionCategoryResponse update(@PathVariable Long id, @Valid @RequestBody UpdatePermissionCategoryRequest request) { return PermissionCategoryResponse.from(service.update(id, request)); }
    @PatchMapping("/{id}/enabled") public PermissionCategoryResponse changeEnabled(@PathVariable Long id, @Valid @RequestBody UpdatePermissionEnabledRequest request) { return PermissionCategoryResponse.from(service.changeEnabled(id, request.enabled())); }
}
