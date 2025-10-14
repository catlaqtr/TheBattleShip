package com.mete.battleship.dto;

import com.mete.battleship.entity.Orientation;
import com.mete.battleship.entity.ShipType;

public class ShipView {
    private Long id;
    private Long boardId;
    private ShipType type;
    private Integer length;
    private Integer startRow;
    private Integer startCol;
    private Orientation orientation;
    private Boolean sunk;

    public ShipView() {}

    public ShipView(Long id, Long boardId, ShipType type, Integer length, Integer startRow, Integer startCol, Orientation orientation, Boolean sunk) {
        this.id = id;
        this.boardId = boardId;
        this.type = type;
        this.length = length;
        this.startRow = startRow;
        this.startCol = startCol;
        this.orientation = orientation;
        this.sunk = sunk;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBoardId() { return boardId; }
    public void setBoardId(Long boardId) { this.boardId = boardId; }
    public ShipType getType() { return type; }
    public void setType(ShipType type) { this.type = type; }
    public Integer getLength() { return length; }
    public void setLength(Integer length) { this.length = length; }
    public Integer getStartRow() { return startRow; }
    public void setStartRow(Integer startRow) { this.startRow = startRow; }
    public Integer getStartCol() { return startCol; }
    public void setStartCol(Integer startCol) { this.startCol = startCol; }
    public Orientation getOrientation() { return orientation; }
    public void setOrientation(Orientation orientation) { this.orientation = orientation; }
    public Boolean getSunk() { return sunk; }
    public void setSunk(Boolean sunk) { this.sunk = sunk; }
}

