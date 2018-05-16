var c = document.getElementById('myCanvas');
var ctx = c.getContext('2d');
var CANVAS_BORDER_WIDTH = window.getComputedStyle(c).borderWidth.slice(0,-2) - 0;

var db = document.getElementById('displayBox');


var ROWS = 20;
var COLUMNS = 20;
var CELL_SIDE = 4;

var DRAW_BORDERS = false;

var running = true;
startGame();

var KEY_H = 72;
var KEY_J = 74;
var KEY_K = 75;
var KEY_P = 80;
var KEY_R = 82;

var DEAD = 0;
var ALIVE = 1;

var BORN = [6,3];
var STAYS_ALIVE = [2,3];

var REFRESH_RATE = 10;

var grids = {
  testGrid:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
};

var grid1 = new Grid(makeBlankGrid(120,170));


// grid1.update();
drawEverything();
var counter = 0;
window.requestAnimationFrame(refresh);

document.addEventListener('click', function(evt){createLife(evt);});

document.addEventListener('keydown', function(evt){
  var keyCode = evt.keyCode;
  if(keyCode === KEY_P){
    if(running) stopGame();
    else startGame();
  }
  else if(keyCode === KEY_H){
    DRAW_BORDERS = !DRAW_BORDERS;
    drawEverything();
  }
  else if(keyCode === KEY_J){
    speedUp(5);
  }
  else if(keyCode === KEY_K){
    speedUp(-5);
  }
  else if(keyCode === KEY_R){
    runGame();
  }
});

function Grid(gridIn){
  this.grid = gridIn;
  this.rows = this.grid.length;
  this.columns = this.grid[0].length;

  this.update = function(){
    var tempGrid = [];
    for(var i = 0; i < this.rows; i++){
      tempGrid.push(this.grid[i].slice());
    }
    for(i = 0; i < tempGrid.length; i++){
      for(var j = 0; j < tempGrid[i].length; j++){
        if(tempGrid[i][j] === DEAD){
          if(meetsRequirements(numLivingNeighbors(tempGrid,i,j),BORN)){
            this.grid[i][j] = ALIVE;
          }
        }
        else{ //tempGrid[i][j].state === ALIVE
          if(!meetsRequirements(numLivingNeighbors(tempGrid,i,j),STAYS_ALIVE)){
            this.grid[i][j] = DEAD;
          }
        }
      }
    }
  };

  this.draw = function(){
    for(var i = 0; i < this.rows; i++){
      for(var j = 0; j < this.columns; j++){
        var tempX = j * CELL_SIDE;
        var tempY = i * CELL_SIDE;
        if(this.grid[i][j] === ALIVE){
          ctx.fillRect(tempX, tempY, CELL_SIDE, CELL_SIDE);
        }
        else if(DRAW_BORDERS){
          ctx.beginPath();
          ctx.rect(tempX, tempY, CELL_SIDE, CELL_SIDE);
          ctx.stroke();
        }
      }
    }
  };
}

function Cell(rowIn, columnIn, stateIn){
  this.row = rowIn;
  this.column = columnIn;
  this.state = stateIn;

  this.draw = function(){
    var tempX = this.column * CELL_SIDE;
    var tempY = this.row * CELL_SIDE;
    if(this.state === ALIVE){
      ctx.fillRect(tempX, tempY, CELL_SIDE, CELL_SIDE);
    }
    else{
      ctx.beginPath();
      ctx.rect(tempX, tempY, CELL_SIDE, CELL_SIDE);
      ctx.stroke();
    }
  };
}

function populate(gridIn){
  var tempGrid = gridIn;
  for(var i = 0; i < tempGrid.length; i++){
    for(var j = 0; j < tempGrid[i].length; j++){
      tempGrid[i][j] = new Cell(i, j, tempGrid[i][j]);
    }
  }
  return tempGrid;
}

function createLife(evt){
  var mousePos = getMousePosInCanvas(c, evt);
  var lifePosX = Math.floor(mousePos.x / CELL_SIDE);
  var lifePosY = Math.floor(mousePos.y / CELL_SIDE);
  grid1.grid[lifePosY][lifePosX] = (grid1.grid[lifePosY][lifePosX] === ALIVE ? DEAD : ALIVE);
  drawEverything();
}

/*This function returns the mouse x and y coordinates in
**the form of an array. These coordinates are the
**coordinates relative to the top, left corner of the
**canvas.
*/
function getMousePosInCanvas(c, evt) {
  var rect = c.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left - CANVAS_BORDER_WIDTH,
    y: evt.clientY - rect.top - CANVAS_BORDER_WIDTH
  };
}

function refresh(){
  if(counter % REFRESH_RATE === 0 && running){
    runGame();
  }
  counter++;
  window.requestAnimationFrame(refresh);
}

function runGame(){
  grid1.update();
  drawEverything();
}

function drawEverything(){
  clearCanvas();
  grid1.draw();
}

function clearCanvas(){
  ctx.clearRect(0,0,c.width,c.height);
}

function numLivingNeighbors(grid, row, column){
  var numLiving = 0;
  numLiving += stateOfCell(grid, row-1, column-1);
  numLiving += stateOfCell(grid, row-1, column);
  numLiving += stateOfCell(grid, row-1, column+1);
  numLiving += stateOfCell(grid, row, column-1);
  numLiving += stateOfCell(grid, row, column+1);
  numLiving += stateOfCell(grid, row+1, column-1);
  numLiving += stateOfCell(grid, row+1, column);
  numLiving += stateOfCell(grid, row+1, column+1);
  return numLiving;
}

function stateOfCell(grid, row, column){
  try{
    if(grid[row][column] === ALIVE)return 1;
    else return 0;
  }
  catch(e){
    return 0;
  }
}

function meetsRequirements(numberIn, requirements){
  for(var i = 0; i < requirements.length; i++){
    if(numberIn === requirements[i]) return true;
  }
  return false;
}

function startGame(){
  running = true;
  db.innerHTML = 'Running. P to stop.';
}

function stopGame(){
  running = false;
  db.innerHTML = 'Game Paused. P to play.';
}

function makeBlankGrid(numRows, numColumns){
  var gridOut = [];
  for(var i = 0; i < numRows; i++){
    gridOut.push([]);
    for(var j = 0; j < numColumns; j++){
      gridOut[i].push(0);
    }
  }
  return gridOut;
}

function speedUp(incrementIn){
  REFRESH_RATE += incrementIn;
}


// SA
