package com.cj.mesprototype.lot.infrastructure;
import com.cj.mesprototype.lot.domain.ProductRouteAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ProductRouteAssignmentRepository extends JpaRepository<ProductRouteAssignment, Long> { Optional<ProductRouteAssignment> findByProductIdAndDefaultRouteTrue(Long productId); }
