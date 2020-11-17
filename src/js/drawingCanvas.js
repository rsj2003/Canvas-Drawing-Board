// canvas
const $canvasPage = document.getElementById("canvasPage");
const $drawingPage = document.getElementById("drawingPage");
const $undo = document.getElementById("undo");
const $redo = document.getElementById("redo");
let $canvas = document.getElementById("canvas");
let ctx = $canvas.getContext("2d");
let drawing = false;
let drawingSize = 5;
let drawingStyle = "line";
let strokeStyle = "round";
let drawingBlur = 0;
let drawingLine = new Array();
let drawingUndoList = new Array();
let drawingRedoList = new Array();
let loadDrawing = document.createElement("img");
let drawingOpacity = 1;
let drawingAlpha = "ff";
let penDrawing = false;
let canDrawing = true;
let selectCanvas = 0;
let layerPreviewImage = document.querySelectorAll(".previewImage");

// canvas drawing
function canvasFunction() {
  let reSize = Math.ceil(getComputedStyle($toolBar).getPropertyValue("width").replace(/px/gi, "") / window.innerWidth * 100) * 2;
  $drawingPage.style.width = `${95 - reSize}%`;
  $drawingPage.style.height = `${95 - reSize}%`;
  $canvasPage.style.width = `100%`;
  $canvasPage.style.height = `100%`;

  $canvas.width = 1200;
  $canvas.height = 600;

  $canvas.style.width = `${$canvas.width}px`;
  $canvas.style.height = `${$canvas.height}px`;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, $canvas.width, $canvas.height);
  layerPreviewImage[selectCanvas].setAttribute("src", canvas.toDataURL());

  document.addEventListener("click", e => {
    if(e.target === $undo) {
      canvasUndo();
    }
    if(e.target === $redo) {
      canvasRedo();
    }
    if(e.target === $canvas && drawingStyle === "floodFill" && canDrawing) {
      addPaletteHistory();
      drawingUndoList.push({url: canvas.toDataURL(), idx: selectCanvas});
      drawingRedoList = [];
      $redo.classList.remove("active");
      $undo.classList.add("active");
      drawingAlpha = Math.floor((drawingOpacity * 256) - 1);
      styleColor = $color.value.replace(/#/gi, "").split("");
      styleColor = [(styleColor[0] + styleColor[1]), (styleColor[2] + styleColor[3]), (styleColor[4] + styleColor[5])];
      styleColor = {r: parseInt(styleColor[0], 16), g: parseInt(styleColor[1], 16), b: parseInt(styleColor[2], 16), a: drawingAlpha};
      pageX = Math.round(e.offsetX / scale);
      pageY = Math.round(e.offsetY / scale);
      floodList = new Array();
      pageIdx = ((pageY * $canvas.width) + pageX) * 4;
      let data = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
      imageData = data.data;
      floodStartColor = {r: imageData[pageIdx], g: imageData[pageIdx + 1], b: imageData[pageIdx + 2], a: imageData[pageIdx + 3]};
      if(styleColor.r !== floodStartColor.r || styleColor.g !== floodStartColor.g || styleColor.b !== floodStartColor.b || styleColor.a !== floodStartColor.a){
        floodFill(pageX, pageY, styleColor);
      }
      layerPreviewImage[selectCanvas].setAttribute("src", canvas.toDataURL());
    }
    if(drawingStyle === "pen" && canDrawing) {
      if(e.target === $canvas &&!penDrawing) {
        penDrawing = true;
        brushReset(e);
        drawingLine = [{x: e.offsetX / scale, y: e.offsetY / scale}, {x: e.offsetX / scale, y: e.offsetY / scale}];
        ctx.moveTo(e.offsetX / scale, e.offsetY / scale);
        return;
      }
      let mouseX = (e.offsetX - pageX) / scale;
      let mouseY = (e.offsetY - pageY) / scale;
      drawingLine.push({x: mouseX, y: mouseY});
    }
  });

  document.addEventListener("dblclick", e => {
    if(drawingStyle === "pen" && penDrawing && canDrawing) drawingPenFinish(false);
  })

  document.addEventListener("mousewheel", e => {
    if(drawing === true) canvasMouseUp(e);
  })

  document.addEventListener("mousedown", e => {
    if(e.button === 0) {
      if(e.target === $canvas && drawingStyle !== "floodFill" && drawingStyle !== "pen" && canDrawing) {
        drawing = true;
        brushReset(e);
        drawingRedoList = [];
        $redo.classList.remove("active");
        $undo.classList.add("active");
        if(drawingStyle === "pixel") ctx.fillRect(e.offsetX / scale - (drawingSize / 2), e.offsetY / scale - (drawingSize / 2), drawingSize, drawingSize);
        if(drawingStyle === "circle") {
          ctx.arc(e.offsetX / scale, e.offsetY / scale, drawingSize / 2, 0, Math.PI * 2, false);
          ctx.fill();
        };
        if(drawingStyle === "line" || drawingStyle === "eraser" && canDrawing) {
          drawingLine = [{x: e.offsetX / scale, y: e.offsetY / scale}];
          ctx.moveTo(e.offsetX / scale, e.offsetY / scale);
          ctx.stroke();
        };
      };
    }else if(e.button === 2) {
      if(drawingStyle === "pen" && penDrawing && canDrawing) drawingPenFinish(true);
    }
  });

  document.addEventListener("mousemove", e => {
    if((drawing || penDrawing) && e.target === $page && canDrawing) {
      let mouseX = (e.offsetX - pageX) / scale;
      let mouseY = (e.offsetY - pageY) / scale;
      if(drawingStyle === "pixel") ctx.fillRect(mouseX - (drawingSize / 2), mouseY - (drawingSize / 2), drawingSize, drawingSize);
      if(drawingStyle === "circle") {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, drawingSize / 2, 0, Math.PI * 2, false);
        ctx.fill();
      };
      if(drawingStyle === "line" || drawingStyle === "eraser") {
        if(drawingStyle === "eraser") ctx.globalCompositeOperation = "source-over";
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
        ctx.filter = `blur(${drawingBlur}px)`;
        if(drawingStyle === "eraser") ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        drawingLine.push({x: mouseX, y: mouseY});
        drawingLine.forEach((i, l) => {
          if(l === 0) {
            ctx.moveTo(i.x, i.y);
            return;
          }
          ctx.lineTo(i.x, i.y);
        })
        ctx.stroke();
      };
      if(penDrawing) {
        mouseMovePen({x: mouseX, y: mouseY});
      }
    };
  });

  document.addEventListener("mouseup", e => {
    if(drawing && canDrawing) canvasMouseUp(e);
  });

  let maxWidth = $canvasPage.style.width.replace(/%/gi, "") * window.innerWidth / 100;
  let maxHeight = $canvasPage.style.height.replace(/%/gi, "") * window.innerHeight / 100;
  let width = Number($canvas.style.width.replace(/px/gi, ""));
  let height = Number($canvas.style.height.replace(/px/gi, ""));
  if(maxWidth < width || maxHeight < height) {
    $canvas.classList.remove("center");
    $canvasPage.scrollTo((width - maxWidth) / 2, (height - maxHeight) / 2);
    return;
  }
  $canvas.classList.add("center");
}

