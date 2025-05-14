"use client";

import { useRouter } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
import { useState, useEffect } from "react";
import { Button } from 'antd';
import { FormOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import Head from "next/head";

export default function LandingPage() {
    const router = useRouter();
    const [showEffect, setShowEffect] = useState(false);

    useEffect(() => {
        // Create animated text elements
        const animateText = () => {
            const title = document.getElementById("animated-title");
            if (!title) return;

            const text = "Outsmart. Outmaneuver. Outplay.";
            title.innerHTML = "";

            [...text].forEach((char, index) => {
                const span = document.createElement("span");
                span.textContent = char;
                span.style.opacity = "0";
                span.style.transform = "translateY(20px)";
                span.style.transition = `all 0.5s ease ${index * 0.03}s`;
                span.style.display = "inline-block";
                title.appendChild(span);
            });

            // requestAnimationFrame(() => {
            //     document.querySelectorAll("#animated-title span").forEach(span => {
            //         span.style.opacity = "1";
            //         span.style.transform = "translateY(0)";
            //     });
            // });
        };

        // Create flying pawn and shatter effect
        const createFlyingPawn = () => {
            // Create pawn element
            const pawn = document.createElement("div");
            pawn.className = "flying-pawn";
            document.body.appendChild(pawn);

            // Random start position
            const startPos = Math.floor(Math.random() * 4);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Position pawn at a random edge
            switch(startPos) {
                case 0: // top
                    pawn.style.top = "-50px";
                    pawn.style.left = `${Math.random() * viewportWidth}px`;
                    break;
                case 1: // right
                    pawn.style.top = `${Math.random() * viewportHeight}px`;
                    pawn.style.left = `${viewportWidth + 50}px`;
                    break;
                case 2: // bottom
                    pawn.style.top = `${viewportHeight + 50}px`;
                    pawn.style.left = `${Math.random() * viewportWidth}px`;
                    break;
                case 3: // left
                    pawn.style.top = `${Math.random() * viewportHeight}px`;
                    pawn.style.left = "-50px";
                    break;
            }

            // Target center of the page
            const targetX = viewportWidth / 2;
            const targetY = viewportHeight / 2;

            // Animate pawn to center with scaling
            pawn.animate([
                { transform: "scale(0.1)" },
                { transform: "scale(1.2)" },
                { transform: "scale(1)" }
            ], {
                duration: 1000,
                easing: "ease-out"
            });

            // Move pawn to center
            pawn.animate([
                { left: pawn.style.left, top: pawn.style.top },
                { left: `${targetX}px`, top: `${targetY}px` }
            ], {
                duration: 1000,
                easing: "ease-out",
                fill: "forwards"
            });

            // Create cracks after pawn lands
            setTimeout(() => {
                // Create crack effect radiating from center
                for (let i = 0; i < 12; i++) {
                    const crack = document.createElement("div");
                    crack.className = "crack";

                    const width = 10 + Math.random() * 5;
                    const height = 100 + Math.random() * 200;
                    const angle = (i * 30) + (Math.random() * 20 - 10);

                    crack.style.width = `${width}px`;
                    crack.style.height = `${height}px`;
                    crack.style.left = `${targetX}px`;
                    crack.style.top = `${targetY}px`;
                    crack.style.transformOrigin = "0 0";
                    crack.style.transform = `rotate(${angle}deg)`;

                    document.body.appendChild(crack);

                    // Animate crack growth
                    crack.animate([
                        { opacity: 0, height: "0px" },
                        { opacity: 0.7, height: `${height}px` }
                    ], {
                        duration: 300,
                        easing: "ease-out",
                        fill: "forwards"
                    });
                }

                // Screen shake effect
                document.body.animate([
                    { transform: "translate(0, 0)" },
                    { transform: "translate(-10px, 5px)" },
                    { transform: "translate(8px, -7px)" },
                    { transform: "translate(-6px, 2px)" },
                    { transform: "translate(4px, -1px)" },
                    { transform: "translate(0, 0)" }
                ], {
                    duration: 500,
                    easing: "ease-out"
                });

                // Flash effect
                const flash = document.createElement("div");
                flash.style.position = "fixed";
                flash.style.top = "0";
                flash.style.left = "0";
                flash.style.width = "100%";
                flash.style.height = "100%";
                flash.style.backgroundColor = "white";
                flash.style.opacity = "0";
                flash.style.zIndex = "1000";
                flash.style.pointerEvents = "none";
                document.body.appendChild(flash);

                flash.animate([
                    { opacity: 0 },
                    { opacity: 0.7 },
                    { opacity: 0 }
                ], {
                    duration: 300,
                    easing: "ease-out"
                });

                // Clean up elements
                setTimeout(() => {
                    document.querySelectorAll(".crack").forEach(el => el.remove());
                    pawn.remove();
                    flash.remove();
                }, 2000);
            }, 1000);
        };

        // Create floating particles
        const createParticles = () => {
            const container = document.querySelector(".particles-container");
            if (!container) return;

            for (let i = 0; i < 30; i++) {
                const particle = document.createElement("div");
                particle.className = "particle";
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.animationDuration = `${5 + Math.random() * 10}s`;
                particle.style.animationDelay = `${Math.random() * 5}s`;
                container.appendChild(particle);
            }
        };

        // Create game board in background
        const createGameBoard = () => {
            const boardContainer = document.querySelector(".board-container");
            if (!boardContainer) return;

            const board = document.createElement("div");
            board.className = "game-board";

            // Create grid cells
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const cell = document.createElement("div");
                    cell.className = "board-cell";
                    board.appendChild(cell);
                }
            }

            // Add random walls
            for (let i = 0; i < 8; i++) {
                const isHorizontal = Math.random() > 0.5;
                const wall = document.createElement("div");
                wall.className = isHorizontal ? "wall-h" : "wall-v";
                wall.style.top = `${Math.random() * 85}%`;
                wall.style.left = `${Math.random() * 85}%`;
                board.appendChild(wall);
            }

            // Add pawns
            const pawn1 = document.createElement("div");
            pawn1.className = "board-pawn pawn1";
            pawn1.style.top = "10%";
            pawn1.style.left = "50%";
            board.appendChild(pawn1);

            const pawn2 = document.createElement("div");
            pawn2.className = "board-pawn pawn2";
            pawn2.style.top = "90%";
            pawn2.style.left = "50%";
            board.appendChild(pawn2);

            boardContainer.appendChild(board);
        };

        // Initialize animations
        animateText();
        createParticles();
        createGameBoard();

        // Set up play button click effect
        const playButton = document.getElementById("play-button");
        if (playButton) {
            playButton.addEventListener("click", createFlyingPawn);
        }

        // Cleanup event listeners on unmount
        return () => {
            const playButton = document.getElementById("play-button");
            if (playButton) {
                playButton.removeEventListener("click", createFlyingPawn);
            }
        };
    }, []);

    return (
        <>
            <Head>
                <title>Quoridor - Strategic Board Game</title>
                <meta name="description" content="Quoridor Online - The ultimate strategic board game" />
            </Head>

            <div className="landing-container">

                {/*  Existing background and content */}
                <div className="particles-container"></div>
                <div className="board-container"></div>

                <main className="main-content">
                    <div className="hero-section">
                        <h1 className="game-title">QUORIDOR</h1>

                        <div
                            id="animated-title"
                            className="animated-subtitle"
                        >
                            🧠 Outsmart. Outmaneuver. Outplay.
                        </div>

                        <p style={{ fontWeight: 500, fontSize: "18px", marginBottom: "24px" }}>
                            <strong>The ultimate digital arena for the modern strategist.</strong>
                        </p>
                        <p className="sub-description">
                            Simple rules, infinite possibilities. In this elegant game of logic and tactics, your goal is clear:
                            <strong> get your pawn to the other side of the board</strong>. But there’s a twist —
                            <strong> your opponent can block your path</strong>.<br />
                            Can you find the shortest route… or will you lay the perfect trap?
                        </p>
                        <p className="sub-description">

                        </p>

                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">🎮</div>
                                <h3 className="feature-title">Play Anytime, Anywhere</h3>
                                <p className="feature-text">
                                    Instant matchmaking or private games with friends.

                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">🏆</div>
                                <h3 className="feature-title">Climb the Leaderboard</h3>
                                <p className="feature-text">
                                    Compete in ranked matches. Track your stats and sharpen your skills.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">🧩</div>
                                <h3 className="feature-title">Master the Mind Game</h3>
                                <p className="feature-text">
                                    Enjoy matches with deep strategic depth.
                                </p>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <Button
                                type="primary"
                                icon={<FormOutlined />}
                                onClick={() => router.push("/register")}
                                size="large"
                                shape="round"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #00b4d8, #90e0ef)",
                                    border: "none",
                                    padding: "0 32px",
                                    height: "48px",
                                    fontSize: "16px",
                                    transition: "transform 0.2s",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                }}
                                className="hover-scale"
                            >
                                Register
                            </Button>

                            <Button
                                type="default"
                                icon={<LoginOutlined />}
                                onClick={() => router.push("/login")}
                                size="large"
                                shape="round"
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "#fff",
                                    padding: "0 32px",
                                    height: "48px",
                                    fontSize: "16px",
                                    transition: "transform 0.2s",
                                    backdropFilter: "blur(4px)",
                                }}
                                className="hover-scale"
                            >
                                Login
                            </Button>
                        </div>

                        <div className="footer-text">
                            A game developed by SoPra-FS25 Group 24
                        </div>
                    </div>
                </main>

                <style jsx>{`
          /* Base container styles */
          .landing-container {
            min-height: 100vh;
            width: 100%;
              display: flex;
              align-items: center; 
              justify-content: center; 
            padding: 40px 20px;
            background: url('https://wallup.net/wp-content/uploads/2018/10/04/670080-space-outer-universe-stars-photography-detail-astronomy-nasa-hubble.jpg');
            background-size: cover;
            background-position: center;
            color: #fff;
            font-family: "Segoe UI", Arial, sans-serif;
            position: relative;
            overflow: hidden;
          }
          
          /* Main content */
          .main-content {
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 10;
          }
          
          .hero-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 40px 20px;
              background-color: rgba(11, 15, 44, 0.9);
              backdrop-filter: blur(12px);
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          }
          
          .game-title {
            font-size: 48px;
            font-weight: 900;
            margin: 0 0 16px;
            background: linear-gradient(90deg, #4a6fa5, #172a42);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 1px;
          }
          
          .animated-subtitle {
            color: #4a6fa5;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
            letter-spacing: 0.5px;
          }
          
          .animated-subtitle span {
            display: inline-block;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease;
          }
          
          .description {
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 20px;
            max-width: 800px;
          }
          
          .sub-description {
            font-size: 16px;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.85);
            margin-bottom: 36px;
            max-width: 800px;
          }
          
          /* Features grid */
          .features-grid {
              
            display: flex;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            width: 100%;
            margin-bottom: 40px;
          }
          
          .feature-card {
            background: rgba(19, 47, 76, 0.6);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid rgba(74, 111, 165, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }
          
          .feature-card::before {
            content: '';
            position: absolute;
            top: -100%;
            left: -100%;
            width: 300%;
            height: 300%;
            background: linear-gradient(45deg, transparent, rgba(74, 111, 165, 0.2), transparent);
            transform: rotate(45deg);
            transition: all 0.7s ease;
          }
          
          .feature-card:hover::before {
            top: 100%;
            left: 100%;
          }
          
          .feature-icon {
            font-size: 36px;
            margin-bottom: 16px;
          }
          
          .feature-title {
            color: #fff;
            font-size: 20px;
            margin-bottom: 16px;
          }
          
          .feature-text {
            color: rgba(255, 255, 255, 0.75);
            line-height: 1.5;
          }
          
          /* Action buttons */
          .action-buttons {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 30px;
          }
          
          .action-button {
            padding: 0 30px;
            height: 48px;
            border-radius: 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          
          .register-button {
            background: linear-gradient(135deg, #1a365d, #0d2035);
            color: white;
          }
          
          .login-button {
            background: rgba(19, 47, 76, 0.4);
            border: 1px solid rgba(74, 111, 165, 0.4);
            color: white;
            backdrop-filter: blur(4px);
          }
          
          .play-button {
            background: linear-gradient(135deg, #4a6fa5, #172a42);
            color: white;
          }
          
          .action-button:hover {
            transform: scale(1.05);
          }
          
          .footer-text {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            margin-top: 20px;
          }
          
          /* Animation elements */
          .particles-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }
          
          .board-container {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }
          
          /* Flying pawn and effects */
          .flying-pawn {
            position: fixed;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle, #1a365d, #0d2035);
            border-radius: 50%;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(44, 89, 153, 0.8);
          }
          
          .crack {
            position: fixed;
            background: linear-gradient(135deg, #1a365d, transparent);
            z-index: 999;
            transform-origin: center;
            opacity: 0;
            pointer-events: none;
          }
          
          .particle {
            position: absolute;
            width: 6px;
            height: 6px;
            background-color: #4a6fa5;
            border-radius: 50%;
            opacity: 0.5;
            animation: float-up linear infinite;
            pointer-events: none;
          }
          
          .game-board {
            position: absolute;
            width: 300px;
            height: 300px;
            background-color: rgba(13, 32, 53, 0.5);
            border-radius: 8px;
            top: 10%;
            right: 10%;
            transform: perspective(800px) rotateX(60deg) rotateZ(45deg);
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            grid-template-rows: repeat(9, 1fr);
            gap: 1px;
            animation: float 15s ease-in-out infinite;
          }
          
          .board-cell {
            background-color: rgba(25, 55, 90, 0.5);
            border: 1px solid rgba(74, 111, 165, 0.3);
          }
          
          .wall-h {
            position: absolute;
            height: 8px;
            width: 55px;
            background-color: #172a42;
            border-radius: 4px;
          }
          
          .wall-v {
            position: absolute;
            height: 55px;
            width: 8px;
            background-color: #172a42;
            border-radius: 4px;
          }
          
          .board-pawn {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
          
          .pawn1 {
            background-color: #4a6fa5;
          }
          
          .pawn2 {
            background-color: #172a42;
            animation: pulse 2s infinite;
          }
          
          /* Animation keyframes */
          @keyframes float {
            0% { transform: perspective(800px) rotateX(60deg) rotateZ(45deg) translateY(0) }
            50% { transform: perspective(800px) rotateX(60deg) rotateZ(45deg) translateY(-20px) }
            100% { transform: perspective(800px) rotateX(60deg) rotateZ(45deg) translateY(0) }
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(44, 89, 153, 0.7) }
            70% { box-shadow: 0 0 0 15px rgba(44, 89, 153, 0) }
            100% { box-shadow: 0 0 0 0 rgba(44, 89, 153, 0) }
          }
          
          @keyframes float-up {
            0% { transform: translateY(0); opacity: 0.8 }
            100% { transform: translateY(-100px); opacity: 0 }
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .features-grid {
              grid-template-columns: 1fr;
            }
            
            .game-title {
              font-size: 36px;
            }
            
            .animated-subtitle {
              font-size: 20px;
            }
            
            .action-buttons {
              flex-direction: column;
              width: 100%;
              max-width: 300px;
            }
          }
        `}</style>
            </div>
        </>
    );
}