package com.mete.battleship.dto;

public class ShotView {
    private Long id;
    private Long boardId;
    private Long shooterUserId;
    private Long targetUserId;
    private Integer row;
    private Integer col;
    private String result;
    private String sunkShipType; // nullable

    public ShotView() {}

    public ShotView(Long id, Long boardId, Long shooterUserId, Long targetUserId, Integer row, Integer col, String result, String sunkShipType) {
        this.id = id;
        this.boardId = boardId;
        this.shooterUserId = shooterUserId;
        this.targetUserId = targetUserId;
        this.row = row;
        this.col = col;
        this.result = result;
        this.sunkShipType = sunkShipType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBoardId() { return boardId; }
    public void setBoardId(Long boardId) { this.boardId = boardId; }
    public Long getShooterUserId() { return shooterUserId; }
    public void setShooterUserId(Long shooterUserId) { this.shooterUserId = shooterUserId; }
    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }
    public Integer getRow() { return row; }
    public void setRow(Integer row) { this.row = row; }
    public Integer getCol() { return col; }
    public void setCol(Integer col) { this.col = col; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public String getSunkShipType() { return sunkShipType; }
    public void setSunkShipType(String sunkShipType) { this.sunkShipType = sunkShipType; }
}
