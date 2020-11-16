const $page = document.getElementById("page");
const $popBackground = document.getElementById("popBackground");
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
  key();
  
  setTimeout(_ => {
    loading.style.opacity = 0;
    setTimeout(_ => loading.remove(), 500);
  },1000);  
};

function key() {
  document.addEventListener("keydown", e => {
    // console.log(e.key);
    // if(e.key === "Control") {
    //   e.preventDefault();
    //   return false;
    // }
  })
  document.addEventListener("keypress", e => {
    // console.log(e.key);
    // if(e.key === "Control") {
    //   e.preventDefault();
    //   e.returnValue = false;
    //   return false;
    // }
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