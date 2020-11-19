const $page = document.getElementById("page");
const $popBackground = document.getElementById("popBackground");
const lockKey = [16,17,18,32,33,34,35,36,37,38,39,40,45,46,112,113,114,115,116,117,118,119,120,121,122,123];
let x = 0;
let oldX = 0;
let y = 0;
let oldY = 0;
let mouseDown = false;
let dragX = false;
let dragY = false;
let pageX = 0;
let pageY = 0;
let pressShift = false;
let pressCtrl = false;
let pressSpace = false;

function init() {
  const loading = document.getElementById("loadingPage");

  paletteFunction();
  canvasFunction();
  brushToolBarFunction();
  eventListener();
  canvasZoom();
  pageMouseMoveEvent();
  layerFunction();

  setTimeout(_ => {
    loading.style.opacity = 0;
    setTimeout(_ => loading.remove(), 500);
  },1000);  
};

function eventListener() {
  document.addEventListener("contextmenu", e => {
    e.preventDefault();
    return false;
  });
  document.addEventListener("keydown", e => {
    if(lockKey.indexOf(e.keyCode) > -1) e.preventDefault();
    switch(e.key.toLowerCase()) {
      case "shift" : pressShift = true; break;
      case "control" : pressCtrl = true; break;
      case " " : pressSpace = true; break;
    }
    pageMouseMove();
    if(penDrawing) {
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
      mouseMovePen();
    }
  })
  document.addEventListener("keydown", e => {
    if(e.key.toLowerCase() === "z" && pressCtrl && canDrawing) {
      if(pressShift && !drawing && !penDrawing) {
        canvasRedo();
      }
      if(!pressShift && !drawing && !penDrawing) {
        canvasUndo();
      }
      if(!pressShift && !drawing && penDrawing) {
        let img = document.createElement("img");
        img.setAttribute("src", drawingUndoList[drawingUndoList.length - 1].url);
        drawingLine.splice(-2, 1);
        img.onload = function() {
          ctx.filter = `blur(0px)`;
          ctx.clearRect(0, 0, $canvas.width, $canvas.height);
          ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
          ctx.filter = `blur(${drawingBlur}px)`;
          ctx.beginPath();
          if(drawingLine.length <= 1) {
            penDrawing = false;
            $toolBar.style.pointerEvents = "";
            $colorBar.style.pointerEvents = "";
            $drawingPage.style.pointerEvents = "";
            return;
          }
          for(let i = 0; i < drawingLine.length; i++) {
            const moveX = drawingLine[i].x;
            const moveY = drawingLine[i].y;
            if(i === 0) {
              ctx.moveTo(moveX, moveY);
            }else{  
              ctx.lineTo(moveX, moveY);
            }
          }
          ctx.stroke();
        }
      }
    }
    if(e.key === "Escape" && drawingStyle === "pen" && penDrawing && canDrawing) drawingPenFinish(true);
  })
  document.addEventListener("keyup", e => {
    switch(e.key.toLowerCase()) {
      case "shift" : pressShift = false; break;
      case "control" : pressCtrl = false; break;
      case " " : pressSpace = false; break;
      case "z" : drawingRecord = false; break;
    }
    pageMouseMove();
  })
  // document.addEventListener("mousewheel", e => {
    // e.preventDefault();
    // e.stopPropagation();
    // return false;
  // })
}

function nextHex() {
  let result = "#";
  if(colorNumber[order[0]] === 15 && colorNumber[order[1]] < 15 && colorNumber[order[2]] === 0) {
    colorNumber[order[1]]++;
  }else if(colorNumber[order[0]] > 0 && colorNumber[order[1]] === 15 && colorNumber[order[2]] === 0) {
    colorNumber[order[0]]--;
  }else if(colorNumber[order[1]] === 15 && colorNumber[order[2]] < 15 && colorNumber[order[0]] === 0) {
    colorNumber[order[2]]++;
  }else if(colorNumber[order[1]] > 0 && colorNumber[order[2]] === 15 && colorNumber[order[0]] === 0) {
    colorNumber[order[1]]--;
  }else if(colorNumber[order[2]] === 15 && colorNumber[order[0]] < 15 && colorNumber[order[1]] === 0) {
    colorNumber[order[0]]++;
  }else if(colorNumber[order[2]] > 0 && colorNumber[order[0]] === 15 && colorNumber[order[1]] === 0) {
    colorNumber[order[2]]--;
  };
  result += hex[colorNumber[0]];
  result += hex[colorNumber[1]];
  result += hex[colorNumber[2]];
  return result;
};

function getIdx(e) {
  let i = 0;
  while((e = e.previousSibling) !== null) i++;

  return i;
};

function hasClass(element, className) {
  return element.classList.contains(className);
};

function setHex(hex) {
  hex = hex.replace(/#/gi, "");
  let hexCode = hex = hex.split("");
  switch(hexCode.length) {
    case 6 : return `#${hexCode[0]}${hexCode[1]}${hexCode[2]}${hexCode[3]}${hexCode[4]}${hexCode[5]}`;
    case 5 : return `#${hexCode[0]}${hexCode[1]}${hexCode[2]}${hexCode[3]}${hexCode[4]}${hexCode[4]}`;
    case 4 : return `#${hexCode[0]}${hexCode[1]}${hexCode[2]}${hexCode[2]}${hexCode[3]}${hexCode[3]}`;
    case 3 : return `#${hexCode[0]}${hexCode[0]}${hexCode[1]}${hexCode[1]}${hexCode[2]}${hexCode[2]}`;
    case 2 : return `#${hexCode[0]}${hexCode[0]}${hexCode[1]}${hexCode[1]}${hexCode[1]}${hexCode[1]}`;
    case 1 : return `#${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}`;
    case 0 : return `#000000`;
  }
};


window.onload = init();