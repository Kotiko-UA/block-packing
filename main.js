function efficientPacking(blocks, container) {
  // Сортуємо блоки за площею у спадаючому порядку
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  const blockCoordinates = [];
  let totalArea = 0;
  let internalEmptySpace = 0;

  // Починаємо розміщення блоків
  for (const block of blocks) {
    let placed = false;

    // Перевіряємо можливі позиції для розміщення блока
    for (const coord of blockCoordinates) {
      if (
        block.width <= coord.right - coord.left &&
        block.height <= coord.bottom - coord.top
      ) {
        // Розміщення блока
        blockCoordinates.push({
          top: coord.top,
          left: coord.left,
          right: coord.left + block.width,
          bottom: coord.top + block.height,
          initialOrder: block.initialOrder,
        });

        // Оновлюємо позиції для наступних блоків
        coord.left += block.width;
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Якщо блок не може бути розміщений у вже існуючих позиціях, то додаємо новий ряд
      const newRowTop = blockCoordinates.reduce(
        (maxTop, coord) => Math.max(maxTop, coord.bottom),
        0
      );

      const newCoord = {
        top: newRowTop,
        left: 0,
        right: block.width,
        bottom: newRowTop + block.height,
        initialOrder: block.initialOrder,
      };

      blockCoordinates.push(newCoord);
      // Оновлюємо змінну coord для подальшого використання
      coord = newCoord;
    }

    // Обчислення загальної площі
    totalArea += block.width * block.height;
    // Обчислення площі внутрішньої порожнини
    internalEmptySpace +=
      (coord.right - coord.left - block.width) *
      (coord.bottom - coord.top - block.height);
  }

  // Обчислення коефіцієнта корисного використання простору за новою формулою
  const fullness = 1 - internalEmptySpace / (internalEmptySpace + totalArea);

  return { fullness, blockCoordinates };
}

// Приклад використання
const blocks = [
  { width: 90, height: 90, initialOrder: 1 },
  { width: 60, height: 115, initialOrder: 2 },
  // Додайте інші блоки за потребою
];

const mainBlock = document.getElementById('container');

window.addEventListener('resize', onResize);

const container = {
  width: mainBlock.clientWidth,
  height: mainBlock.clientHeight,
};

const result = efficientPacking(blocks, container);

function onResize() {
  console.log(result);
}

console.log(result);
