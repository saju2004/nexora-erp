package com.erp.nexora.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "warehouses")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 50, unique = true)
    private String code;

    @Column(length = 255)
    private String location;

    @Column(name = "manager_name", length = 100)
    private String managerName;

    @Column(length = 50)
    private String capacity;

    @Column(nullable = false)
    private boolean active = true;

    public Warehouse() {}

    public Warehouse(String name, String code, String location, String managerName) {
        this.name = name;
        this.code = code;
        this.location = location;
        this.managerName = managerName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
    public String getCapacity() { return capacity; }
    public void setCapacity(String capacity) { this.capacity = capacity; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
