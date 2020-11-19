// canvas
const $canvasPage = document.getElementById("canvasPage");
const $drawingPage = document.getElementById("drawingPage");
const $undo = document.getElementById("undo");
const $redo = document.getElementById("redo");
const $addLayer = document.getElementById("addLayer");
const $layerList = document.getElementById("layerList");
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
let selectCanvas = {element: document.querySelector(".layerList.select .previewImage"), idx: 0};
let canvasViewButtonList = document.querySelectorAll(".viewButton");
let previewImageBackgroundList = document.querySelectorAll(".previewImageBackground");
let layerCanvasList = document.querySelectorAll(".layer");
let layerListList = document.querySelectorAll(".layerList");
let layerImage = new Array();
let selectLayer = document.querySelector(".layerList.select");
let newLayerIdx = 1;

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
  selectCanvas.element.setAttribute("src", $canvas.toDataURL());

  document.addEventListener("click", e => {
    if(e.target === $undo) {
      canvasUndo();
    }
    if(e.target === $redo) {
      canvasRedo();
    }
    if(hasClass(e.target, "layer") && drawingStyle === "floodFill" && canDrawing && hasClass(selectLayer, "view")) {
      addPaletteHistory();
      drawingUndoList.push({url: $canvas.toDataURL(), idx: selectCanvas.idx, create: 0});
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
      selectCanvas.element.setAttribute("src", $canvas.toDataURL());
    }
    if(drawingStyle === "pen" && canDrawing && hasClass(selectLayer, "view")) {
      if(hasClass(e.target, "layer") &&!penDrawing) {
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
    if(drawingStyle === "pen" && penDrawing && canDrawing && hasClass(selectLayer, "view")) drawingPenFinish(false);
  })

  document.addEventListener("mousewheel", e => {
    if(drawing === true) canvasMouseUp(e);
  })

  document.addEventListener("mousedown", e => {
    if(e.button === 0) {
      if(hasClass(e.target, "layer") && drawingStyle !== "floodFill" && drawingStyle !== "pen" && canDrawing && hasClass(selectLayer, "view")) {
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
        if(drawingStyle === "line" || drawingStyle === "eraser" && canDrawing && hasClass(selectLayer, "view")) {
          drawingLine = [{x: e.offsetX / scale, y: e.offsetY / scale}];
          ctx.moveTo(e.offsetX / scale, e.offsetY / scale);
          ctx.stroke();
        };
      };
    }else if(e.button === 2) {
      if(drawingStyle === "pen" && penDrawing && canDrawing && hasClass(selectLayer, "view")) drawingPenFinish(true);
    }
  });

  document.addEventListener("mousemove", e => {
    if((drawing || penDrawing) && e.target === $page && canDrawing && hasClass(selectLayer, "view")) {
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
    if(drawing && canDrawing && hasClass(selectLayer, "view")) canvasMouseUp(e);
  });

  let maxWidth = $canvasPage.style.width.replace(/%/gi, "") * window.innerWidth / 100;
  let maxHeight = $canvasPage.style.height.replace(/%/gi, "") * window.innerHeight / 100;
  let width = Number($canvas.style.width.replace(/px/gi, ""));
  let height = Number($canvas.style.height.replace(/px/gi, ""));
  if(maxWidth >= width && maxHeight >= height) {
    $canvas.classList.add("center");
  }
  if(maxWidth < width && maxHeight >= height) {
    $canvas.classList.add("topCenter");
  }
  if(maxWidth >= width && maxHeight < height) {
    $canvas.classList.add("leftCenter");
  }
  // if(maxWidth < width || maxHeight < height) {
  //   $canvas.classList.remove("center");
  //   $canvasPage.scrollTo((width - maxWidth) / 2, (height - maxHeight) / 2);
  //   return;
  // }
}

function brushReset(e) {
  if(drawingStyle !== "eraser") addPaletteHistory();
  drawingUndoList.push({url: $canvas.toDataURL(), idx: selectCanvas.idx, create: 0});
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
    selectCanvas.element.setAttribute("src", $canvas.toDataURL());
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
  selectCanvas.element.setAttribute("src", $canvas.toDataURL());
}

function canvasUndo() {
  let record = drawingUndoList[drawingUndoList.length - 1];
  if(drawingUndoList.length > 0) {
    if(record.create === 0 || record.create === 1) layerSelect(record.idx);
    drawingRedoList.push({url: $canvas.toDataURL(), idx: record.idx, create: record.create});
    $redo.classList.add("active");
    if(record.create === 0) {
      loadDrawing.setAttribute("src", record.url);
      loadDrawing.onload = function() {
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
        selectCanvas.element.setAttribute("src", $canvas.toDataURL());
      }
    }
    if(record.create === 1) {
      removeRecordLayer(record.idx);
      layerSelect(drawingUndoList[drawingUndoList.length - 2].idx);
    }
    if(record.create === 2) {
      createRecordLayer(record.idx);
      loadDrawing.setAttribute("src", record.url);
      loadDrawing.onload = function() {
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
        selectCanvas.element.setAttribute("src", $canvas.toDataURL());
      }
    }
    
    drawingUndoList.pop();
  }
  if(drawingUndoList.length <= 0) $undo.classList.remove("active");
}

function canvasRedo() {
  let record = drawingRedoList[drawingRedoList.length - 1];
  if(drawingRedoList.length > 0) {
    if(record.create === 0 || record.create === 2) layerSelect(record.idx);
    drawingUndoList.push({url: $canvas.toDataURL(), idx: record.idx, create: record.create});
    $undo.classList.add("active");
    if(record.create === 0) {
      loadDrawing.setAttribute("src", record.url);
      loadDrawing.onload = function() {
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
        selectCanvas.element.setAttribute("src", $canvas.toDataURL());
      }
    }
    if(record.create === 1) {
      createRecordLayer(record.idx);
      loadDrawing.setAttribute("src", record.url);
      loadDrawing.onload = function() {
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
        selectCanvas.element.setAttribute("src", $canvas.toDataURL());
      }
    }
    if(record.create === 2) {
      removeRecordLayer(record.idx);
      layerSelect(drawingUndoList[drawingUndoList.length - 2].idx);
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

function layerFunction() {
  canvasViewButtonList.forEach(i => i.addEventListener("click", e => {
    viewButtonClickEvent(e);
  }));

  previewImageBackgroundList.forEach(i => i.addEventListener("click", e => {
    layerSelect(e.target.dataset.layer);
  }));

  $addLayer.addEventListener("click", e => {
    createRecordLayer(newLayerIdx);

    drawingUndoList.push({url: $canvas.toDataURL(), idx: newLayerIdx, create: 1});

    newLayerIdx++;
  })
}

function viewButtonClickEvent(e) {
  let layerList = e.target.closest(".layerList");
  let select = $canvas;
  layerList.classList.toggle("view");
  layerCanvasList.forEach(i => {
    if(i.dataset.layer === layerList.dataset.layer) {
      $canvas = i;
      ctx = $canvas.getContext("2d");
      return false;
    }
  })
  if(hasClass(layerList, "view")) {
    let i = 0;
    while((layerImage[i].idx !== layerList.dataset.layer) && i < layerImage.length) i++;
    loadDrawing.setAttribute("src", layerImage[i].url);
    ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
  }else {
    if(layerImage.length > 0) {
      let i = 0;
      while(i < layerImage.length && (layerImage[i].idx !== layerList.dataset.layer)) i++;
      if(i < layerImage.length && layerImage[i].idx === layerList.dataset.layer) {
        layerImage[i] = {url: $canvas.toDataURL(), idx: layerList.dataset.layer};
      }else {
        layerImage.push({url: $canvas.toDataURL(), idx: layerList.dataset.layer})
      }
    }else {
      layerImage.push({url: $canvas.toDataURL(), idx: layerList.dataset.layer})
    }
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  }
  $canvas = select;
  ctx = $canvas.getContext("2d");
}

function deleteButtonClickEvent(e) {
  let layerList = e.target.closest(".layerList");
  let canvas
  layerCanvasList.forEach(i => {
    if(i.dataset.layer === layerList.dataset.layer) canvas = i;
  })
  if(hasClass(layerList, "view")) {
    drawingUndoList.push({url: canvas.toDataURL(), idx: Number(layerList.dataset.layer), create: 2});
  }else {
    let i = 0;
    while((layerImage[i].idx !== layerList.dataset.layer) && i < layerImage.length) i++;
    drawingUndoList.push({url: layerImage[i].url, idx: Number(layerList.dataset.layer), create: 2});
  }
  layerList.remove();
  canvas.remove();
  previewImageBackgroundList = document.querySelectorAll(".previewImageBackground");
  canvasViewButtonList = document.querySelectorAll(".viewButton");
  layerCanvasList = document.querySelectorAll(".layer");
  layerListList = document.querySelectorAll(".layerList");
  if(document.querySelectorAll(".layerList.select").length === 0) layerSelect(0);
}

function createRecordLayer(idx) {
  let layerList = document.createElement("div");
  let previewImageBackgroundList = document.createElement("div");
  let previewImage = document.createElement("img");
  let viewButton = document.createElement("p");
  let deleteButton = document.createElement("p");
  let canvas = document.createElement("canvas");

  layerList.classList.add("layerList");
  layerList.classList.add("view");
  layerList.classList.add("select");
  
  if(hasClass($canvas, "center")) {
    canvas.classList.add("center");
  }
  if(hasClass($canvas, "topCenter")) {
    canvas.classList.add("topCenter");
  }
  if(hasClass($canvas, "leftCenter")) {
    canvas.classList.add("leftCenter");
  }

  previewImage.setAttribute("src", "");

  previewImageBackgroundList.classList.add("previewImageBackground");
  previewImage.classList.add("previewImage");

  viewButton.classList.add("viewButton");
  viewButton.classList.add("active");
  deleteButton.classList.add("deleteButton");
  deleteButton.classList.add("active");

  viewButton.innerHTML = "view";
  deleteButton.innerHTML = "delete";
  previewImageBackgroundList.dataset.layer = idx;
  layerList.dataset.layer = idx;

  layerList.addEventListener("mousedown", e => {
    if(pressSpace) {
      pageMoving = true;
      $canvasPage.style.cursor = "grabbing";
      $page.style.cursor = "grabbing";
      moveStartX = e.pageX;
      moveStartY = e.pageY;
      moveStartScrollX = $canvasPage.scrollLeft;
      moveStartScrollY = $canvasPage.scrollTop;
    }
  })
  viewButton.addEventListener("click", e => {
    viewButtonClickEvent(e);
  })
  deleteButton.addEventListener("click", e => {
    deleteButtonClickEvent(e);
  })
  previewImageBackgroundList.addEventListener("click", e => {
    layerSelect(e.target.dataset.layer);
  })


  previewImageBackgroundList.append(previewImage);
  layerList.append(previewImageBackgroundList, viewButton, deleteButton);

  $layerList.append(layerList);
  

  canvas.classList.add("layer");
  canvas.dataset.layer = idx;

  selectLayer.classList.remove("select");
  selectLayer = layerList;

  $canvasPage.append(canvas);
  $canvas = canvas;
  ctx = $canvas.getContext("2d");
  selectCanvas.idx = idx;
  selectCanvas.element = previewImage;

  previewImageBackgroundList = document.querySelectorAll(".previewImageBackground");
  canvasViewButtonList = document.querySelectorAll(".viewButton");
  layerCanvasList = document.querySelectorAll(".layer");
  layerListList = document.querySelectorAll(".layerList");
  
  $canvas.width = normalSize.width;
  $canvas.height = normalSize.height;
  
  $canvas.style.width = `${normalSize.width * scale}px`;
  $canvas.style.height = `${normalSize.height * scale}px`;
}

function removeRecordLayer(idx) {
  let layerList;
  let canvas
  layerListList.forEach(i => {
    if(idx + "" === i.dataset.layer) layerList = i;
  })
  layerCanvasList.forEach(i => {
    if(i.dataset.layer === layerList.dataset.layer) canvas = i;
  })
  layerList.remove();
  canvas.remove();
  
  previewImageBackgroundList = document.querySelectorAll(".previewImageBackground");
  canvasViewButtonList = document.querySelectorAll(".viewButton");
  layerCanvasList = document.querySelectorAll(".layer");
  layerListList = document.querySelectorAll(".layerList");
}

function layerSelect(idx) {
  let layerList;
  layerListList.forEach(i => {
    if(idx + "" === i.dataset.layer) layerList = i;
  })

  if(!layerList) layerList = document.getElementById("canvas");

  selectLayer.classList.remove("select");
  selectLayer = layerList;
  selectLayer.classList.add("select");
  
  layerCanvasList.forEach(i => {
    if(i.dataset.layer === layerList.dataset.layer) {
      $canvas = i;
      ctx = $canvas.getContext("2d");
    }
  })
  
  selectCanvas.idx = Number(layerList.dataset.layer);
  selectCanvas.element = layerList.querySelector(".previewImage");
}