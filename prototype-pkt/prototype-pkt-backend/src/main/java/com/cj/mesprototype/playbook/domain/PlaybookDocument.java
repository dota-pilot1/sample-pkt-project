package com.cj.mesprototype.playbook.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 튼튼척 노트 문서. 본문은 Lexical 직렬화 JSON 문자열을 그대로 보관한다.
 * 챗봇 지식으로는 APPROVED + useForChatbot 인 문서만 노출된다.
 */
@Entity
@Table(name = "playbook_documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlaybookDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private PlaybookTopic topic;

    /** 같은 주제 안에서만 둘 수 있는 선택적 상위 문서. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private PlaybookDocument parent;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String content = "";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlaybookDocumentStatus status = PlaybookDocumentStatus.DRAFT;

    @Column(name = "use_for_chatbot", nullable = false)
    private boolean useForChatbot;

    @Column(name = "order_idx", nullable = false)
    private int orderIdx;

    @Column(nullable = false)
    private int version = 1;

    @Column(name = "created_by")
    private Long createdBy;

    /** 로그인 없이 읽을 수 있는 공유 링크용 비밀 토큰. 발급 전에는 null이다. */
    @Column(name = "share_token", unique = true, length = 64)
    private String shareToken;

    /** 작성자가 AI 편집을 승인할 때만 잠시 사용하는 토큰의 해시. 원문은 저장하지 않는다. */
    @Column(name = "ai_edit_token_hash", unique = true, length = 64)
    private String aiEditTokenHash;

    @Column(name = "ai_edit_token_expires_at")
    private OffsetDateTime aiEditTokenExpiresAt;

    @Column(name = "ai_edit_token_used_at")
    private OffsetDateTime aiEditTokenUsedAt;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private PlaybookDocument(PlaybookTopic topic, PlaybookDocument parent,
                                    String title, int orderIdx, Long createdBy) {
        this.topic = topic;
        this.parent = parent;
        this.title = title;
        this.orderIdx = orderIdx;
        this.createdBy = createdBy;
    }

    public static PlaybookDocument of(PlaybookTopic topic, PlaybookDocument parent,
                                              String title, int orderIdx, Long createdBy) {
        return new PlaybookDocument(topic, parent, title, orderIdx, createdBy);
    }

    /** 본문이나 제목이 바뀌면 개정으로 보고 version 을 올리고 승인 상태를 초안으로 되돌린다. */
    public void edit(String title, String content) {
        boolean changed = false;
        if (title != null && !title.equals(this.title)) {
            this.title = title;
            changed = true;
        }
        if (content != null && !content.equals(this.content)) {
            this.content = content;
            changed = true;
        }
        if (!changed) return;

        this.version += 1;
        if (this.status == PlaybookDocumentStatus.APPROVED) {
            this.status = PlaybookDocumentStatus.DRAFT;
            this.approvedBy = null;
            this.approvedAt = null;
        }
    }

    public void changeChatbotUsage(boolean useForChatbot) {
        this.useForChatbot = useForChatbot;
    }

    public void approve(Long approverId) {
        this.status = PlaybookDocumentStatus.APPROVED;
        this.approvedBy = approverId;
        this.approvedAt = OffsetDateTime.now();
    }

    public void archive() {
        this.status = PlaybookDocumentStatus.ARCHIVED;
        this.approvedBy = null;
        this.approvedAt = null;
    }

    public void moveTo(int orderIdx) {
        this.orderIdx = orderIdx;
    }

    public void changeParent(PlaybookDocument parent) {
        this.parent = parent;
    }

    public void issueShareToken(String token) {
        if (this.shareToken == null) this.shareToken = token;
    }

    public void issueAiEditToken(String tokenHash, OffsetDateTime expiresAt) {
        this.aiEditTokenHash = tokenHash;
        this.aiEditTokenExpiresAt = expiresAt;
        this.aiEditTokenUsedAt = null;
    }

    public void consumeAiEditToken() {
        this.aiEditTokenUsedAt = OffsetDateTime.now();
    }

    @PrePersist
    void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
