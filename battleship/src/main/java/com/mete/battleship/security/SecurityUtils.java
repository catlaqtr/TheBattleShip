package com.mete.battleship.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {
    private SecurityUtils() {}

    public static Optional<Long> currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return Optional.empty();
        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails cud) {
            return Optional.ofNullable(cud.getId());
        }
        return Optional.empty();
    }
}

