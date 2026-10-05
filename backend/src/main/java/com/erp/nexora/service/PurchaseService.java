package com.erp.nexora.service;

import com.erp.nexora.entity.Supplier;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PurchaseService {

    private final SupplierRepository supplierRepository;
    private final AuditService auditService;

    public PurchaseService(SupplierRepository supplierRepository, AuditService auditService) {
        this.supplierRepository = supplierRepository;
        this.auditService = auditService;
    }

    public Page<Supplier> getSuppliers(String search, Pageable pageable) {
        return supplierRepository.searchSuppliers(search, pageable);
    }

    public List<Supplier> getAllSuppliersList() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
    }

    @Transactional
    public Supplier createSupplier(Supplier supplier, String username) {
        if (supplier.getSupplierCode() == null || supplier.getSupplierCode().isBlank()) {
            supplier.setSupplierCode("SUP-" + (1000 + supplierRepository.count() + 1));
        }
        Supplier saved = supplierRepository.save(supplier);
        auditService.log(username, "CREATE", "PURCHASE", saved.getId().toString(),
                "Added supplier " + saved.getName() + " (" + saved.getSupplierCode() + ")");
        return saved;
    }

    @Transactional
    public Supplier updateSupplier(Long id, Supplier updated, String username) {
        Supplier existing = getSupplierById(id);
        existing.setName(updated.getName());
        existing.setContactPerson(updated.getContactPerson());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setCity(updated.getCity());
        existing.setAddress(updated.getAddress());
        existing.setTaxNumber(updated.getTaxNumber());
        existing.setPaymentTerms(updated.getPaymentTerms());
        existing.setStatus(updated.getStatus());

        Supplier saved = supplierRepository.save(existing);
        auditService.log(username, "UPDATE", "PURCHASE", saved.getId().toString(),
                "Updated supplier " + saved.getName());
        return saved;
    }
}
