document.addEventListener('DOMContentLoaded', function() {
  const minDurationSlider = document.getElementById('minDurationSlider');
  const minDurationInput = document.getElementById('minDuration');
  const maxDurationSlider = document.getElementById('maxDurationSlider');
  const maxDurationInput = document.getElementById('maxDuration');
  const maxDurationGroup = document.getElementById('maxDurationGroup');
  const durationWarning = document.getElementById('durationWarning');
  const saveButton = document.getElementById('save');

  // Загружаем сохраненные настройки
  chrome.storage.sync.get(['minDuration', 'maxDuration'], function(result) {
    const minDuration = result.minDuration || 4;
    const maxDuration = result.maxDuration || 0;
    
    minDurationSlider.value = minDuration;
    minDurationInput.value = minDuration;
    maxDurationSlider.value = maxDuration;
    maxDurationInput.value = maxDuration;
    
    checkDurationValues();
  });

  // Функция проверки корректности значений
  function checkDurationValues() {
    const minValue = parseInt(minDurationInput.value);
    const maxValue = parseInt(maxDurationInput.value);
    
    if (maxValue > 0 && maxValue <= minValue) {
      maxDurationGroup.classList.add('disabled');
      durationWarning.style.display = 'block';
    } else {
      maxDurationGroup.classList.remove('disabled');
      durationWarning.style.display = 'none';
    }
  }

  // Синхронизация ползунков и полей ввода
  minDurationSlider.addEventListener('input', function() {
    minDurationInput.value = this.value;
    checkDurationValues();
  });

  minDurationInput.addEventListener('input', function() {
    minDurationSlider.value = this.value;
    checkDurationValues();
  });

  maxDurationSlider.addEventListener('input', function() {
    maxDurationInput.value = this.value;
    checkDurationValues();
  });

  maxDurationInput.addEventListener('input', function() {
    maxDurationSlider.value = this.value;
    checkDurationValues();
  });

  // Обработчик кнопки сохранения
  saveButton.addEventListener('click', function() {
    const minDuration = parseInt(minDurationInput.value);
    let maxDuration = parseInt(maxDurationInput.value);
    
    // Если максимальная длительность меньше минимальной и не равна 0, 
    // устанавливаем её в 0 (без ограничения)
    if (maxDuration > 0 && maxDuration <= minDuration) {
      maxDuration = 0;
      maxDurationInput.value = 0;
      maxDurationSlider.value = 0;
    }
    
    chrome.storage.sync.set({ minDuration, maxDuration }, function() {
      // Отправляем сообщение на обновление контента
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateDurationLimits',
          minDuration,
          maxDuration
        });
      });
    });
  });
}); 