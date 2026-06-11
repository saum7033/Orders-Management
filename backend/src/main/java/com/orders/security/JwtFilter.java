package com.orders.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String method  = req.getMethod();
        String path    = req.getRequestURI();
        String header  = req.getHeader("Authorization");

        log.debug("[JwtFilter] {} {} | Authorization header present: {}", method, path, header != null);

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            boolean valid = jwtUtil.isValid(token);
            log.debug("[JwtFilter] Token valid: {}", valid);

            if (valid) {
                String username  = jwtUtil.extractUsername(token);
                String rawRole   = jwtUtil.extractRole(token);
                String authority = rawRole != null ? "ROLE_" + rawRole.trim().toUpperCase() : null;

                log.debug("[JwtFilter] Username: {} | JWT role claim: {} | Authority: {}",
                        username, rawRole, authority);

                if (authority != null) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            username, null,
                            List.of(new SimpleGrantedAuthority(authority))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.debug("[JwtFilter] Authentication set for {} with {}", username, authority);
                } else {
                    log.warn("[JwtFilter] JWT for {} has no role claim — request will be treated as anonymous", username);
                }
            } else {
                // Token present but invalid/expired → return 401 immediately.
                // This prevents Spring Security's accessDeniedHandler from firing a confusing 403.
                log.warn("[JwtFilter] Token rejected as invalid/expired for path: {}", path);
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.setContentType("application/json;charset=UTF-8");
                res.getWriter().write(
                    "{\"error\":\"Unauthorized\"," +
                    "\"message\":\"Session expired or token invalid — please log in again\"}"
                );
                return;
            }
        } else {
            log.debug("[JwtFilter] No Bearer token — anonymous request to {}", path);
        }

        chain.doFilter(req, res);
    }
}
