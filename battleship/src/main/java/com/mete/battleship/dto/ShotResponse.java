package com.mete.battleship.dto;

public class ShotResponse {
    private String result; // HIT, MISS, SUNK
    private String sunkShipType; // nullable
    private GameSummary game;

    public ShotResponse() {}

    public ShotResponse(String result, String sunkShipType, GameSummary game) {
        this.result = result;
        this.sunkShipType = sunkShipType;
        this.game = game;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getSunkShipType() {
        return sunkShipType;
    }

    public void setSunkShipType(String sunkShipType) {
        this.sunkShipType = sunkShipType;
    }

    public GameSummary getGame() {
        return game;
    }

    public void setGame(GameSummary game) {
        this.game = game;
    }
}