function brushReset(e) {
  if(drawingStyle !== "eraser") addPaletteHistory();
  drawingUndoList.push({url: canvas.toDataURL(), idx: selectCanvas});
  pageX = e.pageX - e.offsetX;
  pageY = e.pageY - e.offsetY;
  $toolBar.style.pointerEvents = "none";
  $colorBar.style.pointerEvents = "none";
  $drawingPage.style.pointerEvents = "none";
  ctx.lineJoin = "miter";
  ctx.lineCap = "butt";
  drawingAlpha = (drawingOpacity * 256).toString(16).split(".");
  if(drawingAlpha[0].length === 1) drawingAlpha[0] = "0" + drawingAlpha[0];
  if(drawingAlpha[0].length === 3) drawingAlpha[0] = "ff";
  ctx.fillStyle = $color.value + drawingAlpha[0];
  ctx.strokeStyle = $color.value + drawingAlpha[0];
  ctx.lineWidth = drawingSize;
  ctx.filter = `blur(${drawingBlur}px)`;
  loadDrawing.setAttribute("src", drawingUndoList[drawingUndoList.length - 1].url);
  if(strokeStyle === "round") {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }
}

function canvasMouseUp(e) {
  let img = document.createElement("img");
  img.setAttribute("src", drawingUndoList[drawingUndoList.length - 1].url);
  img.onload = function() {
    if(drawingStyle === "line" || drawingStyle === "eraser"){
      if(drawingStyle === "eraser") ctx.globalCompositeOperation = "source-over";
      ctx.filter = `blur(0px)`;
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
      ctx.filter = `blur(${drawingBlur}px)`;
      if(drawingStyle === "eraser") ctx.globalCompositeOperation = "destination-out";
      if(drawingLine.length !== 1) {
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
      }else {
        ctx.arc(drawingLine[0].x, drawingLine[0].y, drawingSize / 2, 0, Math.PI * 2, false);
        ctx.fill();
      }
    }
    $toolBar.style.pointerEvents = "";
    $colorBar.style.pointerEvents = "";
    ctx.globalCompositeOperation = "source-over";
    $drawingPage.style.pointerEvents = "";
    $undo.classList.add("active");
    drawing = false;
    ctx.beginPath();
    layerPreviewImage[selectCanvas].setAttribute("src", canvas.toDataURL());
  }
}

