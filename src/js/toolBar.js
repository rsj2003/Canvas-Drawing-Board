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
const $newImage = document.getElementById("newImage");
const $newImageImage = document.getElementById("newImageImage");
let resizeWidth = 1200;
let resizeHeight = 600;
// export
const $exportPage = document.getElementById("exportPage");
const $export = document.getElementById("export");
const $exportDownload = document.getElementById("exportDownload");
const $exportCancle = document.getElementById("exportCancle");
const $exportImage = document.getElementById("exportImage");
const exportCtx = $export.getContext("2d");
const $mosaicRange = document.getElementById("mosaicRange");
const $mosaic = document.getElementById("mosaic");
let mosaicOriginal;
let oldMosaicSize = 1;

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
    if(id !== "clear" && id !== "newProject" && id !== "exportProject") {
      if(id.indexOf("Round") > -1) {
        strokeStyle = "round";
        id = id.replace(/Round/gi, "");
      }else {
        strokeStyle = "";
      }
      $brushButton.querySelector(".select").classList.remove("select");
      e.target.classList.add("select");
      drawingStyle = id;
    }
    if(id === "clear") {
      drawingUndoList.push({url: $canvas.toDataURL(), idx: selectCanvas.idx, create: 0});
      drawingRedoList = [];
      $redo.classList.remove("active");
      $undo.classList.add("active");
      ctx.filter = `blur(0px)`;
      if(selectCanvas.idx === 0) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, $canvas.width, $canvas.height);
      }else {
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
      }
      selectCanvas.element.setAttribute("src", $canvas.toDataURL());
    }else if(id === "newProject") {
      $canvasResize.classList.remove("hidden");
      $popBackground.classList.remove("hidden");
      $newImage.value = "";
      canDrawing = false;
    }else if(id === "exportProject") {
      $exportPage.classList.remove("hidden");
      $export.width = normalSize.width;
      $export.height = normalSize.height;
      layerCanvasList.forEach(i => {
        $exportImage.setAttribute("src", i.toDataURL());
        exportCtx.drawImage($exportImage, 0, 0, $export.width, $export.height, 0, 0, $export.width, $export.height);
      })
      mosaicOriginal = exportCtx.getImageData(0, 0, $export.width, $export.height);
      $mosaicRange.value = 1;
      $mosaic.value = 1;
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

  $exportDownload.addEventListener("click", e => {
    let exportURL = $export.toDataURL("image/png");
    exportURL = exportURL.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    exportURL = exportURL.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

    var aTag = document.createElement('a');
    aTag.download = 'Drawing_board.png';
    aTag.href = exportURL;
    aTag.click();
    $exportPage.classList.add("hidden");
  })

  $exportCancle.addEventListener("click", e => {
    $exportPage.classList.add("hidden");
  })

  $mosaic.addEventListener("input", e => {
    if(e.target.value < 1) e.target.value = 1;
    if(e.target.value > 100) e.target.value = 100;
    $mosaicRange.value = e.target.value;
  })
  $mosaicRange.addEventListener("input", e => {
    if(e.target.value < 1) e.target.value = 1;
    if(e.target.value > 100) e.target.value = 100;
    $mosaic.value = e.target.value;
  })
  document.addEventListener("mouseup", e => {
    if(oldMosaicSize !== Number($mosaic.value)) {
      oldMosaicSize = Number($mosaic.value);
      mosaic();
    }
  })
  $mosaic.addEventListener("keyup", e => {
    if(oldMosaicSize !== Number($mosaic.value)) {
      oldMosaicSize = Number($mosaic.value);
      mosaic();
    }
  })
}

