import { useEffect, useState } from "react";
import { message } from "antd";
import styles from '@/styles/QuoridorBoard.module.css';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Game, GameStatus } from "@/types/game";
import { User } from "@/types/user";
import { Wall, WallOrientation } from "@/types/wall";
import { Pawn } from "@/types/pawn";
import { MovePostDTO, MoveType } from "@/types/move";

type BoardProps = {
  gameId: string;
  currentUser: User;
  game: Game;
  onGameStatusChange: (game: Game) => void;
};

const Board: React.FC<BoardProps> = ({ gameId, currentUser, game, onGameStatusChange }) => {
  const [pawns, setPawns] = useState<Pawn[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [selectedPawn, setSelectedPawn] = useState<Pawn | null>(null);
  const [selectedWallPosition, setSelectedWallPosition] = useState<{ r: number, c: number } | null>(null);
  const [wallOrientation, setWallOrientation] = useState<WallOrientation>(WallOrientation.HORIZONTAL);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //const [isMyTurn, setIsMyTurn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const apiService = useApi();
  const router = useRouter();
  const boardSize = 17;

  // 1. On mount, fetch the game state
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await apiService.get<Game>(`/game-lobby/${gameId}`);
        onGameStatusChange(gameData);
      } catch (error) {
        console.error("Failed to fetch game:", error);
      }
    };
    fetchGame();
  }, [gameId, apiService, onGameStatusChange]);
 


  // 4. Fetch board state (pawns & walls). This can be redundant if game.board always returns updated info.
  useEffect(() => {
    if (gameId && game?.gameStatus === GameStatus.RUNNING) {
      fetchPawns();
      fetchWalls();
    }
  }, [gameId, game?.gameStatus]);

  const fetchPawns = async () => {
    try {
      const pawns = await apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`);
      setPawns(pawns);
    } catch (error) {
      console.error("Error fetching pawns:", error);
      setErrorMessage("Failed to fetch pawns");
    }
  };

  const fetchWalls = async () => {
    try {
      const walls = await apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`);
      setWalls(walls);
    } catch (error) {
      console.error("Error fetching walls:", error);
      setErrorMessage("Failed to fetch walls");
    }
  };

  // 5. Handle pawn move - let backend update turn; no manual turn update here.
  const movePawn = async (pawn: Pawn, targetR: number, targetC: number) => {
    try {
      setIsLoading(true);
      const moveData: MovePostDTO = {
        type: MoveType.MOVE_PAWN,
        user: { 
          id: Number(currentUser.id)
        },
        startPosition: [pawn.r, pawn.c],
        endPosition: [targetR, targetC]
      };

      const updatedGame = await apiService.post<Game>(`/game-lobby/${gameId}/move`, moveData);
      onGameStatusChange(updatedGame);
      setSelectedPawn(null);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to move pawn";
      setErrorMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Handle wall placement - backend validates position & updates turn accordingly.
  const placeWall = async (orientation: WallOrientation) => {
    try {
      setIsLoading(true);
      if (!selectedWallPosition) {
        throw new Error("Wall position not selected");
      }

      const moveData: MovePostDTO = {
        type: MoveType.ADD_WALL,
        user: { 
          id: Number(currentUser.id)
        },
        wallPosition: [selectedWallPosition.r, selectedWallPosition.c],
        wallOrientation: orientation
      };

      const updatedGame = await apiService.post<Game>(`/game-lobby/${gameId}/move`, moveData);
      updateGameState(updatedGame);
      setSelectedWallPosition(null);
    } catch (error) {
      console.error("Error placing wall:", error);
      setErrorMessage("Failed to place wall");
    } finally {
      setIsLoading(false);
    }
  };

  // Update game state using the updated game from the backend
  const updateGameState = (updatedGame: Game) => {
    onGameStatusChange(updatedGame);
    if (updatedGame.board) {
      setPawns(updatedGame.board.pawns || []);
      setWalls(updatedGame.board.walls || []);
    }
    if (updatedGame.gameStatus === GameStatus.ENDED) {
      const winner = updatedGame.currentTurn?.id || "Unknown";
      message.info(`Game ended! Winner: ${winner}`);
    }
  };

  const isPawnPosition = (r: number, c: number) => r % 2 === 0 && c % 2 === 0;
  const isWallPosition = (r: number, c: number) => r % 2 === 1 && c % 2 === 1;
  const getWallAt = (r: number, c: number, orientation: WallOrientation) =>
    walls.find(w => w.r === r && w.c === c && w.orientation === orientation);
  const getPawnAt = (r: number, c: number) =>
    pawns.find(p => p.r === r && p.c === c);

  const handleCellClick = (r: number, c: number) => {
    setErrorMessage(null);
    if (isWallPosition(r, c)) {
      setSelectedPawn(null);
      setSelectedWallPosition({ r, c });
    } else if (isPawnPosition(r, c)) {
      setSelectedWallPosition(null);
      const myPawn = pawns.find(p => p.userId === currentUser.id);
      if (selectedPawn && myPawn && selectedPawn.id === myPawn.id) {
        movePawn(myPawn, r, c);
      } else if (myPawn && myPawn.r === r && myPawn.c === c) {
        setSelectedPawn(myPawn);
      }
    }
  };

  const renderBoard = () => {
    const cells = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        let cellContent = null;
        let cellClass = [styles.boardCell];
        if (isPawnPosition(r, c)) {
          const pawn = getPawnAt(r, c);
          cellClass.push(styles.pawnCell);
          if (pawn) {
            cellContent = (
              <div
                className={`${styles.pawn} ${styles[pawn.color]}  
                  ${pawn.userId === currentUser.id ? styles.myPawn : ''}  
                  ${selectedPawn?.id === pawn.id ? styles.selected : ''}`}
                title={`Player: ${pawn.userId}`}
              />
            );
          }
        } else if (isWallPosition(r, c)) {
          cellClass.push(styles.wallPosition);
          const horizontalWall = getWallAt(r, c, WallOrientation.HORIZONTAL);
          const verticalWall = getWallAt(r, c, WallOrientation.VERTICAL);
          if (horizontalWall) {
            cellContent = (
              <div 
                className={`${styles.wall} ${styles.horizontalWall} ${styles[horizontalWall.color]}`} 
              />
            );
          } else if (verticalWall) {
            cellContent = (
              <div 
                className={`${styles.wall} ${styles.verticalWall} ${styles[verticalWall.color]}`} 
              />
            );
          } else if (selectedWallPosition && selectedWallPosition.r === r && selectedWallPosition.c === c) {
            cellClass.push(styles.selectedWallPosition);
          }
        } else {
          cellClass.push(styles.spacerCell);
        }
        cells.push(
          <div
            key={`${r}-${c}`}
            className={cellClass.join(" ")}
            onClick={() => handleCellClick(r, c)}
          >
            {cellContent}
          </div>
        );
      }
    }
    return <div className={styles.gameBoard}>{cells}</div>;
  };

  return (
    <div className={styles.boardContainer}>
      {/* Visual turn indicator */}
      <div className={styles.gameInfo}>
        <div className={styles.turnIndicator}>
          {game?.gameStatus === GameStatus.RUNNING ? (
            <>
            </>
          ) : (
            <span>
              Game {game?.gameStatus?.toLowerCase() || 'loading'}...
            </span>
          )}
        </div>
      </div>
      <div className={styles.boardControls}>
        { game?.gameStatus === GameStatus.RUNNING && selectedWallPosition && (
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => placeWall(WallOrientation.HORIZONTAL)}>
              Horizontal Wall
            </button>
            <button className={styles.actionBtn} onClick={() => placeWall(WallOrientation.VERTICAL)}>
              Vertical Wall
            </button>
          </div>
        )}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      </div>
      {game?.gameStatus === GameStatus.RUNNING ? renderBoard() : (
        <div className={styles.waitingMessage}>
          {game?.gameStatus === GameStatus.WAITING_FOR_USER
            ? "Waiting for another player to join..."
            : "Game has ended."}
        </div>
      )}
    </div>
  );
};

export default Board;