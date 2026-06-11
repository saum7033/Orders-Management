package com.orders.config;

import com.orders.auth.AppUser;
import com.orders.auth.Role;
import com.orders.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Ensures the default admin account exists on startup.
 * If no ADMIN is found, creates username=admin password=admin123.
 * Change the password via Settings → Change Password after first login.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) return;

        AppUser admin = AppUser.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);
        log.info("Default admin created — username: admin  password: admin123");
    }
}
