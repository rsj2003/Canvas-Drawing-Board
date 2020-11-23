let dstImage;
let dstData;
let pageIdx;
let floodStartColor = new Object();
let floodTodo;
let floodAccuracy = 0;

function getPixelIdx(x, y) {
	return (y * $canvas.width + x) * 4;
};

function matchFloodColor(data, idx, Scolor, Fcolor) {
  // return (data[idx] === Scolor.r && data[idx + 1] === Scolor.g && data[idx + 2] === Scolor.b && data[idx + 3] === Scolor.a);
  if(data[idx] === Fcolor.r && data[idx + 1] === Fcolor.g && data[idx + 2] === Fcolor.b && data[idx + 3] === Fcolor.a) return false;
  return ((data[idx] <= Scolor.r + floodAccuracy && data[idx] >= Scolor.r - floodAccuracy) && (data[idx + 1] <= Scolor.g + floodAccuracy && data[idx + 1] >= Scolor.g - floodAccuracy) && (data[idx + 2] <= Scolor.b + floodAccuracy && data[idx + 2] >= Scolor.b - floodAccuracy) && (data[idx + 3] <= Scolor.a + floodAccuracy && data[idx + 3] >= Scolor.a - floodAccuracy));
};

function colorPixel(data, idx, color) {
	data[idx] = color.r;
  data[idx + 1] = color.g;
  data[idx + 2] = color.b;
  data[idx + 3] = color.a;
};

function floodFill(startX, startY, fillColor) {
  dstImage = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
  dstData = dstImage.data;
  pageIdx = getPixelIdx(startX, startY);
  floodStartColor = {r: dstData[pageIdx], g: dstData[pageIdx+1], b: dstData[pageIdx+2], a: dstData[pageIdx+3]};
  todo = [[startX, startY]];
  
  while (todo.length) {
  	let pos = todo.pop();
    let posX = pos[0];
    let posY = pos[1];    
    let posIdx = getPixelIdx(posX, posY);

    while((posY-- >= 0) && matchFloodColor(dstData, posIdx, floodStartColor, fillColor)) {
      posIdx -= $canvas.width * 4;
    }

    posIdx += $canvas.width * 4;
    ++posY;
    let reachLeft = false;
    let reachRight = false;

    while((posY++ < $canvas.height - 1) && matchFloodColor(dstData, posIdx, floodStartColor, fillColor)) {
      colorPixel(dstData, posIdx, fillColor);
      if (posX > 0) {
        if (matchFloodColor(dstData, posIdx - 4, floodStartColor, fillColor)) {
          if (!reachLeft) {
            todo.push([posX - 1, posY]);
            reachLeft = true;
          }
        }
        else if (reachLeft) {
          reachLeft = false;
        }
      }
      if (posX < $canvas.width - 1) {
        if (matchFloodColor(dstData, posIdx + 4, floodStartColor, fillColor)) {
          if (!reachRight) {
            todo.push([posX + 1, posY]);
            reachRight = true;
          }
        }
        else if (reachRight) {
          reachRight = false;
        }
      }
      posIdx += $canvas.width * 4;
    }
  }
  ctx.putImageData(dstImage, 0, 0);
};