package com.cj.mesprototype.playbook.presentation;

import com.cj.mesprototype.auth.security.UserPrincipal;
import com.cj.mesprototype.playbook.application.PlaybookService;
import com.cj.mesprototype.playbook.domain.PlaybookDomain;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 튼튼척 노트 API. 직원 JWT 인증이 필요하다. */
@RestController
@RequestMapping("/api/hospital-playbook")
@RequiredArgsConstructor
public class PlaybookController {

    private final PlaybookService service;

    // ── 조회 ────────────────────────────────────────────────

    @GetMapping("/spaces")
    public List<PlaybookService.SpaceResponse> spaces() {
        return service.spaces();
    }

    @PostMapping("/spaces")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybookService.SpaceResponse createSpace(@Valid @RequestBody SpaceRequest request) {
        return service.createSpace(request.code(), request.name());
    }

    @PatchMapping("/spaces/{id}")
    public PlaybookService.SpaceResponse renameSpace(@PathVariable Long id, @Valid @RequestBody SpaceNameRequest request) {
        return service.renameSpace(id, request.name());
    }

    @DeleteMapping("/spaces/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSpace(@PathVariable Long id) {
        service.deleteSpace(id);
    }

    @GetMapping
    public List<PlaybookService.CategoryResponse> tree(@RequestParam(defaultValue = "BACKEND") String spaceCode) {
        return service.tree(spaceCode);
    }

    @GetMapping("/documents/{id}")
    public PlaybookService.DocumentResponse document(@PathVariable Long id) {
        return service.document(id);
    }

    @GetMapping("/search")
    public List<PlaybookService.SearchResult> search(@RequestParam String q,
                                                             @RequestParam(defaultValue = "all") String scope,
                                                             @RequestParam(defaultValue = "BACKEND") String spaceCode) {
        return service.search(q, scope, spaceCode);
    }

    @GetMapping("/documents/{id}/comments")
    public List<PlaybookService.CommentResponse> comments(@PathVariable Long id) {
        return service.comments(id);
    }

    @PostMapping("/documents/{id}/share")
    public PlaybookService.ShareResponse shareDocument(@PathVariable Long id,
                                                                @AuthenticationPrincipal UserPrincipal principal) {
        return service.shareDocument(id, principal.getId(), isAdmin(principal));
    }

    @PostMapping("/documents/{id}/ai-edit-token")
    public PlaybookService.AiEditTokenResponse issueAiEditToken(@PathVariable Long id,
                                                                          @AuthenticationPrincipal UserPrincipal principal) {
        return service.issueAiEditToken(id, principal.getId(), isAdmin(principal));
    }

    // ── 1차 영역 ────────────────────────────────────────────

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybookService.CategoryResponse createCategory(@RequestParam(defaultValue = "BACKEND") String spaceCode,
                                                                   @Valid @RequestBody TitleRequest request) {
        return service.createCategory(spaceCode, request.title());
    }

    @PatchMapping("/categories/{id}")
    public PlaybookService.CategoryResponse renameCategory(@PathVariable Long id,
                                                                  @Valid @RequestBody TitleRequest request) {
        return service.renameCategory(id, request.title());
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        service.deleteCategory(id);
    }

    @PostMapping("/categories/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderCategories(@Valid @RequestBody ReorderRequest request) {
        service.reorderCategories(request.ids());
    }

    // ── 2차 주제 ────────────────────────────────────────────

    @PostMapping("/categories/{categoryId}/topics")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybookService.TopicResponse createTopic(@PathVariable Long categoryId,
                                                             @Valid @RequestBody TitleRequest request) {
        return service.createTopic(categoryId, request.title());
    }

    @PatchMapping("/topics/{id}")
    public PlaybookService.TopicResponse renameTopic(@PathVariable Long id,
                                                             @Valid @RequestBody TitleRequest request) {
        return service.renameTopic(id, request.title());
    }

    @DeleteMapping("/topics/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopic(@PathVariable Long id) {
        service.deleteTopic(id);
    }

    @PostMapping("/categories/{categoryId}/topics/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderTopics(@PathVariable Long categoryId, @Valid @RequestBody ReorderRequest request) {
        service.reorderTopics(categoryId, request.ids());
    }

    // ── 문서 ────────────────────────────────────────────────

    @PostMapping("/topics/{topicId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybookService.DocumentResponse createDocument(@PathVariable Long topicId,
                                                                   @Valid @RequestBody CreateDocumentRequest request,
                                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return service.createDocument(topicId, request.title(), request.parentId(), principal == null ? null : principal.getId());
    }

    @PatchMapping("/documents/{id}")
    public PlaybookService.DocumentResponse updateDocument(@PathVariable Long id,
                                                                    @RequestBody UpdateDocumentRequest request) {
        return service.updateDocument(id, request.title(), request.content(), request.useForChatbot(), request.parentId());
    }

    @PostMapping("/documents/{id}/approve")
    public PlaybookService.DocumentResponse approveDocument(@PathVariable Long id,
                                                                     @AuthenticationPrincipal UserPrincipal principal) {
        return service.approveDocument(id, principal == null ? null : principal.getId());
    }

    @PostMapping("/documents/{id}/archive")
    public PlaybookService.DocumentResponse archiveDocument(@PathVariable Long id) {
        return service.archiveDocument(id);
    }

    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(@PathVariable Long id) {
        service.deleteDocument(id);
    }

    @PostMapping("/documents/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public List<PlaybookService.CommentResponse> createComment(@PathVariable Long id,
                                                                        @Valid @RequestBody CommentRequest request,
                                                                        @AuthenticationPrincipal UserPrincipal principal) {
        return service.createComment(id, request.title(), request.content(), request.parentId(),
                principal == null ? null : principal.getId());
    }

    @PatchMapping("/comments/{id}")
    public List<PlaybookService.CommentResponse> updateComment(@PathVariable Long id,
                                                                        @Valid @RequestBody UpdateCommentRequest request) {
        return service.updateComment(id, request.title(), request.content());
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long id) {
        service.deleteComment(id);
    }

    @PostMapping("/topics/{topicId}/documents/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderDocuments(@PathVariable Long topicId, @Valid @RequestBody ReorderDocumentsRequest request) {
        service.reorderDocuments(topicId, request.ids(), request.parentId());
    }

    // ── 요청 DTO ────────────────────────────────────────────

    public record TitleRequest(@NotBlank String title) {}

    public record SpaceRequest(@NotBlank @Size(max = 50) String code, @NotBlank @Size(max = 200) String name) {}

    public record SpaceNameRequest(@NotBlank @Size(max = 200) String name) {}

    public record ReorderRequest(@NotNull List<Long> ids) {}

    public record CreateDocumentRequest(@NotBlank String title, Long parentId) {}

    public record ReorderDocumentsRequest(@NotNull List<Long> ids, Long parentId) {}

    public record UpdateDocumentRequest(String title, String content, Boolean useForChatbot, Long parentId) {}

    public record CommentRequest(@Size(max = 160) String title, @NotBlank @Size(max = 10000) String content, Long parentId) {}

    public record UpdateCommentRequest(@Size(max = 160) String title, @NotBlank @Size(max = 10000) String content) {}

    private static boolean isAdmin(UserPrincipal principal) {
        return "ROLE_SYSTEM_ADMIN".equals(principal.getRoleCode())
                || "ROLE_HOSPITAL_ADMIN".equals(principal.getRoleCode());
    }
}
