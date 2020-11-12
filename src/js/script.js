const $page = document.getElementById("page");
let x = 0;
let oldX = 0;
let y = 0;
let oldY = 0;
let mouseDown = false;
let dragX = false;
let dragY = false;
let pageX = 0;
let pageY = 0;
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
// roller palette
const $paletteHistory = document.getElementById("paletteHistory");
const $palette = document.getElementById("palette");
const hex = "0123456789abcdef".split("");
let $colors;
let colorNumber = [15,0,6];
let order = [0,1,2];
let color = "#f06";
let deg = -90;
let translate = "translateX(-50%)";
let palette = false;
let select = 0;
let oldSelect = 0;
let paletteDeg = 0;
let movePaletteDeg = 0;
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
const $rangeInputs = document.querySelectorAll(".rangeInputWarp input");

function init() {
  const loading = document.getElementById("loadingPage");

  paletteFunction();
  canvasFunction();
  brushToolBarFunction();
  

  $canvas.width = 1200;
  $canvas.height = 600;

  $canvas.style.width = `${$canvas.width}px`;
  $canvas.style.height = `${$canvas.height}px`;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, $canvas.width, $canvas.height);

  
  setTimeout(_ => {
    loading.style.opacity = 0;
    setTimeout(_ => loading.remove(), 500);
  },1000);  
};

function paletteFunction() {
  for(let i = 0; i < 16 * 6 + 7; i++) {
    const $box = document.createElement("div");
    const $text = document.createElement("span");
    $box.classList.add("box");
    $box.style.background = color;
    $box.style.transform = `rotate(${deg}deg) ${translate}`;
    $text.innerHTML = color;
    if(deg > 90) $box.style.display = "none";
    $box.appendChild($text);
    $palette.appendChild($box);
    color = nextHex();
    deg += 15;
  };

  for(let i = 0; i < 75; i++) {
    const $box = document.createElement("div");
    $box.classList.add("colorHistory");
    $paletteHistory.appendChild($box);
  }
  
  $colors = document.querySelectorAll(".box");
  $colorHistory = document.querySelectorAll(".colorHistory");

  
  document.addEventListener("mousewheel", e => {
    if(palette) {
      if(e.wheelDelta > 0) movePaletteDeg -= 15;
      if(e.wheelDelta < 0) movePaletteDeg += 15;
    };
  });

  document.addEventListener("input", e => {
    if(e.target === $color) {
      $colorInput.value = $color.value;
    }
    if(e.target === $colorInput) {
      $color.value = setHex($colorInput.value);
    }
    brushPreview();
  })

  $colorInput.addEventListener("blur", e => {
    $colorInput.value = setHex($colorInput.value);
  })

  document.addEventListener("click", e => {
    if(hasClass(e.target, "box") && palette) {
      if(select !== oldSelect) return false;
      select = getIdx(e.target);
      oldSelect = select;
      movePaletteDeg = (select - 6) * 15;
    };
    if(hasClass(e.target, "colorHistory")) {
      if(paletteHistory[getIdx(e.target)].length !== 0) {
        $color.value = paletteHistory[getIdx(e.target)];
        $colorInput.value = paletteHistory[getIdx(e.target)];
      };
    };
    if(e.target === $colorIcon) {
      if(palette === true) {
        $palette.style.bottom = "-1600px";
        $palette.style.transition = ".5s";
        palette = 0;
        setTimeout(_ => {
          $canvasPage.style.zIndex = "";
          $palette.style.transition = "";
          palette = false;
        }, 500);
        return;
      };
      if(palette === false) {
        $palette.style.bottom = "-800px";
        $palette.style.transition = ".5s";
        $canvasPage.style.zIndex = "0";
        palette = 0;
        setTimeout(_ => {
          palette = true;
          $palette.style.transition = "";
        }, 500);
      };
    };
  });

  document.addEventListener("mousedown", e => {
    x = e.pageX;
    y = e.pageY;
    oldX = x;
    oldY = y;
    mouseDown = true;
  });

  document.addEventListener("mousemove", e => {
    if(mouseDown && palette) {
      x = e.pageX;
      y = e.pageY;
      if(!dragX && !dragY) {
        if(oldY - y > 10 || oldY - y < -10) {
          dragY = true;
          return;
        }
        if(x - oldX > 10) {
          dragX = true;
        }
      }
      if(dragX) {
        let bottom = -800 - x + oldX; 
        if(bottom > -800) bottom = -800;
        $palette.style.bottom = `${bottom}px`;
      }
      if(dragY) {
        movePaletteDeg += (y - oldY) / 10;
        oldY = y;
      }
    };
  });

  document.addEventListener("mouseup", e => {
    mouseDown = false;
    if(dragX === true){
      let bottom = Number($palette.style.bottom.replace(/px/gi, ""));
      if(bottom < -1300) {
        $palette.style.bottom = "-1600px";
        $palette.style.transition = ".5s";
        palette = 0;
        setTimeout(_ => {
          $canvasPage.style.zIndex = "";
          $palette.style.transition = "";
          palette = false;
        }, 500);
      }else {
        $palette.style.bottom = "-800px";
        $palette.style.transition = ".5s";
        $canvasPage.style.zIndex = "0";
        palette = 0;
        setTimeout(_ => {
          palette = true;
          $palette.style.transition = "";
        }, 500);
      };
      dragX = false;
    }
    dragY = false;
  });

  setInterval(e => {
    let scroll;
    if(paletteDeg > 1350) {
      paletteDeg -= 1350;
      movePaletteDeg -= 1350;
    };
    if(paletteDeg < 0) {
      paletteDeg += 1350;
      movePaletteDeg += 1350;
    };
    scroll = Number((paletteDeg).toFixed(3));
    if(movePaletteDeg % 15 !== 0 && mouseDown === false) {
      let value = movePaletteDeg % 15;
      if(value >= 7.5) {
        movePaletteDeg = Math.ceil(movePaletteDeg);
        value = movePaletteDeg % 15;
        movePaletteDeg += 15 - value;
      }else {
        movePaletteDeg = Math.ceil(movePaletteDeg);
        value = movePaletteDeg % 15;
        movePaletteDeg -= value;
      };
    };
    if(scroll < movePaletteDeg) {
      paletteDeg = scroll + Number(((movePaletteDeg - scroll)/ 50).toFixed(3));
    };
    if(scroll > movePaletteDeg) {
      paletteDeg = scroll - Number(((scroll - movePaletteDeg)/ 50).toFixed(3));
    };
    if(scroll !== movePaletteDeg) {
      $palette.style.transform = `rotate(${-paletteDeg}deg)`;
      let colorIdx = Math.round(paletteDeg / 15);
      let colorList = [colorIdx];
      for(let i = 1; i <= 12; i++) {
        colorList.push(colorIdx + i);
      };
      $colors.forEach((e, i) => {
        if(colorList.indexOf(i) > -1) {
          e.style.display = "block";
          return;
        };
        e.style.display = "none";
      });
      let color = setHex($colors[colorIdx + 6].querySelector("span").innerHTML)
      $color.value = color;
      $colorInput.value = color;
    };
    if(((movePaletteDeg - scroll < 0.03 && movePaletteDeg - scroll > -0.03) || (movePaletteDeg + scroll < 0.03 && movePaletteDeg + scroll > -0.03)) && paletteDeg !== movePaletteDeg) {
      $palette.style.transform = `rotate(${-movePaletteDeg}deg)`;
      paletteDeg = movePaletteDeg;
    };
  });
};

