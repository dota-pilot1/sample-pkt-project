package com.cj.mesprototype.playbook.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.playbook.domain.PlaybookCategory;
import com.cj.mesprototype.playbook.domain.PlaybookDocument;
import com.cj.mesprototype.playbook.domain.PlaybookSpace;
import com.cj.mesprototype.playbook.domain.PlaybookDocumentComment;
import com.cj.mesprototype.playbook.domain.PlaybookTopic;
import com.cj.mesprototype.playbook.domain.PlaybookDocumentStatus;
import com.cj.mesprototype.playbook.domain.PlaybookDomain;
import com.cj.mesprototype.playbook.infrastructure.PlaybookCategoryRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookDocumentRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookDocumentCommentRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookTopicRepository;
import com.cj.mesprototype.playbook.infrastructure.PlaybookSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.Objects;

/** 튼튼척 노트 영역/주제/문서 관리. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaybookService {

    private final PlaybookCategoryRepository categoryRepository;
    private final PlaybookSpaceRepository spaceRepository;
    private final PlaybookTopicRepository topicRepository;
    private final PlaybookDocumentRepository documentRepository;
    private final PlaybookDocumentCommentRepository commentRepository;

    // ── 조회 ────────────────────────────────────────────────

    /** 3단 트리 전체. 문서는 본문을 제외한 요약만 담는다. */
    public List<CategoryResponse> tree(String spaceCode) {
        return categoryRepository.findAllBySpaceIdOrderByOrderIdxAscIdAsc(findSpace(spaceCode).getId()).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    /** 기존 내부 호출과 테스트의 기본 도메인은 백엔드로 유지한다. */
    public List<CategoryResponse> tree() {
        return tree("BACKEND");
    }

    public DocumentResponse document(Long documentId) {
        return DocumentResponse.from(findDocument(documentId));
    }

    /** 1차 문서의 위치와 본문, 하위 문서 본문을 LLM이 한 번에 읽을 수 있는 컨텍스트. */
    public DocumentContextResponse documentContext(Long documentId) {
        return DocumentContextResponse.from(findDocument(documentId));
    }

    public CategoryResponse category(Long categoryId) {
        return CategoryResponse.from(findCategory(categoryId));
    }

    public TopicResponse topic(Long topicId) {
        return TopicResponse.from(findTopic(topicId));
    }

    public List<SearchResult> search(String keyword, String scope, String spaceCode) {
        String normalized = keyword == null ? "" : keyword.trim();
        if (normalized.isBlank()) return List.of();
        String normalizedScope = switch (scope == null ? "" : scope.trim().toLowerCase()) {
            case "category", "topic", "document" -> scope.trim().toLowerCase();
            default -> "all";
        };
        String query = normalized.toLowerCase(Locale.ROOT);
        return documentRepository.findAllForSearch().stream()
                .filter(document -> document.getTopic().getCategory().getSpace().getCode().equals(spaceCode))
                .filter(document -> matches(document, query, normalizedScope))
                .limit(50)
                .map(SearchResult::from)
                .toList();
    }

    public List<SearchResult> search(String keyword, String scope) {
        return search(keyword, scope, "BACKEND");
    }

    private static boolean matches(PlaybookDocument document, String query, String scope) {
        String category = document.getTopic().getCategory().getTitle().toLowerCase(Locale.ROOT);
        String topic = document.getTopic().getTitle().toLowerCase(Locale.ROOT);
        String title = document.getTitle().toLowerCase(Locale.ROOT);
        String content = document.getContent() == null ? "" : document.getContent().toLowerCase(Locale.ROOT);
        return switch (scope) {
            case "category" -> category.contains(query);
            case "topic" -> topic.contains(query);
            case "document" -> title.contains(query) || content.contains(query);
            default -> category.contains(query) || topic.contains(query)
                    || title.contains(query) || content.contains(query);
        };
    }

    @Transactional
    public ShareResponse shareDocument(Long documentId, Long requesterId, boolean admin) {
        PlaybookDocument document = findDocument(documentId);
        // 시더와 LLM 공개 API로 생성된 문서는 소유자가 없다. 이런 공용 문서는
        // 로그인한 노트 사용자라면 공유할 수 있어야 AI 편집 토큰 발급 규칙과도 일치한다.
        if (document.getCreatedBy() != null) {
            ensureAuthorOrAdmin(document, requesterId, admin);
        }
        document.issueShareToken(UUID.randomUUID().toString().replace("-", ""));
        return new ShareResponse(document.getShareToken());
    }

    @Transactional
    public AiEditTokenResponse issueAiEditToken(Long documentId, Long requesterId, boolean admin) {
        PlaybookDocument document = findDocument(documentId);
        // LLM 공개 API로 생성된 문서는 createdBy가 없을 수 있다.
        // 로그인한 노트 사용자가 이런 문서의 AI 편집 연결을 발급받을 수 있도록
        // 이 토큰 발급 경로에서만 작성자 없는 문서를 허용한다.
        if (!admin && document.getCreatedBy() != null
                && (requesterId == null || !requesterId.equals(document.getCreatedBy()))) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        String token = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(10);
        document.issueAiEditToken(sha256(token), expiresAt);
        return new AiEditTokenResponse(token, document.getId(), document.getVersion(), expiresAt);
    }

    public AiEditDocumentResponse aiEditDocument(Long documentId, String token) {
        return AiEditDocumentResponse.from(findAiEditDocument(documentId, token));
    }

    @Transactional
    public AiEditDocumentResponse updateWithAiEditToken(Long documentId, String token,
                                                        String title, String content, int expectedVersion) {
        PlaybookDocument document = findAiEditDocument(documentId, token);
        if (document.getVersion() != expectedVersion) {
            throw new BusinessException(ErrorCode.PLAYBOOK_DOCUMENT_VERSION_CONFLICT);
        }
        document.edit(title, content);
        document.consumeAiEditToken();
        return AiEditDocumentResponse.from(document);
    }

    private PlaybookDocument findAiEditDocument(Long documentId, String token) {
        if (token == null || token.isBlank()) throw new BusinessException(ErrorCode.INVALID_TOKEN);
        PlaybookDocument document = documentRepository.findByAiEditTokenHash(sha256(token))
                .filter(candidate -> candidate.getId().equals(documentId))
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));
        if (document.getAiEditTokenUsedAt() != null || document.getAiEditTokenExpiresAt() == null
                || document.getAiEditTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
        return document;
    }

    private void ensureAuthorOrAdmin(PlaybookDocument document, Long requesterId, boolean admin) {
        if (!admin && (requesterId == null || !requesterId.equals(document.getCreatedBy()))) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private static String sha256(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public PublicDocumentResponse publicDocument(String shareToken) {
        PlaybookDocument document = documentRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new BusinessException(com.cj.mesprototype.common.exception.ErrorCode.PLAYBOOK_DOCUMENT_NOT_FOUND));
        return new PublicDocumentResponse(document.getTitle(), document.getContent(), document.getUpdatedAt());
    }

    public List<CommentResponse> comments(Long documentId) {
        findDocument(documentId);
        return commentRepository.findAllByDocumentIdOrderByCreatedAtAscIdAsc(documentId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    /** 챗봇이 사용할 수 있는 지식 문서. 승인 + 사용 허용 조건을 서버에서 강제한다. */
    public List<DocumentResponse> chatbotKnowledge() {
        return documentRepository.findAllByStatusAndUseForChatbotTrue(PlaybookDocumentStatus.APPROVED).stream()
                .map(DocumentResponse::from)
                .toList();
    }

    // ── 1차 영역 ────────────────────────────────────────────

    @Transactional
    public CategoryResponse createCategory(String spaceCode, String title) {
        PlaybookSpace space = findSpace(spaceCode);
        int next = categoryRepository.findAllBySpaceIdOrderByOrderIdxAscIdAsc(space.getId()).size();
        return CategoryResponse.from(categoryRepository.save(PlaybookCategory.of(space, title, next)));
    }

    @Transactional
    public CategoryResponse createCategory(String title) {
        return createCategory("BACKEND", title);
    }

    /** LLM이 1차 영역과 여러 2차 주제를 한 번에 만들 때 사용한다. */
    @Transactional
    public StructureResponse createStructure(String spaceCode, String categoryTitle, List<String> topicTitles) {
        CategoryResponse category = createCategory(spaceCode, categoryTitle);
        List<TopicResponse> topics = topicTitles.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(title -> !title.isBlank())
                .map(title -> createTopic(category.id(), title))
                .toList();
        return new StructureResponse(category, topics);
    }

    public List<SpaceResponse> spaces() {
        return spaceRepository.findAll().stream().map(SpaceResponse::from).toList();
    }

    @Transactional
    public SpaceResponse createSpace(String code, String name) {
        return SpaceResponse.from(spaceRepository.save(PlaybookSpace.of(code.trim().toUpperCase(Locale.ROOT), name)));
    }

    @Transactional
    public SpaceResponse renameSpace(Long id, String name) {
        PlaybookSpace space = spaceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAYBOOK_CATEGORY_NOT_FOUND));
        space.rename(name);
        return SpaceResponse.from(space);
    }

    @Transactional
    public void deleteSpace(Long id) {
        PlaybookSpace space = spaceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAYBOOK_CATEGORY_NOT_FOUND));
        if (categoryRepository.findAllBySpaceIdOrderByOrderIdxAscIdAsc(id).size() > 0) {
            throw new BusinessException(ErrorCode.PLAYBOOK_CATEGORY_NOT_FOUND);
        }
        spaceRepository.delete(space);
    }

    private PlaybookSpace findSpace(String spaceCode) {
        return spaceRepository.findByCode(spaceCode.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAYBOOK_CATEGORY_NOT_FOUND));
    }

    @Transactional
    public CategoryResponse renameCategory(Long id, String title) {
        PlaybookCategory category = findCategory(id);
        category.rename(title);
        return CategoryResponse.from(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.delete(findCategory(id));
    }

    @Transactional
    public void reorderCategories(List<Long> categoryIds) {
        for (int i = 0; i < categoryIds.size(); i++) {
            findCategory(categoryIds.get(i)).moveTo(i);
        }
    }

    // ── 2차 주제 ────────────────────────────────────────────

    @Transactional
    public TopicResponse createTopic(Long categoryId, String title) {
        PlaybookCategory category = findCategory(categoryId);
        int next = topicRepository.findAllByCategoryIdOrderByOrderIdxAscIdAsc(categoryId).size();
        return TopicResponse.from(topicRepository.save(PlaybookTopic.of(category, title, next)));
    }

    @Transactional
    public TopicResponse renameTopic(Long id, String title) {
        PlaybookTopic topic = findTopic(id);
        topic.rename(title);
        return TopicResponse.from(topic);
    }

    @Transactional
    public void deleteTopic(Long id) {
        topicRepository.delete(findTopic(id));
    }

    @Transactional
    public void reorderTopics(Long categoryId, List<Long> topicIds) {
        for (int i = 0; i < topicIds.size(); i++) {
            PlaybookTopic topic = findTopic(topicIds.get(i));
            if (!topic.getCategory().getId().equals(categoryId)) {
                throw new BusinessException(ErrorCode.PLAYBOOK_TOPIC_NOT_FOUND);
            }
            topic.moveTo(i);
        }
    }

    // ── 문서 ────────────────────────────────────────────────

    @Transactional
    public DocumentResponse createDocument(Long topicId, String title, Long parentId, Long actorId) {
        PlaybookTopic topic = findTopic(topicId);
        PlaybookDocument parent = parentId == null ? null : findDocument(parentId);
        validateParent(topic, parent);
        int next = (int) documentRepository.findAllByTopicIdOrderByOrderIdxAscIdAsc(topicId).stream()
                .filter(document -> sameParent(document.getParent(), parent)).count();
        return DocumentResponse.from(
                documentRepository.save(PlaybookDocument.of(topic, parent, title, next, actorId)));
    }

    /** 기존 호출자와의 호환을 유지하는 최상위 문서 생성 오버로드. */
    @Transactional
    public DocumentResponse createDocument(Long topicId, String title, Long actorId) {
        return createDocument(topicId, title, null, actorId);
    }

    @Transactional
    public DocumentResponse updateDocument(Long id, String title, String content, Boolean useForChatbot, Long parentId) {
        PlaybookDocument document = findDocument(id);
        document.edit(title, content);
        if (parentId != null || document.getParent() != null) {
            PlaybookDocument parent = parentId == null ? null : findDocument(parentId);
            validateParent(document.getTopic(), parent);
            if (parent != null && (parent.getId().equals(document.getId()) || isDescendant(parent, document))) {
                throw new BusinessException(ErrorCode.PLAYBOOK_DOCUMENT_NOT_FOUND);
            }
            document.changeParent(parent);
        }
        if (useForChatbot != null) {
            document.changeChatbotUsage(useForChatbot);
        }
        return DocumentResponse.from(document);
    }

    /** LLM 본문 수정 전용 진입점. 버전이 전달되면 낙관적 충돌을 검사한다. */
    @Transactional
    public DocumentResponse updateDocumentContent(Long id, String title, String content, Integer expectedVersion) {
        return updateDocumentContent(id, title, content, expectedVersion, null);
    }

    /**
     * LLM 본문 수정 전용 진입점. parentId가 생략되면 기존 부모를 유지한다.
     * 따라서 본문 저장 때문에 하위 문서가 최상위 문서로 승격되지 않는다.
     */
    @Transactional
    public DocumentResponse updateDocumentContent(Long id, String title, String content,
                                                   Integer expectedVersion, Long parentId) {
        PlaybookDocument current = findDocument(id);
        if (expectedVersion != null && current.getVersion() != expectedVersion) {
            throw new BusinessException(ErrorCode.PLAYBOOK_DOCUMENT_VERSION_CONFLICT);
        }
        Long effectiveParentId = parentId != null
                ? parentId
                : current.getParent() == null ? null : current.getParent().getId();
        return updateDocument(id, title == null ? current.getTitle() : title,
                content, null, effectiveParentId);
    }

    /** 본문을 포함한 하위 문서를 한 번에 만든다. */
    @Transactional
    public DocumentResponse createDocumentWithContent(Long topicId, String title, String content,
                                                       Long parentId, Long actorId) {
        DocumentResponse created = createDocument(topicId, title, parentId, actorId);
        return updateDocument(created.id(), title, content, null, parentId);
    }

    /** 기존 호출자와의 호환을 유지하는 문서 수정 오버로드. */
    @Transactional
    public DocumentResponse updateDocument(Long id, String title, String content, Boolean useForChatbot) {
        return updateDocument(id, title, content, useForChatbot, null);
    }

    @Transactional
    public DocumentResponse approveDocument(Long id, Long actorId) {
        PlaybookDocument document = findDocument(id);
        document.approve(actorId);
        return DocumentResponse.from(document);
    }

    @Transactional
    public DocumentResponse archiveDocument(Long id) {
        PlaybookDocument document = findDocument(id);
        document.archive();
        return DocumentResponse.from(document);
    }

    @Transactional
    public void deleteDocument(Long id) {
        PlaybookDocument document = findDocument(id);
        List<PlaybookDocument> allDocuments = documentRepository
                .findAllByTopicIdOrderByOrderIdxAscIdAsc(document.getTopic().getId());
        Map<Long, List<PlaybookDocument>> childrenByParentId = new HashMap<>();
        for (PlaybookDocument candidate : allDocuments) {
            if (candidate.getParent() != null) {
                childrenByParentId
                        .computeIfAbsent(candidate.getParent().getId(), ignored -> new ArrayList<>())
                        .add(candidate);
            }
        }

        List<PlaybookDocument> documentsToDelete = new ArrayList<>();
        collectDocumentTree(document, childrenByParentId, documentsToDelete);

        commentRepository.deleteAllByDocumentIds(
                documentsToDelete.stream().map(PlaybookDocument::getId).toList());

        // 부모 문서가 자식 문서를 참조하므로 자식부터 삭제한다.
        Collections.reverse(documentsToDelete);
        documentRepository.deleteAll(documentsToDelete);
    }

    private void collectDocumentTree(PlaybookDocument document,
                                     Map<Long, List<PlaybookDocument>> childrenByParentId,
                                     List<PlaybookDocument> result) {
        result.add(document);
        for (PlaybookDocument child : childrenByParentId.getOrDefault(document.getId(), List.of())) {
            collectDocumentTree(child, childrenByParentId, result);
        }
    }

    @Transactional
    public List<CommentResponse> createComment(Long documentId, String title, String content, Long parentId, Long actorId) {
        PlaybookDocument document = findDocument(documentId);
        PlaybookDocumentComment parent = parentId == null ? null : findComment(parentId);
        if (parent != null && !parent.getDocument().getId().equals(documentId)) {
            throw new BusinessException(ErrorCode.PLAYBOOK_COMMENT_NOT_FOUND);
        }
        commentRepository.save(PlaybookDocumentComment.of(document, parent, title, content, actorId));
        return comments(documentId);
    }

    @Transactional
    public List<CommentResponse> updateComment(Long commentId, String title, String content) {
        PlaybookDocumentComment comment = findComment(commentId);
        comment.edit(title, content);
        return comments(comment.getDocument().getId());
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.delete(findComment(commentId));
    }

    @Transactional
    public void reorderDocuments(Long topicId, List<Long> documentIds, Long parentId) {
        PlaybookDocument parent = parentId == null ? null : findDocument(parentId);
        PlaybookTopic topic = findTopic(topicId);
        validateParent(topic, parent);
        for (int i = 0; i < documentIds.size(); i++) {
            PlaybookDocument document = findDocument(documentIds.get(i));
            if (!document.getTopic().getId().equals(topicId) || !sameParent(document.getParent(), parent)) {
                throw new BusinessException(ErrorCode.PLAYBOOK_DOCUMENT_NOT_FOUND);
            }
            document.moveTo(i);
        }
    }

    // ── 내부 ────────────────────────────────────────────────

    private PlaybookCategory findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAYBOOK_CATEGORY_NOT_FOUND));
    }

    private PlaybookTopic findTopic(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAYBOOK_TOPIC_NOT_FOUND));
    }

    private PlaybookDocument findDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAYBOOK_DOCUMENT_NOT_FOUND));
    }

    private PlaybookDocumentComment findComment(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PLAYBOOK_COMMENT_NOT_FOUND));
    }

    private void validateParent(PlaybookTopic topic, PlaybookDocument parent) {
        if (parent != null && !parent.getTopic().getId().equals(topic.getId())) {
            throw new BusinessException(ErrorCode.PLAYBOOK_DOCUMENT_NOT_FOUND);
        }
    }

    private boolean sameParent(PlaybookDocument left, PlaybookDocument right) {
        return left == null ? right == null : right != null && left.getId().equals(right.getId());
    }

    private boolean isDescendant(PlaybookDocument candidate, PlaybookDocument ancestor) {
        PlaybookDocument current = candidate;
        while (current != null) {
            if (current.getId().equals(ancestor.getId())) return true;
            current = current.getParent();
        }
        return false;
    }

    // ── 응답 DTO ────────────────────────────────────────────

    public record CategoryResponse(Long id, String title, int orderIdx, List<TopicResponse> topics) {
        static CategoryResponse from(PlaybookCategory c) {
            return new CategoryResponse(c.getId(), c.getTitle(), c.getOrderIdx(),
                    c.getTopics().stream().map(TopicResponse::from).toList());
        }
    }

    public record StructureResponse(CategoryResponse category, List<TopicResponse> topics) {}

    public record SpaceResponse(Long id, String code, String name) {
        static SpaceResponse from(PlaybookSpace space) {
            return new SpaceResponse(space.getId(), space.getCode(), space.getName());
        }
    }

    public record TopicResponse(Long id, Long categoryId, String title, int orderIdx,
                                List<DocumentSummary> documents) {
        static TopicResponse from(PlaybookTopic t) {
            return new TopicResponse(t.getId(), t.getCategory().getId(), t.getTitle(), t.getOrderIdx(),
                    t.getDocuments().stream().map(DocumentSummary::from).toList());
        }
    }

    /** 목록용. 본문(content)을 싣지 않아 트리 조회가 가벼워진다. */
    public record DocumentSummary(Long id, Long topicId, Long parentId, String title, PlaybookDocumentStatus status,
                                  boolean useForChatbot, int orderIdx, int version) {
        static DocumentSummary from(PlaybookDocument d) {
            return new DocumentSummary(d.getId(), d.getTopic().getId(),
                    d.getParent() == null ? null : d.getParent().getId(), d.getTitle(), d.getStatus(),
                    d.isUseForChatbot(), d.getOrderIdx(), d.getVersion());
        }
    }

    public record DocumentResponse(Long id, Long topicId, Long parentId, String title, String content,
                                   PlaybookDocumentStatus status, boolean useForChatbot, int orderIdx,
                                   int version, Long createdBy, Long approvedBy, OffsetDateTime approvedAt,
                                   OffsetDateTime updatedAt) {
        static DocumentResponse from(PlaybookDocument d) {
            return new DocumentResponse(d.getId(), d.getTopic().getId(),
                    d.getParent() == null ? null : d.getParent().getId(), d.getTitle(), d.getContent(),
                    d.getStatus(), d.isUseForChatbot(), d.getOrderIdx(), d.getVersion(), d.getCreatedBy(),
                    d.getApprovedBy(), d.getApprovedAt(), d.getUpdatedAt());
        }
    }

    public record DocumentContextResponse(
            String spaceCode,
            String spaceName,
            Long categoryId,
            String categoryTitle,
            Long topicId,
            String topicTitle,
            DocumentContextNode document) {
        static DocumentContextResponse from(PlaybookDocument root) {
            PlaybookTopic topic = root.getTopic();
            PlaybookCategory category = topic.getCategory();
            PlaybookSpace space = category.getSpace();
            return new DocumentContextResponse(
                    space.getCode(),
                    space.getName(),
                    category.getId(),
                    category.getTitle(),
                    topic.getId(),
                    topic.getTitle(),
                    DocumentContextNode.from(root, topic));
        }
    }

    public record DocumentContextNode(
            Long id,
            Long parentId,
            String title,
            String content,
            PlaybookDocumentStatus status,
            boolean useForChatbot,
            int orderIdx,
            int version,
            OffsetDateTime updatedAt,
            List<DocumentContextNode> children) {
        static DocumentContextNode from(PlaybookDocument document, PlaybookTopic topic) {
            return new DocumentContextNode(
                    document.getId(),
                    document.getParent() == null ? null : document.getParent().getId(),
                    document.getTitle(),
                    document.getContent(),
                    document.getStatus(),
                    document.isUseForChatbot(),
                    document.getOrderIdx(),
                    document.getVersion(),
                    document.getUpdatedAt(),
                    topic.getDocuments().stream()
                            .filter(child -> child.getParent() != null && child.getParent().getId().equals(document.getId()))
                            .map(child -> from(child, topic))
                            .toList());
        }
    }

    public record SearchResult(Long id, Long categoryId, String categoryTitle, Long topicId,
                               String topicTitle, Long parentId, String title,
                               PlaybookDocumentStatus status, OffsetDateTime updatedAt) {
        static SearchResult from(PlaybookDocument d) {
            return new SearchResult(d.getId(), d.getTopic().getCategory().getId(),
                    d.getTopic().getCategory().getTitle(), d.getTopic().getId(), d.getTopic().getTitle(),
                    d.getParent() == null ? null : d.getParent().getId(), d.getTitle(), d.getStatus(),
                    d.getUpdatedAt());
        }
    }

    public record ShareResponse(String token) {}

    public record AiEditTokenResponse(String token, Long documentId, int expectedVersion,
                                      OffsetDateTime expiresAt) {}

    public record AiEditDocumentResponse(Long documentId, String title, String content, int version,
                                         OffsetDateTime updatedAt) {
        static AiEditDocumentResponse from(PlaybookDocument d) {
            return new AiEditDocumentResponse(d.getId(), d.getTitle(), d.getContent(), d.getVersion(), d.getUpdatedAt());
        }
    }

    public record PublicDocumentResponse(String title, String content, OffsetDateTime updatedAt) {}

    public record CommentResponse(Long id, Long documentId, Long parentId, String title, String content,
                                  Long createdBy, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        static CommentResponse from(PlaybookDocumentComment comment) {
            return new CommentResponse(comment.getId(), comment.getDocument().getId(),
                    comment.getParent() == null ? null : comment.getParent().getId(), comment.getTitle(),
                    comment.getContent(), comment.getCreatedBy(), comment.getCreatedAt(), comment.getUpdatedAt());
        }
    }
}
