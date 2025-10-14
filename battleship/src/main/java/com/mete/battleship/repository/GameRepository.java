package com.mete.battleship.repository;

import com.mete.battleship.entity.Game;
import com.mete.battleship.entity.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameRepository extends JpaRepository<Game,Long> {
    List<Game> findAllByOrderByCreatedAtDesc();
    List<Game> findByStatusOrderByCreatedAtDesc(GameStatus status);
    List<Game> findByStatusAndPlayer2IdIsNullOrderByCreatedAtDesc(GameStatus status);
}
