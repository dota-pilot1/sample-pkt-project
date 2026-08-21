package com.cj.mesprototype.playbook.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/** 개발 학습 문서의 댓글과 1단계 답글. */
@Entity
@Table(name = "playbook_document_comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlaybookDocumentComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private PlaybookDocument document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private PlaybookDocumentComment parent;

    @Column(length = 160)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    private PlaybookDocumentComment(PlaybookDocument document,
                                            PlaybookDocumentComment parent,
                                            String title, String content, Long createdBy) {
        this.document = document;
        this.parent = parent;
        this.title = title;
        this.content = content;
        this.createdBy = createdBy;
    }

    public static PlaybookDocumentComment of(PlaybookDocument document,
                                                      PlaybookDocumentComment parent,
                                                      String title, String content, Long createdBy) {
        return new PlaybookDocumentComment(document, parent, title, content, createdBy);
    }

    public void edit(String title, String content) {
        if (title != null) this.title = title;
        if (content != null) this.content = content;
    }

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
