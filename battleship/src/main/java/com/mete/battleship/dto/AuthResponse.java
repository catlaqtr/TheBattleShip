package com.mete.battleship.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UserView user;

    public AuthResponse() {}
    public AuthResponse(String token, UserView user) {
        this.token = token;
        this.user = user;
    }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public UserView getUser() { return user; }
    public void setUser(UserView user) { this.user = user; }
}

