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

  $toolBarToggleButton.forEach(i => i.addEventListener("click", e => {
    e.target.closest(".toolBars").classList.toggle("toggle");
  }));

  $brushButton.querySelectorAll("button").forEach(i => i.addEventListener("click", e => {
    let id = e.target.id
    if(id !== "clear") {
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