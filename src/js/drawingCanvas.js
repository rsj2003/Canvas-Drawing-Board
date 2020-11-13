// canvas
const $canvas = document.getElementById("canvas");
const $canvasPage = document.getElementById("canvasPage");
const $undo = document.getElementById("undo");
const $redo = document.getElementById("redo");
const ctx = $canvas.getContext("2d");
let drawing = false;
let drawingSize = 5;
let drawingStyle = "line";
let strokeStyle = "";
let drawingBlur = 0;
let drawingLine = new Array();
let drawingUndoList = new Array();
let drawingRedoList = new Array();
let loadDrawing = document.createElement("img");
let drawingOpacity = 1;
let drawingAlpha = "ff";
let penDrawing = false;

// canvas drawing
function canvasFunction() {
  let reSize = Math.ceil(getComputedStyle($toolBar).getPropertyValue("width").replace(/px/gi, "") / window.innerWidth * 100) * 2;
  $canvasPage.style.width = `${90 - reSize}%`;
  $canvasPage.style.height = `${90 - reSize}%`;

  document.addEventListener("click", e => {
    if(e.target === $undo) {
      if(drawingUndoList.length > 0) {
        drawingRedoList.push(canvas.toDataURL());
        $redo.classList.add("active");
        loadDrawing.setAttribute("src", drawingUndoList[drawingUndoList.length - 1]);
        loadDrawing.onload = function() {
          ctx.filter = `blur(0px)`;
          ctx.clearRect(0, 0, $canvas.width, $canvas.height);
          ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
        }
        drawingUndoList.pop();
      }
      if(drawingUndoList.length <= 0) $undo.classList.remove("active");
    }
    if(e.target === $redo) {
      if(drawingRedoList.length > 0) {
        drawingUndoList.push(canvas.toDataURL());
        $undo.classList.add("active");
        loadDrawing.setAttribute("src", drawingRedoList[drawingRedoList.length - 1]);
        loadDrawing.onload = function() {
          ctx.filter = `blur(0px)`;
          ctx.clearRect(0, 0, $canvas.width, $canvas.height);
          ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
        }
        drawingRedoList.pop();
      }
      if(drawingRedoList.length <= 0) $redo.classList.remove("active");
    }
    if(e.target === $canvas && drawingStyle === "floodFill") {
      addPaletteHistory();
      drawingUndoList.push(canvas.toDataURL());
      drawingRedoList = [];
      $redo.classList.remove("active");
      $undo.classList.add("active");
      drawingAlpha = Math.floor((drawingOpacity * 256) - 1);
      styleColor = $color.value.replace(/#/gi, "").split("");
      styleColor = [(styleColor[0] + styleColor[1]), (styleColor[2] + styleColor[3]), (styleColor[4] + styleColor[5])];
      styleColor = {r: parseInt(styleColor[0], 16), g: parseInt(styleColor[1], 16), b: parseInt(styleColor[2], 16), a: drawingAlpha};
      pageX = e.offsetX;
      pageY = e.offsetY;
      floodList = new Array();
      pageIdx = ((pageY * $canvas.width) + pageX) * 4;
      let data = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
      imageData = data.data;
      floodStartColor = {r: imageData[pageIdx], g: imageData[pageIdx + 1], b: imageData[pageIdx + 2], a: imageData[pageIdx + 3]};
      if(styleColor.r !== floodStartColor.r || styleColor.g !== floodStartColor.g || styleColor.b !== floodStartColor.b || styleColor.a !== floodStartColor.a){
        floodFill(pageX, pageY, styleColor);
      }
    }
    if(drawingStyle === "pen") {
      if(e.target === $canvas &&!penDrawing) {
        addPaletteHistory();
        drawingUndoList.push(canvas.toDataURL());
        drawingRedoList = [];
        $redo.classList.remove("active");
        $undo.classList.add("active");
        penDrawing = true;
        pageX = e.pageX - e.offsetX;
        pageY = e.pageY - e.offsetY;
        $toolBar.style.pointerEvents = "none";
        $colorBar.style.pointerEvents = "none";
        $canvasPage.style.pointerEvents = "none";
        ctx.lineJoin = "miter";
        ctx.lineCap = "butt";
        drawingAlpha = (drawingOpacity * 256).toString(16).split(".");
        if(drawingAlpha[0].length === 1) drawingAlpha[0] = "0" + drawingAlpha[0];
        if(drawingAlpha[0].length === 3) drawingAlpha[0] = "ff";
        ctx.fillStyle = $color.value + drawingAlpha[0];
        ctx.strokeStyle = $color.value + drawingAlpha[0];
        ctx.lineWidth = drawingSize;
        ctx.filter = `blur(${drawingBlur}px)`;
        loadDrawing.setAttribute("src", drawingUndoList[drawingUndoList.length - 1]);
        drawingLine = [{x: e.offsetX, y: e.offsetY}, {x: e.offsetX, y: e.offsetY}];if(strokeStyle === "round") {
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
        }
        ctx.moveTo(e.offsetX, e.offsetY);
        return;
      }
      let mouseX = e.offsetX;
      let mouseY = e.offsetY;
      if(e.target === $page) {
        mouseX -= pageX;
        mouseY -= pageY;
      }
      drawingLine.push({x: mouseX, y: mouseY});
      // ctx.lineTo(e.offsetX, e.offsetY);
      // ctx.stroke();
    }
  });

  document.addEventListener("dblclick", e => {
    if(drawingStyle === "pen" && penDrawing) {
      let img = document.createElement("img");
      let mouseX = e.offsetX - pageX;
      let mouseY = e.offsetY - pageY;
      img.setAttribute("src", drawingUndoList[drawingUndoList.length - 1]);
      img.onload = function() {
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
        ctx.filter = `blur(${drawingBlur}px)`;
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
        $canvasPage.style.pointerEvents = "";
        $undo.classList.add("active");
        penDrawing = false;
        ctx.beginPath();
      }
    }
  })

  document.addEventListener("mousewheel", e => {
    if(drawing === true) {
      canvasMouseUp(e);
    }
  })

  document.addEventListener("mousedown", e => {
    if(e.target === $canvas && drawingStyle !== "floodFill" && drawingStyle !== "pen") {
      if(drawingStyle !== "eraser") addPaletteHistory();
      drawingUndoList.push(canvas.toDataURL());
      drawingRedoList = [];
      $redo.classList.remove("active");
      drawing = true;
      pageX = e.pageX - e.offsetX;
      pageY = e.pageY - e.offsetY;
      $toolBar.style.pointerEvents = "none";
      $colorBar.style.pointerEvents = "none";
      $canvasPage.style.pointerEvents = "none";
      ctx.lineJoin = "miter";
      ctx.lineCap = "butt";
      drawingAlpha = (drawingOpacity * 256).toString(16).split(".");
      if(drawingAlpha[0].length === 1) drawingAlpha[0] = "0" + drawingAlpha[0];
      if(drawingAlpha[0].length === 3) drawingAlpha[0] = "ff";
      ctx.fillStyle = $color.value + drawingAlpha[0];
      ctx.strokeStyle = $color.value + drawingAlpha[0];
      ctx.lineWidth = drawingSize;
      ctx.filter = `blur(${drawingBlur}px)`;
      if(drawingStyle === "pixel") ctx.fillRect(e.offsetX - (drawingSize / 2), e.offsetY - (drawingSize / 2), drawingSize, drawingSize);
      if(drawingStyle === "circle") {
        ctx.arc(e.offsetX, e.offsetY, drawingSize / 2, 0, Math.PI * 2, false);
        ctx.fill();
      };
      if(drawingStyle === "line" || drawingStyle === "eraser") {
        if(drawingStyle === "eraser") ctx.globalCompositeOperation = "destination-out";
        if(strokeStyle === "round") {
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
        };
        if(drawingStyle === "eraser") ctx.globalCompositeOperation = "source-over";
        loadDrawing.setAttribute("src", drawingUndoList[drawingUndoList.length - 1]);
        drawingLine = [{x: e.offsetX, y: e.offsetY}];
        ctx.moveTo(e.offsetX, e.offsetY);
        // ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      };
    };
  });

  document.addEventListener("mousemove", e => {
    if((drawing || penDrawing) && e.target === $page) {
      let mouseX = e.offsetX;
      let mouseY = e.offsetY;
      if(e.target === $page) {
        mouseX -= pageX;
        mouseY -= pageY;
      }
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
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
        ctx.filter = `blur(${drawingBlur}px)`;
        ctx.beginPath();
        drawingLine[drawingLine.length - 1] = {x: mouseX, y: mouseY};
        drawingLine.forEach((i, l) => {
          if(l === 0) {
            ctx.moveTo(i.x, i.y);
            return;
          }
          ctx.lineTo(i.x, i.y);
        })
        ctx.stroke();
      }
    };
  });

  document.addEventListener("mouseup", e => {
    if(drawing === true) {
      canvasMouseUp(e);
    }
  });

  setInterval(e => {
    let maxWidth = $canvasPage.style.width.replace(/%/gi, "") * window.innerWidth / 100;
    let maxHeight = $canvasPage.style.height.replace(/%/gi, "") * window.innerHeight / 100;
    if(maxWidth < $canvas.width && maxHeight < $canvas.height) {
      $canvas.classList.remove("center");
      return;
    }
    $canvas.classList.add("center");
  })
}

function canvasMouseUp(e) {
  let img = document.createElement("img");
  let mouseX = e.offsetX - pageX;
  let mouseY = e.offsetY - pageY;
  img.setAttribute("src", drawingUndoList[drawingUndoList.length - 1]);
  img.onload = function() {
    if(drawingStyle === "line" || drawingStyle === "eraser"){
      if(drawingStyle === "eraser") ctx.globalCompositeOperation = "source-over";
      ctx.filter = `blur(0px)`;
      ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
      ctx.filter = `blur(${drawingBlur}px)`;
      if(drawingStyle === "eraser") ctx.globalCompositeOperation = "destination-out";
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
    $toolBar.style.pointerEvents = "";
    $colorBar.style.pointerEvents = "";
    ctx.globalCompositeOperation = "source-over";
    $canvasPage.style.pointerEvents = "";
    $undo.classList.add("active");
    drawing = false;
    ctx.beginPath();
  }
}
