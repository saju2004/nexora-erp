package com.erp.nexora.service;

import com.erp.nexora.entity.Expense;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.ExpenseRepository;
import com.erp.nexora.repository.InvoiceRepository;
import com.erp.nexora.repository.OrderRepository;
import com.erp.nexora.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceService {

    private final ExpenseRepository expenseRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditService auditService;

    public FinanceService(ExpenseRepository expenseRepository,
                          OrderRepository orderRepository,
                          PaymentRepository paymentRepository,
                          InvoiceRepository invoiceRepository,
                          AuditService auditService) {
        this.expenseRepository = expenseRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.auditService = auditService;
    }

    public Page<Expense> getExpenses(String search, String category, String status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return expenseRepository.searchExpenses(search, category, status, startDate, endDate, pageable);
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
    }

    @Transactional
    public Expense createExpense(Expense expense, String username) {
        if (expense.getExpenseNumber() == null || expense.getExpenseNumber().isBlank()) {
            expense.setExpenseNumber("EXP-" + LocalDate.now().getYear() + "-" + String.format("%04d", (expenseRepository.count() + 1)));
        }
        Expense saved = expenseRepository.save(expense);
        auditService.log(username, "CREATE", "FINANCE", saved.getId().toString(),
                "Added expense " + saved.getExpenseNumber() + " (" + saved.getCategory() + ") AED " + saved.getAmount());
        return saved;
    }

    @Transactional
    public Expense updateExpenseStatus(Long id, String status, String username) {
        Expense expense = getExpenseById(id);
        expense.setStatus(status);
        Expense saved = expenseRepository.save(expense);
        auditService.log(username, "UPDATE_STATUS", "FINANCE", id.toString(), "Updated expense status to " + status);
        return saved;
    }

    public Map<String, Object> getFinancialSummary() {
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        BigDecimal totalPaymentsReceived = paymentRepository.calculateTotalPaymentsReceived();
        BigDecimal totalExpenses = expenseRepository.calculateTotalApprovedExpenses();
        BigDecimal totalOutstanding = invoiceRepository.calculateTotalOutstanding();
        BigDecimal netIncome = totalRevenue.subtract(totalExpenses);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalPaymentsReceived", totalPaymentsReceived);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalOutstanding", totalOutstanding);
        summary.put("netIncome", netIncome);
        summary.put("expenseCategories", expenseRepository.getExpenseBreakdownByCategory());
        summary.put("invoiceBreakdown", invoiceRepository.getInvoiceSummaryByStatus());
        return summary;
    }
}
