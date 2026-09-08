package com.cj.novabss.subscription.domain;

import com.cj.novabss.plan.domain.RatePlan;
import com.cj.novabss.user.domain.User;
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
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 고객 사용자와 요금제 사이의 가입 이력을 표현한다. 결제·청구·개통은 이후 도메인에서 다룬다. */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_plan_id", nullable = false)
    private RatePlan ratePlan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(name = "subscribed_at", nullable = false)
    private OffsetDateTime subscribedAt;

    public static Subscription request(User user, RatePlan ratePlan, OffsetDateTime now) {
        Subscription subscription = new Subscription();
        subscription.user = user;
        subscription.ratePlan = ratePlan;
        subscription.status = SubscriptionStatus.REQUESTED;
        subscription.subscribedAt = now;
        return subscription;
    }
}
