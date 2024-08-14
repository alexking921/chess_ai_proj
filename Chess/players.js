function mouseOnBoard(gameValues)
{
  const x = mouseX;
  const y = mouseY;
  
  const left = gameValues.boardLeft;
  const right = left + 8*gameValues.cellSize;
  const top = gameValues.boardTop;
  const bottom = top + 8*gameValues.cellSize;
  
  return x > left && x < right && y > top && y < bottom;
}

function getMouseCell(gameValues)
{
  const x = mouseX - gameValues.boardLeft;
  const y = mouseY - gameValues.boardTop;
  
  const row = 7 - (int) (y / gameValues.cellSize);
  const col = (int) (x / gameValues.cellSize);
  
  return [row, col];
}

const addCellTint = (posX, posY, size, gameValues) => { 
  fill(186,202,68);
  square(posX, posY, size);
};
const addCellCaptured = (posX, posY, size, gameValues) => {
  image(gameValues.images.capture, posX, posY, size, size);
}
const addCellMove = (posX, posY, size, gameValues) => {
  image(gameValues.images.move, posX, posY, size, size);
}

const real_player =
{
  update(curBoard, gameValues) {
    let highlights = {};
    if (mouseOnBoard(gameValues))
    {
      const cell = getMouseCell(gameValues);
      const ind = cell[0]*8 + cell[1];
      if (canInteract(curBoard, cell[0], cell[1]) || ind in gameValues.cellEffects)
      {
        cursor(HAND);
      }
      else
      {
        cursor(ARROW);
      }
    }
  },
  
  move: null,
  selectedCell: [],
  
  hasMove() {
    return this.move != null
  },
  
  getMove() {
    return this.move;
  },
  
  clearMove() {
    this.move = null;
  },
  
  selectCell(gameValues, row, col) {
    this.selectedCell = [row, col];
    gameValues.cellEffects = {};
  
    let ind = row*8 + col;
    gameValues.cellEffects[ind] = addCellTint;
  
    const actions = getValidPieceActions(curBoard, row, col);
  
    if (typeof actions.forEach !== 'function') return;
    
    // actions of the format [row, col, capture] where capture is 0 if it's a move and 1 if it's a capture
    actions.forEach((action) => {
      if (action[2] === 1)
      {
        ind = action[0]*8 + action[1];
        gameValues.cellEffects[ind] = addCellCaptured;
      }
      else
      {
        ind = action[0]*8 + action[1];
        gameValues.cellEffects[ind] = addCellMove;
      }
    });
  },
  
  OnMouseDown(gameValues) {
    
  },
  
  OnMouseUp(gameValues) {
    if (!mouseOnBoard(gameValues))
    {
      return;
    }
  
    const cell = getMouseCell(gameValues);
    const ind = cell[0]*8 + cell[1];
  
    // default to selecting a new piece
    // then make a move if you can
    // otherwise deselect
    if (canInteract(curBoard, cell[0], cell[1]))
    {
      this.selectCell(gameValues, cell[0], cell[1]);
    }
    else if (ind in gameValues.cellEffects)
    {
      const cell0 = this.selectedCell;
      this.move = [[cell0[0], cell0[1]], [cell[0], cell[1]]];
      this.selectedCell = null;
      gameValues.cellEffects = {};
    }
    else
    {
      this.selectedCell = null;
      gameValues.cellEffects = {};
    }
  },  
}

const random_player =
{
  move: null,
  noMoves: false,
  
  update(_c, _g) {},
  
  hasMove() 
  {  
    if (this.move != null) return true;
    
    if (this.noMoves) return false;
    
    const isWhite = getWhiteToMove(curBoard.meta);
    this.move = this.pickRandMove(curBoard, isWhite);
    this.noMoves = this.move == null;
    
    return !this.noMoves;
  },
  
  getMove() { return this.move},
  
  clearMove() 
  {
    this.move = null;
    this.noMoves = false;
  },
  
  pickRandMove(board, isWhite)
  {
    let moves = getAllMoves(board, isWhite);
    
    if (moves.length == 0) return null;
    
    return moves[(int)(random(moves.length))];
  },
  
  OnMouseUp(_g) {},
  OnMouseDown(_g) {}
}

const gotta_take_it_player =
{
  move: null,
  noMoves: false,
  
  update(_c, _g) {},
  
  hasMove() 
  {  
    if (this.move != null) return true;
    
    if (this.noMoves) return false;
    
    const isWhite = getWhiteToMove(curBoard.meta);
    this.move = this.pickMove(curBoard, isWhite);
    this.noMoves = this.move == null;
    
    return !this.noMoves;
  },
  
  getMove() { return this.move},
  
  clearMove() 
  {
    this.move = null;
    this.noMoves = false;
  },
  
  pickMove(board, isWhite)
  {
    let moves = getAllMoves(board, isWhite);
    
    if (moves.length == 0) return null;
    
    let captureMoves = moves.filter((move) => {
      const row = move[1][0];
      const col = move[1][1];
      const ind = 8 * row + col;
      return (board.board[ind] != '0');
    });
    
    if (captureMoves.length > 0) {
      return captureMoves[(int)(random(captureMoves.length))];
    }
        
    return moves[(int)(random(moves.length))];
  },
  
  OnMouseUp(_g) {},
  OnMouseDown(_g) {}
}

const ab_simple_player =
{
  move: null,
  noMoves: false,
  
  update(_c, _g) {},
  
  hasMove() 
  {  
    if (this.move != null) return true;
    
    if (this.noMoves) return false;
    
    const isWhite = getWhiteToMove(curBoard.meta);
    this.move = alpha_beta_cuffoff(curBoard, (isWhite) ? point_eval_white : point_eval_black, bad_move_cutoff, 2);
    this.noMoves = this.move == null;
    
    return !this.noMoves;
  },
  
  getMove() { return this.move},
  
  clearMove() 
  {
    this.move = null;
    this.noMoves = false;
  },
  
  OnMouseUp(_g) {},
  OnMouseDown(_g) {}
}