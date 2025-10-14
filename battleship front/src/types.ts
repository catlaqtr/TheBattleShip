export type GameSummary = {
  gameId: number;
  player1Id: number;
  player2Id: number | null;
  status: "LOBBY" | "PLACING" | "IN_PROGRESS" | "FINISHED";
  currentTurnUserId: number | null;
  winnerUserId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BoardView = {
  id: number;
  gameId: number;
  ownerUserId: number;
  size: number;
  createdAt: string;
};

export type ShipView = {
  id: number;
  boardId: number;
  type: "CARRIER" | "BATTLESHIP" | "CRUISER" | "SUBMARINE" | "DESTROYER";
  length: number;
  startRow: number;
  startCol: number;
  orientation: "HORIZONTAL" | "VERTICAL";
  sunk: boolean;
};

export type ShotView = {
  id: number;
  boardId: number;
  shooterUserId: number;
  targetUserId: number;
  row: number;
  col: number;
  result: "HIT" | "MISS" | "SUNK";
  sunkShipType?: ShipView["type"] | null;
};
