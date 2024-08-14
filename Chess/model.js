function getWhiteToMove(boardMeta)
{
  return (boardMeta & 0x100000) == 0;
}

const whitePieces = ['p', 'r', 'n', 'b', 'q', 'k'];
const blackPieces = ['P', 'R', 'N', 'B', 'Q', 'K'];

function canInteract(board, row, col)
{
  const ind = row * 8 + col;
  const piece = board.board[ind];
  if (getWhiteToMove(board.meta))
  {
    if (whitePieces.includes(piece))
    {
      return true;
    }
  }
  else
  {
    if (blackPieces.includes(piece))
    {
      return true;
    }
  }
  
  return false;
}

function getValidPieceActions(board, row, col)
{
  const isWhite = isWhitePiece(board, row, col);
  const possible_moves = getPieceActions(board, row, col);
  const move_entries = Object.keys(possible_moves);
  let valid_moves = move_entries.filter((move_ind) => {
    const move_row = (int)(move_ind / 8);
    const move_col = move_ind - move_row*8;
    return !isInCheck(takeAction(board, row, col, move_row, move_col), isWhite);
  }).map((move_ind) => {
    const move_row = (int)(move_ind / 8);
    const move_col = move_ind - move_row*8;
    return [move_row, move_col, possible_moves[move_ind]];
  })
  
  return valid_moves;
}

function isTerminal(board)
{
  const isWhite = getWhiteToMove(board.meta);
  
  const moves = board.moves || getAllMoves(board, isWhite);
  
  if (moves.length == 0) return true;
  
  let whitePieces = 0; 
  [...board.board].forEach((cell) => {
    if (isPieceCharOfColor(cell, true)) {
      whitePieces += 1;
    }
  });
  
  let blackPieces = 0;
  [...board.board].forEach((cell) => {
    if (isPieceCharOfColor(cell, false)) {
      blackPieces += 1;
    }
  });
  
  if (whitePieces == 1 && blackPieces == 1) return true;
  
  return false;
}

// 1: white win, 0: draw, -1: black win
function utility(board)
{
  const isWhite = getWhiteToMove(board.meta);
  
  if (isInCheck(board, isWhite))
  {
    return isWhite ? -1 : 1;
  }
  else if (isInCheck(board, !isWhite))
  {
    return isWhite ? 1 : -1;
  }
  
  return 0;
}
