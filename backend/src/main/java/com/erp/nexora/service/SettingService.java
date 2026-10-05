package com.erp.nexora.service;

import com.erp.nexora.entity.CompanySetting;
import com.erp.nexora.entity.Role;
import com.erp.nexora.entity.User;
import com.erp.nexora.exception.BadRequestException;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.CompanySettingRepository;
import com.erp.nexora.repository.RoleRepository;
import com.erp.nexora.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SettingService {

    private final CompanySettingRepository companySettingRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public SettingService(CompanySettingRepository companySettingRepository,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          AuditService auditService) {
        this.companySettingRepository = companySettingRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public List<CompanySetting> getAllSettings() {
        return companySettingRepository.findAll();
    }

    @Transactional
    public void saveSettings(Map<String, String> settings, String username) {
        settings.forEach((key, value) -> {
            Optional<CompanySetting> opt = companySettingRepository.findByKey(key);
            CompanySetting setting = opt.orElseGet(() -> new CompanySetting(key, value, "", "GENERAL"));
            setting.setValue(value);
            companySettingRepository.save(setting);
        });
        auditService.log(username, "UPDATE_SETTINGS", "SETTINGS", "COMPANY", "Updated company configuration parameters");
    }

    // Users and Roles
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional
    public User createUser(User user, String roleName, String username) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email already in use: " + user.getEmail());
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new BadRequestException("Username already taken: " + user.getUsername());
        }

        Role role = roleRepository.findByName(roleName != null ? roleName : "ROLE_EMPLOYEE")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
        user.getRoles().add(role);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User saved = userRepository.save(user);
        auditService.log(username, "CREATE_USER", "SETTINGS", saved.getId().toString(),
                "Created new user account for " + saved.getFullName() + " with role " + role.getName());
        return saved;
    }

    @Transactional
    public User updateUserStatus(Long userId, String status, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(status);
        User saved = userRepository.save(user);
        auditService.log(username, "UPDATE_USER_STATUS", "SETTINGS", userId.toString(),
                "Set user status for " + user.getUsername() + " to " + status);
        return saved;
    }
}
