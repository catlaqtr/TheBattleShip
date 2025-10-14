package com.mete.battleship.repository;

import com.mete.battleship.entity.Shot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShotRepository extends JpaRepository<Shot, Long> {
    boolean existsByBoardIdAndRowAndCol(Long boardId, Integer row, Integer col);
    List<Shot> findByBoardId(Long boardId);
}

