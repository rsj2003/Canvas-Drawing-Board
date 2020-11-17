// color tool bar
const $color = document.getElementById("color");
const $colorInput = document.getElementById("colorInput");
const $colorIcon = document.getElementById("colorIcon");
const $controller = document.getElementById("controller");
const $colorBar = document.getElementById("colorBar");
const $toolBar = document.getElementById("toolBar");
let $colorHistory;
let paletteHistory = new Array();
// brush tool bar
const $preview = document.getElementById("preview");
const previewCtx = $preview.getContext("2d");
const $toolBarToggleButton = document.querySelectorAll(".toolBarToggleButton");
const $brushButton = document.getElementById("brushButton");
const $brushSizeRange = document.getElementById("brushSizeRange");
const $brushSize = document.getElementById("brushSize");
const $brushBlurRange = document.getElementById("brushBlurRange");
const $brushBlur = document.getElementById("brushBlur");
const $brushAlphaRange = document.getElementById("brushAlphaRange");
const $brushAlpha = document.getElementById("brushAlpha");
const $brushFloodFillInput = document.getElementById("brushFloodFillInput");
const $brushFloodFillRange = document.getElementById("brushFloodFillRange");
const $brushFloodFill = document.getElementById("brushFloodFill");
const $rangeInputs = document.querySelectorAll(".rangeInputWarp input");
// canvas tool
const $newWidth = document.getElementById("newWidth");
const $newHeight = document.getElementById("newHeight");
const $canvasResize = document.getElementById("canvasResize");
const $canvasResizeSize = document.getElementById("canvasResizeSize");
const $canvasCreateButton = document.getElementById("create");
const $canvasCancleButton = document.getElementById("cancle");
let resizeWidth = 1200;
let resizeHeight = 600;

function addPaletteHistory() {
  if(paletteHistory.indexOf($color.value) > -1) paletteHistory.splice(paletteHistory.indexOf($color.value), 1);
  if(paletteHistory.length > 74) paletteHistory.pop();
    paletteHistory.unshift($color.value);
    paletteHistory.forEach((c, i) => {
    $colorHistory[i].style.background = c;
  });
};

function brushToolBarFunction() {
  $preview.width = 120;
  $preview.height = 120;

  // previewCtx.fillStyle = "#fff";
  // previewCtx.fillRect(0, 0, $preview.width, $preview.height);

  brushPreview();
  resize();
  
  $toolBarToggleButton.forEach(i => i.addEventListener("click", e => {
    e.target.closest(".toolBars").classList.toggle("toggle");
  }));

  $brushButton.querySelectorAll("button").forEach(i => i.addEventListener("click", e => {
    let id = e.target.id
    if(id !== "clear" && id !== "newProject") {
      if(id.indexOf("Round") > -1) {
        strokeStyle = "round";
        id = id.replace(/Round/gi, "");
      }else {
        strokeStyle = "";
      }
      $brushButton.querySelector(".select").classList.remove("select");
      e.target.classList.add("select");
    }
    if(id === "clear") {
      drawingUndoList.push(canvas.toDataURL());
      drawingRedoList = [];
      $redo.classList.remove("active");
      $undo.classList.add("active");
      ctx.filter = `blur(0px)`;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, $canvas.width, $canvas.height);
      scale = 1;
      $canvas.style.width = `${$canvas.width}px`;
      $canvas.style.height = `${$canvas.height}px`;
      layerPreviewImage[selectCanvas].setAttribute("src", canvas.toDataURL());
    }else if(id === "newProject") {
      $canvasResize.classList.remove("hidden");
      $popBackground.classList.remove("hidden");
      canDrawing = false;
    }else {
      drawingStyle = id;
    }
    brushPreview();
    // if(id ==="floodFill") {
    //   $brushFloodFillInput.classList.remove("hidden");
    // }else {
    //   $brushFloodFillInput.classList.add("hidden");
    // }
  }))

  $rangeInputs.forEach(i => i.addEventListener("input", e => {
    let targetId = e.target.id.replace(/Range|brush/gi, "");
    let value = e.target.value
    if(targetId === "Size") {
      if(value < 1) value = 1;
      $brushSize.value = value;
      $brushSizeRange.value = value;
      drawingSize = value;
    }
    if(targetId === "Blur") {
      if(value < 0) value = 0;
      $brushBlur.value = value;
      $brushBlurRange.value = value;
      drawingBlur = value;
    }
    if(targetId === "Alpha") {
      if(value < 0) value = 0;
      if(value > 1) value = 1;
      $brushAlpha.value = value;
      $brushAlphaRange.value = value;
      drawingOpacity = value;
    }
    if(targetId === "FloodFill") {
      if(value < 0) value = 0;
      if(value > 255) value = 255;
      $brushFloodFill.value = value;
      $brushFloodFillRange.value = value;
      floodAccuracy = value;
    }
    brushPreview();
  }))
}

