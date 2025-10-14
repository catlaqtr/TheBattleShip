package com.mete.battleship.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ships")
public class Ship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_id",nullable = false)
    private Long boardId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ShipType type;

    @Column(nullable = false)
    private Integer length;

    @Column(name = "start_row",nullable = false)
    private Integer startRow;

    @Column(name = "start_col",nullable = false)
    private Integer startCol;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Orientation orientation;

    @Column(nullable = false)
    private Boolean sunk = false;

    public Ship() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBoardId() {
        return boardId;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }

    public ShipType getType() {
        return type;
    }

    public void setType(ShipType type) {
        this.type = type;
    }

    public Integer getLength() {
        return length;
    }

    public void setLength(Integer length) {
        this.length = length;
    }

    public Integer getStartRow() {
        return startRow;
    }

    public void setStartRow(Integer startRow) {
        this.startRow = startRow;
    }

    public Integer getStartCol() {
        return startCol;
    }

    public void setStartCol(Integer startCol) {
        this.startCol = startCol;
    }

    public Orientation getOrientation() {
        return orientation;
    }

    public void setOrientation(Orientation orientation) {
        this.orientation = orientation;
    }

    public Boolean getSunk() {
        return sunk;
    }

    public void setSunk(Boolean sunk) {
        this.sunk = sunk;
    }
}
