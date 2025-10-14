package com.mete.battleship.dto;

import java.time.LocalDateTime;

public class BoardView {
    private Long id;
    private Long gameId;
    private Long ownerUserId;
    private Integer size;
    private LocalDateTime createdAt;

    public BoardView() {}

    public BoardView(Long id, Long gameId, Long ownerUserId, Integer size, LocalDateTime createdAt) {
        this.id = id;
        this.gameId = gameId;
        this.ownerUserId = ownerUserId;
        this.size = size;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }
    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

