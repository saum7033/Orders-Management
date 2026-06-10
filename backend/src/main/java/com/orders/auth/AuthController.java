package com.orders.auth;

import com.orders.dto.ApiResponse;
import com.orders.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    /** Signup — create a new account */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@RequestBody AuthRequest req) {
        if (repo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username already exists"));
        }
        Role role = Role.USER;
        if ("ADMIN".equalsIgnoreCase(req.getRole())) role = Role.ADMIN;

        AppUser user = AppUser.builder()
                .username(req.getUsername())
                .password(encoder.encode(req.getPassword()))
                .role(role)
                .build();
        repo.save(user);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.ok("Account created",
                new AuthResponse(token, user.getUsername(), user.getRole().name())));
    }

    /** Login — returns JWT */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest req) {
        AppUser user = repo.findByUsername(req.getUsername()).orElse(null);
        if (user == null || !encoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Invalid username or password"));
        }
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.ok("Login successful",
                new AuthResponse(token, user.getUsername(), user.getRole().name())));
    }
}
