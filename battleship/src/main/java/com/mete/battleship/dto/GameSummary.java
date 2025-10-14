package com.mete.battleship.dto;

import com.mete.battleship.entity.Game;

import java.time.LocalDateTime;

public class GameSummary {
    private Long gameId;
    private Long player1Id;
    private Long player2Id;
    private String status;
    private Long currentTurnUserId;
    private Long winnerUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public GameSummary(String status, Long gameId, Long player1Id, Long player2Id, Long currentTurnUserId, Long winnerUserId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.status = status;
        this.gameId = gameId;
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.currentTurnUserId = currentTurnUserId;
        this.winnerUserId = winnerUserId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public GameSummary() {
    }

    public static GameSummary fromGame(Game game) {
        return new GameSummary(
                game.getStatus().name(),
                game.getId(),
                game.getPlayer1Id(),
                game.getPlayer2Id(),
                game.getCurrentTurnUserId(),
                game.getWinnerUserId(),
                game.getCreatedAt(),
                game.getUpdatedAt()
        );
    }

    public Long getWinnerUserId() {
        return winnerUserId;
    }

    public void setWinnerUserId(Long winnerUserId) {
        this.winnerUserId = winnerUserId;
    }

    public Long getGameId() {
        return gameId;
    }

    public void setGameId(Long gameId) {
        this.gameId = gameId;
    }

    public Long getPlayer1Id() {
        return player1Id;
    }

    public void setPlayer1Id(Long player1) {
        this.player1Id = player1;
    }

    public Long getPlayer2Id() {
        return player2Id;
    }

    public void setPlayer2Id(Long player2) {
        this.player2Id = player2;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCurrentTurnUserId() {
        return currentTurnUserId;
    }

    public void setCurrentTurnUserId(Long currentTurnUserId) {
        this.currentTurnUserId = currentTurnUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
