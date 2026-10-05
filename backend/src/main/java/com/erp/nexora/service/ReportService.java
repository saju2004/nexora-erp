package com.erp.nexora.service;

import com.erp.nexora.entity.Invoice;
import com.erp.nexora.entity.Order;
import com.erp.nexora.entity.Product;
import com.erp.nexora.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollRepository payrollRepository;

    public ReportService(OrderRepository orderRepository,
                         ProductRepository productRepository,
                         InvoiceRepository invoiceRepository,
                         ExpenseRepository expenseRepository,
                         EmployeeRepository employeeRepository,
                         PayrollRepository payrollRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
        this.expenseRepository = expenseRepository;
        this.employeeRepository = employeeRepository;
        this.payrollRepository = payrollRepository;
    }

    public Map<String, Object> getSalesReport(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> !o.getOrderDate().isBefore(start) && !o.getOrderDate().isAfter(end))
                .toList();

        BigDecimal totalSales = orders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", start);
        report.put("endDate", end);
        report.put("totalOrdersCount", orders.size());
        report.put("totalSalesAmount", totalSales);
        report.put("averageOrderValue", orders.isEmpty() ? BigDecimal.ZERO : totalSales.divide(BigDecimal.valueOf(orders.size()), 2, java.math.RoundingMode.HALF_UP));
        report.put("orders", orders);
        return report;
    }

    public Map<String, Object> getInventoryReport() {
        List<Product> products = productRepository.findAll();
        BigDecimal totalValue = productRepository.calculateTotalInventoryValue();
        List<Product> lowStock = productRepository.findLowStockProducts();

        Map<String, Object> report = new HashMap<>();
        report.put("totalProducts", products.size());
        report.put("totalValuation", totalValue);
        report.put("lowStockCount", lowStock.size());
        report.put("products", products);
        report.put("lowStockProducts", lowStock);
        return report;
    }

    public Map<String, Object> getFinancialReport() {
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        BigDecimal totalExpenses = expenseRepository.calculateTotalApprovedExpenses();
        BigDecimal totalOutstanding = invoiceRepository.calculateTotalOutstanding();
        List<Invoice> recentInvoices = invoiceRepository.findTop10ByOrderByCreatedAtDesc();

        Map<String, Object> report = new HashMap<>();
        report.put("grossRevenue", totalRevenue);
        report.put("totalExpenses", totalExpenses);
        report.put("netProfit", totalRevenue.subtract(totalExpenses));
        report.put("totalOutstanding", totalOutstanding);
        report.put("expenseBreakdown", expenseRepository.getExpenseBreakdownByCategory());
        report.put("recentInvoices", recentInvoices);
        return report;
    }

    public Map<String, Object> getEmployeeReport() {
        long activeCount = employeeRepository.countByStatus("ACTIVE");
        long onLeaveCount = employeeRepository.countByStatus("ON_LEAVE");
        List<Object[]> deptCounts = employeeRepository.countEmployeesByDepartment();

        Map<String, Object> report = new HashMap<>();
        report.put("activeEmployees", activeCount);
        report.put("onLeaveEmployees", onLeaveCount);
        report.put("totalEmployees", activeCount + onLeaveCount);
        report.put("departmentBreakdown", deptCounts);
        report.put("employees", employeeRepository.findAll());
        return report;
    }
}
