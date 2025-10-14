import { api } from './api';
import type { GameSummary, BoardView, ShipView, ShotView } from '../types';

export const gameApi = {
  listGames: async () => (await api.get('/games')) as GameSummary[],
  createGame: async () => (await api.post('/games')) as GameSummary,
  joinGame: async (id: number) => (await api.post(`/games/${id}/join`)) as GameSummary,
  getGame: async (id: number) => (await api.get(`/games/${id}`)) as GameSummary,

  getBoards: async (gameId: number) => (await api.get(`/games/${gameId}/boards`)) as BoardView[],
  getShips: async (boardId: number) => (await api.get(`/boards/${boardId}/ships`)) as ShipView[],
  placeShips: async (
    gameId: number,
    boardId: number,
    body: Array<{
      type: ShipView['type'];
      startRow: number;
      startCol: number;
      orientation: 'HORIZONTAL' | 'VERTICAL';
    }>
  ) => {
    return (await api.post(`/games/${gameId}/boards/${boardId}/ships`, body)) as GameSummary;
  },

  getShots: async (_gameId: number, boardId: number) =>
    (await api.get(`/boards/${boardId}/shots`)) as ShotView[],
  shoot: async (gameId: number, body: { row: number; col: number }) =>
    api.post(`/games/${gameId}/shots`, body) as unknown,
};