function brushPreview() {
  previewCtx.beginPath();
  // previewCtx.fillStyle = "#fff";
  previewCtx.clearRect(0, 0, $preview.width, $preview.height);
  drawingAlpha = (drawingOpacity * 256).toString(16).split(".");
  if(drawingAlpha[0].length === 1) drawingAlpha[0] = "0" + drawingAlpha[0];
  if(drawingAlpha[0].length === 3) drawingAlpha[0] = "ff";
  previewCtx.fillStyle = $color.value + drawingAlpha[0];
  previewCtx.strokeStyle = $color.value + drawingAlpha[0];
  previewCtx.lineWidth = drawingSize;
  previewCtx.filter = `blur(${drawingBlur}px)`;
  previewCtx.lineCap = "butt";
  let pixelSize = drawingSize;

  if(previewCtx.lineWidth > 30) previewCtx.lineWidth = 30;
  if(pixelSize > 60) pixelSize = 60;

  if(drawingStyle === "pixel") previewCtx.fillRect($preview.width / 2 - (pixelSize / 2), $preview.height / 2 - (pixelSize / 2), pixelSize, pixelSize);
  if(drawingStyle === "circle") {
    previewCtx.arc($preview.width / 2, $preview.height / 2, pixelSize / 2, 0, Math.PI * 2, false);
    previewCtx.fill();
  };
  if(drawingStyle === "line" || drawingStyle === "pen") {
    if(strokeStyle === "round") previewCtx.lineCap = "round";
    previewCtx.moveTo($preview.width / 2, $preview.height / 2 - 40);
    previewCtx.lineTo($preview.width / 2, $preview.height / 2 + 40);
    previewCtx.stroke();
  };
  if(drawingStyle === "eraser") {
    previewCtx.fillStyle = "#fff";
    previewCtx.fillRect(0, 0, $preview.width, $preview.height);
    previewCtx.globalCompositeOperation = "destination-out";
    if(strokeStyle === "round") previewCtx.lineCap = "round";
    previewCtx.moveTo($preview.width / 2, $preview.height / 2 - 40);
    previewCtx.lineTo($preview.width / 2, $preview.height / 2 + 40);
    previewCtx.stroke();
    previewCtx.globalCompositeOperation = "source-over";
  };
  if(drawingStyle === "floodFill") {
    previewCtx.clearRect(0, 0, $preview.width, $preview.height);
    previewCtx.filter = `blur(0px)`;
    previewCtx.fillRect(0, 0, $preview.width, $preview.height);
  }
}

function resize() {
  resizePreview();
  $newHeight.addEventListener("input", resizePreview);
  $newWidth.addEventListener("input", resizePreview);

  $canvasCreateButton.addEventListener("click", e => {
    if(confirm("새로만들면 기존의 작업물은 사라집니다.")) {
      resizeWidth = Number($newWidth.value);
      resizeHeight = Number($newHeight.value);
  
      $canvas.width = resizeWidth;
      $canvas.height = resizeHeight;
  
      $canvas.style.width = `${resizeWidth}px`;
      $canvas.style.height = `${resizeHeight}px`;
  
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, $canvas.width, $canvas.height);

      drawingUndoList = new Array();
      $undo.classList.remove("active");
      drawingRedoList = new Array();
      $redo.classList.remove("active");
      layerPreviewImage[selectCanvas].setAttribute("src", canvas.toDataURL());
  
      $canvasResize.classList.add("hidden");
      $popBackground.classList.add("hidden");
      canDrawing = true;
    }
  })
  $canvasCancleButton.addEventListener("click", e => {
    $canvasResize.classList.add("hidden");
    $popBackground.classList.add("hidden");
    canDrawing = true;
  })
}

function resizePreview() {
  resizeWidth = Number($newWidth.value);
  resizeHeight = Number($newHeight.value);
  if(resizeWidth > resizeHeight) {
    $canvasResizeSize.style.width = `80%`;
    $canvasResizeSize.style.height = `${resizeHeight / resizeWidth * 80}%`;
    return;
  }
  if(resizeWidth < resizeHeight) {
    $canvasResizeSize.style.width = `${resizeWidth / resizeHeight * 80}%`;
    $canvasResizeSize.style.height = `80%`;
    return;
  }
  $canvasResizeSize.style.width = `80%`;
  $canvasResizeSize.style.height = `80%`;
}