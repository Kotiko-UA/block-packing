// Функція для розміщення блоків у контейнері
function efficientBlockPlacement(blocks, container) {
  // Сортуємо блоки в порядку спадання їх площі
  blocks.sort((a, b) => b.width * b.height - a.width * a.height);

  // Ініціалізуємо змінні для результатів
  let fullness = 0;
  let blockCoordinates = [];

  // Вираховуємо координати для кожного блоку
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    let placed = false;

    // Перевіряємо кожну позицію у контейнері
    for (let y = 0; y <= container.height - block.height && !placed; y++) {
      for (let x = 0; x <= container.width - block.width && !placed; x++) {
        // Перевіряємо, чи блок не перекривається з іншими вже розміщеними блоками
        if (!blocksOverlap(x, y, block, blockCoordinates)) {
          // Додаємо блок у список розміщених
          blockCoordinates.push({
            top: y,
            left: x,
            right: x + block.width,
            bottom: y + block.height,
            initialOrder: i + 1,
          });

          // Оновлюємо коефіцієнт корисного використання простору
          fullness = calculateFullness(container, blockCoordinates);

          // Встановлюємо прапорець, що блок розміщений
          placed = true;
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

// Код для відображення результату роботи алгоритму
function displayResult(result) {
  let containerElement = document.body;

  // Виводимо коефіцієнт корисного використання простору
  console.log('Fullness:', result.fullness);

  // Виводимо блоки у контейнері
  result.blockCoordinates.forEach((coord) => {
    let blockElement = document.createElement('div');
    blockElement.className = 'block';
    blockElement.style.width = coord.right - coord.left + 'px';
    blockElement.style.height = coord.bottom - coord.top + 'px';
    blockElement.style.top = coord.top + 'px';
    blockElement.style.left = coord.left + 'px';
    blockElement.innerText = coord.initialOrder;
    containerElement.appendChild(blockElement);
  });
}

// Приклад використання
let blocks = [
  { width: 90, height: 190 },
  { width: 80, height: 290 },
  { width: 70, height: 390 },
  { width: 60, height: 190 },
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
let container = { width: window.innerWidth, height: window.innerHeight };

// Викликаємо функцію та відображаємо результат
let result = efficientBlockPlacement(blocks, container);
displayResult(result);

// Збереження попередніх блоків
let previousBlocks = blocks.slice();

// Обробник події для перерахунку розташування блоків при зміні розміру вікна
window.addEventListener('resize', function () {
  // Очищаємо контейнер перед перерахунком
  document.body.innerHTML = '';

  // Отримуємо новий розмір вікна
  container.width = window.innerWidth;
  container.height = window.innerHeight;

  // Викликаємо функцію та відображаємо оновлений результат
  result = efficientBlockPlacement(previousBlocks, container);
  displayResult(result);
});
