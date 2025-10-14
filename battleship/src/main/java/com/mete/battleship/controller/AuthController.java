package com.mete.battleship.controller;

import com.mete.battleship.dto.AuthResponse;
import com.mete.battleship.dto.LoginRequest;
import com.mete.battleship.dto.UserView;
import com.mete.battleship.entity.User;
import com.mete.battleship.repository.UserRepository;
import com.mete.battleship.security.CustomUserDetails;
import com.mete.battleship.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
            CustomUserDetails cud = (CustomUserDetails) auth.getPrincipal();
            String token = jwtService.generateToken(cud.getUsername(), cud.getId());
            User u = userRepository.findByUsername(cud.getUsername()).orElseThrow();
            UserView uv = new UserView(u.getId(), u.getUsername(), u.getEmail(), u.getCreatedAt());
            return ResponseEntity.ok(new AuthResponse(token, uv));
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }
}
