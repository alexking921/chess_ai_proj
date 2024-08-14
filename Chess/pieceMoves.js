function inBounds(row, col)
{
  return (row >= 0 && row < 8) && (col >= 0 && col < 8);
}

function hasPiece(board, row, col)
{
  const ind = row*8 + col;
  if (!inBounds(row, col)) return false;
  return board.board[ind] != '0';
}

function isWhitePiece(board, row, col)
{
  const ind = row*8 + col;
  if (!inBounds(row, col)) return false;
  return whitePieces.includes(board.board[ind]);
}

function isBlackPiece(board, row, col)
{
  const ind = row*8 + col;
  if (!inBounds(row, col)) return false;
  return blackPieces.includes(board.board[ind]);
}

function isPieceOfColor(board, row, col, isWhite)
{
  return hasPiece(board, row, col) && (isWhitePiece(board, row, col) == isWhite);
}

function isPieceCharOfColor(piece, isWhite)
{
  if (piece == '0') return false;
  return (piece.toLowerCase() === piece) == isWhite;
}

function isPieceWhite(piece)
{
  if (piece == '0') return false;
  return piece.toLowerCase() === piece;
}

function bitAnd1(a, shift)
{
  if (shift > 31)
  {
    return [0x0, a[1] & (1 << (shift - 32))];
  }
  
  return [a[0] & (1 << shift), 0x0];
}

function bitOr1(a, shift)
{
  if (shift > 31)
  {
    return [a[0], a[1] | (1 << (shift - 32))];
  }
  
  return [a[0] | (1 << shift), a[1]];
}

function getAttackBitBoard(board, isWhite)
{
  let bitboard = [0x0, 0x0];
  
  [...board.board].forEach((cell, ind) => {
    if (isPieceCharOfColor(cell, isWhite))
    {
      const row = (int)(ind / 8);
      const col = ind % 8;
      const moves = getPieceActions(board, row, col, false);
      
      Object.keys(moves).forEach((move) => {
        if (moves[move])
        {
          bitboard = bitOr1(bitboard, move);
        }
      });
    }
  });
  
  return bitboard;
}

// will return false if board has king in check for the color specified
function isInCheck(board, isWhite)
{
  const attackBitBoard = getAttackBitBoard(board, !isWhite);
  const ind = isWhite ? board.board.indexOf('k') : board.board.indexOf('K');
  const result = bitAnd1(attackBitBoard, ind);
  return (result[0] || result[1]);
}

function isBeingAttacked(board, row, col, byWhite)
{
  const attackBitBoard = getAttackBitBoard(board, isWhite);
  let ind = row*8 + col;
  const result = bitAnd1(attackBitBoard, ind);
  return (result[0] || result[1]);
}

function inStartingPosition(piece, row, col)
{
  switch (piece)
  {
    case 'p':
      return row == 1;
    case 'P':
      return row == 6;
    case 'r':
      return row == 0 && (col == 0 || col == 7);
    case 'R':
      return row == 7 && (col == 0 || col == 7);
    case 'n':
      return row == 0 && (col == 1 || col == 6);
    case 'N':
      return row == 7 && (col == 1 || col == 6);
    case 'b':
      return row == 0 && (col == 2 || col == 5);
    case 'B':
      return row == 7 && (col == 2 || col == 5);
    case 'q':
      return row == 0 && col == 3;
    case 'Q':
      return row == 7 && col == 3;
    case 'k':
      return row == 0 && col == 4;
    case 'K':
      return row == 7 && col == 4;
  }
  
  return false;
}
  
function getPieceActions(board, row, col, checkCastle = true)
{
  const ind = row*8 + col;
  const piece = board.board[ind];
  
  if (!whitePieces.includes(piece) && !blackPieces.includes(piece)) { return {}; }
  
  const isWhite = whitePieces.includes(piece);
  
  switch (piece.toLowerCase())
  {
    case 'p':
      return getPawnMoves(board, row, col, isWhite);
    case 'r':
      return getRookMoves(board, row, col, isWhite);
    case 'n':
      return getKnightMoves(board, row, col, isWhite);
    case 'b':
      return getBishopMoves(board, row, col, isWhite);
    case 'q':
      return getQueenMoves(board, row, col, isWhite);
    case 'k':
      return getKingMoves(board, row, col, isWhite, checkCastle);
  }
  
  return {};
}

