let curBoard = {
    board: "rnbqkbnrpppppppp00000000000000000000000000000000PPPPPPPPRNBQKBNR",
    meta: 0x0F0000,
  }
  
  function OnMouseDown(gameValues)
  {
    if (getWhiteToMove(curBoard.meta))
    {
      gameValues.playerWhite.OnMouseDown(gameValues);
    }
    else
    {
      gameValues.playerBlack.OnMouseDown(gameValues);
    }
  }
  
  function OnMouseUp(gameValues)
  {
    if (getWhiteToMove(curBoard.meta))
    {
      gameValues.playerWhite.OnMouseUp(gameValues);
    }
    else
    {
      gameValues.playerBlack.OnMouseUp(gameValues);
    }
  }
  
  function updateController(gameValues)
  {
    if (gameValues.gameOver) {
      drawBoard(curBoard.board, gameValues);
      return;
    }
    
    const curPlayer = getWhiteToMove(curBoard.meta) ? 
                      gameValues.playerWhite : gameValues.playerBlack;
    
    
    curPlayer.update(curBoard, gameValues);
    if (curPlayer.hasMove())
    {
      const action = curPlayer.getMove();
      curPlayer.clearMove();
      curBoard = takeAction(curBoard, action[0][0], action[0][1], action[1][0], action[1][1]);
      if (isTerminal(curBoard))
      {
        gameValues.gameOver = true;
        const result = utility(curBoard);
        if (result == -1) {
          print("Black won!");
        }
        else if (result == 1) {
          print("White won!");
        }
        else {
          print("Draw!")
        }
      }
    }
    
    
    drawBoard(curBoard.board, gameValues);
  }
  