package com.mete.battleship;

import com.mete.battleship.dto.*;
import com.mete.battleship.entity.Orientation;
import com.mete.battleship.entity.ShipType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class GameFlowIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void endToEnd_flow_signup_create_join_place_shoot() {
        // 1) Signup two players
        UserView p1 = signup("p1", "p1@example.com");
        UserView p2 = signup("p2", "p2@example.com");
        assertNotNull(p1.getId());
        assertNotNull(p2.getId());

        // 2) Create a game as player1
        HttpHeaders h1 = new HttpHeaders();
        h1.set("X-User-Id", p1.getId().toString());
        ResponseEntity<GameSummary> createdGameResp = rest.exchange(url("/games"), HttpMethod.POST, new HttpEntity<>(null, h1), GameSummary.class);
        assertEquals(HttpStatus.CREATED, createdGameResp.getStatusCode());
        GameSummary game = createdGameResp.getBody();
        assertNotNull(game);
        Long gameId = game.getGameId();
        assertNotNull(gameId);
        assertEquals(p1.getId(), game.getPlayer1Id());

        // 3) Join as player2
        HttpHeaders h2 = new HttpHeaders();
        h2.set("X-User-Id", p2.getId().toString());
        ResponseEntity<GameSummary> joinResp = rest.exchange(url("/games/" + gameId + "/join"), HttpMethod.POST, new HttpEntity<>(null, h2), GameSummary.class);
        assertEquals(HttpStatus.OK, joinResp.getStatusCode());
        assertNotNull(joinResp.getBody());

        // 4) Fetch boards for the game (two boards expected)
        ResponseEntity<BoardView[]> boardsResp = rest.getForEntity(url("/games/" + gameId + "/boards"), BoardView[].class);
        assertEquals(HttpStatus.OK, boardsResp.getStatusCode());
        BoardView[] boards = boardsResp.getBody();
        assertNotNull(boards);
        assertEquals(2, boards.length);

        // Make sure we know which board belongs to which user
        BoardView p1Board = boards[0].getOwnerUserId().equals(p1.getId()) ? boards[0] : boards[1];
        BoardView p2Board = boards[0].getOwnerUserId().equals(p2.getId()) ? boards[0] : boards[1];

        // 5) Place ships for player1 and player2 (non-overlapping, within bounds)
        List<PlaceShipRequest> p1Ships = buildStandardFleet(); // rows 0,2,4,6,8 horizontally
        List<PlaceShipRequest> p2Ships = buildStandardFleet(); // same layout for simplicity

        // P1 places
        HttpHeaders hPlaceP1 = new HttpHeaders();
        hPlaceP1.setContentType(MediaType.APPLICATION_JSON);
        hPlaceP1.set("X-User-Id", p1.getId().toString());
        ResponseEntity<GameSummary> place1 = rest.exchange(
                url("/boards/" + p1Board.getId() + "/ships"), HttpMethod.POST,
                new HttpEntity<>(p1Ships, hPlaceP1), GameSummary.class);
        assertEquals(HttpStatus.CREATED, place1.getStatusCode());

        // P2 places
        HttpHeaders hPlaceP2 = new HttpHeaders();
        hPlaceP2.setContentType(MediaType.APPLICATION_JSON);
        hPlaceP2.set("X-User-Id", p2.getId().toString());
        ResponseEntity<GameSummary> place2 = rest.exchange(
                url("/boards/" + p2Board.getId() + "/ships"), HttpMethod.POST,
                new HttpEntity<>(p2Ships, hPlaceP2), GameSummary.class);
        assertEquals(HttpStatus.CREATED, place2.getStatusCode());

        // 6) Game should now be IN_PROGRESS and current turn should be player1
        ResponseEntity<GameSummary> gameResp = rest.getForEntity(url("/games/" + gameId), GameSummary.class);
        assertEquals(HttpStatus.OK, gameResp.getStatusCode());
        GameSummary current = gameResp.getBody();
        assertNotNull(current);
        assertEquals("IN_PROGRESS", current.getStatus());
        assertEquals(p1.getId(), current.getCurrentTurnUserId());

        // 7) Player1 fires a shot at (0,0) -> should be a HIT based on our layout
        HttpHeaders hShot = new HttpHeaders();
        hShot.setContentType(MediaType.APPLICATION_JSON);
        hShot.set("X-User-Id", p1.getId().toString());
        ShootRequest shotReq = new ShootRequest();
        shotReq.setRow(0);
        shotReq.setCol(0);
        ResponseEntity<ShotResponse> shotResp = rest.exchange(
                url("/games/" + gameId + "/shots"), HttpMethod.POST,
                new HttpEntity<>(shotReq, hShot), ShotResponse.class);
        assertEquals(HttpStatus.OK, shotResp.getStatusCode());
        ShotResponse sr = shotResp.getBody();
        assertNotNull(sr);
        assertEquals("HIT", sr.getResult());
        assertNotNull(sr.getGame());
        assertEquals(p2.getId(), sr.getGame().getCurrentTurnUserId()); // turn flips to player2

        // 8) Shots listing for defender's board should include our shot
        ResponseEntity<ShotView[]> shotsList = rest.getForEntity(url("/boards/" + p2Board.getId() + "/shots"), ShotView[].class);
        assertEquals(HttpStatus.OK, shotsList.getStatusCode());
        ShotView[] shotViews = shotsList.getBody();
        assertNotNull(shotViews);
        assertTrue(shotViews.length >= 1);
    }

    private UserView signup(String username, String email) {
        SignupRequest req = new SignupRequest();
        req.setUsername(username);
        req.setEmail(email);
        req.setPassword("pass");
        ResponseEntity<UserView> resp = rest.postForEntity(url("/users"), req, UserView.class);
        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        return resp.getBody();
    }

    private List<PlaceShipRequest> buildStandardFleet() {
        // Place ships horizontally on rows 0,2,4,6,8 starting at col 0 for simplicity
        List<PlaceShipRequest> list = new ArrayList<>();
        List<ShipType> types = List.of(ShipType.CARRIER, ShipType.BATTLESHIP, ShipType.CRUISER, ShipType.SUBMARINE, ShipType.DESTROYER);
        List<Integer> rows = List.of(0, 2, 4, 6, 8);
        int startCol = 0;
        for (int i = 0; i < types.size(); i++) {
            ShipType t = types.get(i);
            PlaceShipRequest r = new PlaceShipRequest();
            r.setType(t);
            r.setOrientation(Orientation.HORIZONTAL);
            r.setStartRow(rows.get(i));
            r.setStartCol(startCol);
            list.add(r);
        }
        // Sort by type for deterministic order (not required, but tidy)
        list.sort(Comparator.comparing(pr -> pr.getType().name()));
        return list;
    }
}
