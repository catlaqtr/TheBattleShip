package com.mete.battleship.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shots")
public class Shot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_id", nullable = false)
    private Long boardId;

    @Column(name = "shooter_user_id", nullable = false)
    private Long shooterUserId;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Column(name = "row", nullable = false)
    private Integer row;

    @Column(name = "col", nullable = false)
    private Integer col;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false)
    private ShotResult result;

    @Enumerated(EnumType.STRING)
    @Column(name = "sunk_ship_type")
    private ShipType sunkShipType;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Shot() {}

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
    public ShotResult getResult() { return result; }
    public void setResult(ShotResult result) { this.result = result; }
    public ShipType getSunkShipType() { return sunkShipType; }
    public void setSunkShipType(ShipType sunkShipType) { this.sunkShipType = sunkShipType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
