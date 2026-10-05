package com.erp.nexora.service;

import com.erp.nexora.dto.OrderCreateDto;
import com.erp.nexora.dto.OrderItemDto;
import com.erp.nexora.entity.*;
import com.erp.nexora.exception.BadRequestException;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class SalesService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public SalesService(CustomerRepository customerRepository,
                        OrderRepository orderRepository,
                        ProductRepository productRepository,
                        InvoiceRepository invoiceRepository,
                        PaymentRepository paymentRepository,
                        StockMovementRepository stockMovementRepository,
                        AuditService auditService,
                        NotificationService notificationService) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    // Customer operations
    public Page<Customer> getCustomers(String search, String status, Pageable pageable) {
        return customerRepository.searchCustomers(search, status, pageable);
    }

    public List<Customer> getAllCustomersList() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
    }

    @Transactional
    public Customer createCustomer(Customer customer, String username) {
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isBlank()) {
            customer.setCustomerCode("CUST-" + (1000 + customerRepository.count() + 1));
        }
        Customer saved = customerRepository.save(customer);
        auditService.log(username, "CREATE", "SALES", saved.getId().toString(), "Added customer " + saved.getName() + " (" + saved.getCustomerCode() + ")");
        return saved;
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer updated, String username) {
        Customer existing = getCustomerById(id);
        existing.setName(updated.getName());
        existing.setCompanyName(updated.getCompanyName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setCity(updated.getCity());
        existing.setAddress(updated.getAddress());
        existing.setTaxNumber(updated.getTaxNumber());
        existing.setCreditLimit(updated.getCreditLimit());
        existing.setStatus(updated.getStatus());

        Customer saved = customerRepository.save(existing);
        auditService.log(username, "UPDATE", "SALES", saved.getId().toString(), "Updated customer " + saved.getName());
        return saved;
    }

    // Order operations
    public Page<Order> getOrders(String search, String status, String paymentStatus, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return orderRepository.searchOrders(search, status, paymentStatus, startDate, endDate, pageable);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    @Transactional
    public Order createOrder(OrderCreateDto dto, String username) {
        Customer customer = getCustomerById(dto.getCustomerId());

        Order order = new Order();
        order.setOrderNumber("ORD-" + LocalDate.now().getYear() + "-" + (10400 + orderRepository.count() + 1));
        order.setCustomer(customer);
        order.setOrderDate(LocalDate.now());
        order.setExpectedDeliveryDate(dto.getExpectedDeliveryDate() != null ? dto.getExpectedDeliveryDate() : LocalDate.now().plusDays(3));
        order.setShippingAddress(dto.getShippingAddress() != null ? dto.getShippingAddress() : customer.getAddress());
        order.setNotes(dto.getNotes());
        order.setStatus("PROCESSING");
        order.setPaymentStatus("UNPAID");

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product " + product.getName() + ". Available: " + product.getStockQuantity());
            }

            BigDecimal unitPrice = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : product.getSellingPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = new OrderItem(product, itemDto.getQuantity(), unitPrice, itemTotal);
            order.addItem(orderItem);

            // Deduct stock and log movement
            int before = product.getStockQuantity();
            int after = before - itemDto.getQuantity();
            product.setStockQuantity(after);
            productRepository.save(product);

            StockMovement movement = new StockMovement(
                    product, "OUT", itemDto.getQuantity(), before, after,
                    order.getOrderNumber(), "Order fulfillment: " + order.getOrderNumber(), username
            );
            stockMovementRepository.save(movement);
        }

        // UAE VAT rate: 5%
        BigDecimal discount = dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal taxable = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal tax = taxable.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discount);
        order.setTaxAmount(tax);
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        // Auto-generate invoice for the new order
        createInvoiceForOrder(saved, username);

        notificationService.createNotification(
                "New Order " + saved.getOrderNumber(),
                "Order created for " + customer.getName() + " totaling AED " + saved.getTotalAmount(),
                "INFO",
                "/sales/orders"
        );

        auditService.log(username, "CREATE", "SALES", saved.getId().toString(),
                "Created order " + saved.getOrderNumber() + " totaling AED " + saved.getTotalAmount());
        return saved;
    }

    @Transactional
    public Order updateOrderStatus(Long id, String status, String username) {
        Order order = getOrderById(id);
        order.setStatus(status);
        Order saved = orderRepository.save(order);
        auditService.log(username, "UPDATE_STATUS", "SALES", order.getId().toString(),
                "Updated order " + order.getOrderNumber() + " status to " + status);
        return saved;
    }

    @Transactional
    public Invoice createInvoiceForOrder(Order order, String username) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", (invoiceRepository.count() + 1)));
        invoice.setOrder(order);
        invoice.setCustomer(order.getCustomer());
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setSubtotal(order.getSubtotal());
        invoice.setTaxAmount(order.getTaxAmount());
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setBalanceAmount(order.getTotalAmount());
        invoice.setStatus("UNPAID");
        invoice.setNotes("Standard 30-day invoice for order " + order.getOrderNumber());

        // Update customer balance
        Customer customer = order.getCustomer();
        customer.setCurrentBalance(customer.getCurrentBalance().add(order.getTotalAmount()));
        customerRepository.save(customer);

        Invoice saved = invoiceRepository.save(invoice);
        auditService.log(username, "GENERATE_INVOICE", "FINANCE", saved.getId().toString(),
                "Generated invoice " + saved.getInvoiceNumber() + " for order " + order.getOrderNumber());
        return saved;
    }

    // Invoices and Payments
    public Page<Invoice> getInvoices(String search, String status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return invoiceRepository.searchInvoices(search, status, startDate, endDate, pageable);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
    }

    @Transactional
    public Payment recordPayment(Long invoiceId, BigDecimal amount, String method, String refNumber, String notes, String username) {
        Invoice invoice = getInvoiceById(invoiceId);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }
        if (amount.compareTo(invoice.getBalanceAmount()) > 0) {
            throw new BadRequestException("Payment amount cannot exceed invoice outstanding balance: AED " + invoice.getBalanceAmount());
        }

        Payment payment = new Payment();
        payment.setPaymentNumber("PAY-" + LocalDate.now().getYear() + "-" + String.format("%04d", (paymentRepository.count() + 1)));
        payment.setInvoice(invoice);
        payment.setCustomer(invoice.getCustomer());
        payment.setPaymentDate(LocalDate.now());
        payment.setAmount(amount);
        payment.setPaymentMethod(method != null ? method : "BANK_TRANSFER");
        payment.setReferenceNumber(refNumber != null ? refNumber : "TXN-" + System.currentTimeMillis());
        payment.setStatus("COMPLETED");
        payment.setNotes(notes);

        Payment saved = paymentRepository.save(payment);

        // Update invoice balance and status
        BigDecimal newPaid = invoice.getPaidAmount().add(amount);
        BigDecimal newBalance = invoice.getTotalAmount().subtract(newPaid);
        invoice.setPaidAmount(newPaid);
        invoice.setBalanceAmount(newBalance);

        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("PAID");
            if (invoice.getOrder() != null) {
                invoice.getOrder().setPaymentStatus("PAID");
                orderRepository.save(invoice.getOrder());
            }
        } else {
            invoice.setStatus("PARTIAL");
            if (invoice.getOrder() != null) {
                invoice.getOrder().setPaymentStatus("PARTIAL");
                orderRepository.save(invoice.getOrder());
            }
        }
        invoiceRepository.save(invoice);

        // Update customer balance
        Customer customer = invoice.getCustomer();
        customer.setCurrentBalance(customer.getCurrentBalance().subtract(amount).max(BigDecimal.ZERO));
        customerRepository.save(customer);

        notificationService.createNotification(
                "Payment Received: " + saved.getPaymentNumber(),
                "Payment of AED " + amount + " received for Invoice " + invoice.getInvoiceNumber(),
                "SUCCESS",
                "/finance/payments"
        );

        auditService.log(username, "RECORD_PAYMENT", "FINANCE", saved.getId().toString(),
                "Recorded payment " + saved.getPaymentNumber() + " for invoice " + invoice.getInvoiceNumber());
        return saved;
    }

    public Page<Payment> getPayments(String search, String status, String method, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return paymentRepository.searchPayments(search, status, method, startDate, endDate, pageable);
    }
}
