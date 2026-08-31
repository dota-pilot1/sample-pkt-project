package com.cj.mesprototype.lot.infrastructure;
import com.cj.mesprototype.lot.domain.ProductProcessRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductProcessRouteRepository extends JpaRepository<ProductProcessRoute, Long> {
    List<ProductProcessRoute> findAllByProductIdOrderBySequenceNoAsc(Long productId);

    boolean existsByProductIdAndProcessId(Long productId, Long processId);
}
