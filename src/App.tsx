import { useState, useEffect } from 'react';
import './App.css';
import Chessboard from './components/Chessboard';
import GameInfo from './components/GameInfo';
import { Chess, Move, Square, PieceSymbol } from 'chess.js';
import { initializePieces } from './utils/initPieces';

function App() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [status, setStatus] = useState('Click "New Game" to start playing');
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const [pendingMove, setPendingMove] = useState<{ from: Square, to: Square } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ w: PieceSymbol[], b: PieceSymbol[] }>({ w: [], b: [] });
  const [lastMove, setLastMove] = useState<{ from: Square, to: Square } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'w' | 'b'>('w');
  const [piecesLoaded, setPiecesLoaded] = useState(false);

  useEffect(() => {
    initializePieces();
    setPiecesLoaded(true);
  }, []);

  useEffect(() => {
    updateGameState();
  }, [game]);

  const updateGameState = () => {
    setCurrentPlayer(game.turn() as 'w' | 'b');

    let statusText = '';
    if (!gameStarted) statusText = 'Click "New Game" to start playing';
    else if (game.isCheckmate()) statusText = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    else if (game.isDraw()) statusText = 'Game ended in a draw';
    else if (game.isCheck()) statusText = `${game.turn() === 'w' ? 'White' : 'Black'} is in check`;
    else statusText = `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
    setStatus(statusText);

    const history = game.history({ verbose: true }) as Move[];
    setMoveHistory(history);

    if (history.length > 0) {
      const lastMoveDetail = history[history.length - 1];
      setLastMove({ from: lastMoveDetail.from, to: lastMoveDetail.to });
    } else setLastMove(null);

    const captured: { w: PieceSymbol[], b: PieceSymbol[] } = { w: [], b: [] };
    history.forEach((move: Move) => {
      if (move.captured) {
        if (move.color === 'w') captured.b.push(move.captured);
        else captured.w.push(move.captured);
      }
    });
    setCapturedPieces(captured);
  };

  const handleSquareClick = (square: Square) => {
    if (!gameStarted || game.isGameOver() || promotionSquare) return;

    if (selectedSquare) {
      const moves = game.moves({ square: selectedSquare, verbose: true }) as Move[];
      const move = moves.find(m => m.to === square);

      if (move) {
        if (move.promotion) {
          setPromotionSquare(square);
          setPendingMove({ from: selectedSquare, to: square });
        } else {
          makeMove(selectedSquare, square);
        }
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }) as Move[];
        setValidMoves(moves.map(m => m.to));
      }
    }
  };

  const makeMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    try {
      game.move({ from, to, promotion });
      const newGame = new Chess(game.fen());
      setGame(newGame);
      setLastMove({ from, to });
    } catch (e) {
      console.error('Invalid move', e);
    }
  };

  const handlePromotion = (piece: PieceSymbol) => {
    if (pendingMove) {
      makeMove(pendingMove.from, pendingMove.to, piece);
      setPromotionSquare(null);
      setPendingMove(null);
    }
  };

  const handleNewGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setValidMoves([]);
    setPromotionSquare(null);
    setPendingMove(null);
    setCapturedPieces({ w: [], b: [] });
    setLastMove(null);
    setGameStarted(true);
  };

  const handleUndoMove = () => {
    if (!gameStarted) return;
    const moveUndone = game.undo();
    if (moveUndone) {
      const newGame = new Chess(game.fen());
      setGame(newGame);
    }
  };

  return (
    <div className="chess-game">
      <h1>Chess Game</h1>
      {!piecesLoaded ? (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <div className="loading-text">Loading chess pieces...</div>
        </div>
      ) : (
        <div className="game-container">
          <div className="board-container">
            {currentPlayer === 'b' && gameStarted && (
              <div className="player-info white-player">
                <div className="player-name">White</div>
                <div className="captured-pieces-row">
                  {capturedPieces.b.map((type, i) => (
                    <div
                      key={`b-${type}-${i}`}
                      className="captured-piece-small"
                      style={{ backgroundImage: `url(/pieces/w${type}.svg)` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <Chessboard
              position={game.fen()}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
            />
            {currentPlayer === 'w' && gameStarted && (
              <div className="player-info black-player">
                <div className="player-name">Black</div>
                <div className="captured-pieces-row">
                  {capturedPieces.w.map((type, i) => (
                    <div
                      key={`w-${type}-${i}`}
                      className="captured-piece-small"
                      style={{ backgroundImage: `url(/pieces/b${type}.svg)` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <GameInfo
            status={status}
            moveHistory={moveHistory}
            capturedPieces={capturedPieces}
            onNewGame={handleNewGame}
            onUndoMove={handleUndoMove}
            canUndo={moveHistory.length > 0 && gameStarted}
            gameStarted={gameStarted}
            currentPlayer={currentPlayer}
          />
        </div>
      )}

      {promotionSquare && (
        <div className="promotion-modal">
          <div className="promotion-options">
            {['q', 'r', 'n', 'b'].map(piece => (
              <div
                key={piece}
                className="promotion-piece"
                style={{ backgroundImage: `url(/pieces/${game.turn()}${piece}.svg)` }}
                onClick={() => handlePromotion(piece as PieceSymbol)}
              >
                {game.turn() === 'w' ? piece.toUpperCase() : piece}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