function getAllMoves(board, isWhite)
{
  if (board.moves) return board.moves;

  let moves = [];
  [...board.board].forEach((cell, ind) => {
    if (isPieceCharOfColor(cell, isWhite))
    {
      const row = (int)(ind / 8);
      const col = ind % 8;
      const newMoves = getValidPieceActions(board, row, col).map((move) => [[row, col], move]);
      moves = [
        ...moves,
        ...newMoves,
      ];
    }
  });
  
  board.moves = moves;
  return moves;
}
  
function getPawnMoves(board, row, col, isWhite)
{
  let moves = {};
  
  if (isWhite)
  {
    if (!hasPiece(board, row+1, col))
    {
      moves[8*(row+1) + col] = 0;
      if (row == 1 && !hasPiece(board, row+2, col))
      {
        moves[8*(row+2) + col] = 0;
      }
    }
    
    if (isBlackPiece(board, row+1, col+1))
    {
      moves[8*(row+1) + col + 1] = 1;
    }
    
    if (isBlackPiece(board, row+1, col-1))
    {
      moves[8*(row+1) + col - 1] = 1;
    }
    
    if (row == 4) // check for en passant
    {
      // use bit shift to test en passant to left and right
      if (col > 0  && (board.meta & (1 << (7 - col + 1)))) // left
      {
        moves[8*(row+1) + col - 1] = 1;
      }
      if (col < 7 && (board.meta & (1 << (7 - col - 1)))) // right
      {
        moves[8*(row+1) + col + 1] = 1;
      }
    }
  }
  else
  {
    if (!hasPiece(board, row-1, col))
    {
      moves[8*(row-1) + col] = 0;
      if (row == 6 && !hasPiece(board, row-2, col))
      {
        moves[8*(row-2) + col] = 0;
      }
    }
    
    if (isWhitePiece(board, row-1, col+1))
    {
      moves[8*(row-1) + col + 1] = 1;
    }
    
    if (isWhitePiece(board, row-1, col-1))
    {
      moves[8*(row-1) + col - 1] = 1;
    }
    
    if (row == 3) // check for en passant
    {
      // use bit shift to test en passant to left and right
      // plus 8 to get to white en passant values
      if (col > 0  && (board.meta & (1 << (8 + 7 - col + 1)))) // left
      {
        moves[8*(row-1) + col - 1] = 1;
      }
      if (col < 7 && (board.meta & (1 << (8 + 7 - col - 1)))) // right
      {
        moves[8*(row-1) + col + 1] = 1;
      }
    }
  }
  
  return moves;
}

function getRookMoves(board, row, col, isWhite)
{
  let row1;
  let col1;
  let moves = [];
  
  // move down until we hit a piece or boundary
  col1 = col;
  for (row1 = row - 1; row1 >= 0; row1--)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, row1, col1, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, row1, col1))
    {
      moves[8*(row1)+col1] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(row1)+col1] = 0;
  }
  
  // move right until we hit a piece or boundary
  row1 = row;
  for (col1 = col + 1; col1 <= 7; col1++)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, row1, col1, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, row1, col1))
    {
      moves[8*(row1)+col1] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(row1)+col1] = 0;
  }
  
  // move up until we hit a piece or boundary
  col1 = col;
  for (row1 = row + 1; row1 <= 7; row1++)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, row1, col1, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, row1, col1))
    {
      moves[8*(row1)+col1] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(row1)+col1] = 0;
  }
  
  // move left until we hit a piece or boundary
  row1 = row;
  for (col1 = col - 1; col1 >= 0; col1--)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, row1, col1, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, row1, col1))
    {
      moves[8*(row1)+col1] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(row1)+col1] = 0;
  }
  
  return moves;
}

