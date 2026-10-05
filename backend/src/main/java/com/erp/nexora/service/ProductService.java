package com.erp.nexora.service;

import com.erp.nexora.dto.StockAdjustDto;
import com.erp.nexora.entity.*;
import com.erp.nexora.exception.BadRequestException;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          WarehouseRepository warehouseRepository,
                          SupplierRepository supplierRepository,
                          StockMovementRepository stockMovementRepository,
                          AuditService auditService,
                          NotificationService notificationService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.supplierRepository = supplierRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public Page<Product> getProducts(String search, Long categoryId, Long warehouseId, String status, Pageable pageable) {
        return productRepository.searchProducts(search, categoryId, warehouseId, status, pageable);
    }

    public List<Product> getAllProductsList() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    @Transactional
    public Product createProduct(Product product, String username) {
        if (product.getSku() != null && productRepository.existsBySku(product.getSku())) {
            throw new BadRequestException("Product SKU '" + product.getSku() + "' already exists");
        }
        product.updateComputedStatus();
        Product saved = productRepository.save(product);

        // Record initial stock movement
        if (saved.getStockQuantity() > 0) {
            StockMovement movement = new StockMovement(
                    saved, "IN", saved.getStockQuantity(), 0, saved.getStockQuantity(),
                    "INITIAL-STOCK", "Initial stock intake", username
            );
            stockMovementRepository.save(movement);
        }

        auditService.log(username, "CREATE", "INVENTORY", saved.getId().toString(), "Created product " + saved.getName() + " (" + saved.getSku() + ")");
        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, Product updated, String username) {
        Product existing = getProductById(id);
        existing.setName(updated.getName());
        existing.setBarcode(updated.getBarcode());
        existing.setCostPrice(updated.getCostPrice());
        existing.setSellingPrice(updated.getSellingPrice());
        existing.setReorderLevel(updated.getReorderLevel());
        existing.setUnit(updated.getUnit());
        existing.setDescription(updated.getDescription());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getWarehouse() != null) existing.setWarehouse(updated.getWarehouse());
        if (updated.getSupplier() != null) existing.setSupplier(updated.getSupplier());
        existing.updateComputedStatus();

        Product saved = productRepository.save(existing);
        auditService.log(username, "UPDATE", "INVENTORY", saved.getId().toString(), "Updated product details " + saved.getName());
        return saved;
    }

    @Transactional
    public void deleteProduct(Long id, String username) {
        Product product = getProductById(id);
        product.setStatus("INACTIVE");
        productRepository.save(product);
        auditService.log(username, "DELETE", "INVENTORY", id.toString(), "Soft deleted product " + product.getName());
    }

    @Transactional
    public Product adjustStock(StockAdjustDto dto, String username) {
        Product product = getProductById(dto.getProductId());
        int before = product.getStockQuantity();
        int change = dto.getQuantity();
        int after = before + change;
        if (after < 0) {
            throw new BadRequestException("Stock cannot be negative. Current stock: " + before);
        }

        product.setStockQuantity(after);
        Product saved = productRepository.save(product);

        String type = dto.getAdjustmentType() != null ? dto.getAdjustmentType() : (change >= 0 ? "IN" : "OUT");
        StockMovement movement = new StockMovement(
                product, type, Math.abs(change), before, after,
                dto.getReferenceNumber() != null ? dto.getReferenceNumber() : "ADJ-" + System.currentTimeMillis(),
                dto.getReason() != null ? dto.getReason() : "Manual stock adjustment",
                username
        );
        stockMovementRepository.save(movement);

        if (saved.getStockQuantity() <= saved.getReorderLevel()) {
            notificationService.createNotification(
                    "Low Stock Alert: " + saved.getName(),
                    "Product " + saved.getSku() + " is at or below reorder level (" + saved.getStockQuantity() + " remaining).",
                    "WARNING",
                    "/inventory"
            );
        }

        auditService.log(username, "ADJUST_STOCK", "INVENTORY", product.getId().toString(),
                "Adjusted stock from " + before + " to " + after + " (" + (change >= 0 ? "+" : "") + change + ")");
        return saved;
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    public BigDecimal getTotalInventoryValue() {
        return productRepository.calculateTotalInventoryValue();
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public Page<StockMovement> getStockMovements(Pageable pageable) {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
