package com.cj.novabss.role.presentation;

import com.cj.novabss.role.application.PermissionService;
import com.cj.novabss.role.presentation.dto.CreatePermissionRequest;
import com.cj.novabss.role.presentation.dto.PermissionResponse;
import com.cj.novabss.role.presentation.dto.UpdatePermissionEnabledRequest;
import com.cj.novabss.role.presentation.dto.UpdatePermissionRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class PermissionController {
    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<PermissionResponse> findAll() {
        return permissionService.findAll().stream().map(PermissionResponse::from).toList();
    }

    @GetMapping("/{id}")
    public PermissionResponse getPermission(@PathVariable Long id) {
        // 조회 결과의 HTTP 응답 변환만 담당하고, 존재 여부 판단은 Service에 위임한다.
        return PermissionResponse.from(permissionService.getPermissionById(id));
    }

    @PostMapping
    public ResponseEntity<PermissionResponse> create(@Valid @RequestBody CreatePermissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(PermissionResponse.from(permissionService.create(request)));
    }

    @PatchMapping("/{id}")
    public PermissionResponse update(@PathVariable Long id, @Valid @RequestBody UpdatePermissionRequest request) {
        return PermissionResponse.from(permissionService.update(id, request));
    }

    @PatchMapping("/{id}/enabled")
    public PermissionResponse changeEnabled(@PathVariable Long id, @Valid @RequestBody UpdatePermissionEnabledRequest request) {
        return PermissionResponse.from(permissionService.changeEnabled(id, request.enabled()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
}
