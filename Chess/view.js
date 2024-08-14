/*
Board representation:
{
  //file: a b c d e f g h | rank:
  //   --------------------
  board: "r n b q k b n r | 1
          p p p p p p p p | 2 
          0 0 0 0 0 0 0 0 | 3
          0 0 0 0 0 0 0 0 | 4
          0 0 0 0 0 0 0 0 | 5
          0 0 0 0 0 0 0 0 | 6
          P P P P P P P P | 7
          R N B Q K B N R"| 8
  metadata: 0x0F0000
  //     0                         1111 
  // white's move , black/white castle left/right
  
  // 00000000 00000000
  // white pawns & black pawns can be taken with en passant
}
*/

function cellUL(row, col, gameValues)
{
  return [gameValues.boardLeft + col*gameValues.cellSize, gameValues.boardTop + (7 - row)*gameValues.cellSize];
}

// draws a board from its string representation
// board: string representing board state (see top of file)
// effects: array of effects to be added on board cells
// gameValues: object with necessary values stored in it
function drawBoard(board, gameValues)
{
  // first draw the checkerboard pattern
  noStroke();
  for (let row = 0; row < 8; row++)
  {
    for (let col = 0; col < 8; col++)
    {
      const ind = row*8 + col;
      let effect = (posX, posY, size, gameValues) => {};
      if (ind in gameValues.cellEffects)
      {
        effect = gameValues.cellEffects[ind];   
      }
      drawCell(row, col, board[row*8 + col], effect, gameValues);
    }
  }
}

function drawCell(row, col, piece, effect, gameValues)
{
  const color = (row + col) % 2 == 0 ? gameValues.lightColor : gameValues.darkColor;
  const coords = cellUL(row, col, gameValues);
  fill(color[0], color[1], color[2]);
  square(coords[0], coords[1], gameValues.cellSize);
  
  effect(coords[0], coords[1], gameValues.cellSize, gameValues);
  
  if (piece in gameValues.images)
  {
    image(gameValues.images[piece], coords[0], coords[1], gameValues.cellSize, gameValues.cellSize);
  }
}