function getKnightMoves(board, row, col, isWhite)
{
  const offsets = [-2, -1, 1, 2];
  let moves = {};
  
  for (let rowOffset = -2; rowOffset <= 2; rowOffset++)
  {
    if (rowOffset == 0) continue;
    for (let colOffset = -2; colOffset <= 2; colOffset++)
    {
      if (colOffset == 0 || abs(rowOffset) == abs(colOffset)) continue;
      
      const newRow = row + rowOffset;
      const newCol = col + colOffset;
      
      if (!inBounds(newRow, newCol)) continue;
      if (isPieceOfColor(board, newRow, newCol, isWhite)) continue;
      
      if (hasPiece(board, newRow, newCol))
      {
        moves[8*(newRow)+newCol] = 1;
      }
      else
      {
        moves[8*(newRow)+newCol] = 0;
      }
    }
  }
  
  return moves;
}

function getBishopMoves(board, row, col, isWhite)
{
  let moves = {};
  
  let newRow;
  let newCol;
  
  // first go up left
  for (newRow = row+1, newCol = col-1; newRow <= 7 && newCol >= 0; newRow++, newCol--)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, newRow, newCol, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, newRow, newCol))
    {
      moves[8*(newRow)+newCol] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(newRow)+newCol] = 0;
  }
  
  // go up right
  for (newRow = row+1, newCol = col+1; newRow <= 7 && newCol <= 7; newRow++, newCol++)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, newRow, newCol, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, newRow, newCol))
    {
      moves[8*(newRow)+newCol] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(newRow)+newCol] = 0;
  }
  
  // go down right
  for (newRow = row-1, newCol = col+1; newRow >= 0 && newCol <= 7; newRow--, newCol++)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, newRow, newCol, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, newRow, newCol))
    {
      moves[8*(newRow)+newCol] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(newRow)+newCol] = 0;
  }
  
  // go down left
  for (newRow = row-1, newCol = col-1; newRow >= 0 && newCol >= 0; newRow--, newCol--)
  {
    // stop if we hit piece of the same color
    if (isPieceOfColor(board, newRow, newCol, isWhite))
    {
      break;
    }
    
    // stop if we hit piece of opposite color, but add it to moves
    if (hasPiece(board, newRow, newCol))
    {
      moves[8*(newRow)+newCol] = 1;
      break;
    }
    
    // else add it as a regular move
    moves[8*(newRow)+newCol] = 0;
  }
  
  return moves;
}

function getQueenMoves(board, row, col, isWhite)
{
  return {
    ...getBishopMoves(board, row, col, isWhite),
    ...getRookMoves(board, row, col, isWhite)
  };
}

function getKingMoves(board, row, col, isWhite, checkCastle=true)
{
  let moves = {};
  
  let offsets = [-1, 0, 1];
  
  // basic king movement
  for (let rowOffset = -1; rowOffset <= 1; rowOffset++)
  {
    for (let colOffset = -1; colOffset <= 1; colOffset++)
    {
      if (rowOffset == 0 && colOffset == 0) continue;
      
      const newRow = row + rowOffset;
      const newCol = col + colOffset;
      
      if (!inBounds(newRow, newCol)) continue;
      if (isPieceOfColor(board, newRow, newCol, isWhite)) continue;
      
      if (hasPiece(board, newRow, newCol))
      {
        moves[8*(newRow)+newCol] = 1;
      }
      else
      {
        moves[8*(newRow)+newCol] = 0;
      }
    }
  }
  
  // if we don't want to recurse then ignore castling
  if(!checkCastle)
  {
    return moves;
  }
  
  // check for castling
  if (isWhite)
  {
    // check left white castle
    if (board.meta & 0x80000)
    {
      if (!hasPiece(board, 0, 2) && !hasPiece(board, 0, 3) &&
          !isInCheck(board, true) &&
          !isInCheck(takeAction(board, 0, 4, 0, 3, false), true))
      {
        moves[2] = 0;
      }
    }
    
    // right white castle
    if (board.meta & 0x40000)
    {
      if (!hasPiece(board, 0, 5) && !hasPiece(board, 0, 6) &&
          !isInCheck(board, true) &&
          !isInCheck(takeAction(board, 0, 4, 0, 5, false), true))
      {
        moves[6] = 0;
      }
    }
  }
  else
  {
    // left black castle
    if (board.meta & 0x20000)
    {
      if (!hasPiece(board, 7, 2) && !hasPiece(board, 7, 3) &&
          !isInCheck(board, true) &&
          !isInCheck(takeAction(board, 7, 4, 7, 3, false), false))
      {
        moves[7*8 + 2] = 0;
      }
    }
    
    // right black castle
    if (board.meta & 0x10000)
    {
      if (!hasPiece(board, 7, 5) && !hasPiece(board, 7, 6) &&
          !isInCheck(board, true) &&
          !isInCheck(takeAction(board, 7, 4, 7, 5, false), false))
      {
        moves[7*8 + 6] = 0;
      }
    }
  }
  
  return moves;
}

