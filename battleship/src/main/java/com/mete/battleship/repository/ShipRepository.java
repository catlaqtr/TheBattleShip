package com.mete.battleship.repository;

import com.mete.battleship.entity.Ship;
import com.mete.battleship.entity.ShipType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ShipRepository extends JpaRepository<Ship, Long> {
    long countByBoardId(Long boardId);
    boolean existsByBoardIdAndType(Long boardId, ShipType type);
    List<Ship> findByBoardId(Long boardId);
}
