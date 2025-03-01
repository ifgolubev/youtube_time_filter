let minDuration = 4; // По умолчанию 4 минуты
let maxDuration = 0; // По умолчанию без ограничения

// Получаем сохраненные настройки
chrome.storage.sync.get(['minDuration', 'maxDuration'], function(result) {
  minDuration = result.minDuration || 4;
  maxDuration = result.maxDuration || 0;
  filterVideos();
});

// Слушаем изменения настроек
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateDurationLimits') {
    minDuration = request.minDuration;
    maxDuration = request.maxDuration;
    filterVideos();
  }
});

// Функция для конвертации времени в минуты
function timeToMinutes(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }
  return parts[0] + parts[1] / 60;
}

// Основная функция фильтрации
function filterVideos() {
  // Находим все видео на странице
  const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer');
  
  videos.forEach(video => {
    // Проверяем длительность обычных видео
    const timeElement = video.querySelector('#text.ytd-thumbnail-overlay-time-status-renderer');
    if (timeElement) {
      const duration = timeToMinutes(timeElement.textContent.trim());
      if (duration < minDuration || (maxDuration > 0 && duration > maxDuration)) {
        // Вместо display: none используем visibility: collapse для сохранения структуры
        video.style.display = 'none';
        video.style.height = '0';
        video.style.margin = '0';
        video.style.padding = '0';
        video.style.overflow = 'hidden';
      } else {
        video.style.display = '';
        video.style.height = '';
        video.style.margin = '';
        video.style.padding = '';
        video.style.overflow = '';
      }
    }
  });
  
  // Запускаем функцию для удаления пустых секций
  removeEmptySections();
}

// Функция для удаления пустых секций
function removeEmptySections() {
  // Находим все секции, которые могут содержать видео
  const sections = document.querySelectorAll('ytd-rich-section-renderer, ytd-shelf-renderer');
  
  sections.forEach(section => {
    // Проверяем, содержит ли секция видимые видео
    const visibleVideos = section.querySelectorAll('ytd-rich-item-renderer:not([style*="display: none"]), ytd-video-renderer:not([style*="display: none"]), ytd-grid-video-renderer:not([style*="display: none"])');
    
    if (visibleVideos.length === 0) {
      // Если нет видимых видео, скрываем всю секцию
      section.style.display = 'none';
      section.style.height = '0';
      section.style.margin = '0';
      section.style.padding = '0';
      section.style.overflow = 'hidden';
    } else {
      section.style.display = '';
      section.style.height = '';
      section.style.margin = '';
      section.style.padding = '';
      section.style.overflow = '';
    }
  });
}

// Наблюдатель за изменениями DOM
const observer = new MutationObserver(() => {
  filterVideos();
  // Добавляем небольшую задержку для обработки динамически загружаемого контента
  setTimeout(removeEmptySections, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 