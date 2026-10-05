package com.erp.nexora.config;

import com.erp.nexora.entity.*;
import com.erp.nexora.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final CompanySettingRepository companySettingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           CategoryRepository categoryRepository,
                           WarehouseRepository warehouseRepository,
                           SupplierRepository supplierRepository,
                           ProductRepository productRepository,
                           CustomerRepository customerRepository,
                           OrderRepository orderRepository,
                           InvoiceRepository invoiceRepository,
                           PaymentRepository paymentRepository,
                           ExpenseRepository expenseRepository,
                           EmployeeRepository employeeRepository,
                           AttendanceRepository attendanceRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           PayrollRepository payrollRepository,
                           ProjectRepository projectRepository,
                           ProjectTaskRepository projectTaskRepository,
                           NotificationRepository notificationRepository,
                           AuditLogRepository auditLogRepository,
                           CompanySettingRepository companySettingRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.expenseRepository = expenseRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollRepository = payrollRepository;
        this.projectRepository = projectRepository;
        this.projectTaskRepository = projectTaskRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.companySettingRepository = companySettingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (roleRepository.count() > 0 && userRepository.count() > 0) {
            log.info("Database already seeded with enterprise data.");
            return;
        }

        log.info("Initializing NEXORA Enterprise ERP realistic seed dataset...");

        // 1. Roles
        Role roleSuperAdmin = roleRepository.save(new Role("ROLE_SUPER_ADMIN", "Super Administrator with global access"));
        Role roleAdmin = roleRepository.save(new Role("ROLE_ADMIN", "System Administrator"));
        Role roleManager = roleRepository.save(new Role("ROLE_MANAGER", "Department Operations Manager"));
        Role roleHr = roleRepository.save(new Role("ROLE_HR", "Human Resources Director"));
        Role roleFinance = roleRepository.save(new Role("ROLE_FINANCE", "Finance & Accounts Specialist"));
        Role roleSales = roleRepository.save(new Role("ROLE_SALES", "Sales & Commercial Representative"));
        Role roleInventory = roleRepository.save(new Role("ROLE_INVENTORY", "Warehouse & Inventory Officer"));
        Role roleEmployee = roleRepository.save(new Role("ROLE_EMPLOYEE", "General Staff Member"));

        // 2. Users
        User adminUser = new User("admin@nexora.ae", "admin", passwordEncoder.encode("Admin@123"), "Sajith Ahamed", "Executive Management", "Chief Technology Officer");
        adminUser.setRoles(Set.of(roleSuperAdmin, roleAdmin));
        adminUser.setPhone("+971 50 123 4567");
        adminUser.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        userRepository.save(adminUser);

        User financeUser = new User("finance@nexora.ae", "fatima", passwordEncoder.encode("Finance@123"), "Fatima Al-Mansoor", "Finance & Accounts", "Head of Finance");
        financeUser.setRoles(Set.of(roleFinance, roleManager));
        financeUser.setPhone("+971 50 234 5678");
        userRepository.save(financeUser);

        User salesUser = new User("sales@nexora.ae", "rashid", passwordEncoder.encode("Sales@123"), "Rashid Al-Nuaimi", "Commercial & Sales", "Sales Director");
        salesUser.setRoles(Set.of(roleSales, roleManager));
        salesUser.setPhone("+971 50 345 6789");
        userRepository.save(salesUser);

        User hrUser = new User("hr@nexora.ae", "mariam", passwordEncoder.encode("Hr@123"), "Mariam Khalid", "Human Resources", "HR Generalist");
        hrUser.setRoles(Set.of(roleHr));
        hrUser.setPhone("+971 50 456 7890");
        userRepository.save(hrUser);

        User invUser = new User("inventory@nexora.ae", "tariq", passwordEncoder.encode("Inventory@123"), "Tariq Hassan", "Supply Chain", "Warehouse Operations Manager");
        invUser.setRoles(Set.of(roleInventory));
        invUser.setPhone("+971 50 567 8901");
        userRepository.save(invUser);

        // 3. Categories
        Category catHardware = categoryRepository.save(new Category("Enterprise Hardware", "CAT-HW", "Servers, storage racks, and data center hardware"));
        Category catNetwork = categoryRepository.save(new Category("Networking & Telecom", "CAT-NET", "Enterprise routers, managed switches, and cabling"));
        Category catSecurity = categoryRepository.save(new Category("Security & Surveillance", "CAT-SEC", "Access control, biometric terminals, and CCTV"));
        Category catOffice = categoryRepository.save(new Category("Office Infrastructure", "CAT-OFF", "Smart workstations, ergonomic seating, and monitors"));
        Category catSupplies = categoryRepository.save(new Category("Industrial Consumables", "CAT-IND", "Label stocks, thermal ribbons, packaging, and spares"));

        // 4. Warehouses
        Warehouse whDubai = warehouseRepository.save(new Warehouse("Dubai Central Logistics Hub", "WH-DXB-01", "Al Quoz Industrial Area 3, Dubai", "Tariq Hassan"));
        Warehouse whJafza = warehouseRepository.save(new Warehouse("JAFZA Free Zone Depot", "WH-JAF-02", "Jebel Ali Free Zone South, Dubai", "Mansoor Al-Zaabi"));
        Warehouse whAbuDhabi = warehouseRepository.save(new Warehouse("Abu Dhabi Industrial Hub", "WH-AUH-03", "Musaffah Industrial City, Abu Dhabi", "Sultan Al-Shamsi"));

        // 5. Suppliers
        Supplier supGulfStar = new Supplier();
        supGulfStar.setSupplierCode("SUP-1001");
        supGulfStar.setName("Gulf Star Trading LLC");
        supGulfStar.setContactPerson("Bilal Al-Hashimi");
        supGulfStar.setEmail("orders@gulfstartrading.ae");
        supGulfStar.setPhone("+971 4 332 8899");
        supGulfStar.setCity("Dubai");
        supGulfStar.setAddress("Deira Commercial District, Suite 402");
        supGulfStar.setTaxNumber("100234589000003");
        supGulfStar.setPaymentTerms("Net 30");
        supplierRepository.save(supGulfStar);

        Supplier supAlNoor = new Supplier();
        supAlNoor.setSupplierCode("SUP-1002");
        supAlNoor.setName("Al Noor Electronics FZCO");
        supAlNoor.setContactPerson("Kareem Al-Sayed");
        supAlNoor.setEmail("b2b@alnoorelec.ae");
        supAlNoor.setPhone("+971 4 881 7766");
        supAlNoor.setCity("Dubai");
        supAlNoor.setAddress("JAFZA North Tower, 11th Floor");
        supAlNoor.setTaxNumber("100889211000003");
        supAlNoor.setPaymentTerms("Net 45");
        supplierRepository.save(supAlNoor);

        Supplier supEmiratesInd = new Supplier();
        supEmiratesInd.setSupplierCode("SUP-1003");
        supEmiratesInd.setName("Emirates Industrial Solutions");
        supEmiratesInd.setContactPerson("Zaid Qasim");
        supEmiratesInd.setEmail("sales@emiratesindustrial.ae");
        supEmiratesInd.setPhone("+971 6 542 3311");
        supEmiratesInd.setCity("Sharjah");
        supEmiratesInd.setAddress("Industrial Area 13, Sharjah");
        supEmiratesInd.setTaxNumber("100445672000003");
        supEmiratesInd.setPaymentTerms("Net 30");
        supplierRepository.save(supEmiratesInd);

        // 6. Products
        Product p1 = createProd("Dell PowerEdge R750xs Server", "SKU-SRV-750", "884116378291", catHardware, supAlNoor, whDubai, new BigDecimal("14200.00"), new BigDecimal("18500.00"), 18, 5, "UNIT");
        Product p2 = createProd("Cisco Catalyst 9200 48-Port Switch", "SKU-CS-9200", "088265882310", catNetwork, supGulfStar, whDubai, new BigDecimal("5400.00"), new BigDecimal("7250.00"), 34, 8, "UNIT");
        Product p3 = createProd("Honeywell Biometric Face & Palm Terminal", "SKU-SEC-HW01", "692144567812", catSecurity, supGulfStar, whJafza, new BigDecimal("2100.00"), new BigDecimal("2980.00"), 12, 4, "UNIT");
        Product p4 = createProd("Ubiquiti UniFi Pro Wi-Fi 6 AP", "SKU-NET-U6P", "810010072314", catNetwork, supGulfStar, whDubai, new BigDecimal("650.00"), new BigDecimal("890.00"), 48, 15, "UNIT");
        Product p5 = createProd("Samsung 34\" UltraWide QHD Curved Monitor", "SKU-DS-S34", "880609123849", catOffice, supAlNoor, whAbuDhabi, new BigDecimal("1450.00"), new BigDecimal("1950.00"), 4, 10, "PCS"); // Low Stock!
        Product p6 = createProd("Herman Miller Aeron Task Chair", "SKU-CH-AER", "764010892019", catOffice, supEmiratesInd, whDubai, new BigDecimal("3200.00"), new BigDecimal("4450.00"), 22, 6, "PCS");
        Product p7 = createProd("Cat6A Bulk Shielded Ethernet Cable 305m", "SKU-CAB-6A", "789102345612", catNetwork, supEmiratesInd, whJafza, new BigDecimal("380.00"), new BigDecimal("540.00"), 3, 12, "ROLL"); // Low Stock!
        Product p8 = createProd("APC Smart-UPS 3000VA LCD RM 2U", "SKU-PWR-3000", "731304268712", catHardware, supAlNoor, whDubai, new BigDecimal("4100.00"), new BigDecimal("5600.00"), 14, 5, "UNIT");
        Product p9 = createProd("Zebra ZT411 Industrial Thermal Barcode Printer", "SKU-PRN-ZT4", "768239014281", catSupplies, supEmiratesInd, whJafza, new BigDecimal("4800.00"), new BigDecimal("6450.00"), 8, 4, "UNIT");
        Product p10 = createProd("Thermal Transfer Barcode Ribbon Rolls (Box 12)", "SKU-RBN-TR12", "600123984120", catSupplies, supEmiratesInd, whDubai, new BigDecimal("180.00"), new BigDecimal("270.00"), 2, 8, "BOX"); // Low Stock!

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));

        // 7. Customers
        Customer c1 = createCust("CUST-1001", "Emirates Office Supplies", "Emirates Office Supplies LLC", "procurement@emiratesofficesupplies.ae", "+971 4 228 1144", "Dubai", "Sheikh Zayed Road, Trade Centre 2", new BigDecimal("150000.00"), new BigDecimal("28450.00"));
        Customer c2 = createCust("CUST-1002", "Dubai Business Solutions", "Dubai Business Solutions FZ-LLC", "accounts@dubaibusiness.ae", "+971 4 456 9900", "Dubai", "Bay Square Building 7, Business Bay", new BigDecimal("200000.00"), new BigDecimal("14400.00"));
        Customer c3 = createCust("CUST-1003", "Abu Dhabi Maritime Services", "Abu Dhabi Maritime Services PJSC", "finance@admaritime.ae", "+971 2 678 3322", "Abu Dhabi", "Corniche Sector, Tower 3", new BigDecimal("350000.00"), BigDecimal.ZERO);
        Customer c4 = createCust("CUST-1004", "Gulf Star Commercial Bank", "Gulf Commercial Bank PJSC", "it.procure@gulfcombank.ae", "+971 4 362 5500", "Dubai", "DIFC Gate Precinct 4, Dubai", new BigDecimal("500000.00"), BigDecimal.ZERO);
        Customer c5 = createCust("CUST-1005", "Al Noor Logistics Group", "Al Noor Logistics Group LLC", "supply@alnoorlogistics.ae", "+971 6 523 7744", "Sharjah", "Sharjah Airport Free Zone (SAIF)", new BigDecimal("120000.00"), BigDecimal.ZERO);

        customerRepository.saveAll(List.of(c1, c2, c3, c4, c5));

        // 8. Orders, Invoices, Payments
        Order o1 = new Order();
        o1.setOrderNumber("ORD-2026-10480");
        o1.setCustomer(c4);
        o1.setOrderDate(LocalDate.now().minusDays(18));
        o1.setExpectedDeliveryDate(LocalDate.now().minusDays(15));
        o1.setShippingAddress("DIFC Gate Precinct 4, Floor 14, Dubai");
        o1.setStatus("DELIVERED");
        o1.setPaymentStatus("PAID");
        o1.addItem(new OrderItem(p1, 2, new BigDecimal("18500.00"), new BigDecimal("37000.00")));
        o1.addItem(new OrderItem(p2, 4, new BigDecimal("7250.00"), new BigDecimal("29000.00")));
        o1.setSubtotal(new BigDecimal("66000.00"));
        o1.setTaxAmount(new BigDecimal("3300.00")); // 5%
        o1.setTotalAmount(new BigDecimal("69300.00"));
        orderRepository.save(o1);

        Invoice inv1 = new Invoice();
        inv1.setInvoiceNumber("INV-2026-0040");
        inv1.setOrder(o1);
        inv1.setCustomer(c4);
        inv1.setInvoiceDate(o1.getOrderDate());
        inv1.setDueDate(o1.getOrderDate().plusDays(30));
        inv1.setSubtotal(o1.getSubtotal());
        inv1.setTaxAmount(o1.getTaxAmount());
        inv1.setTotalAmount(o1.getTotalAmount());
        inv1.setPaidAmount(o1.getTotalAmount());
        inv1.setBalanceAmount(BigDecimal.ZERO);
        inv1.setStatus("PAID");
        invoiceRepository.save(inv1);

        Payment pay1 = new Payment();
        pay1.setPaymentNumber("PAY-2026-0038");
        pay1.setInvoice(inv1);
        pay1.setCustomer(c4);
        pay1.setPaymentDate(LocalDate.now().minusDays(10));
        pay1.setAmount(inv1.getTotalAmount());
        pay1.setPaymentMethod("BANK_TRANSFER");
        pay1.setReferenceNumber("FT-GCB-998231");
        pay1.setStatus("COMPLETED");
        paymentRepository.save(pay1);

        Order o2 = new Order();
        o2.setOrderNumber("ORD-2026-10481");
        o2.setCustomer(c1);
        o2.setOrderDate(LocalDate.now().minusDays(8));
        o2.setExpectedDeliveryDate(LocalDate.now().minusDays(5));
        o2.setShippingAddress("Trade Centre 2, Sheikh Zayed Road, Dubai");
        o2.setStatus("SHIPPED");
        o2.setPaymentStatus("PARTIAL");
        o2.addItem(new OrderItem(p6, 6, new BigDecimal("4450.00"), new BigDecimal("26700.00")));
        o2.addItem(new OrderItem(p4, 8, new BigDecimal("890.00"), new BigDecimal("7120.00")));
        o2.setSubtotal(new BigDecimal("33820.00"));
        o2.setTaxAmount(new BigDecimal("1691.00"));
        o2.setTotalAmount(new BigDecimal("35511.00"));
        orderRepository.save(o2);

        Invoice inv2 = new Invoice();
        inv2.setInvoiceNumber("INV-2026-0041");
        inv2.setOrder(o2);
        inv2.setCustomer(c1);
        inv2.setInvoiceDate(o2.getOrderDate());
        inv2.setDueDate(o2.getOrderDate().plusDays(30));
        inv2.setSubtotal(o2.getSubtotal());
        inv2.setTaxAmount(o2.getTaxAmount());
        inv2.setTotalAmount(o2.getTotalAmount());
        inv2.setPaidAmount(new BigDecimal("7061.00"));
        inv2.setBalanceAmount(new BigDecimal("28450.00"));
        inv2.setStatus("PARTIAL");
        invoiceRepository.save(inv2);

        Payment pay2 = new Payment();
        pay2.setPaymentNumber("PAY-2026-0039");
        pay2.setInvoice(inv2);
        pay2.setCustomer(c1);
        pay2.setPaymentDate(LocalDate.now().minusDays(6));
        pay2.setAmount(new BigDecimal("7061.00"));
        pay2.setPaymentMethod("CREDIT_CARD");
        pay2.setReferenceNumber("CC-AUTH-88231");
        pay2.setStatus("COMPLETED");
        paymentRepository.save(pay2);

        Order o3 = new Order();
        o3.setOrderNumber("ORD-2026-10482");
        o3.setCustomer(c2);
        o3.setOrderDate(LocalDate.now().minusDays(2));
        o3.setExpectedDeliveryDate(LocalDate.now().plusDays(2));
        o3.setShippingAddress("Bay Square Building 7, Business Bay, Dubai");
        o3.setStatus("PROCESSING");
        o3.setPaymentStatus("UNPAID");
        o3.addItem(new OrderItem(p3, 4, new BigDecimal("2980.00"), new BigDecimal("11920.00")));
        o3.addItem(new OrderItem(p8, 1, new BigDecimal("5600.00"), new BigDecimal("5600.00")));
        o3.setSubtotal(new BigDecimal("17520.00"));
        o3.setTaxAmount(new BigDecimal("876.00"));
        o3.setTotalAmount(new BigDecimal("18396.00"));
        orderRepository.save(o3);

        Invoice inv3 = new Invoice();
        inv3.setInvoiceNumber("INV-2026-0042");
        inv3.setOrder(o3);
        inv3.setCustomer(c2);
        inv3.setInvoiceDate(o3.getOrderDate());
        inv3.setDueDate(o3.getOrderDate().plusDays(30));
        inv3.setSubtotal(o3.getSubtotal());
        inv3.setTaxAmount(o3.getTaxAmount());
        inv3.setTotalAmount(o3.getTotalAmount());
        inv3.setPaidAmount(new BigDecimal("3996.00"));
        inv3.setBalanceAmount(new BigDecimal("14400.00"));
        inv3.setStatus("PARTIAL");
        invoiceRepository.save(inv3);

        // 9. Expenses (Explicit instantiation)
        Expense exp1 = new Expense();
        exp1.setExpenseNumber("EXP-2026-0081");
        exp1.setCategory("Cloud & IT Infrastructure");
        exp1.setAmount(new BigDecimal("18450.00"));
        exp1.setExpenseDate(LocalDate.now().minusDays(5));
        exp1.setPayee("Amazon Web Services MENA FZ-LLC");
        exp1.setStatus("APPROVED");
        exp1.setDescription("Monthly production hosting, multi-AZ database clustering & backup storage");
        expenseRepository.save(exp1);

        Expense exp2 = new Expense();
        exp2.setExpenseNumber("EXP-2026-0082");
        exp2.setCategory("Facility & Warehouse Lease");
        exp2.setAmount(new BigDecimal("35000.00"));
        exp2.setExpenseDate(LocalDate.now().minusDays(12));
        exp2.setPayee("Dubai Industrial City Properties");
        exp2.setStatus("APPROVED");
        exp2.setDescription("Q4 Logistics warehouse rental installment for Al Quoz hub");
        expenseRepository.save(exp2);

        Expense exp3 = new Expense();
        exp3.setExpenseNumber("EXP-2026-0083");
        exp3.setCategory("Telecommunications & ISP");
        exp3.setAmount(new BigDecimal("4200.00"));
        exp3.setExpenseDate(LocalDate.now().minusDays(18));
        exp3.setPayee("Emirates Telecommunications Group (e&)");
        exp3.setStatus("APPROVED");
        exp3.setDescription("Gigabit dedicated leased line fiber connection for headquarters");
        expenseRepository.save(exp3);

        Expense exp4 = new Expense();
        exp4.setExpenseNumber("EXP-2026-0084");
        exp4.setCategory("Office Supplies & Logistics");
        exp4.setAmount(new BigDecimal("2800.00"));
        exp4.setExpenseDate(LocalDate.now().minusDays(22));
        exp4.setPayee("DHL Express UAE");
        exp4.setStatus("APPROVED");
        exp4.setDescription("Express document & secure hardware transfer between hubs");
        expenseRepository.save(exp4);

        // 10. Employees
        Employee e1 = createEmp("EMP-1001", "Sajith", "Ahamed", "sajith@nexora.ae", "+971 50 123 4567", "Executive", "Chief Technology Officer", LocalDate.of(2021, 3, 1), new BigDecimal("32000.00"));
        Employee e2 = createEmp("EMP-1002", "Fatima", "Al-Mansoor", "fatima@nexora.ae", "+971 50 234 5678", "Finance & Accounts", "Head of Finance", LocalDate.of(2022, 1, 15), new BigDecimal("24500.00"));
        Employee e3 = createEmp("EMP-1003", "Rashid", "Al-Nuaimi", "rashid@nexora.ae", "+971 50 345 6789", "Sales & Commercial", "Sales Director", LocalDate.of(2022, 6, 1), new BigDecimal("22000.00"));
        Employee e4 = createEmp("EMP-1004", "Mariam", "Khalid", "mariam@nexora.ae", "+971 50 456 7890", "Human Resources", "HR Generalist", LocalDate.of(2023, 2, 10), new BigDecimal("16500.00"));
        Employee e5 = createEmp("EMP-1005", "Tariq", "Hassan", "tariq@nexora.ae", "+971 50 567 8901", "Supply Chain", "Warehouse Operations Manager", LocalDate.of(2023, 5, 20), new BigDecimal("18000.00"));
        Employee e6 = createEmp("EMP-1006", "Zaid", "Al-Balooshi", "zaid@nexora.ae", "+971 50 678 9012", "IT & Engineering", "Senior Systems Architect", LocalDate.of(2023, 9, 1), new BigDecimal("19500.00"));
        Employee e7 = createEmp("EMP-1007", "Sara", "Al-Marzouqi", "sara@nexora.ae", "+971 50 789 0123", "Finance & Accounts", "Senior Accountant", LocalDate.of(2024, 1, 8), new BigDecimal("14000.00"));

        employeeRepository.saveAll(List.of(e1, e2, e3, e4, e5, e6, e7));

        // 11. Attendance
        attendanceRepository.save(new Attendance(e1, LocalDate.now(), LocalTime.of(8, 45), null, "PRESENT"));
        attendanceRepository.save(new Attendance(e2, LocalDate.now(), LocalTime.of(8, 55), null, "PRESENT"));
        attendanceRepository.save(new Attendance(e3, LocalDate.now(), LocalTime.of(9, 15), null, "LATE"));
        attendanceRepository.save(new Attendance(e4, LocalDate.now(), LocalTime.of(8, 50), null, "PRESENT"));
        attendanceRepository.save(new Attendance(e5, LocalDate.now(), LocalTime.of(8, 30), null, "PRESENT"));
        attendanceRepository.save(new Attendance(e6, LocalDate.now(), LocalTime.of(8, 52), null, "PRESENT"));

        // 12. Leave Requests
        LeaveRequest lr1 = new LeaveRequest();
        lr1.setEmployee(e7);
        lr1.setLeaveType("ANNUAL");
        lr1.setStartDate(LocalDate.now().plusDays(10));
        lr1.setEndDate(LocalDate.now().plusDays(15));
        lr1.setDaysCount(5);
        lr1.setReason("Annual family leave to Muscat");
        lr1.setStatus("APPROVED");
        lr1.setApprovedBy("Mariam Khalid");
        leaveRequestRepository.save(lr1);

        LeaveRequest lr2 = new LeaveRequest();
        lr2.setEmployee(e3);
        lr2.setLeaveType("CASUAL");
        lr2.setStartDate(LocalDate.now().plusDays(4));
        lr2.setEndDate(LocalDate.now().plusDays(4));
        lr2.setDaysCount(1);
        lr2.setReason("Personal appointment");
        lr2.setStatus("PENDING");
        leaveRequestRepository.save(lr2);

        // 13. Payroll
        Payroll pr1 = new Payroll();
        pr1.setPayrollMonth("2026-09");
        pr1.setEmployee(e1);
        pr1.setBasicSalary(e1.getBasicSalary());
        pr1.setAllowances(new BigDecimal("3000.00"));
        pr1.setDeductions(BigDecimal.ZERO);
        pr1.setNetSalary(new BigDecimal("35000.00"));
        pr1.setStatus("PAID");
        pr1.setPaymentDate(LocalDate.now().minusDays(5));
        pr1.setPaymentReference("PAYROLL-2026-09-EMP-1001");
        payrollRepository.save(pr1);

        Payroll pr2 = new Payroll();
        pr2.setPayrollMonth("2026-09");
        pr2.setEmployee(e2);
        pr2.setBasicSalary(e2.getBasicSalary());
        pr2.setAllowances(new BigDecimal("2000.00"));
        pr2.setDeductions(BigDecimal.ZERO);
        pr2.setNetSalary(new BigDecimal("26500.00"));
        pr2.setStatus("PAID");
        pr2.setPaymentDate(LocalDate.now().minusDays(5));
        pr2.setPaymentReference("PAYROLL-2026-09-EMP-1002");
        payrollRepository.save(pr2);

        // 14. Projects & Tasks
        Project prj1 = new Project();
        prj1.setProjectCode("PRJ-101");
        prj1.setName("Enterprise Cloud ERP Migration");
        prj1.setClientName("Emirates Office Supplies LLC");
        prj1.setStartDate(LocalDate.now().minusMonths(2));
        prj1.setEndDate(LocalDate.now().plusMonths(1));
        prj1.setBudget(new BigDecimal("280000.00"));
        prj1.setSpent(new BigDecimal("192000.00"));
        prj1.setStatus("IN_PROGRESS");
        prj1.setPriority("HIGH");
        prj1.setProgressPercentage(72);
        prj1.setDescription("Full-stack data migration and API integration from legacy SAP R/3 to Nexora ERP cloud platform");
        projectRepository.save(prj1);

        Project prj2 = new Project();
        prj2.setProjectCode("PRJ-102");
        prj2.setName("Smart Warehouse Barcode & RFID Integration");
        prj2.setClientName("Al Noor Logistics Group");
        prj2.setStartDate(LocalDate.now().minusMonths(1));
        prj2.setEndDate(LocalDate.now().plusMonths(2));
        prj2.setBudget(new BigDecimal("145000.00"));
        prj2.setSpent(new BigDecimal("68000.00"));
        prj2.setStatus("IN_PROGRESS");
        prj2.setPriority("MEDIUM");
        prj2.setProgressPercentage(45);
        prj2.setDescription("Deploying Zebra RFID scanners, handheld terminals, and real-time inventory synchronization");
        projectRepository.save(prj2);

        ProjectTask t1 = new ProjectTask();
        t1.setProject(prj1);
        t1.setTitle("Deploy Spring Boot API to Dubai Private VPC");
        t1.setDescription("Configure load balancers and SSL certificates for port 8080 and endpoints");
        t1.setAssignedTo("Sajith Ahamed");
        t1.setDueDate(LocalDate.now().plusDays(2));
        t1.setPriority("HIGH");
        t1.setStatus("IN_PROGRESS");
        t1.setEstimatedHours(16);
        t1.setActualHours(10);
        projectTaskRepository.save(t1);

        ProjectTask t2 = new ProjectTask();
        t2.setProject(prj1);
        t2.setTitle("Execute automated database integrity migration");
        t2.setDescription("Validate 10,000 legacy records against MySQL relational constraints");
        t2.setAssignedTo("Zaid Al-Balooshi");
        t2.setDueDate(LocalDate.now().plusDays(5));
        t2.setPriority("URGENT");
        t2.setStatus("TODO");
        t2.setEstimatedHours(24);
        t2.setActualHours(0);
        projectTaskRepository.save(t2);

        ProjectTask t3 = new ProjectTask();
        t3.setProject(prj2);
        t3.setTitle("RFID gate antenna calibration at JAFZA depot");
        t3.setDescription("Hardware testing for passive RFID tag recognition speed at Bay 4");
        t3.setAssignedTo("Tariq Hassan");
        t3.setDueDate(LocalDate.now().plusDays(7));
        t3.setPriority("MEDIUM");
        t3.setStatus("TODO");
        t3.setEstimatedHours(12);
        t3.setActualHours(0);
        projectTaskRepository.save(t3);

        // 15. Notifications
        notificationRepository.save(new Notification("Low Stock Alert: Samsung 34\" UltraWide Monitor", "Only 4 units remaining in Dubai Central Hub (Reorder level is 10).", "WARNING", "/inventory"));
        notificationRepository.save(new Notification("New Order ORD-2026-10482 received", "Dubai Business Solutions confirmed order worth AED 18,396.", "INFO", "/sales/orders"));
        notificationRepository.save(new Notification("Payment Received: PAY-2026-0038", "Bank transfer of AED 69,300.00 received from Gulf Commercial Bank.", "SUCCESS", "/finance/payments"));
        notificationRepository.save(new Notification("Leave Request Pending Review", "Rashid Al-Nuaimi submitted casual leave for tomorrow.", "INFO", "/hr/leaves"));

        // 16. Audit Logs
        auditLogRepository.save(new AuditLog("admin", "LOGIN", "AUTH", "1", "User logged in successfully via web console"));
        auditLogRepository.save(new AuditLog("fatima", "RECORD_PAYMENT", "FINANCE", "38", "Recorded payment PAY-2026-0038 of AED 69,300"));
        auditLogRepository.save(new AuditLog("rashid", "CREATE_ORDER", "SALES", "10482", "Created order ORD-2026-10482 for Dubai Business Solutions"));
        auditLogRepository.save(new AuditLog("tariq", "ADJUST_STOCK", "INVENTORY", "5", "Restocked 10 units of Samsung monitors to WH-AUH-03"));
        auditLogRepository.save(new AuditLog("mariam", "APPROVE_LEAVE", "HR", "1", "Approved annual leave application for Sara Al-Marzouqi"));

        // 17. Company Settings
        companySettingRepository.save(new CompanySetting("company_name", "NEXORA Enterprise Solutions LLC", "Registered Corporate Entity", "GENERAL"));
        companySettingRepository.save(new CompanySetting("trn_number", "100348291000003", "UAE Federal Tax Authority 15-digit TRN", "TAX"));
        companySettingRepository.save(new CompanySetting("default_currency", "AED", "Default Base Currency", "GENERAL"));
        companySettingRepository.save(new CompanySetting("vat_rate", "5%", "UAE Standard VAT Rate", "TAX"));
        companySettingRepository.save(new CompanySetting("official_email", "contact@nexora.ae", "Official Communication Address", "GENERAL"));
        companySettingRepository.save(new CompanySetting("official_phone", "+971 4 800 6396", "Enterprise Support Hotline", "GENERAL"));
        companySettingRepository.save(new CompanySetting("headquarters", "Level 28, Al Saada Tower, Business Bay, Dubai, UAE", "Corporate Headquarters", "GENERAL"));

        log.info("NEXORA Enterprise ERP database seeding successfully finished!");
    }

    private Product createProd(String name, String sku, String barcode, Category cat, Supplier sup, Warehouse wh, BigDecimal cost, BigDecimal sell, int qty, int reorder, String unit) {
        Product p = new Product();
        p.setName(name);
        p.setSku(sku);
        p.setBarcode(barcode);
        p.setCategory(cat);
        p.setSupplier(sup);
        p.setWarehouse(wh);
        p.setCostPrice(cost);
        p.setSellingPrice(sell);
        p.setStockQuantity(qty);
        p.setReorderLevel(reorder);
        p.setUnit(unit);
        p.updateComputedStatus();
        return p;
    }

    private Customer createCust(String code, String name, String company, String email, String phone, String city, String addr, BigDecimal limit, BigDecimal balance) {
        Customer c = new Customer();
        c.setCustomerCode(code);
        c.setName(name);
        c.setCompanyName(company);
        c.setEmail(email);
        c.setPhone(phone);
        c.setCity(city);
        c.setAddress(addr);
        c.setCreditLimit(limit);
        c.setCurrentBalance(balance);
        c.setStatus("ACTIVE");
        return c;
    }

    private Employee createEmp(String code, String fn, String ln, String email, String phone, String dept, String desig, LocalDate joinDate, BigDecimal salary) {
        Employee e = new Employee();
        e.setEmployeeCode(code);
        e.setFirstName(fn);
        e.setLastName(ln);
        e.setEmail(email);
        e.setPhone(phone);
        e.setDepartment(dept);
        e.setDesignation(desig);
        e.setJoiningDate(joinDate);
        e.setBasicSalary(salary);
        e.setStatus("ACTIVE");
        return e;
    }
}
