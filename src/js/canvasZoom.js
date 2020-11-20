const $canvasZoomScale = document.getElementById("canvasZoomScale");
let scale = 1;
let normalSize = {width: 1200, height: 600};
let pageMoving = false;
let moveStartScrollX;
let moveStartScrollY;
let moveStartX;
let moveStartY;
let moveX;
let moveY;

function canvasZoom() {
  $canvasPage.onwheel= function(e){
    e.preventDefault();
    scale = Number((scale - (e.deltaY / 2000)).toFixed(2));
    let maxWidth = $drawingPage.style.width.replace(/%/gi, "") * window.innerWidth / 100;
    let maxHeight = $drawingPage.style.height.replace(/%/gi, "") * window.innerHeight / 100;
    let width = Number($canvas.style.width.replace(/px/gi, ""));
    let height = Number($canvas.style.height.replace(/px/gi, ""));
    let zoomX = (width - maxWidth) / 2;
    let zoomY = (height - maxHeight) / 2;
    if(e.target === $canvas) {
      zoomX = (e.offsetX - maxWidth / 2);
      zoomY = (e.offsetY - maxHeight / 2);
      // console.log(e.pageX);
    }
    if(scale < 0.05) scale = 0.05;
    layerCanvasList.forEach(i => i.style.width = `${normalSize.width * scale}px`);
    layerCanvasList.forEach(i => i.style.height = `${normalSize.height * scale}px`);
    $canvasZoomScale.innerHTML = scale;
    $canvasZoomScale.style.transition = "0s";
    $canvasZoomScale.style.opacity = 1;
    setTimeout(e => {
      $canvasZoomScale.style.transition = "";
      $canvasZoomScale.style.opacity = 0;
    },0);

    width = Number($canvas.style.width.replace(/px/gi, ""));
    height = Number($canvas.style.height.replace(/px/gi, ""));
    layerCanvasList.forEach(i => i.classList.remove("center"));
    layerCanvasList.forEach(i => i.classList.remove("leftCenter"));
    layerCanvasList.forEach(i => i.classList.remove("topCenter"));
    if(maxWidth >= width && maxHeight >= height) {
      layerCanvasList.forEach(i => i.classList.add("center"));
      return;
    }
    if(maxWidth < width && maxHeight >= height) {
      layerCanvasList.forEach(i => i.classList.add("topCenter"));
      $canvasPage.scrollTo(zoomX, 0);
      console.log($canvasPage.scrollLeft);
      return;
    }
    if(maxWidth >= width && maxHeight < height) {
      layerCanvasList.forEach(i => i.classList.add("leftCenter"));
      $canvasPage.scrollTo(0, zoomY);
      return;
    }
    $canvasPage.scrollTo(zoomX, zoomY);
  }
}

function pageMouseMove() {
  if(pressSpace && canDrawing) {
    canDrawing = false;
    $canvasPage.style.cursor = "grab";
  }
  if(!pressSpace && !canDrawing) {
    canDrawing = true;
    if(pageMoving) $canvasPage.style.cursor = "grabbing";
    if(!pageMoving) $canvasPage.style.cursor = "";
  }
}

function pageMouseMoveEvent() {
  $canvas.addEventListener("mousedown", e => {
    canvasZoomMove(e);
  })
  document.addEventListener("mousemove", e => {
    if(pageMoving) {
      moveX = moveStartScrollX + (moveStartX - e.pageX);
      moveY = moveStartScrollY + (moveStartY - e.pageY);
      $canvasPage.scrollTo(moveX, moveY);
    }
  })
  document.addEventListener("mouseup", e => {
    if(pageMoving) {
      pageMoving = false;
      if(pressSpace) $canvasPage.style.cursor = "grab";
      if(!pressSpace) $canvasPage.style.cursor = "";
      $page.style.cursor = "";
    }
  })
}

function canvasZoomMove(e) {
  if(pressSpace) {
    pageMoving = true;
    $canvasPage.style.cursor = "grabbing";
    $page.style.cursor = "grabbing";
    moveStartX = e.pageX;
    moveStartY = e.pageY;
    moveStartScrollX = $canvasPage.scrollLeft;
    moveStartScrollY = $canvasPage.scrollTop;
  }
}