package com.mete.battleship.service;

import com.mete.battleship.dto.GameSummary;
import com.mete.battleship.dto.PlaceShipRequest;
import com.mete.battleship.dto.ShootRequest;
import com.mete.battleship.dto.ShotResponse;
import com.mete.battleship.entity.*;
import com.mete.battleship.repository.BoardRepository;
import com.mete.battleship.repository.GameRepository;
import com.mete.battleship.repository.ShipRepository;
import com.mete.battleship.repository.UserRepository;
import com.mete.battleship.repository.ShotRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GameService {
    private static final Logger log = LoggerFactory.getLogger(GameService.class);
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final ShipRepository shipRepository;
    private final ShotRepository shotRepository;

    public GameService(GameRepository gameRepository, UserRepository userRepository, BoardRepository boardRepository, ShipRepository shipRepository, ShotRepository shotRepository) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.boardRepository = boardRepository;
        this.shipRepository = shipRepository;
        this.shotRepository = shotRepository;
    }

    public Game createGame(Long creatorUserId) {
        if (!userRepository.existsById(creatorUserId)) {
            log.warn("Create game failed: user {} not found", creatorUserId);
            throw new RuntimeException("User not found");
        }
        var game = new Game();
        game.setStatus(GameStatus.LOBBY);
        game.setPlayer1Id(creatorUserId);
        game.setPlayer2Id(null);
        game.setCurrentTurnUserId(null);
        game.setWinnerUserId(null);
        Game saved = gameRepository.save(game);
        log.info("Game created id={} by userId={}", saved.getId(), creatorUserId);
        return saved;
    }

    @Transactional
    public Game joinGame(Long gameId, Long joinerUserId) {
        log.info("User {} joining game {}", joinerUserId, gameId);
        var game = gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found"));
        userRepository.findById(joinerUserId).orElseThrow(() -> new RuntimeException("User not found"));
        var status = game.getStatus();
        if (status != GameStatus.LOBBY) {
            log.warn("Join rejected: game {} not in LOBBY (status={})", gameId, status);
            throw new RuntimeException("Game is not in LOBBY status");
        }
        var player1Id = game.getPlayer1Id();
        if (player1Id.equals(joinerUserId)) {
            log.warn("Join rejected: user {} is player1 for game {}", joinerUserId, gameId);
            throw new RuntimeException("You cannot join your own game");
        }
        var player2Id = game.getPlayer2Id();
        if (player2Id != null) {
            log.warn("Join rejected: game {} already has two players", gameId);
            throw new RuntimeException("Game already has two players");
        }
        game.setPlayer2Id(joinerUserId);
        game.setStatus(GameStatus.PLACING);
        long count = boardRepository.countByGameId(gameId);
        if (count == 0) {
            Board board = new Board();
            Board board2 = new Board();
            board.setGameId(gameId);
            board.setOwnerUserId(player1Id);
            board.setSize(10);
            board2.setGameId(gameId);
            board2.setOwnerUserId(joinerUserId);
            board2.setSize(10);
            boardRepository.save(board2);
            boardRepository.save(board);
            log.debug("Created two boards for game {}", gameId);

        } else if (count == 1) {
            if (boardRepository.existsByGameIdAndOwnerUserId(gameId, player1Id)) {
                Board board2 = new Board();
                board2.setGameId(gameId);
                board2.setOwnerUserId(joinerUserId);
                board2.setSize(10);
                boardRepository.save(board2);
                log.debug("Created second board for joiner {} in game {}", joinerUserId, gameId);
            } else {
                Board board = new Board();
                board.setGameId(gameId);
                board.setOwnerUserId(player1Id);
                board.setSize(10);
                boardRepository.save(board);
                log.debug("Created missing board for player1 {} in game {}", player1Id, gameId);
            }
        }

        Game saved = gameRepository.save(game);
        log.info("User {} joined game {} -> status {}", joinerUserId, gameId, saved.getStatus());
        return saved;


    }

    @Transactional
    public GameSummary placeShips(Long boardId, Long ownerUserId, List<PlaceShipRequest> ships) {
        log.info("Placing ships: boardId={}, ownerUserId={}, count={} ", boardId, ownerUserId, ships != null ? ships.size() : 0);
        var board = boardRepository.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        if (!board.getOwnerUserId().equals(ownerUserId)) {
            log.warn("Place ships forbidden: user {} is not owner of board {}", ownerUserId, boardId);
            throw new RuntimeException("You are not the owner of this board");
        }
        var game = gameRepository.findById(board.getGameId()).orElseThrow(() -> new RuntimeException("Game not found"));
        if (game.getStatus() != GameStatus.PLACING) {
            log.warn("Place ships rejected: game {} status {} != PLACING", game.getId(), game.getStatus());
            throw new RuntimeException("Game is not in PLACING status");
        }
        long existing = shipRepository.countByBoardId(boardId);

        if(existing > 0) {
            log.warn("Place ships rejected: board {} already has ships", boardId);
            throw new RuntimeException("Ships have already been placed on this board");
        }
        if (ships == null || ships.size() != 5) {
            log.warn("Place ships rejected: expected 5 ships, got {}", ships == null ? null : ships.size());
            throw new RuntimeException("You must place exactly 5 ships");
        }

        int size = board.getSize() != null ? board.getSize() : 10;
        boolean[][] occupied = new boolean[size][size];
        Set<ShipType> seenTypes = new HashSet<>();
        for (var r : ships) {
            if (r.getType() == null || r.getOrientation() == null || r.getStartRow() == null || r.getStartCol() == null) {
                throw new RuntimeException("Ship placement fields cannot be null");
            }
            if (!seenTypes.add(r.getType())) {
                throw new RuntimeException("Duplicate ship type: " + r.getType());
            }
            int length = r.getType().getLength();
            int row = r.getStartRow();
            int col = r.getStartCol();
            if (row < 0 || row >= size || col < 0 || col >= size) {
                throw new RuntimeException("Ship start position out of bounds");
            }
            if (r.getOrientation() == com.mete.battleship.entity.Orientation.HORIZONTAL) {
                if (col + length - 1 >= size) {
                    throw new RuntimeException("Ship extends beyond board horizontally: " + r.getType());
                }
                for (int c = col; c < col + length; c++) {
                    if (occupied[row][c]) {
                        throw new RuntimeException("Ships overlap at (" + row + "," + c + ")");
                    }
                }
                for (int c = col; c < col + length; c++) {
                    occupied[row][c] = true;
                }
            } else { // VERTICAL
                if (row + length - 1 >= size) {
                    throw new RuntimeException("Ship extends beyond board vertically: " + r.getType());
                }
                for (int r2 = row; r2 < row + length; r2++) {
                    if (occupied[r2][col]) {
                        throw new RuntimeException("Ships overlap at (" + r2 + "," + col + ")");
                    }
                }
                for (int r2 = row; r2 < row + length; r2++) {
                    occupied[r2][col] = true;
                }
            }
        }
        if (!seenTypes.equals(EnumSet.allOf(ShipType.class))) {
            throw new RuntimeException("You must place one of each ship type: " + EnumSet.allOf(ShipType.class));
        }

        var toSave = new ArrayList<Ship>(5);
        for (var r : ships) {
            var ship = new Ship();
            ship.setBoardId(boardId);
            ship.setType(r.getType());
            ship.setLength(r.getType().getLength());
            ship.setStartRow(r.getStartRow());
            ship.setStartCol(r.getStartCol());
            ship.setOrientation(r.getOrientation());
            ship.setSunk(false);
            toSave.add(ship);
        }
        shipRepository.saveAll(toSave);

        Long p1 = game.getPlayer1Id();
        Long p2 = game.getPlayer2Id();
        Long otherUserId = ownerUserId.equals(p1) ? p2 : p1;
        if (otherUserId != null) {
            Board otherBoard = boardRepository.findByGameIdAndOwnerUserId(game.getId(), otherUserId);
            if (otherBoard != null) {
                long otherCount = shipRepository.countByBoardId(otherBoard.getId());
                if (otherCount >= 5) {
                    game.setStatus(GameStatus.IN_PROGRESS);
                    game.setCurrentTurnUserId(p1);
                    gameRepository.save(game);
                    log.info("Game {} moved to IN_PROGRESS. First turn userId={}", game.getId(), p1);
                }
            }
        }

        return GameSummary.fromGame(game);
    }

    public List<Board> listBoards(Long gameId) {
        log.debug("List boards for game {}", gameId);
        return boardRepository.findByGameId(gameId);
    }

    public GameSummary getGameSummary(Long gameId) {
        log.debug("Get game summary for {}", gameId);
        Game game = gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found"));
        return GameSummary.fromGame(game);
    }

    public List<Shot> listShots(Long boardId) {
        log.debug("List shots for board {}", boardId);
        return shotRepository.findByBoardId(boardId);
    }


    public List<Ship> listShips(Long boardId, Long requesterUserId) {
        Board board = boardRepository.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        if (!Objects.equals(board.getOwnerUserId(), requesterUserId)) {
            log.warn("List ships forbidden: requester {} is not owner of board {}", requesterUserId, boardId);
            throw new AccessDeniedException("You can only view your own ships");
        }
        return shipRepository.findByBoardId(boardId);
    }


    public List<GameSummary> listAllGames() {
        return gameRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(GameSummary::fromGame).collect(Collectors.toList());
    }


    public List<GameSummary> listOpenGames() {
        return gameRepository.findByStatusAndPlayer2IdIsNullOrderByCreatedAtDesc(GameStatus.LOBBY)
                .stream().map(GameSummary::fromGame).collect(Collectors.toList());
    }

    @Transactional
    public ShotResponse fireShot(Long gameId, Long shooterUserId, ShootRequest req) {
        if (req == null || req.getRow() == null || req.getCol() == null) {
            log.warn("Fire shot rejected: missing row/col for game {} by user {}", gameId, shooterUserId);
            throw new RuntimeException("row and col are required");
        }
        Game game = gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found"));
        if (game.getStatus() != GameStatus.IN_PROGRESS) {
            log.warn("Fire shot rejected: game {} not IN_PROGRESS (status={})", gameId, game.getStatus());
            throw new RuntimeException("Game is not in progress");
        }
        Long p1 = game.getPlayer1Id();
        Long p2 = game.getPlayer2Id();
        if (!Objects.equals(shooterUserId, p1) && !Objects.equals(shooterUserId, p2)) {
            log.warn("Fire shot rejected: user {} not in game {}", shooterUserId, gameId);
            throw new RuntimeException("You are not a player in this game");
        }
        if (!Objects.equals(game.getCurrentTurnUserId(), shooterUserId)) {
            log.warn("Fire shot rejected: not user {}'s turn in game {}", shooterUserId, gameId);
            throw new RuntimeException("It's not your turn");
        }
        Long targetUserId = Objects.equals(shooterUserId, p1) ? p2 : p1;
        Board targetBoard = boardRepository.findByGameIdAndOwnerUserId(gameId, targetUserId);
        if (targetBoard == null) {
            log.warn("Fire shot rejected: target board not found (game={}, targetUserId={})", gameId, targetUserId);
            throw new RuntimeException("Target board not found");
        }
        int size = targetBoard.getSize() != null ? targetBoard.getSize() : 10;
        int row = req.getRow();
        int col = req.getCol();
        if (row < 0 || row >= size || col < 0 || col >= size) {
            log.warn("Fire shot rejected: out of bounds (row={}, col={}, size={})", row, col, size);
            throw new RuntimeException("Shot out of bounds");
        }
        if (shotRepository.existsByBoardIdAndRowAndCol(targetBoard.getId(), row, col)) {
            log.warn("Fire shot rejected: already shot cell (row={}, col={})", row, col);
            throw new RuntimeException("This cell has already been shot");
        }


        List<Ship> defenderShips = shipRepository.findByBoardId(targetBoard.getId());
        Ship hitShip = null;
        for (Ship s : defenderShips) {
            if (occupiesCell(s, row, col)) {
                hitShip = s;
                break;
            }
        }

        Shot shot = new Shot();
        shot.setBoardId(targetBoard.getId());
        shot.setShooterUserId(shooterUserId);
        shot.setTargetUserId(targetUserId);
        shot.setRow(row);
        shot.setCol(col);

        ShotResult result;
        ShipType sunkType = null;
        if (hitShip == null) {
            result = ShotResult.MISS;
        } else {

            int length = hitShip.getLength();
            int hitCellsBefore = countHitCellsForShip(targetBoard.getId(), hitShip, row, col);
            boolean willBeSunk = (hitCellsBefore + 1) >= length;
            if (willBeSunk) {
                result = ShotResult.SUNK;
                sunkType = hitShip.getType();
            } else {
                result = ShotResult.HIT;
            }
        }
        shot.setResult(result);
        shot.setSunkShipType(sunkType);
        shotRepository.save(shot);

        if (result == ShotResult.SUNK) {
            hitShip.setSunk(true);
            shipRepository.save(hitShip);
        }


        boolean allSunk = false;
        if (result != ShotResult.MISS) {
            allSunk = shipRepository.findByBoardId(targetBoard.getId()).stream().allMatch(Ship::getSunk);
        }
        if (allSunk) {
            game.setStatus(GameStatus.FINISHED);
            game.setWinnerUserId(shooterUserId);
            game.setCurrentTurnUserId(null);
            gameRepository.save(game);
            log.info("Game {} finished. Winner userId={}", gameId, shooterUserId);
        } else {

            game.setCurrentTurnUserId(targetUserId);
            gameRepository.save(game);
            log.info("Shot result: {} at ({},{}). Next turn userId={}", result, row, col, targetUserId);
        }

        return new ShotResponse(result.name(), sunkType != null ? sunkType.name() : null, GameSummary.fromGame(game));
    }

    private boolean occupiesCell(Ship s, int row, int col) {
        int r0 = s.getStartRow();
        int c0 = s.getStartCol();
        int len = s.getLength();
        if (s.getOrientation() == Orientation.HORIZONTAL) {
            return row == r0 && col >= c0 && col < c0 + len;
        } else {
            return col == c0 && row >= r0 && row < r0 + len;
        }
    }

    private int countHitCellsForShip(Long boardId, Ship ship, int currentRow, int currentCol) {
        int count = 0;
        int r0 = ship.getStartRow();
        int c0 = ship.getStartCol();
        int len = ship.getLength();
        if (ship.getOrientation() == Orientation.HORIZONTAL) {
            for (int c = c0; c < c0 + len; c++) {
                if (c == currentCol && currentRow == r0) continue;
                if (shotRepository.existsByBoardIdAndRowAndCol(boardId, r0, c)) {
                    count++;
                }
            }
        } else {
            for (int r = r0; r < r0 + len; r++) {
                if (r == currentRow && currentCol == c0) continue;
                if (shotRepository.existsByBoardIdAndRowAndCol(boardId, r, c0)) {
                    count++;
                }
            }
        }
        return count;
    }
}
