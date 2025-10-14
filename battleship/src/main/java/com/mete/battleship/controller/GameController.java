package com.mete.battleship.controller;

import com.mete.battleship.dto.PlaceShipRequest;
import com.mete.battleship.entity.Game;
import com.mete.battleship.dto.GameSummary;
import com.mete.battleship.dto.ShootRequest;
import com.mete.battleship.dto.ShotResponse;
import com.mete.battleship.dto.BoardView;
import com.mete.battleship.dto.ShotView;
import com.mete.battleship.dto.ShipView;
import com.mete.battleship.entity.Board;
import com.mete.battleship.entity.Shot;
import com.mete.battleship.entity.Ship;
import com.mete.battleship.security.SecurityUtils;
import com.mete.battleship.service.GameService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping({"/", "/api"})
public class GameController {
    private static final Logger log = LoggerFactory.getLogger(GameController.class);
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    private Long resolveUserId(Long headerUserId) {
        if (headerUserId != null) return headerUserId;
        Optional<Long> authId = SecurityUtils.currentUserId();
        return authId.orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Missing user context: provide X-User-Id header or authenticate"));
    }

    @PostMapping("/games")
    @ResponseStatus(HttpStatus.CREATED)
    public GameSummary createGame(@RequestHeader(value = "X-User-Id", required = false) Long creatorUserId) {
        Long uid = resolveUserId(creatorUserId);
        log.info("Create game requested by userId={}", uid);
        Game game = gameService.createGame(uid);
        if (game == null) {
            throw new RuntimeException("Game could not be created");
        }
        log.info("Game created: id={} by userId={}", game.getId(), uid);
        return GameSummary.fromGame(game);

    }

    @GetMapping("/games")
    @ResponseStatus(HttpStatus.OK)
    public List<GameSummary> listGames() {
        log.info("Listing all games");
        return gameService.listAllGames();
    }

    @GetMapping("/games/open")
    @ResponseStatus(HttpStatus.OK)
    public List<GameSummary> listOpenGames() {
        log.info("Listing open games");
        return gameService.listOpenGames();
    }

    @PostMapping("/games/{gameId}/join")
    @ResponseStatus(HttpStatus.OK)
    public GameSummary joinGame(@PathVariable Long gameId, @RequestHeader(value = "X-User-Id", required = false) Long joinerUserId) {
        Long uid = resolveUserId(joinerUserId);
        log.info("Join game requested: gameId={}, userId={}", gameId, uid);
        Game game = gameService.joinGame(gameId, uid);
        log.info("User {} joined game {}", uid, gameId);
        return GameSummary.fromGame(game);
    }

    @GetMapping("/games/{gameId}")
    @ResponseStatus(HttpStatus.OK)
    public GameSummary getGame(@PathVariable Long gameId) {
        log.info("Fetching game summary: gameId={}", gameId);
        return gameService.getGameSummary(gameId);
    }

    @GetMapping("/games/{gameId}/boards")
    @ResponseStatus(HttpStatus.OK)
    public List<BoardView> listBoards(@PathVariable Long gameId) {
        log.info("Listing boards for gameId={}", gameId);
        List<Board> boards = gameService.listBoards(gameId);
        return boards.stream()
                .map(b -> new BoardView(b.getId(), b.getGameId(), b.getOwnerUserId(), b.getSize(), b.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @GetMapping("/boards/{boardId}/shots")
    @ResponseStatus(HttpStatus.OK)
    public List<ShotView> listShots(@PathVariable Long boardId) {
        log.info("Listing shots for boardId={}", boardId);
        List<Shot> shots = gameService.listShots(boardId);
        return shots.stream()
                .map(s -> new ShotView(
                        s.getId(), s.getBoardId(), s.getShooterUserId(), s.getTargetUserId(),
                        s.getRow(), s.getCol(),
                        s.getResult() != null ? s.getResult().name() : null,
                        s.getSunkShipType() != null ? s.getSunkShipType().name() : null
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/boards/{boardId}/ships")
    @ResponseStatus(HttpStatus.OK)
    public List<ShipView> listShips(
            @PathVariable Long boardId,
            @RequestHeader(value = "X-User-Id", required = false) Long requesterUserId
    ) {
        Long uid = resolveUserId(requesterUserId);
        log.info("Listing ships: boardId={}, requesterUserId={}", boardId, uid);
        List<Ship> ships = gameService.listShips(boardId, uid);
        return ships.stream()
                .map(s -> new ShipView(
                        s.getId(), s.getBoardId(), s.getType(), s.getLength(), s.getStartRow(), s.getStartCol(), s.getOrientation(), s.getSunk()
                ))
                .collect(Collectors.toList());
    }

    @PostMapping("/boards/{boardId}/ships")
    @ResponseStatus(HttpStatus.CREATED)
    public GameSummary placeShips(
            @PathVariable Long boardId,
            @RequestHeader(value = "X-User-Id", required = false) Long ownerUserId,
            @RequestBody java.util.List<PlaceShipRequest> body
    ) {
        Long uid = resolveUserId(ownerUserId);
        log.info("Place ships: boardId={}, ownerUserId={}, ships={}", boardId, uid, body != null ? body.size() : 0);
        return gameService.placeShips(boardId, uid, body);
    }

    @PostMapping("/games/{gameId}/boards/{boardId}/ships")
    @ResponseStatus(HttpStatus.CREATED)
    public GameSummary placeShipsByGame(
            @PathVariable Long gameId,
            @PathVariable Long boardId,
            @RequestHeader(value = "X-User-Id", required = false) Long ownerUserId,
            @RequestBody java.util.List<PlaceShipRequest> body
    ) {
        Long uid = resolveUserId(ownerUserId);
        log.info("Place ships by game: gameId={}, boardId={}, ownerUserId={}, ships={}", gameId, boardId, uid, body != null ? body.size() : 0);
        return gameService.placeShips(boardId, uid, body);
    }

    @PostMapping("/games/{gameId}/shots")
    @ResponseStatus(HttpStatus.OK)
    public ShotResponse fireShot(
            @PathVariable Long gameId,
            @RequestHeader(value = "X-User-Id", required = false) Long shooterUserId,
            @RequestBody ShootRequest body
    ) {
        Long uid = resolveUserId(shooterUserId);
        log.info("Fire shot: gameId={}, shooterUserId={}, row={}, col={}", gameId, uid, body != null ? body.getRow() : null, body != null ? body.getCol() : null);
        return gameService.fireShot(gameId, uid, body);
    }

}
