import { FC } from 'react';
import { Square } from 'chess.js';

interface ChessboardProps {
  position: string;
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
}

const Chessboard: FC<ChessboardProps> = ({
  position,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareClick
}) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const parseFen = (fen: string) => {
    const [piecePlacement] = fen.split(' ');
    const rows = piecePlacement.split('/');
    const board: { [key: string]: { type: string; color: string } } = {};

    ranks.forEach((rank, rankIndex) => {
      let fileIndex = 0;
      const row = rows[rankIndex];
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (/\d/.test(char)) {
          fileIndex += parseInt(char, 10);
        } else {
          const file = files[fileIndex];
          const square = file + rank;
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase();
          board[square] = { type, color };
          fileIndex++;
        }
      }
    });

    return board;
  };

  const board = parseFen(position);

  const getSquareClasses = (square: Square) => {
    const fileIndex = files.indexOf(square[0]);
    const rankIndex = ranks.indexOf(square[1]);

    const isLight = (fileIndex + rankIndex) % 2 === 1;
    const isSelected = square === selectedSquare;
    const isValidMove = validMoves.includes(square);
    const isValidCapture = isValidMove && board[square];
    const isLastMoveFrom = lastMove && square === lastMove.from;
    const isLastMoveTo = lastMove && square === lastMove.to;

    return `square ${isLight ? 'light' : 'dark'}
      ${isSelected ? 'selected' : ''}
      ${isValidMove && !isValidCapture ? 'valid-move' : ''}
      ${isValidCapture ? 'valid-capture' : ''}
      ${isLastMoveFrom ? 'last-move-from' : ''}
      ${isLastMoveTo ? 'last-move-to' : ''}`;
  };

  const getPieceSymbol = (type: string, color: string) => {
    const symbols: { [key: string]: string } = {
      wp: '♙', bp: '♟',
      wn: '♘', bn: '♞',
      wb: '♗', bb: '♝',
      wr: '♖', br: '♜',
      wq: '♕', bq: '♛',
      wk: '♔', bk: '♚'
    };
    return symbols[color + type] || '';
  };

  return (
    <div className="chessboard">
      {ranks.map(rank =>
        files.map(file => {
          const square: Square = (file + rank) as Square;
          const piece = board[square];
          return (
            <div
              key={square}
              className={getSquareClasses(square)}
              onClick={() => onSquareClick(square)}
              data-square={square}
            >
              {file === 'a' && <div className="coordinate rank">{rank}</div>}
              {rank === '1' && <div className="coordinate file">{file}</div>}

              {piece && (
                <div
                  className="piece"
                  style={{
                    backgroundImage: `url(/pieces/${piece.color}${piece.type}.svg)`,
                  }}
                  data-piece={`${piece.color}${piece.type}`}
                >
                  <span className="piece-fallback">
                    {getPieceSymbol(piece.type, piece.color)}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Chessboard;
