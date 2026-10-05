package com.erp.nexora.repository;

import com.erp.nexora.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:warehouseId IS NULL OR p.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Product> searchProducts(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("warehouseId") Long warehouseId,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.reorderLevel AND p.status != 'INACTIVE' ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockProducts();

    @Query("SELECT COALESCE(SUM(p.costPrice * p.stockQuantity), 0) FROM Product p WHERE p.status != 'INACTIVE'")
    BigDecimal calculateTotalInventoryValue();

    long countByStatus(String status);
}
