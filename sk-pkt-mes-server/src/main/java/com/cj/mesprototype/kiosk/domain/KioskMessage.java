package com.cj.mesprototype.kiosk.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "kiosk_chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class KioskMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private KioskSession session;
    @Column(nullable = false, length = 20)
    private String sender;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(length = 50)
    private String intent;
    @Column(nullable = false)
    private Instant createdAt;

    private KioskMessage(KioskSession session, String sender, String content, String intent) {
        this.session = session; this.sender = sender; this.content = content; this.intent = intent; this.createdAt = Instant.now();
    }
    public static KioskMessage create(KioskSession session, String sender, String content, String intent) { return new KioskMessage(session, sender, content, intent); }
}
