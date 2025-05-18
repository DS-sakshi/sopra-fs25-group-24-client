
import { useEffect, useState } from "react";

export default function GameOverScreen({
                                           isWinner,
                                           onPlayAgain,
                                           onMainMenu,
                                           showConfetti = true,
                                       }: {
    isWinner: boolean;
    onPlayAgain: () => void;
    onMainMenu: () => void;
    showConfetti?: boolean;
}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="game-over-container"
            style={{
                textAlign: "center",
                padding: "20px",
                backgroundColor: "#1a242f",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                maxWidth: "450px",
                margin: "20px auto",
                color: "white",
                animation: "fadeIn 0.8s ease-in-out",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Confetti */}
            {show && showConfetti && (
                <div className="confetti-container absolute inset-0 pointer-events-none z-0">
                    {[...Array(25)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10%`,
                                background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                                width: `${Math.random() * 10 + 5}px`,
                                height: `${Math.random() * 10 + 5}px`,
                                borderRadius: Math.random() > 0.5 ? "50%" : "0",
                                animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Icon */}
            <div
                style={{
                    fontSize: "3rem",
                    marginBottom: "10px",
                    animation: "bounce 1s ease-in-out",
                }}
            >
                {isWinner ? "🎮" : "🏆"}
            </div>

            {/* Game Over */}
            <h2
                style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#f1c40f",
                    textShadow: "0 0 8px rgba(241, 196, 15, 0.5)",
                    margin: "0 0 10px 0",
                    animation: "pulse 2s infinite",
                }}
            >
                Game Over
            </h2>

            <p style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
                {isWinner ? "You won!" : "You lost!"}
            </p>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    marginTop: "12px",
                }}
            >
                <button
                    onClick={onPlayAgain}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.2s",
                    }}
                >
                    Play Again
                </button>
                <button
                    onClick={onMainMenu}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.2s",
                    }}
                >
                    Main Menu
                </button>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes bounce {
          0% {
            transform: translateY(-15px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(500px) rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}
