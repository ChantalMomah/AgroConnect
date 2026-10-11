package com.agroconnect.security;

import com.agroconnect.model.User;
import com.agroconnect.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger logger =
        LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        filterChain.doFilter(request, response);
        return;
    }

    String token = authHeader.substring(7);

    if (jwtUtil.validateToken(token)) {

    String email = jwtUtil.extractEmail(token);

    if (email != null) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + user.getRole());

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(authority));

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }
}
logger.info(
    "REQUEST: {} {} | AUTH: {} | AUTHORITIES: {}",
    request.getMethod(),
    request.getRequestURI(),
    SecurityContextHolder.getContext().getAuthentication(),
    SecurityContextHolder.getContext().getAuthentication() != null
        ? SecurityContextHolder.getContext().getAuthentication().getAuthorities()
        : "NONE"
);
    filterChain.doFilter(request, response);
}
}