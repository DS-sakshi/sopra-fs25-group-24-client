import React, { useState, useEffect } from 'react';


// Types for game state (adjust these as needed for your app)
type Pawn = {
    id: string;
    r: number;
    c: number;
    color?: string;
    userId: number;
};


type Wall = {
    r: number;
    c: number;
    orientation: 'HORIZONTAL' | 'VERTICAL';
};


type Board = {
    pawns?: Pawn[];
    walls?: Wall[];
};


type Game = {
    board: Board;
    creator: { id: string };
};


// A separate component for the wall intersection cell that uses its own state.
interface WallIntersectionProps {
    row: number;
    col: number;
    gapSize: number;
    sendPosition: (row: number, col: number, orientation: 'HORIZONTAL' | 'VERTICAL') => void;
}


interface QuoridorBoardProps {
    currentUser: {
        id: number;
        name: string;
        username: string;
        status: UserStatus;
        token: string;
        creationDate: string;
        birthday?: string;
        totalGamesWon: number;
        totalGamesLost: number;
        totalGamesPlayed: number;
    };
    game: Game;
    gameId: string;
    apiService: ApiService;
    onUpdateGame: (updatedGame: Game) => void;
}



const WallIntersection: React.FC<WallIntersectionProps> = ({ row, col, gapSize, sendPosition }) => {
    const [showButtons, setShowButtons] = useState(false);


    return (
        <div
            style={{
                width: gapSize,
                height: gapSize,
                background: 'blue',
                cursor: 'pointer',
                position: 'relative'
            }}
            onClick={(e) => {
                e.stopPropagation();
                setShowButtons((prev) => !prev);
            }}
        >
            {showButtons && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        gap: '4px',
                        zIndex: 10
                    }}
                >
                    <button
                        style={{ fontSize: '8px', padding: '2px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            sendPosition(row, col, 'VERTICAL');
                            setShowButtons(false);
                        }}
                    >
                        Vertical
                    </button>
                    <button
                        style={{ fontSize: '8px', padding: '2px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            sendPosition(row, col, 'HORIZONTAL');
                            setShowButtons(false);
                        }}
                    >
                        Horizontal
                    </button>
                </div>
            )}
        </div>
    );
};


