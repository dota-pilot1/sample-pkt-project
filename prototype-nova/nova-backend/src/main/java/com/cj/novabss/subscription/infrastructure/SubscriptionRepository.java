package com.cj.novabss.subscription.infrastructure;

import com.cj.novabss.subscription.domain.Subscription;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserIdOrderBySubscribedAtDesc(Long userId);
}
