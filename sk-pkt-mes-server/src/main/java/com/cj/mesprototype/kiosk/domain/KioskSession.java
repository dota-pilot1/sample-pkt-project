package com.cj.mesprototype.kiosk.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "kiosk_chat_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class KioskSession {
    @Id @Column(length = 36)
    private String id;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(nullable = false)
    private Instant startedAt;
    @Column(nullable = false)
    private Instant lastActivityAt;

    private KioskSession(String id) {
        this.id = id;
        this.status = "ACTIVE";
        this.startedAt = Instant.now();
        this.lastActivityAt = this.startedAt;
    }
    public static KioskSession start() { return new KioskSession(UUID.randomUUID().toString()); }
    public void touch() { this.lastActivityAt = Instant.now(); }
    public void finish() { this.status = "EXPIRED"; touch(); }
}
