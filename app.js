function randomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Функція для генерації хешу розмірів та повороту блоку
function getBlockHash(block) {
  return `${block.width}-${block.height}-${block.rotation || 0}`;
}

// Функція для розміщення блоків у контейнері
function efficientBlockPlacement(blocks, container) {
  // Сортуємо блоки в порядку спадання їх площі
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  // Ініціалізуємо змінні для результатів
  let fullness = 0;
  let blockCoordinates = [];
  let sizeColors = {}; // Об'єкт для зберігання кольорів за розміром

  // Вираховуємо координати для кожного блоку
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    let placed = false;
    let blockHash = getBlockHash(block);

    // Перевіряємо, чи у нас вже є колір для цього блоку
    let color = sizeColors[blockHash];

    if (!color) {
      // Якщо немає коліра, генеруємо новий
      color = randomColor();
      sizeColors[blockHash] = color;
    }

    let rotations = block.rotation ? [block.rotation, 0] : [0]; // Додаємо 0 градусів для блоків, які не повертаються

    // Перевіряємо розміщення блока з різними кутами повороту
    for (let rotation of rotations) {
      // Перевіряємо кожну позицію у контейнері
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
          // Перевіряємо, чи блок не перекривається з іншими вже розміщеними блоками
          if (!blocksOverlap(x, y, block, blockCoordinates, rotation)) {
            // Додаємо блок у список розміщених
            blockCoordinates.push({
              top: y,
              left: x,
              right: x + (rotation % 180 === 90 ? block.height : block.width),
              bottom: y + (rotation % 180 === 90 ? block.width : block.height),
              initialOrder: i + 1,
              color: color, // Встановлюємо колір
            });

            // Оновлюємо коефіцієнт корисного використання простору
            fullness = calculateFullness(container, blockCoordinates);

            // Встановлюємо прапорець, що блок розміщений
            placed = true;
          }
        }
      }
    }
  }

  // Повертаємо результат
  return {
    fullness: fullness,
    blockCoordinates: blockCoordinates,
  };
}

// Функція для перевірки перекривання блоків
function blocksOverlap(x, y, block, blockCoordinates) {
  for (let i = 0; i < blockCoordinates.length; i++) {
    let coord = blockCoordinates[i];
    if (
      x < coord.right &&
      x + block.width > coord.left &&
      y < coord.bottom &&
      y + block.height > coord.top
    ) {
      return true; // Блоки перекриваються
    }
  }
  return false; // Блоки не перекриваються
}

// Функція для розрахунку коефіцієнта корисного використання простору
function calculateFullness(container, blockCoordinates) {
  let totalArea = container.width * container.height;
  let emptyArea = 0;

  // Розраховуємо площу порожнин в середині контейнера
  for (let y = 1; y < container.height - 1; y++) {
    for (let x = 1; x < container.width - 1; x++) {
      if (!blocksOverlap(x, y, { width: 1, height: 1 }, blockCoordinates)) {
        emptyArea++;
      }
    }
  }

  // Розраховуємо та повертаємо коефіцієнт корисного використання простору
  return 1 - emptyArea / (emptyArea + totalArea);
}
const fullnessContainer = document.querySelector('.fullness-text');
const containerElement = document.getElementById('container');

function displayResult(result) {
  // Виводимо коефіцієнт корисного використання простору
  fullnessContainer.textContent = result.fullness;

  // Виводимо блоки у контейнері
  result.blockCoordinates.forEach((coord) => {
    let blockElement = document.createElement('div');
    blockElement.className = 'block';
    blockElement.style.width = coord.right - coord.left + 'px';
    blockElement.style.height = coord.bottom - coord.top + 'px';
    blockElement.style.top = coord.top + 'px';
    blockElement.style.left = coord.left + 'px';
    blockElement.style.background = coord.color; // Задаємо колір
    blockElement.innerText = coord.initialOrder;
    containerElement.appendChild(blockElement);
  });
}

// Приклад використання
let blocks = [
  { width: 190, height: 90 },
  { width: 190, height: 90 },
  { width: 80, height: 290 },
  { width: 70, height: 390 },
  { width: 160, height: 90 },
  { width: 160, height: 90 },
  { width: 50, height: 290 },
  { width: 40, height: 90 },
  { width: 30, height: 50 },
  { width: 20, height: 11 },
  { width: 10, height: 25 },
  { width: 15, height: 378 },
  { width: 25, height: 371 },
  { width: 35, height: 110 },
  { width: 95, height: 10 },
  { width: 85, height: 93 },
  { width: 75, height: 115 } /* інші блоки */,
];
const container = {
  width: containerElement.offsetWidth,
  height: containerElement.offsetHeight,
};

// Викликаємо функцію та відображаємо результат
let result = efficientBlockPlacement(blocks, container);
displayResult(result);

// Збереження попередніх блоків
let previousBlocks = blocks.slice();

// Обробник події для перерахунку розташування блоків при зміні розміру вікна
window.addEventListener('resize', function () {
  // Очищаємо контейнер перед перерахунком
  if (containerElement) {
    containerElement.innerHTML = '';
    // Отримуємо новий розмір вікна
    container.width = containerElement.offsetWidth;
    container.height = containerElement.offsetHeight;

    // Викликаємо функцію та відображаємо оновлений результат
    result = efficientBlockPlacement(previousBlocks, container);
    displayResult(result);
  }
});
