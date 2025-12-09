let currentSlide = 0; // Текущий индекс слайда

/**
 * Функция отображает слайд с заданным индексом
 * 
 * @param {number} index - индекс слайда
 * 
 * Если индекс больше, чем количество слайдов, то функция
 * установит текущий слайд в 0.
 * Если индекс меньше 0, то функция
 * установит текущий слайд в количество слайдов - 1.
 * Иначе функция
 * установит текущий слайд в переданный индекс.
 * 
 * Функция также добавляет класс active к слайду
 * с заданным индексом и изменяет трансформацию
 * контейнера со слайдами.
 */
function showSlide(index) {
    const slides = document.querySelectorAll('.slide-masters');
    slides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= slides.length) {
        currentSlide = 0; // Перейти к первому слайду
    } else if (index < 0) {
        currentSlide = slides.length - 1; // Перейти к последнему слайду
    } else {
        currentSlide = index; // Установить текущий слайд
    }
    
    slides[currentSlide].classList.add('active');
    document.querySelector('.slides-masters').style.transform = `translateX(-${currentSlide * 100}%)`;
}

function changeSlide(direction) {
    showSlide(currentSlide + direction); // Увеличиваем или уменьшаем текущий индекс
}

showSlide(currentSlide);
