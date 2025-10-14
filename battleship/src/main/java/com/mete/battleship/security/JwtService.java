package com.mete.battleship.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expirationMs:86400000}") // 1 day default
    private long expirationMs;

    private byte[] keyBytes() {
        // Try Base64 first
        try {
            byte[] decoded = Decoders.BASE64.decode(secret);
            if (decoded != null && decoded.length >= 32) {
                return decoded;
            }
        } catch (IllegalArgumentException ignored) {
            // Not valid Base64, fall back to UTF-8 bytes
        }
        byte[] utf8 = secret != null ? secret.getBytes(StandardCharsets.UTF_8) : new byte[0];
        if (utf8.length >= 32) {
            return utf8;
        }
        // If still too short, derive a 256-bit key via SHA-256
        try {
            return MessageDigest.getInstance("SHA-256").digest(utf8);
        } catch (NoSuchAlgorithmException e) {
            // Should never happen on Java platforms; rethrow as runtime
            throw new IllegalStateException("SHA-256 not available for JWT key derivation", e);
        }
    }

    private Key key() {
        return Keys.hmacShaKeyFor(keyBytes());
    }

    public String extractUsername(String token) {
        return parseClaims(token).getBody().getSubject();
    }

    public String generateToken(String username, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        if (userId != null) claims.put("uid", userId);
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, String username) {
        try {
            Claims claims = parseClaims(token).getBody();
            String sub = claims.getSubject();
            Date exp = claims.getExpiration();
            return sub != null && sub.equals(username) && exp != null && exp.after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
    }
}
