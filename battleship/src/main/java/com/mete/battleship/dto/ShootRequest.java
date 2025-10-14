package com.mete.battleship.dto;

public class ShootRequest {
    private Integer row;
    private Integer col;

    public ShootRequest() {}

    public Integer getRow() {
        return row;
    }

    public void setRow(Integer row) {
        this.row = row;
    }

    public Integer getCol() {
        return col;
    }

    public void setCol(Integer col) {
        this.col = col;
    }
}

