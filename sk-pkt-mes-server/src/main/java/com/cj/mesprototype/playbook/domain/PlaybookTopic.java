package com.cj.mesprototype.playbook.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/** 튼튼척 노트의 2차 주제. 하나의 1차 영역에 속한다. */
@Entity
@Table(name = "playbook_topics")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlaybookTopic {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private PlaybookCategory category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "order_idx", nullable = false)
    private int orderIdx;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIdx ASC, id ASC")
    private List<PlaybookDocument> documents = new ArrayList<>();

    private PlaybookTopic(PlaybookCategory category, String title, int orderIdx) {
        this.category = category;
        this.title = title;
        this.orderIdx = orderIdx;
    }

    public static PlaybookTopic of(PlaybookCategory category, String title, int orderIdx) {
        return new PlaybookTopic(category, title, orderIdx);
    }

    public void rename(String title) {
        this.title = title;
    }

    public void moveTo(int orderIdx) {
        this.orderIdx = orderIdx;
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
