import blocks from '../blocks.json' assert { type: 'json' };

function randomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getBlockHash(block) {
  return `${block.width}-${block.height}-${block.rotation || 0}`;
}

function efficientBlockPlacement(blocks, container) {
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  let fullness = 0;
  const blockCoordinates = [];
  const sizeColors = {};

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    let placed = false;
    const blockHash = getBlockHash(block);
    let color = sizeColors[blockHash];

    if (!color) {
      color = randomColor();
      sizeColors[blockHash] = color;
    }

    const rotations = block.rotation ? [block.rotation, 0, 90] : [0, 90];

    for (let rotation of rotations) {
      for (
        let y = 0;
        y <=
          container.height -
            (rotation % 180 === 90 ? block.width : block.height) && !placed;
        y++
      ) {
        for (
          let x = 0;
          x <=
            container.width -
              (rotation % 180 === 90 ? block.height : block.width) && !placed;
          x++
        ) {
          if (!blocksOverlap(x, y, block, blockCoordinates, rotation)) {
            blockCoordinates.push({
              top: y,
              left: x,
              right: x + (rotation % 180 === 90 ? block.height : block.width),
              bottom: y + (rotation % 180 === 90 ? block.width : block.height),
              initialOrder: i + 1,
              color: color,
              rotation: rotation,
            });

            fullness = calculateFullness(container, blockCoordinates);
            placed = true;
          }
        }
      }
    }
  }

  return {
    fullness: fullness,
    blockCoordinates: blockCoordinates,
  };
}

function rotateCoordinates(x, y, rotation) {
  if (rotation === 90) {
    return { x: y, y: -x };
  }
  return { x, y };
}

function blocksOverlap(x, y, block, blockCoordinates, rotation) {
  for (let i = 0; i < blockCoordinates.length; i++) {
    let coord = blockCoordinates[i];

    let rotatedCoord = rotateCoordinates(x, y, rotation);

    if (
      rotatedCoord.x < coord.right &&
      rotatedCoord.x + block.width > coord.left &&
      rotatedCoord.y < coord.bottom &&
      rotatedCoord.y + block.height > coord.top
    ) {
      return true;
    }
  }
  return false;
}

function calculateFullness(container, blockCoordinates) {
  const totalArea = container.width * container.height;
  let emptyArea = totalArea;

  for (let i = 0; i < blockCoordinates.length; i++) {
    const coord = blockCoordinates[i];
    emptyArea -= (coord.right - coord.left) * (coord.bottom - coord.top);
  }

  return 1 - emptyArea / totalArea;
}

const fullnessContainer = document.querySelector('.fullness-text');
const containerElement = document.getElementById('container');

const blockStyles = {
  position: 'absolute',
  transformOrigin: 'top left',
};

function rotateCoordinatesInternal(x, y, rotation, width, height) {
  if (rotation === 90) {
    return { x: y, y: -x, width: height, height: width };
  }
  return { x, y, width, height };
}

function displayResult(result) {
  fullnessContainer.textContent = result.fullness;

  const fragment = document.createDocumentFragment();
  result.blockCoordinates.forEach((coord, index) => {
    const { x, y, width, height } = rotateCoordinatesInternal(
      coord.left,
      coord.top,
      coord.rotation,
      coord.right - coord.left,
      coord.bottom - coord.top
    );

    const blockElement = document.createElement('div');
    blockElement.className = 'block';
    blockElement.style.width = `${width}px`;
    blockElement.style.height = `${height}px`;
    blockElement.style.top = `${y}px`;
    blockElement.style.left = `${x}px`;
    blockElement.style.background = coord.color;
    blockElement.innerText = coord.initialOrder;

    blockElement.setAttribute('data-width', width);
    blockElement.setAttribute('data-height', height);

    Object.assign(blockElement.style, blockStyles);
    if (coord.rotation === 90) {
      blockElement.style.transform = 'rotate(90deg)';
    }

    fragment.appendChild(blockElement);
  });

  containerElement.innerHTML = '';
  containerElement.appendChild(fragment);
}

const container = {
  width: containerElement.offsetWidth,
  height: containerElement.offsetHeight,
};

let result = efficientBlockPlacement(blocks, container);
displayResult(result);

const previousBlocks = blocks.slice();
let resizeTimeout;

window.addEventListener('resize', function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    if (containerElement) {
      container.width = containerElement.offsetWidth;
      container.height = containerElement.offsetHeight;

      result = efficientBlockPlacement(blocks, container);

      result.blockCoordinates.forEach((coord, index) => {
        const blockElement = containerElement.children[index];
        if (blockElement) {
          const { x, y, width, height } = rotateCoordinates(
            coord.left,
            coord.top,
            coord.rotation,
            coord.right - coord.left,
            coord.bottom - coord.top
          );

          const originalWidth = parseInt(
            blockElement.getAttribute('data-width'),
            10
          );
          const originalHeight = parseInt(
            blockElement.getAttribute('data-height'),
            10
          );

          blockElement.style.width = `${Math.max(originalWidth, width)}px`;
          blockElement.style.height = `${Math.max(originalHeight, height)}px`;
          blockElement.style.top = `${y}px`;
          blockElement.style.left = `${x}px`;

          blockElement.setAttribute(
            'data-width',
            Math.max(originalWidth, width)
          );
          blockElement.setAttribute(
            'data-height',
            Math.max(originalHeight, height)
          );
        }
      });

      displayResult(result);
    }
  }, 200);
});
