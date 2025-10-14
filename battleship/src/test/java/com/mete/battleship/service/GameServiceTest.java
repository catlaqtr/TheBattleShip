package com.mete.battleship.service;

import com.mete.battleship.dto.ShootRequest;
import com.mete.battleship.entity.*;
import com.mete.battleship.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock GameRepository gameRepository;
    @Mock UserRepository userRepository;
    @Mock BoardRepository boardRepository;
    @Mock ShipRepository shipRepository;
    @Mock ShotRepository shotRepository;

    @InjectMocks GameService gameService;

    @Test
    void createGame_userExists_savesGame() {
        // Arrange
        when(userRepository.existsById(1L)).thenReturn(true);
        when(gameRepository.save(any(Game.class))).thenAnswer(inv -> {
            Game g = inv.getArgument(0);
            g.setId(42L);
            return g;
        });
        // Act
        Game saved = gameService.createGame(1L);
        // Assert
        assertNotNull(saved);
        assertEquals(42L, saved.getId());
        assertEquals(GameStatus.LOBBY, saved.getStatus());
        verify(gameRepository, times(1)).save(any(Game.class));
    }

    @Test
    void createGame_userMissing_throws() {
        when(userRepository.existsById(2L)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> gameService.createGame(2L));
        verify(gameRepository, never()).save(any());
    }

    @Test
    void fireShot_whenGameNotInProgress_throws() {
        Game game = new Game();
        game.setId(1L);
        game.setStatus(GameStatus.LOBBY);
        when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
        ShootRequest req = new ShootRequest();
        req.setRow(0);
        req.setCol(0);
        assertThrows(RuntimeException.class, () -> gameService.fireShot(1L, 10L, req));
    }

    @Test
    void fireShot_hit_flipsTurn() {
        // Arrange game state
        Game game = new Game();
        game.setId(99L);
        game.setStatus(GameStatus.IN_PROGRESS);
        game.setPlayer1Id(10L);
        game.setPlayer2Id(20L);
        game.setCurrentTurnUserId(10L); // shooter is player1
        when(gameRepository.findById(99L)).thenReturn(Optional.of(game));

        // Target board belongs to player2
        Board targetBoard = new Board();
        targetBoard.setId(100L);
        targetBoard.setGameId(99L);
        targetBoard.setOwnerUserId(20L);
        targetBoard.setSize(10);
        when(boardRepository.findByGameIdAndOwnerUserId(99L, 20L)).thenReturn(targetBoard);

        // No shots yet in target cell or other ship cells
        when(shotRepository.existsByBoardIdAndRowAndCol(eq(100L), anyInt(), anyInt())).thenReturn(false);

        // Defender has one ship occupying (0,0) and (0,1)
        Ship ship = new Ship();
        ship.setBoardId(100L);
        ship.setType(ShipType.DESTROYER); // length 2
        ship.setLength(2);
        ship.setStartRow(0);
        ship.setStartCol(0);
        ship.setOrientation(Orientation.HORIZONTAL);
        ship.setSunk(false);
        when(shipRepository.findByBoardId(100L)).thenReturn(List.of(ship));

        // Shoot at (0,0)
        ShootRequest req = new ShootRequest();
        req.setRow(0);
        req.setCol(0);

        // Act
        var resp = gameService.fireShot(99L, 10L, req);

        // Assert response
        assertNotNull(resp);
        assertEquals("HIT", resp.getResult());
        assertNull(resp.getSunkShipType());

        // Turn should flip to player2
        assertEquals(20L, game.getCurrentTurnUserId());
        verify(shotRepository, times(1)).save(any(Shot.class));
        verify(gameRepository, atLeastOnce()).save(any(Game.class));
    }
}

