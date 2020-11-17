const $canvasZoomScale = document.getElementById("canvasZoomScale");
let scale = 1;
let normalSize = {width: 1200, height: 600};

function canvasZoom() {
  $canvasPage.onwheel= function(e){
    e.preventDefault();
    scale = Number((scale - (e.deltaY / 2000)).toFixed(2));
    if(scale < 0.05) scale = 0.05;
    $canvas.style.width = `${normalSize.width * scale}px`;
    $canvas.style.height = `${normalSize.height * scale}px`;
    $canvasZoomScale.innerHTML = scale;
    $canvasZoomScale.style.transition = "0s";
    $canvasZoomScale.style.opacity = 1;
    setTimeout(e => {
      $canvasZoomScale.style.transition = ".5s .5s";
      $canvasZoomScale.style.opacity = 0;
    },0);

    let maxWidth = $drawingPage.style.width.replace(/%/gi, "") * window.innerWidth / 100;
    let maxHeight = $drawingPage.style.height.replace(/%/gi, "") * window.innerHeight / 100;
    let width = Number($canvas.style.width.replace(/px/gi, ""));
    let height = Number($canvas.style.height.replace(/px/gi, ""));
    $canvas.classList.remove("center");
    $canvas.classList.remove("leftCenter");
    $canvas.classList.remove("topCenter");
    if(maxWidth >= width && maxHeight >= height) {
      $canvas.classList.add("center");
      // $canvasPage.scrollTo((width - maxWidth), (height - maxHeight));
      return;
    }
    if(maxWidth < width && maxHeight >= height) {
      $canvas.classList.add("topCenter");
      // $canvasPage.scrollTo((width - maxWidth), (height - maxHeight));
      return;
    }
    if(maxWidth >= width && maxHeight < height) {
      $canvas.classList.add("leftCenter");
      // $canvasPage.scrollTo((width - maxWidth), (height - maxHeight));
      return;
    }
  }
}