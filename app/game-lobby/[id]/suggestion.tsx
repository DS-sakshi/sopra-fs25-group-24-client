import { useAuth } from "@/context/AuthContext";
import React, { useState } from 'react';

// Types for game entities
interface Pawn {
  userId: string;
  r: number;
  c: number;
}

interface Wall {
  userId: string;
  r: number;
  c: number;
}

type StrategyType = 'defensive' | 'offensive' | 'safe';

interface Suggestion {
  action: 'Move pawn' | 'Place wall' | 'pass';
  direction?: 'up' | 'down' | 'left' | 'right';
  wall?: {
    placement: string;
    orientation: 'HORIZONTAL' | 'VERTICAL';
  };
  rationale: string;
}

interface SuggestionProps {
  pawns: Pawn[];
  walls: Wall[];
}

export const Suggestion: React.FC<SuggestionProps> = ({ pawns, walls }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [strategy, setStrategy] = useState<StrategyType | null>(null);
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getUser } = useAuth();
  
  const fetchSuggestion = async (type: StrategyType) => {
    setStrategy(type);
    setLoading(true);
    setError(null);
    setIsOpen(true);

    const currentUser = getUser();
    if (!currentUser) {
      setError('No user logged in.');
      setLoading(false);
      return;
    }

    const myPawn = pawns.find(p => p.userId === currentUser.id);
    const oppPawn = pawns.find(p => p.userId !== currentUser.id);

    const gameState = {
      boardSize: 9,
      yourPosition: myPawn ? [myPawn.r / 2, myPawn.c / 2] : null,
      opponentPosition: oppPawn ? [oppPawn.r / 2, oppPawn.c / 2] : null,
      yourWallsLeft: 10 - walls.filter(w => w.userId === currentUser.id).length,
      opponentWallsLeft: 10 - walls.filter(w => w.userId !== currentUser.id).length,
    };

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState, strategy: type })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error: ${res.status} ${text}`);
      }

      const data: Suggestion = await res.json();
      let tipText = '';
      
      if (data.action === 'Move pawn' && data.direction) {
        tipText = `Move your pawn ${data.direction}.\n${data.rationale}`;
      } else if (data.action === 'Place wall' && data.wall) {
        const { placement, orientation } = data.wall;
        tipText = `Place a ${orientation.toLowerCase()} wall ${placement}.\n${data.rationale}`;
      } else if (data.action === 'pass') {
        tipText = `Pass your turn.\n${data.rationale}`;
      } else {
        tipText = `No valid suggestion.\n${data.rationale}`;
      }

      setTip(tipText);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error fetching suggestion.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    {/* Strategy Buttons */}
    <button onClick={() => fetchSuggestion('offensive')} disabled={loading}>
      Offensive
    </button>
    <button onClick={() => fetchSuggestion('defensive')} disabled={loading}>
      Defensive
    </button>
    <button onClick={() => fetchSuggestion('safe')} disabled={loading}>
      Safe
    </button>

    {/* Strategy Tips Panel */}
    {isOpen && (
      <div
        style={{
          position: 'fixed',
          right: '100px',
          bottom: '100px',
          zIndex: 1000,
          width: '300px',
          backgroundColor: '#1a2234',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          padding: tip ? '16px' : '0'
        }}
      >
        {/* Choose Strategy */}
        {!strategy && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <h3 style={{ color: 'white', marginTop: 0 }}>Choose Strategy Type:</h3>
            <button
              onClick={() => fetchSuggestion('defensive')}
              style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Defensive Strategy
            </button>
            <button
              onClick={() => fetchSuggestion('offensive')}
              style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Offensive Strategy
            </button>
            <button
              onClick={() => fetchSuggestion('safe')}
              style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Safe/Balanced Strategy
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
            <p>Analyzing game state...</p>
            <div
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                borderTopColor: 'white',
                animation: 'spin 1s ease-in-out infinite'
              }}
            ></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Strategy Tip Content */}
        {tip && !loading && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #334155'
              }}
            >
              <h3 style={{ margin: 0, color: 'white' }}>
                {strategy === 'defensive'
                  ? 'Defensive'
                  : strategy === 'offensive'
                  ? 'Offensive'
                  : 'Balanced'}{' '}
                Strategy
              </h3>
              <button
                onClick={() => {
                  setStrategy(null);
                  setTip('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ color: 'white', padding: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {tip.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <button
              onClick={() => {
                setStrategy(null);
                setTip('');
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#4b5563',
                color: 'white',
                border: 'none',
                borderTop: '1px solid #334155',
                cursor: 'pointer'
              }}
            >
              Get Another Strategy
            </button>
          </div>
        )}
      </div>
    )}

    {/* Display any Errors */}
    {error && <p style={{ color: 'red' }}>{error}</p>}
  </>
);
};

export default Suggestion;