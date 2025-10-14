package com.mete.battleship.dto;

import com.mete.battleship.entity.Orientation;
import com.mete.battleship.entity.ShipType;

public class PlaceShipRequest {
    private ShipType type;
    private Integer startRow;
    private Integer startCol;
    private Orientation orientation;

    public PlaceShipRequest() {
    }

    public ShipType getType() {
        return type;
    }

    public void setType(ShipType type) {
        this.type = type;
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
}
