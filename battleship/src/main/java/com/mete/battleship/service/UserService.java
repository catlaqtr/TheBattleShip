package com.mete.battleship.service;

import com.mete.battleship.dto.SignupRequest;
import com.mete.battleship.dto.UserView;
import com.mete.battleship.entity.User;
import com.mete.battleship.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserView signup(SignupRequest req) {
        if (req == null) throw new RuntimeException("Request is required");
        if (req.getUsername() == null || req.getUsername().isBlank()) throw new RuntimeException("username is required");
        if (req.getEmail() == null || req.getEmail().isBlank()) throw new RuntimeException("email is required");
        if (req.getPassword() == null || req.getPassword().isBlank()) throw new RuntimeException("password is required");
        if (userRepository.existsByUsername(req.getUsername())) throw new RuntimeException("username already taken");
        if (userRepository.existsByEmail(req.getEmail())) throw new RuntimeException("email already in use");
        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        User saved = userRepository.save(u);
        return new UserView(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getCreatedAt());
    }
}
