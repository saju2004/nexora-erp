package com.erp.nexora.controller;

import com.erp.nexora.dto.ApiResponse;
import com.erp.nexora.dto.OrderCreateDto;
import com.erp.nexora.entity.Customer;
import com.erp.nexora.entity.Invoice;
import com.erp.nexora.entity.Order;
import com.erp.nexora.entity.Payment;
import com.erp.nexora.service.SalesService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SalesController {

    private final SalesService salesService;

    public SalesController(SalesService salesService) {
        this.salesService = salesService;
    }

    // Customers
    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Page<Customer>>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<Customer> customers = salesService.getCustomers(search, status, PageRequest.of(page, size, Sort.by(direction, sortParams[0])));
        return ResponseEntity.ok(ApiResponse.ok(customers));
    }

    @GetMapping("/customers/all")
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.ok(salesService.getAllCustomersList()));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(salesService.getCustomerById(id)));
    }

    @PostMapping("/customers")
    public ResponseEntity<ApiResponse<Customer>> createCustomer(
            @Valid @RequestBody Customer customer,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Customer registered successfully", salesService.createCustomer(customer, username)));
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody Customer customer,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", salesService.updateCustomer(id, customer, username)));
    }

    // Orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<Order>>> getOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<Order> orders = salesService.getOrders(search, status, paymentStatus, startDate, endDate, PageRequest.of(page, size, Sort.by(direction, sortParams[0])));
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(salesService.getOrderById(id)));
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @Valid @RequestBody OrderCreateDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Order created and invoice generated", salesService.createOrder(dto, username)));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", salesService.updateOrderStatus(id, body.get("status"), username)));
    }

    // Invoices
    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<Page<Invoice>>> getInvoices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return ResponseEntity.ok(ApiResponse.ok(salesService.getInvoices(search, status, startDate, endDate, PageRequest.of(page, size, Sort.by(direction, sortParams[0])))));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<ApiResponse<Invoice>> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(salesService.getInvoiceById(id)));
    }

    // Record Payment
    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<ApiResponse<Payment>> recordPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String method = (String) body.get("method");
        String ref = (String) body.get("referenceNumber");
        String notes = (String) body.get("notes");

        Payment payment = salesService.recordPayment(id, amount, method, ref, notes, username);
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully", payment));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<Payment>>> getPayments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.ok(salesService.getPayments(search, status, method, startDate, endDate, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))));
    }
}
