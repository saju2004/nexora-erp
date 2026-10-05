package com.erp.nexora.service;

import com.erp.nexora.dto.AuthRequest;
import com.erp.nexora.dto.AuthResponse;
import com.erp.nexora.dto.UserDto;
import com.erp.nexora.entity.Role;
import com.erp.nexora.entity.User;
import com.erp.nexora.exception.BadRequestException;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.UserRepository;
import com.erp.nexora.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    public AuthResponse authenticateUser(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(authRequest.getUsername())
                .or(() -> userRepository.findByUsername(authRequest.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("User", "usernameOrEmail", authRequest.getUsername()));

        auditService.log(user.getUsername(), "LOGIN", "AUTH", user.getId().toString(), "User logged into ERP system");

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                user.getDepartment(),
                user.getDesignation(),
                user.getAvatarUrl(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
        );
    }

    public UserDto getCurrentUser(String usernameOrEmail) {
        User user = userRepository.findByEmail(usernameOrEmail)
                .or(() -> userRepository.findByUsername(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "usernameOrEmail", usernameOrEmail));

        return mapToDto(user);
    }

    public void updatePassword(String usernameOrEmail, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(usernameOrEmail)
                .or(() -> userRepository.findByUsername(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User", "usernameOrEmail", usernameOrEmail));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        auditService.log(user.getUsername(), "PASSWORD_CHANGE", "AUTH", user.getId().toString(), "User updated password");
    }

    public UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setDepartment(user.getDepartment());
        dto.setDesignation(user.getDesignation());
        dto.setPhone(user.getPhone());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setStatus(user.getStatus());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return dto;
    }
}
