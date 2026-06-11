package com.orders.auth;

import com.orders.dto.ApiResponse;
import com.orders.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
        // First signup becomes ADMIN (if no admin exists); all others become USER
        Role role = repo.existsByRole(Role.ADMIN) ? Role.USER : Role.ADMIN;
        AppUser user = AppUser.builder()
                .username(req.getUsername())
                .password(encoder.encode(req.getPassword()))
                .role(role)
                .active(true)
                .build();
        repo.save(user);
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.ok("Account created",
                new AuthResponse(token, user.getUsername(), user.getRole().name())));
    }

    /**
     * Health — public endpoint the frontend polls to verify the new backend code is running.
     * Returns version "2.0-rbac" so the frontend can detect old vs new build.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status",  "UP",
            "version", "2.0-rbac"
        ));
    }

    /** Change password — authenticated users only */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));

        String currentPwd = body.getOrDefault("currentPassword", "");
        String newPwd     = body.getOrDefault("newPassword", "");
        if (newPwd.length() < 6)
            return ResponseEntity.badRequest().body(ApiResponse.error("New password must be at least 6 characters"));

        AppUser user = repo.findByUsername(auth.getName()).orElse(null);
        if (user == null || !encoder.matches(currentPwd, user.getPassword()))
            return ResponseEntity.badRequest().body(ApiResponse.error("Current password is incorrect"));

        user.setPassword(encoder.encode(newPwd));
        repo.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    /** Me — returns the username and role the server reads from the current JWT */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        String username = auth.getName();
        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse("UNKNOWN");
        return ResponseEntity.ok(ApiResponse.ok("Authenticated",
                new AuthResponse(null, username, role)));
    }

    /** Login — returns JWT */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest req) {
        AppUser user = repo.findByUsername(req.getUsername()).orElse(null);
        if (user == null || !encoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Invalid username or password"));
        }
        if (!user.isActive()) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Account is deactivated. Contact an administrator."));
        }
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.ok("Login successful",
                new AuthResponse(token, user.getUsername(), user.getRole().name())));
    }
}
