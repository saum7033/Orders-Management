package com.orders.auth;

import com.orders.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", userService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> create(
            @RequestBody UserDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("User created",
                    userService.createUser(dto, auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> update(
            @PathVariable Long id, @RequestBody UserDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("User updated",
                    userService.updateUser(id, dto, auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id, Authentication auth) {
        try {
            userService.deleteUser(id, auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<UserDTO>> toggleActive(
            @PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Status updated",
                    userService.toggleActive(id, auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