const QuoridorBoard: React.FC = () => {
    // Local state for the game. In a real app, this might come from props or a context.
    const [game, setGame] = useState<Game | null>(null);
    const [selectedPawn, setSelectedPawn] = useState<Pawn | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);


    // Dummy user (replace this with your actual user context/state)
    const currentUser = { id: "1" };


    // Dummy functions for board interaction. Replace or augment with your actual logic.
    const handleCellClick = (cellRow: number, cellCol: number) => {
        console.log(`Cell clicked: (${cellRow}, ${cellCol})`);
    };


    const handlePawnSelection = (pawn: Pawn) => {
        console.log('Pawn selected:', pawn);
        setSelectedPawn(pawn);
    };


    const sendPosition = (row: number, col: number, orientation?: 'HORIZONTAL' | 'VERTICAL') => {
        console.log(`Send position: row ${row}, col ${col}, orientation ${orientation}`);
    };


    const isCurrentUserTurn = () => true; // dummy logic
    const renderGameStatus = () => <div style={{ marginTop: '20px' }}>Game in progress...</div>;


    // For demonstration purposes, initialize a dummy game.
    useEffect(() => {
        if (!game) {
            const dummyGame: Game = {
                board: {
                    pawns: [
                        { id: "pawn1", r: 0, c: 4, color: 'blue', userId: 1 },
                        { id: "pawn2", r: 8, c: 4, color: 'red', userId: 2 }
                    ],
                    walls: [] // No walls initially
                },
                creator: { id: "1" }
            };
            setGame(dummyGame);
        }
    }, [game]);


    // Board rendering constants
    const boardSize = 9; // Number of cells in one dimension
    const cellSize = 20;
    const gapSize = 10;
    const totalSize = boardSize * cellSize + (boardSize - 1) * gapSize;


    // Build the alternating column and row sizes for a 17x17 grid (9 cells + 8 gaps)
    const columns: string[] = [];
    const rows: string[] = [];
    for (let i = 0; i < 17; i++) {
        columns.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
        rows.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
    }


    // Render the board grid
    const renderBoard = () => {
        if (!game || !game.board) {
            console.log("No game or board data available");
            return null;
        }


        console.log("Rendering board with data:", game.board);
        return (
            <div className="quoridor-board-container">
                <div
                    className="quoridor-board-wrapper"
                    style={{
                        position: 'relative',
                        margin: '40px auto',
                        width: `${totalSize}px`
                    }}
                >
                    <div
                        style={{
                            marginTop: 20,
                            height: 400,
                            background: '#f0f2f5',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%'
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: columns.join(' '),
                                gridTemplateRows: rows.join(' '),
                                gap: 0,
                                width: `${totalSize}px`,
                                height: `${totalSize}px`
                            }}
                        >
                            {Array.from({ length: 289 }).map((_, index) => {
                                const rowIndex = Math.floor(index / 17);
                                const colIndex = index % 17;
                                const isOddRow = rowIndex % 2 === 1;
                                const isOddCol = colIndex % 2 === 1;


                                // Wall intersection points (blue)
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
                                } else if (!isOddRow && !isOddCol) {
                                    // Game cells (actual squares)
                                    const cellRow = rowIndex / 2;
                                    const cellCol = colIndex / 2;


                                    // Find any pawns present at this cell
                                    const pawnsAtPosition = game.board.pawns?.filter(
                                        (pawn) => pawn.r === cellRow && pawn.c === cellCol
                                    ) || [];


                                    const isPossibleMove = possibleMoves.some(
                                        ([r, c]) => r === cellRow && c === cellCol
                                    );


                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleCellClick(cellRow, cellCol)}
                                            style={{
                                                width: cellSize,
                                                height: cellSize,
                                                backgroundColor: isPossibleMove ? '#90ee9060' : '#FFDEAD',
                                                border: isPossibleMove ? '2px dashed green' : '1px solid #8B4513',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                cursor: isPossibleMove ? 'pointer' : 'default',
                                                position: 'relative'
                                            }}
                                        >
                                            {pawnsAtPosition.map((pawn, idx) => (
                                                <div
                                                    key={`pawn-${cellRow}-${cellCol}-${idx}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePawnSelection(pawn);
                                                    }}
                                                    style={{
                                                        width: '80%',
                                                        height: '80%',
                                                        borderRadius: '50%',
                                                        backgroundColor:
                                                            pawn.color ||
                                                            (pawn.userId === parseInt(game.creator.id, 10) ? 'blue' : 'red'),
                                                        boxShadow: '0 3px 5px rgba(0,0,0,0.3)',
                                                        cursor:
                                                            pawn.userId === parseInt(currentUser.id, 10) && isCurrentUserTurn()
                                                                ? 'pointer'
                                                                : 'default',
                                                        border: selectedPawn?.id === pawn.id ? '2px solid yellow' : 'none',
                                                        zIndex: 3
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    );
                                } else {
                                    // Wall slots (gaps between cells)
                                    const wallRow = isOddRow ? (rowIndex - 1) / 2 : rowIndex / 2;
                                    const wallCol = isOddCol ? (colIndex - 1) / 2 : colIndex / 2;
                                    const orientation = isOddRow ? 'HORIZONTAL' : 'VERTICAL';


                                    const hasWall = game.board.walls?.some(
                                        (wall) =>
                                            wall.r === wallRow &&
                                            wall.c === wallCol &&
                                            wall.orientation === orientation
                                    );


                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                width: isOddCol ? gapSize : cellSize,
                                                height: isOddRow ? gapSize : cellSize,
                                                background: hasWall ? '#4a5568' : (rowIndex + colIndex) % 2 === 1 ? 'black' : 'white',
                                                cursor: 'pointer',
                                                boxShadow: hasWall ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                                                borderRadius: hasWall ? '2px' : '0',
                                                zIndex: hasWall ? 2 : 1
                                            }}
                                            onClick={() => {
                                                if (!hasWall) {
                                                    sendPosition(wallRow, wallCol, orientation);
                                                }
                                            }}
                                        />
                                    );
                                }
                            })}
                        </div>
                    </div>
                    {/* Game status message */}
                    {renderGameStatus()}
                    <div
                        id="coords-display"
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            padding: '10px',
                            background: 'white',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
            </div>
        );
    };


    return <div>{renderBoard()}</div>;
};


export default QuoridorBoard;