import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";
import { User } from "@/types/user";
import { Pawn } from "@/types/pawn";
import { Wall, WallOrientation } from "@/types/wall";
import "@ant-design/v5-patch-for-react-19";
import * as Types from "@/types/user";
import { GameStatus } from "@/types/api";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { log } from "console";

interface WallIntersectionProps {
  row: number;
  col: number;
  gapSize: number;
  sendPosition: (
    row: number,
    col: number,
    orientation: WallOrientation
  ) => void;
}

interface QuoridorBoardProps {
  gameId: string;
}

const WallIntersection: React.FC<WallIntersectionProps> = ({
  row,
  col,
  gapSize,
  sendPosition,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  return (
    <div
      style={{
        width: gapSize,
        height: gapSize,
        background: "blue",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => setShowOptions(!showOptions)}
    >
      {showOptions && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            zIndex: 10,
          }}
        >
          <button
            style={{ fontSize: "8px", padding: "2px" }}
            onClick={(e) => {
              e.stopPropagation();
              sendPosition(row, col, WallOrientation.VERTICAL);
              setShowOptions(false);
            }}
          >
            Vertical
          </button>
          <button
            style={{ fontSize: "8px", padding: "2px" }}
            onClick={(e) => {
              e.stopPropagation();
              sendPosition(row, col, WallOrientation.HORIZONTAL);
              setShowOptions(false);
            }}
          >
            Horizontal
          </button>
        </div>
      )}
    </div>
  );
};

const QuoridorBoard: React.FC<QuoridorBoardProps> = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [pawns, setPawns] = useState<Pawn[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useState<User | null>(null); // Dummy current user
  const apiService = useApi();
  const params = useParams();
  const gameId = params.id;
  const { getUser } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      apiService.get<Game>(`/game-lobby/${gameId}`),
      apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`),
      apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`),
    ])
      .then(([gameData, pawnsData, wallsData]) => {
        setGame(gameData);
        setPawns(pawnsData);
        setWalls(wallsData);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch game data.");
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [gameId]);

  const sendPosition = async (
    row: number,
    col: number,
    orientation?: WallOrientation
  ) => {
    if (!game) return;

    const currentUser = getUser();
    if (!currentUser) {
      setError("No user logged in.");
      return;
    }

    const payload = {
      endPosition: orientation ? null : [row, col],
      wallPosition: orientation ? [row, col] : null,
      wallOrientation: orientation ? orientation : null, 
      user: {
        id: currentUser.id,
      },
      type: orientation ? "ADD_WALL" : "MOVE_PAWN",
    };

    try {
      console.log(payload);
      const response = await apiService.post<Game>(
        `/game-lobby/${game.id}/move`,
        payload
      );
      if (response) {
        setGame(response);
        const [newPawns, newWalls] = await Promise.all([
          apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`),
          apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`),
        ]);
        setPawns(newPawns);
        setWalls(newWalls);
      }
    } catch (error) {
      console.error("Error sending move:", error);
    }
  };
  const boardSize = 9;
  const cellSize = 20;
  const gapSize = 10;
  const totalSize = boardSize * cellSize + (boardSize - 1) * gapSize;

  const columns: string[] = [];
  const rows: string[] = [];
  for (let i = 0; i < 17; i++) {
    columns.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
    rows.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
  }

  const renderBoard = () => {
    if (!game) return null;

    return (
      <div className="quoridor-board-container">
        <div
          style={{
            margin: "40px auto",
            width: `${totalSize}px`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: columns.join(" "),
              gridTemplateRows: rows.join(" "),
              width: `${totalSize}px`,
              height: `${totalSize}px`,
              backgroundColor: "lightgrey", // Add a background color
            }}
          >
            {Array.from({ length: 289 }).map((_, index) => {
              const rowIndex = Math.floor(index / 17);
              const colIndex = index % 17;
              const isOddRow = rowIndex % 2 === 1;
              const isOddCol = colIndex % 2 === 1;

              // Wall intersection button
              if (isOddRow && isOddCol) {
                return (
                  <WallIntersection
                    key={index}
                    row={rowIndex}
                    col={colIndex}
                    gapSize={gapSize}
                    sendPosition={sendPosition}
                  />
                );
              }

              // Pawn cell
              if (!isOddRow && !isOddCol) {
                const cellRow = rowIndex;
                const cellCol = colIndex;
                const pawn = pawns.find(
                  (pawn) => pawn.r === cellRow && pawn.c === cellCol
                );
                return (
                  <div
                    key={index}
                    onClick={() => sendPosition(cellRow, cellCol)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: "white", // Set square color to white
                      border: "1px solid #8B4513",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {pawn && (
                      <div
                        style={{
                          width: "80%",
                          height: "80%",
                          borderRadius: "50%",
                          backgroundColor: pawn.color,
                        }}
                        title={pawn.id}
                      />
                    )}
                  </div>
                );
              }

              // Wall slots
              const wallRow = isOddRow ? rowIndex - 1 : rowIndex;
              const wallCol = isOddCol ? colIndex - 1 : colIndex;
              const orientation = isOddRow
                ? WallOrientation.HORIZONTAL
                : WallOrientation.VERTICAL;

              const wallHere = walls.find(
                (w) =>
                  w.r === wallRow &&
                  w.c === wallCol &&
                  w.orientation === orientation
              );

              return (
                <div
                  key={index}
                  style={{
                    width: isOddCol ? gapSize : cellSize,
                    height: isOddRow ? gapSize : cellSize,
                    backgroundColor: "blue", // Set line color to blue
                    opacity: 1, // Make lines fully visible
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading game...</div>;
  if (error) return <div>{error}</div>;

  return <>{renderBoard()}</>;
};

export default QuoridorBoard;
