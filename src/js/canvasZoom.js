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

    let maxWidth = $canvasPage.style.width.replace(/%/gi, "") * window.innerWidth / 100;
    let maxHeight = $canvasPage.style.height.replace(/%/gi, "") * window.innerHeight / 100;
    let width = Number($canvas.style.width.replace(/px/gi, ""));
    let height = Number($canvas.style.height.replace(/px/gi, ""));
    // console.log(maxWidth, Number($canvas.style.width.replace(/px/gi, "")));
    if(maxWidth < width || maxHeight < height) {
      $canvas.classList.remove("center");
      // $canvasPage.scrollTo((width - maxWidth), (height - maxHeight));
      return;
    }
    $canvas.classList.add("center");
  }
}