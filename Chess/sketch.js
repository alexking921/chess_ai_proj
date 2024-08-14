function loadImages()
{
  gameValues.images.p = loadImage("Assets/pawn_white.png");
  gameValues.images.P = loadImage("Assets/pawn_black.png");
  gameValues.images.r = loadImage("Assets/rook_white.png");
  gameValues.images.R = loadImage("Assets/rook_black.png");
  gameValues.images.n = loadImage("Assets/knight_white.png");
  gameValues.images.N = loadImage("Assets/knight_black.png");
  gameValues.images.b = loadImage("Assets/bishop_white.png");
  gameValues.images.B = loadImage("Assets/bishop_black.png");
  gameValues.images.q = loadImage("Assets/queen_white.png");
  gameValues.images.Q = loadImage("Assets/queen_black.png");
  gameValues.images.k = loadImage("Assets/king_white.png");
  gameValues.images.K = loadImage("Assets/king_black.png");
  gameValues.images.capture = loadImage("Assets/CapturePiece.png");
  gameValues.images.move = loadImage("Assets/MovePiece.png");
}

function setup() {
  createCanvas(512, 512);
  loadImages();
}

let gameValues = {
  boardLeft: 0,
  boardTop: 0,
  cellSize: 64,
  lightColor: [238, 238, 210],
  darkColor: [118,150,86],
  images: {},
  selectedCell: null,
  cellEffects: {},
  gameOver: false,
  playerWhite: real_player,
  playerBlack: gotta_take_it_player,
}

let mouseWasPressed = false;

function draw() {
  background(0);
  
  if (mouseIsPressed != mouseWasPressed)
  {
    if (mouseWasPressed)
    {
      OnMouseUp(gameValues);
    }
    else
    {
      OnMouseDown(gameValues);
    }
    mouseWasPressed = mouseIsPressed;
  }
  
  updateController(gameValues);
}