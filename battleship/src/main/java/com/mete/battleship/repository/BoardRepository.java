package com.mete.battleship.repository;

import com.mete.battleship.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board,Long> {
    long countByGameId(Long gameId);
    boolean existsByGameIdAndOwnerUserId(Long gameId, Long ownerUserId);
    Board findByGameIdAndOwnerUserId(Long gameId, Long ownerUserId);
    List<Board> findByGameId(Long gameId);
}
