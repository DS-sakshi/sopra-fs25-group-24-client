import { useEffect, useState } from "react";
import { message } from "antd";
import styles from '@/styles/QuoridorBoard.module.css'; // Assuming you have styles
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
  const [placingWall, setPlacingWall] = useState(false);
  const [wallOrientation, setWallOrientation] = useState<WallOrientation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const { user } = useAuth();
  const apiService = useApi();
  const router = useRouter();
  const boardSize = 17;

  // 🌀 Determine if it's this user's turn
  useEffect(() => {
    if (game && currentUser) {
      // Log the entire game object to see its structure
      console.log("Game object:", JSON.stringify(game));
      
      // Check if currentTurn exists and has correct structure
      console.log("Current turn object:", game.currentTurn);
      
      let isCurrentTurn = false;
      
      // FALLBACK: If currentTurn is undefined but game is running, check if this user is the creator
      if (!game.currentTurn && game.gameStatus === GameStatus.RUNNING) {
        console.log("Using fallback turn logic - checking if user is creator");
        // Assume creator goes first if currentTurn is undefined
        isCurrentTurn = game.creator?.id === currentUser.id;
        console.log("Is user creator?", isCurrentTurn);
      }
      // Normal turn checking if currentTurn exists
      else if (game.currentTurn) {
        const turnId = game.currentTurn.id;
        console.log("Turn ID detected as:", turnId);
        
        if (turnId !== null && turnId !== undefined) {
          isCurrentTurn = Number(turnId) === Number(currentUser.id);
        }
      }
      
      console.log("Is my turn calculated as:", isCurrentTurn);
      setIsMyTurn(isCurrentTurn);
    }
  }, [game, currentUser]);

  // 🔁 Poll for updated game state every second
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (gameId && game?.gameStatus === GameStatus.RUNNING) {
        try {
          const updatedGame = await apiService.get<Game>(`/game-lobby/${gameId}`);
          onGameStatusChange(updatedGame);
        } catch (error) {
          console.error("Failed to poll game:", error);
        }
      }
    },5000);
    return () => clearInterval(pollInterval);
  }, [gameId, game?.gameStatus]);

  // 🧩 Fetch board state when game is running
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

  const refreshGameState = async () => {
    try {
      const updatedGame = await apiService.get<Game>(`/game-lobby/${gameId}`);
      onGameStatusChange(updatedGame);
      return true;
    } catch (error) {
      console.error("Failed to refresh game:", error);
      return false;
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (!isMyTurn) {
      setErrorMessage("It's not your turn!");
      return;
    }

    setErrorMessage(null);

    if (placingWall) {
      if (isWallPosition(r, c)) {
        placeWall(r, c);
      }
    } else {
      const myPawn = pawns.find(p => p.userId === currentUser.id);
      if (selectedPawn && myPawn && selectedPawn.id === myPawn.id) {
        movePawn(myPawn, r, c);
      } else if (myPawn && myPawn.r === r && myPawn.c === c) {
        setSelectedPawn(myPawn);
      }
    }
  };

  const movePawn = async (pawn: Pawn, targetR: number, targetC: number) => {
    if (!isPawnPosition(targetR, targetC)) {
      setErrorMessage("Invalid pawn position");
      return;
    }
  
    try {
      // Log before sending
      console.log("Moving pawn with data:", {
        currentUser,
        from: [pawn.r, pawn.c],
        to: [targetR, targetC],
        isMyTurn
      });
  
      const moveData: MovePostDTO = {
        type: MoveType.MOVE_PAWN,
        user: { 
          id: Number(currentUser.id),
          username: currentUser.username
        },
        startPosition: [pawn.r, pawn.c],
        endPosition: [targetR, targetC]
      };
  
      console.log("Sending move data:", moveData);
      const updatedGame = await apiService.post<Game>(`/game-lobby/${gameId}/move`, moveData);
      
      console.log("Move response:", updatedGame);
      onGameStatusChange(updatedGame);
      setSelectedPawn(null);
      fetchPawns();
      fetchWalls();
    } catch (error) {
      console.error("Error moving pawn:", error);
      setErrorMessage("Failed to move pawn");
      setSelectedPawn(null);
    }
  };

  const placeWall = async (r: number, c: number) => {
    try {
      const moveData: MovePostDTO = {
        type: MoveType.ADD_WALL,
        user: { 
          id: Number(currentUser.id),
          username: currentUser.username
        },
        wallPosition: [r, c],
        wallOrientation,
      };

      const updatedGame = await apiService.post<Game>(`/game-lobby/${gameId}/move`, moveData);
      onGameStatusChange(updatedGame);
      setPlacingWall(false);
      fetchWalls();
    } catch (error) {
      console.error("Error placing wall:", error);
      setErrorMessage("Failed to place wall");
    }
  };

  const toggleWallPlacement = () => {
    if (!isMyTurn) {
      setErrorMessage("It's not your turn!");
      return;
    }

    setPlacingWall(!placingWall);
    setSelectedPawn(null);
    setErrorMessage(null);
  };

  const toggleWallOrientation = () => {
    setWallOrientation(
      wallOrientation === WallOrientation.HORIZONTAL
        ? WallOrientation.VERTICAL
        : WallOrientation.HORIZONTAL
    );
  };

  const isPawnPosition = (r: number, c: number) => r % 2 === 0 && c % 2 === 0;
  const isWallPosition = (r: number, c: number) => r % 2 === 1 || c % 2 === 1;
  const isHorizontalWallPosition = (r: number, c: number) => r % 2 === 1 && c % 2 === 0;
  const isVerticalWallPosition = (r: number, c: number) => r % 2 === 0 && c % 2 === 1;
  const isIntersectionPosition = (r: number, c: number) => r % 2 === 1 && c % 2 === 1;

  const getWallAt = (r: number, c: number, orientation: WallOrientation) =>
    walls.find(w => w.r === r && w.c === c && w.orientation === orientation);

  const getPawnAt = (r: number, c: number) =>
    pawns.find(p => p.r === r && p.c === c);

  const renderBoard = () => {
    const cells = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        let cellContent = null;
        let cellClass = [styles.boardCell];

        if (isPawnPosition(r, c)) {
          const pawn = getPawnAt(r, c);
          if (pawn) {
            cellContent = (
              <div
                className={`${styles.pawn} ${styles[pawn.color]} 
                  ${pawn.userId === currentUser.id ? styles.myPawn : ''} 
                  ${selectedPawn?.id === pawn.id ? styles.selected : ''}`}
              />
            );
          }
          cellClass.push(styles.pawnCell);
        } else if (isHorizontalWallPosition(r, c)) {
          const wall = getWallAt(r, c, WallOrientation.HORIZONTAL);
          if (wall) {
            cellClass.push(styles.wall, styles.horizontalWall, styles[wall.color]);
          } else if (placingWall && wallOrientation === WallOrientation.HORIZONTAL) {
            cellClass.push(styles.wallPlacement, styles.horizontalPlacement);
          }
        } else if (isVerticalWallPosition(r, c)) {
          const wall = getWallAt(r, c, WallOrientation.VERTICAL);
          if (wall) {
            cellClass.push(styles.wall, styles.verticalWall, styles[wall.color]);
          } else if (placingWall && wallOrientation === WallOrientation.VERTICAL) {
            cellClass.push(styles.wallPlacement, styles.verticalPlacement);
          }
        } else if (isIntersectionPosition(r, c)) {
          cellClass.push(styles.intersectionCell);
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
      <div className={styles.boardControls}>
        
        <div className={styles.turnIndicator}>
          {game?.gameStatus === GameStatus.RUNNING ? (
            <>
              <div className={styles.status}>Game Status: {game.gameStatus}</div>
              <div className={styles.turn}>
                Current Turn: {game.currentTurn?.username}
                {isMyTurn && <span className={styles.yourTurn}> (Your Turn)</span>}
              </div>
            </>
          ) : (
            <div className={styles.status}>Game Status: {game?.gameStatus}</div>
          )}
        </div>

        {isMyTurn && game?.gameStatus === GameStatus.RUNNING && (
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${!placingWall ? styles.active : ''}`}
              onClick={() => { setPlacingWall(false); setSelectedPawn(null); }}
            >
              Move Pawn
            </button>
            <button
              className={`${styles.actionBtn} ${placingWall ? styles.active : ''}`}
              onClick={toggleWallPlacement}
            >
              Place Wall
            </button>
            {placingWall && (
              <button
                className={styles.orientationBtn}
                onClick={toggleWallOrientation}
              >
                {wallOrientation === WallOrientation.HORIZONTAL ? 'Horizontal' : 'Vertical'}
              </button>
            )}
          </div>
        )}

        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      </div>

      {game?.gameStatus === GameStatus.RUNNING ? (
        renderBoard()
      ) : (
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