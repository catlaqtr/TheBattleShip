package com.mete.battleship.controller;

import com.mete.battleship.dto.SignupRequest;
import com.mete.battleship.dto.UserView;
import com.mete.battleship.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/", "/api"})
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserView signup(@RequestBody SignupRequest body) {
        return userService.signup(body);
    }
}