function takeAction(board, row0, col0, row1, col1)
{
  let newBoard = {
    board: board.board,
    meta: board.meta & 0x0F0000, // clear en passant and turn metadata, since it resets every move
    moves: null,
  }
  
  let boardArray = board.board.split('');
  
  const fromInd = row0*8 + col0;
  const toInd = row1*8 + col1;
  
  const piece = board.board[fromInd];
  const takenPiece = board.board[toInd];
  const whiteMove = isPieceWhite(piece);
  
  boardArray[fromInd] = '0';
  boardArray[toInd] = piece;
  
  // special cases that affect other pieces:
  //  1: castling
  const rowMove = abs(row1 - row0);
  const colMove = abs(col1 - col0);
  if (piece.toLowerCase() == 'k' && colMove >= 2)
  {
    if (col1 > col0) // castling to the right
    {
      boardArray[row1*8 + 7] = '0'; // remove the rook
      boardArray[row1*8 + col1 - 1] = whiteMove ? 'r' : 'R'; // move left of king
    }
    else // castle to the left
    {
      boardArray[row1*8] = '0'; // remove the rook
      boardArray[row1*8 + col1 + 1] = whiteMove ? 'r' : 'R'; // move right of king
    }
  }
  
  // 2: en passant capture, a diagaonal pawn move into empty space behind pawn
  if (piece.toLowerCase() == 'p' && takenPiece == '0' &&
      (rowMove == 1 && colMove == 1))
  {
    boardArray[row0*8 + col1] = '0'; // move space beind pawn;
  }
  
  // now moves that affect the metadata
  //  1: king moves, no more castling
  if (piece.toLowerCase() == 'k')
  {
    if (whiteMove)
    {
      // remove the 2 bits that enable white castling
      newBoard.meta &= 0xF3FFFF; // 3 = 0011
    }
    else
    {
      // remove the 2 bits that enable black castling
      newBoard.meta &= 0xFCFFFF; // C (12) = 1100
    }
  }

  // 2: rook captures and captuers, no more castling
  if (toInd == 0 || fromInd == 0) // bottom left
  {
    // remove bit that enables white left castle
    newBoard.meta &= 0xF7FFFF; // 7 = 0111
  }
  else if (toInd == 7 || fromInd == 7) // bottom right
  {
    // remove bit that enables white right castle
    newBoard.meta &= 0xFBFFFF; // B (11) = 1011
  }
  else if (toInd == 56 || fromInd == 56) // top left
  {
    // remove bit that enables black left castle
    newBoard.meta &= 0xFDFFFF; // D (13) = 1101
  }
  else if (toInd == 63 || fromInd == 63) // top right
  {
    // remove bit that enables black right castle
    newBoard.meta &= 0xFEFFFF; // E (14) = 1110
  }
  
  //  3: pawn moves, may enable an en passant
  if (piece.toLowerCase() == 'p' && rowMove == 2)
  {
    let shift = 7 - col0; // how much we need to shift bit over to get to right bit position
    if (whiteMove) shift += 8; // since white en passant bits are first
    newBoard.meta |= 1 << shift;
  }
  
  //  4: pawn promotion, automatically to queen. Fight me about it
  if (piece.toLowerCase() == 'p' && (row1 == 0 || row1 == 7))
  {
      boardArray[toInd] = whiteMove ? 'q' : 'Q';
  }
  
  // finally, change the turn
  if (whiteMove) newBoard.meta |= 0x100000; // the one bit there means black move
  
  newBoard.board = boardArray.join('');
  
  return newBoard;
}
