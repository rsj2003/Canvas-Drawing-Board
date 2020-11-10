const $page = document.getElementById("page");
const $paletteHistory = document.getElementById("paletteHistory");
const $palette = document.getElementById("palette");
const $color = document.getElementById("color");
const $colorInput = document.getElementById("colorInput");
const $colorIcon = document.getElementById("colorIcon");
const $canvas = document.getElementById("canvas");
const $canvasPage = document.getElementById("canvasPage");
const $colorBar = document.getElementById("colorBar");
const $toolBar = document.getElementById("toolBar");
const $undo = document.getElementById("undo");
const ctx = $canvas.getContext("2d");
const hex = "0123456789abcdef".split("");
let $colors;
let $colorHistory;
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
let paletteHistory = new Array();
let x = 0;
let oldX = 0;
let y = 0;
let oldY = 0;
let mouseDown = false;
let dragX = false;
let dragY = false;
let pageX = 0;
let pageY = 0;
let drawing = false;
let drawingSize = 10;
let drawingStyle = "line";
let strokeStyle = "";
let drawingBlur = 0;
let drawingLine = new Array();
let drawingHistory = new Array();

function init() {
  const loading = document.getElementById("loadingPage");

  $canvas.width = (window.innerWidth / 10) * 8;
  $canvas.height = (window.innerHeight / 10) * 8;

  $canvas.style.width = `${$canvas.width}px`;
  $canvas.style.height = `${$canvas.height}px`;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, $canvas.width, $canvas.height);
  
  paletteFunction();
  canvasFunction();
  
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
  document.addEventListener("click", e => {
    if(e.target === $undo) {
      if(drawingHistory.length > 0) {
        let img = document.createElement("img");
        img.setAttribute("src", drawingHistory[drawingHistory.length - 1]);
        img.onload = function() {
          ctx.clearRect(0, 0, $canvas.width, $canvas.height);
          ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height, 0, 0, $canvas.width, $canvas.height);  
          console.log(img);
        }
      }
    }
  })

  document.addEventListener("mousedown", e => {
    if(e.target === $canvas) {
      addPaletteHistory();
      drawingHistory.push(canvas.toDataURL());
      drawing = true;
      pageX = e.pageX - e.offsetX;
      pageY = e.pageY - e.offsetY;
      $toolBar.style.pointerEvents = "none";
      $colorBar.style.pointerEvents = "none";
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
        if(drawingLine.length > 3) {
          ctx.beginPath();
          const moveX = drawingLine[drawingLine.length - 3].x;
          const moveY = drawingLine[drawingLine.length - 3].y;
          ctx.moveTo(moveX, moveY);
          for(let i = drawingLine.length - 2; i < drawingLine.length; i++) {
            const moveX = drawingLine[i].x;
            const moveY = drawingLine[i].y;
            ctx.lineTo(moveX, moveY);
          }
        }else {
          for(let i = 0; i < drawingLine.length; i++) {
            const moveX = drawingLine[i].x;
            const moveY = drawingLine[i].y;
            ctx.lineTo(moveX, moveY);
          }
        }
        ctx.lineTo(mouseX, mouseY);
        drawingLine.push({x: mouseX, y: mouseY});
        ctx.stroke();
      };
    };
  });

  document.addEventListener("mouseup", e => {
    if(drawing === true) {
      $toolBar.style.pointerEvents = "";
      $colorBar.style.pointerEvents = "";
      if(drawing && e.target === $canvas && drawingStyle === "line" && strokeStyle === "round") {
        ctx.beginPath();
        ctx.arc(e.offsetX, e.offsetY, drawingSize / 2, 0, Math.PI * 2, false);
        ctx.fill();
      }
      drawing = false;
      ctx.beginPath();
    }
  });
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
  if(hexCode.length === 6) {
    return `#${hex}`;
  }
  if(hexCode.length === 5) {
    return `#${hexCode[0]}${hexCode[1]}${hexCode[2]}${hexCode[3]}${hexCode[4]}${hexCode[4]}`;
  }
  if(hexCode.length === 4) {
    return `#${hexCode[0]}${hexCode[1]}${hexCode[2]}${hexCode[2]}${hexCode[3]}${hexCode[3]}`;
  }
  if(hexCode.length === 3) {
    return `#${hexCode[0]}${hexCode[0]}${hexCode[1]}${hexCode[1]}${hexCode[2]}${hexCode[2]}`;
  }
  if(hexCode.length === 2) {
    return `#${hexCode[0]}${hexCode[0]}${hexCode[1]}${hexCode[1]}${hexCode[1]}${hexCode[1]}`;
  }
  if(hexCode.length === 1) {
    return `#${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}${hexCode[0]}`;
  }
  if(hexCode.length === 0) {
    return `#000000`;
  }
};


window.onload = init();