function addPaletteHistory() {
  if(paletteHistory.indexOf($color.value) > -1) paletteHistory.splice(paletteHistory.indexOf($color.value), 1);
  if(paletteHistory.length > 74) paletteHistory.splice(-1, 1);
    paletteHistory.unshift($color.value);
    paletteHistory.forEach((c, i) => {
    $colorHistory[i].style.background = c;
  });
};

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
        drawingUndoList.splice(-1,1);
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
        drawingRedoList.splice(-1,1);
      }
      if(drawingRedoList.length <= 0) $redo.classList.remove("active");
    }
  });

  document.addEventListener("mousewheel", e => {
    if(drawing === true) {
      canvasMouseUp(e);
    }
  })

  document.addEventListener("mousedown", e => {
    if(e.target === $canvas) {
      addPaletteHistory();
      drawingUndoList.push(canvas.toDataURL());
      drawingRedoList = [];
      $redo.classList.remove("active");
      drawing = true;
      pageX = e.pageX - e.offsetX;
      pageY = e.pageY - e.offsetY;
      $toolBar.style.pointerEvents = "none";
      $colorBar.style.pointerEvents = "none";
      $canvasPage.style.pointerEvents = "none";
      ctx.fillStyle = $color.value;
      ctx.strokeStyle = $color.value;
      ctx.lineWidth = drawingSize;
      ctx.filter = `blur(${drawingBlur}px)`;
      if(drawingStyle === "pixel") ctx.fillRect(e.offsetX - (drawingSize / 2), e.offsetY - (drawingSize / 2), drawingSize, drawingSize);
      if(drawingStyle === "circle") {
        ctx.arc(e.offsetX, e.offsetY, drawingSize / 2, 0, Math.PI * 2, false);
        ctx.fill();
      };
      if(drawingStyle === "line") {
        if(strokeStyle === "round") {
          ctx.arc(e.offsetX, e.offsetY, drawingSize / 2, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.beginPath();
        };
        loadDrawing.setAttribute("src", drawingUndoList[drawingUndoList.length - 1]);
        drawingLine = [{x: e.offsetX, y: e.offsetY}];
        ctx.moveTo(e.offsetX, e.offsetY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      };
    };
  });

  document.addEventListener("mousemove", e => {
    if(drawing && (e.target === $canvas || e.target === $page)) {
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
      if(drawingStyle === "line") {
        ctx.filter = `blur(0px)`;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage(loadDrawing, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
        ctx.filter = `blur(${drawingBlur}px)`;
        if(strokeStyle === "round") {
          ctx.beginPath();
          ctx.arc(drawingLine[0].x, drawingLine[0].y, drawingSize / 2, 0, Math.PI * 2, false);
          ctx.fill();
        }
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
    };
  });

  document.addEventListener("mouseup", e => {
    if(drawing === true) {
      canvasMouseUp(e);
    }
  });

  function canvasMouseUp(e) {
    let img = document.createElement("img");
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;
    if(e.target === $page) {
      mouseX -= pageX;
      mouseY -= pageY;
    }
    img.setAttribute("src", drawingUndoList[drawingUndoList.length - 1]);
    img.onload = function() {
      if(drawingStyle === "line"){
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
      }
      $toolBar.style.pointerEvents = "";
      $colorBar.style.pointerEvents = "";
      if(drawingStyle === "line" && strokeStyle === "round") {
        ctx.beginPath();
        ctx.arc(drawingLine[0].x, drawingLine[0].y, drawingSize / 2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, drawingSize / 2, 0, Math.PI * 2, false);
        ctx.fill();
      }
      $canvasPage.style.pointerEvents = "";
      $undo.classList.add("active");
      drawing = false;
      ctx.beginPath();
    }
  }

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

function brushToolBarFunction() {
  $preview.width = 120;
  $preview.height = 120;

  previewCtx.fillStyle = "#fff";
  previewCtx.fillRect(0, 0, $preview.width, $preview.height);

  brushPreview();

  $toolBarToggleButton.forEach(i => i.addEventListener("click", e => {
    e.target.closest(".toolBars").classList.toggle("toggle");
  }));

  $brushButton.querySelectorAll("button").forEach(i => i.addEventListener("click", e => {
    if(e.target.id === "roundLine") {
      drawingStyle = "line";
      strokeStyle = "round";
    }else {
      strokeStyle = "";
      drawingStyle = e.target.id;
    }
    $brushButton.querySelector(".select").classList.remove("select");
    e.target.classList.add("select");
    brushPreview();
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
    brushPreview();
  }))
}

function brushPreview() {
  previewCtx.beginPath();
  previewCtx.fillStyle = "#fff";
  previewCtx.fillRect(0, 0, $preview.width, $preview.height);
  previewCtx.fillStyle = $color.value;
  previewCtx.strokeStyle = $color.value;
  previewCtx.lineWidth = drawingSize;
  previewCtx.filter = `blur(${drawingBlur}px)`;
  let pixelSize = drawingSize;

  if(previewCtx.lineWidth > 30) previewCtx.lineWidth = 30;
  if(pixelSize > 60) pixelSize = 60;

  if(drawingStyle === "pixel") previewCtx.fillRect($preview.width / 2 - (pixelSize / 2), $preview.height / 2 - (pixelSize / 2), pixelSize, pixelSize);
  if(drawingStyle === "circle") {
    previewCtx.arc($preview.width / 2, $preview.height / 2, pixelSize / 2, 0, Math.PI * 2, false);
    previewCtx.fill();
  };
  if(drawingStyle === "line") {
    if(strokeStyle === "round") {
      previewCtx.arc($preview.width / 2, $preview.height / 2 - 40, previewCtx.lineWidth / 2, 0, Math.PI * 2, false);
      previewCtx.fill();
      previewCtx.beginPath();
      previewCtx.arc($preview.width / 2, $preview.height / 2 + 40, previewCtx.lineWidth / 2, 0, Math.PI * 2, false);
      previewCtx.fill();
      previewCtx.beginPath();
    };
    previewCtx.moveTo($preview.width / 2, $preview.height / 2 - 40);
    previewCtx.lineTo($preview.width / 2, $preview.height / 2 + 40);
    previewCtx.stroke();
  };
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
    case 6 : return `#${hex}`;
    case 5 : return `#${hexCode[0]}${hexCode[1]}${hexCode[2]}${hexCode[3]}${hexCode[4]}${hexCode[4]}`;
    case 4 : return `#${hexCode[0]}${hexCode[1]}${hexCode[2]}${hexCode[2]}${hexCode[3]}${hexCode[3]}`;
    case 3 : return `#${hexCode[0]}${hexCode[0]}${hexCode[1]}${hexCode[1]}${hexCode[2]}${hexCode[2]}`;
    case 2 : return `#${hexCode[0]}${hexCode[0]}${hexCode[1]}${hexCode[1]}${hexCode[1]}${hexCode[1]}`;
    case 1 : return `#${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}`;
    case 0 : return `#000000`;
  }
};


window.onload = init();