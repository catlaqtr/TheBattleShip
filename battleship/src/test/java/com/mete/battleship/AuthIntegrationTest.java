package com.mete.battleship;

import com.mete.battleship.dto.AuthResponse;
import com.mete.battleship.dto.LoginRequest;
import com.mete.battleship.dto.SignupRequest;
import com.mete.battleship.dto.UserView;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void signup_then_login_returns_jwt() {
        SignupRequest req = new SignupRequest();
        req.setUsername("authuser");
        req.setEmail("authuser@example.com");
        req.setPassword("secret");
        ResponseEntity<UserView> signup = rest.postForEntity(url("/users"), req, UserView.class);
        assertEquals(HttpStatus.CREATED, signup.getStatusCode());
        assertNotNull(signup.getBody());

        LoginRequest login = new LoginRequest();
        login.setUsername("authuser");
        login.setPassword("secret");
        ResponseEntity<AuthResponse> loginResp = rest.postForEntity(url("/auth/login"), login, AuthResponse.class);
        assertEquals(HttpStatus.OK, loginResp.getStatusCode());
        assertNotNull(loginResp.getBody());
        assertNotNull(loginResp.getBody().getToken());
        assertEquals("Bearer", loginResp.getBody().getTokenType());
        assertNotNull(loginResp.getBody().getUser());
        assertEquals("authuser", loginResp.getBody().getUser().getUsername());
    }
}

