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
      if(paletteHistory.length >= getIdx(e.target) - 1) {
        $color.value = paletteHistory[getIdx(e.target)];
        $colorInput.value = paletteHistory[getIdx(e.target)];
        brushPreview();
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
      brushPreview();
    };
    if(((movePaletteDeg - scroll < 0.03 && movePaletteDeg - scroll > -0.03) || (movePaletteDeg + scroll < 0.03 && movePaletteDeg + scroll > -0.03)) && paletteDeg !== movePaletteDeg) {
      $palette.style.transform = `rotate(${-movePaletteDeg}deg)`;
      paletteDeg = movePaletteDeg;
    };
  });
};
