package com.erp.nexora.dto;

import com.erp.nexora.entity.Order;
import com.erp.nexora.entity.Product;
import com.erp.nexora.entity.ProjectTask;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private BigDecimal totalRevenue;
    private String revenueChangePercentage;
    private long totalOrders;
    private String ordersChangePercentage;
    private BigDecimal inventoryValue;
    private String inventoryChangePercentage;
    private BigDecimal outstandingPayments;
    private String outstandingChangePercentage;

    private List<String> revenueMonths;
    private List<BigDecimal> monthlyRevenue;
    private List<BigDecimal> monthlyExpenses;

    private Map<String, Long> orderStatusCounts;
    private List<Product> lowStockItems;
    private List<Order> recentOrders;
    private List<ProjectTask> upcomingTasks;

    public DashboardStatsDto() {}

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public String getRevenueChangePercentage() { return revenueChangePercentage; }
    public void setRevenueChangePercentage(String revenueChangePercentage) { this.revenueChangePercentage = revenueChangePercentage; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public String getOrdersChangePercentage() { return ordersChangePercentage; }
    public void setOrdersChangePercentage(String ordersChangePercentage) { this.ordersChangePercentage = ordersChangePercentage; }
    public BigDecimal getInventoryValue() { return inventoryValue; }
    public void setInventoryValue(BigDecimal inventoryValue) { this.inventoryValue = inventoryValue; }
    public String getInventoryChangePercentage() { return inventoryChangePercentage; }
    public void setInventoryChangePercentage(String inventoryChangePercentage) { this.inventoryChangePercentage = inventoryChangePercentage; }
    public BigDecimal getOutstandingPayments() { return outstandingPayments; }
    public void setOutstandingPayments(BigDecimal outstandingPayments) { this.outstandingPayments = outstandingPayments; }
    public String getOutstandingChangePercentage() { return outstandingChangePercentage; }
    public void setOutstandingChangePercentage(String outstandingChangePercentage) { this.outstandingChangePercentage = outstandingChangePercentage; }
    public List<String> getRevenueMonths() { return revenueMonths; }
    public void setRevenueMonths(List<String> revenueMonths) { this.revenueMonths = revenueMonths; }
    public List<BigDecimal> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<BigDecimal> monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    public List<BigDecimal> getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(List<BigDecimal> monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }
    public Map<String, Long> getOrderStatusCounts() { return orderStatusCounts; }
    public void setOrderStatusCounts(Map<String, Long> orderStatusCounts) { this.orderStatusCounts = orderStatusCounts; }
    public List<Product> getLowStockItems() { return lowStockItems; }
    public void setLowStockItems(List<Product> lowStockItems) { this.lowStockItems = lowStockItems; }
    public List<Order> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<Order> recentOrders) { this.recentOrders = recentOrders; }
    public List<ProjectTask> getUpcomingTasks() { return upcomingTasks; }
    public void setUpcomingTasks(List<ProjectTask> upcomingTasks) { this.upcomingTasks = upcomingTasks; }
}
