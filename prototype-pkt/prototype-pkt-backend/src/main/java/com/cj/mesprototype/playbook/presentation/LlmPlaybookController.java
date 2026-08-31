package com.cj.mesprototype.playbook.presentation;

import com.cj.mesprototype.auth.security.UserPrincipal;
import com.cj.mesprototype.playbook.application.PlaybookService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * LLM이 플레이북을 단계적으로 작성하기 위한 명시적 API.
 * 공개 접근은 SecurityConfig의 app.playbook.llm-api-public 설정으로 제어한다.
 */
@RestController
@RequestMapping("/api/llm/hospital-playbook")
@RequiredArgsConstructor
public class LlmPlaybookController {

    private final PlaybookService service;

    @GetMapping("/tree")
    public List<PlaybookService.CategoryResponse> tree(
            @RequestParam(defaultValue = "BACKEND") String spaceCode) {
        return service.tree(spaceCode);
    }

    @GetMapping("/categories/{id}")
    public PlaybookService.CategoryResponse category(@PathVariable Long id) {
        return service.category(id);
    }

    @GetMapping("/topics/{id}")
    public PlaybookService.TopicResponse topic(@PathVariable Long id) {
        return service.topic(id);
    }

    @GetMapping("/documents/{id}")
    public PlaybookService.DocumentResponse document(@PathVariable Long id) {
        return service.document(id);
    }

    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(@PathVariable Long id) {
        service.deleteDocument(id);
    }

    @GetMapping("/documents/{id}/context")
    public PlaybookService.DocumentContextResponse documentContext(@PathVariable Long id) {
        return service.documentContext(id);
    }

    @PostMapping("/structure")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybookService.StructureResponse createStructure(
            @Valid @RequestBody StructureRequest request) {
        return service.createStructure(request.spaceCode(), request.categoryTitle(), request.topicTitles());
    }

    @PatchMapping("/documents/{id}/content")
    public PlaybookService.DocumentResponse updateContent(
            @PathVariable Long id,
            @Valid @RequestBody ContentRequest request) {
        return service.updateDocumentContent(
                id, request.title(), request.content(), request.expectedVersion(), request.parentId());
    }

    @PostMapping("/topics/{topicId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybookService.DocumentResponse createDocument(
            @PathVariable Long topicId,
            @Valid @RequestBody DocumentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return service.createDocumentWithContent(
                topicId,
                request.title(),
                request.content(),
                request.parentId(),
                principal == null ? null : principal.getId());
    }

    @PostMapping("/topics/{topicId}/children")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybookService.DocumentResponse createChild(
            @PathVariable Long topicId,
            @Valid @RequestBody ChildDocumentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return service.createDocumentWithContent(
                topicId,
                request.title(),
                request.content(),
                request.parentId(),
                principal == null ? null : principal.getId());
    }

    @PostMapping("/topics/{topicId}/documents/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderDocuments(
            @PathVariable Long topicId,
            @Valid @RequestBody ReorderDocumentsRequest request) {
        service.reorderDocuments(topicId, request.ids(), request.parentId());
    }

    public record StructureRequest(
            @NotBlank @Size(max = 50) String spaceCode,
            @NotBlank @Size(max = 200) String categoryTitle,
            @NotEmpty List<@NotBlank @Size(max = 200) String> topicTitles) {}

    public record ContentRequest(
            @Size(max = 200) String title,
            @NotNull String content,
            Integer expectedVersion,
            Long parentId) {}

    public record DocumentRequest(
            @NotBlank @Size(max = 200) String title,
            @NotNull String content,
            Long parentId) {}

    public record ChildDocumentRequest(
            @NotBlank @Size(max = 200) String title,
            @NotNull String content,
            @NotNull Long parentId) {}

    public record ReorderDocumentsRequest(
            @NotEmpty List<@NotNull Long> ids,
            Long parentId) {}
}
