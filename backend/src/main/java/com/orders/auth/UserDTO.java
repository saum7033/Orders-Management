package com.orders.auth;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDTO {
    private Long   id;
    private String username;
    private String password; // only sent on create / password-reset; never returned in responses
    private String role;
    private boolean active;
    private String email;
    private String createdAt;
}