function mosaic() {
  exportCtx.putImageData(mosaicOriginal, 0, 0);
  let mosaic = exportCtx.getImageData(0, 0, $export.width, $export.height);
  let mosaicData = mosaic.data;
  let mosaicSize = Number($mosaic.value);
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  let idx = 0;
  let idxY = 1;
  if(mosaicSize !== 1) {
    for(let i = 0; i <= Math.ceil($export.width / mosaicSize) * Math.ceil($export.height / mosaicSize); i++) {
      r = 0;
      g = 0;
      b = 0;
      a = 0;
      let mosaicRList = new Array();
      let mosaicGList = new Array();
      let mosaicBList = new Array();
      let mosaicAList = new Array();
      for(let x = 0; x < mosaicSize; x++) {
        if((idx + (x * 4)) / ($export.width * 4) < idxY) {
          for(let y = 0; y < mosaicSize; y++) {
            if((idx + ($export.width * 4 * y) < $export.width * $export.height * 4)) {
              mosaicRList.push(idx + (x * 4) + ($export.width * 4 * y));
              mosaicGList.push(idx + (x * 4) + ($export.width * 4 * y) + 1);
              mosaicBList.push(idx + (x * 4) + ($export.width * 4 * y) + 2);
              mosaicAList.push(idx + (x * 4) + ($export.width * 4 * y) + 3);
              r += mosaicData[idx + (x * 4) + ($export.width * 4 * y)];
              g += mosaicData[idx + (x * 4) + ($export.width * 4 * y) + 1];
              b += mosaicData[idx + (x * 4) + ($export.width * 4 * y) + 2];
              a += mosaicData[idx + (x * 4) + ($export.width * 4 * y) + 3];
            }
          }
        }
      }
      // if(i > Math.ceil($export.width / mosaicSize) * Math.ceil($export.height / mosaicSize) - 5) console.log(mosaicRList);
      r = Math.round(r / mosaicRList.length);
      g = Math.round(g / mosaicGList.length);
      b = Math.round(b / mosaicBList.length);
      a = Math.round(a / mosaicAList.length);
      for(let l = 0; l < mosaicRList.length; l++) {
        // if(i > Math.ceil($export.width / mosaicSize) * Math.ceil($export.height / mosaicSize) - 5) console.log(mosaicRList[l]);
        mosaicData[mosaicRList[l]] = r;
        mosaicData[mosaicGList[l]] = g;
        mosaicData[mosaicBList[l]] = b;
        mosaicData[mosaicAList[l]] = a;
      }
      idx += 4 * mosaicSize;
      if(idx / ($export.width * 4) >= idxY) {
        idx = idx - (idx % ($export.width * 4)) + ($export.width * 4 * (mosaicSize - 1));
        idxY += mosaicSize;
      }
    }
  }
  exportCtx.putImageData(mosaic, 0, 0);
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

  $newImage.addEventListener("input", e => {
    let reader = new FileReader();
    reader.onload = function(i) {
        $newImageImage.setAttribute("src", i.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);

    $newImageImage.onload = function() {
      $newHeight.value = $newImageImage.height;
      $newWidth.value = $newImageImage.width;
      resizePreview()
    }
  })

  $canvasCreateButton.addEventListener("click", e => {
    if(confirm("새로만들면 기존의 작업물은 사라집니다.")) {
      resizeWidth = Number($newWidth.value);
      resizeHeight = Number($newHeight.value);
      
      $layerList.innerHTML = `
      <div class="layerList view lock select" data-layer="0">
        <div class="previewImageBackground" data-layer="0">
          <img src="" class="previewImage">
        </div>
        <p class="viewButton active">view</p>
      </div>
      `;
      selectCanvas = {element: document.querySelector(".layerList.select .previewImage"), idx: 0};
      
      $canvasPage.innerHTML = `
      <canvas id="canvas" class="backgroundPattern layer" data-layer="0"></canvas>
      `;
      $canvas = document.getElementById("canvas");
      ctx = $canvas.getContext("2d");

      selectLayer = document.querySelector(".layerList.select");
      previewImageBackgroundList = document.querySelectorAll(".previewImageBackground");
      canvasViewButtonList = document.querySelectorAll(".viewButton");
      layerCanvasList = document.querySelectorAll(".layer");
      layerListList = document.querySelectorAll(".layerList");

      canvasViewButtonList.forEach(i => i.addEventListener("click", e => {
        viewButtonClickEvent(e);
      }));
    
      previewImageBackgroundList.forEach(i => i.addEventListener("click", e => {
        layerSelect(e.target.dataset.layer);
      }));

      $canvas.addEventListener("mousedown", e => {
        canvasZoomMove(e);
      })
      
      $canvas.addEventListener("click", canvasPipetteColorPick);
      
      $canvas.addEventListener("mousemove", e => {
        canvasPipetteColor(e);
      })

      $canvas.width = resizeWidth;
      $canvas.height = resizeHeight;
  
      $canvas.style.width = `${resizeWidth}px`;
      $canvas.style.height = `${resizeHeight}px`;

      if($newImage.value === "") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, $canvas.width, $canvas.height);
      }else {
        ctx.drawImage($newImageImage, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);
      }
      
      drawingUndoList = new Array();
      $undo.classList.remove("active");
      drawingRedoList = new Array();
      $redo.classList.remove("active");
      selectCanvas.element.setAttribute("src", $canvas.toDataURL());
      newLayerIdx = 1;
      layerImage = new Array();
      
      scale = 1;
      normalSize = {width: resizeWidth, height: resizeHeight};
      
      let maxWidth = $drawingPage.style.width.replace(/%/gi, "") * window.innerWidth / 100;
      let maxHeight = $drawingPage.style.height.replace(/%/gi, "") * window.innerHeight / 100;
      let width = Number($canvas.style.width.replace(/px/gi, ""));
      let height = Number($canvas.style.height.replace(/px/gi, ""));
      $canvas.classList.remove("center");
      $canvas.classList.remove("leftCenter");
      $canvas.classList.remove("topCenter");
      if(maxWidth >= width && maxHeight >= height) {
        $canvas.classList.add("center");
      }
      if(maxWidth < width && maxHeight >= height) {
        $canvas.classList.add("topCenter");
      }
      if(maxWidth >= width && maxHeight < height) {
        $canvas.classList.add("leftCenter");
      }

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