function drawingPenFinish(final) {
  let img = document.createElement("img");
  img.setAttribute("src", drawingUndoList[drawingUndoList.length - 1].url);
  drawingLine.pop();
  if(!final)drawingLine.pop();
  img.onload = function() {
    ctx.filter = `blur(0px)`;
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
    ctx.filter = `blur(${drawingBlur}px)`;
    ctx.beginPath();
    if(drawingLine.length <= 1) {
      drawingUndoList.pop();
      penDrawing = false;
      $toolBar.style.pointerEvents = "";
      $colorBar.style.pointerEvents = "";
      $drawingPage.style.pointerEvents = "";
      ctx.beginPath();
      return;
    }
    drawingRedoList = [];
    $redo.classList.remove("active");
    $undo.classList.add("active");
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
    $toolBar.style.pointerEvents = "";
    $colorBar.style.pointerEvents = "";
    $drawingPage.style.pointerEvents = "";
    $undo.classList.add("active");
    penDrawing = false;
    ctx.beginPath();
  }
  layerPreviewImage[selectCanvas].setAttribute("src", canvas.toDataURL());
}

function canvasUndo() {
  if(drawingUndoList.length > 0) {
    drawingRedoList.push({url: canvas.toDataURL(), idx: selectCanvas});
    $redo.classList.add("active");
    loadDrawing.setAttribute("src", drawingUndoList[drawingUndoList.length - 1].url);
    loadDrawing.onload = function() {
      ctx.filter = `blur(0px)`;
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
    }
    drawingUndoList.pop();
  }
  if(drawingUndoList.length <= 0) $undo.classList.remove("active");
}

function canvasRedo() {
  if(drawingRedoList.length > 0) {
    drawingUndoList.push({url: canvas.toDataURL(), idx: selectCanvas});
    $undo.classList.add("active");
    loadDrawing.setAttribute("src", drawingRedoList[drawingRedoList.length - 1].url);
    loadDrawing.onload = function() {
      ctx.filter = `blur(0px)`;
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
    }
    drawingRedoList.pop();
  }
  if(drawingRedoList.length <= 0) $redo.classList.remove("active");
}

function mouseMovePen(mouse = drawingLine[drawingLine.length - 1]) {
  ctx.filter = `blur(0px)`;
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
  ctx.filter = `blur(${drawingBlur}px)`;
  ctx.beginPath();
  if(pressShift){
    let x1 = drawingLine[drawingLine.length - 2].x;
    let y1 = drawingLine[drawingLine.length - 2].y;
    let x2 = mouse.x;
    let y2 = mouse.y;
    x2 = x1 - x2;
    y2 = y1 - y2;
    if(x2 < 0) x2 *= -1;
    if(y2 < 0) y2 *= -1;
    if(x2 > y2) drawingLine[drawingLine.length - 1] = {x: mouse.x, y: y1};
    if(x2 < y2) drawingLine[drawingLine.length - 1] = {x: x1, y: mouse.y};
    if(x2 === y2) drawingLine[drawingLine.length - 1] = {x: mouse.x, y: mouse.y};
  }else {
    drawingLine[drawingLine.length - 1] = {x: mouse.x, y: mouse.y};
  }
  drawingLine.forEach((i, l) => {
    if(l === 0) {
      ctx.moveTo(i.x, i.y);
      return;
    }
    ctx.lineTo(i.x, i.y);
  })
  ctx.stroke();
}