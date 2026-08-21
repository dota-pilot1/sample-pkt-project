package com.cj.mesprototype.hospital_playbook.presentation;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.playbook.application.PlaybookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 작성자가 발급한 1회용 Bearer 토큰으로만 접근하는 AI 편집 API. */
@RestController
@RequestMapping("/api/public/hospital-playbook/ai-edit/documents")
@RequiredArgsConstructor
public class PublicPlaybookAiEditController {
    private final PlaybookService service;

    @GetMapping("/{id}")
    public PlaybookService.AiEditDocumentResponse read(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return service.aiEditDocument(id, bearerToken(authorization));
    }

    @PatchMapping("/{id}")
    public PlaybookService.AiEditDocumentResponse update(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody UpdateRequest request) {
        return service.updateWithAiEditToken(id, bearerToken(authorization), request.title(), request.content(), request.expectedVersion());
    }

    private static String bearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
        return authorization.substring("Bearer ".length()).trim();
    }

    public record UpdateRequest(String title, String content, int expectedVersion) {}
}
