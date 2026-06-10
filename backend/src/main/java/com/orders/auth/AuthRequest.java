package com.orders.auth;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
    private String role; // "ADMIN" or "USER" — used only during signup
}
