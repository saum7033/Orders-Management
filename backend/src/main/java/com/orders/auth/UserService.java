package com.orders.auth;

import com.orders.audit.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository    repo;
    private final PasswordEncoder   encoder;
    private final AuditLogService   auditLog;

    public List<UserDTO> getAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public UserDTO createUser(UserDTO dto, String performedBy) {
        if (dto.getUsername() == null || dto.getUsername().isBlank())
            throw new RuntimeException("Username is required");
        if (dto.getPassword() == null || dto.getPassword().isBlank())
            throw new RuntimeException("Password is required");
        if (dto.getPassword().length() < 6)
            throw new RuntimeException("Password must be at least 6 characters");
        if (repo.existsByUsername(dto.getUsername().trim()))
            throw new RuntimeException("Username already exists");

        Role role = parseRole(dto.getRole());
        if (role == Role.ADMIN && repo.existsByRole(Role.ADMIN))
            throw new RuntimeException("An admin account already exists. Only one admin is allowed.");
        AppUser user = AppUser.builder()
                .username(dto.getUsername().trim())
                .password(encoder.encode(dto.getPassword()))
                .role(role)
                .active(true)
                .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                .build();
        AppUser saved = repo.save(user);

        auditLog.log("USER_CREATED", performedBy, saved.getUsername(),
                "Role: " + saved.getRole().name());
        return toDTO(saved);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO dto, String performedBy) {
        AppUser user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StringBuilder changes = new StringBuilder();

        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            String newUsername = dto.getUsername().trim();
            if (!newUsername.equals(user.getUsername()) && repo.existsByUsername(newUsername))
                throw new RuntimeException("Username already exists");
            if (!newUsername.equals(user.getUsername())) {
                changes.append("username changed; ");
            }
            user.setUsername(newUsername);
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6)
                throw new RuntimeException("Password must be at least 6 characters");
            user.setPassword(encoder.encode(dto.getPassword()));
            changes.append("password changed; ");
        }
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            Role newRole = parseRole(dto.getRole());
            if (newRole == Role.ADMIN && newRole != user.getRole() && repo.existsByRole(Role.ADMIN))
                throw new RuntimeException("An admin account already exists. Only one admin is allowed.");
            if (newRole != user.getRole()) changes.append("role → " + newRole.name() + "; ");
            user.setRole(newRole);
        }
        if (user.isActive() != dto.isActive()) {
            changes.append("active → " + dto.isActive() + "; ");
        }
        user.setActive(dto.isActive());
        user.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);

        AppUser saved = repo.save(user);
        auditLog.log("USER_UPDATED", performedBy, saved.getUsername(),
                changes.length() > 0 ? changes.toString().trim() : "no field changes");
        return toDTO(saved);
    }

    @Transactional
    public void deleteUser(Long id, String performedBy) {
        AppUser user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getUsername().equals(performedBy))
            throw new RuntimeException("You cannot delete your own account");
        String targetUsername = user.getUsername();
        repo.deleteById(id);
        auditLog.log("USER_DELETED", performedBy, targetUsername, null);
    }

    @Transactional
    public UserDTO toggleActive(Long id, String performedBy) {
        AppUser user = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getUsername().equals(performedBy))
            throw new RuntimeException("You cannot deactivate your own account");
        user.setActive(!user.isActive());
        AppUser saved = repo.save(user);
        String action = saved.isActive() ? "USER_ACTIVATED" : "USER_DEACTIVATED";
        auditLog.log(action, performedBy, saved.getUsername(), null);
        return toDTO(saved);
    }

    private Role parseRole(String roleStr) {
        try {
            return Role.valueOf(roleStr != null ? roleStr.trim().toUpperCase() : "USER");
        } catch (IllegalArgumentException e) {
            return Role.USER;
        }
    }

    private UserDTO toDTO(AppUser u) {
        return UserDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .role(u.getRole().name())
                .active(u.isActive())
                .email(u.getEmail())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                .build();
    }
}
