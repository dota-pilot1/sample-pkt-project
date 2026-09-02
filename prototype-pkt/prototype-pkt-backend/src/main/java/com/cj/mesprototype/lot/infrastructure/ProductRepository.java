package com.cj.mesprototype.lot.infrastructure;

import com.cj.mesprototype.lot.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByProductCode(String productCode);
    List<Product> findAllByOrderByProductCodeAsc();
    List<Product> findAllByActiveTrueOrderByProductCodeAsc();
}
