// Получаем элементы
const modal = document.getElementById("myModal");
const img = document.querySelectorAll(".gallery-item img");
const modalImg = document.getElementById("img01");
const captionText = document.getElementById("caption");
const span = document.getElementsByClassName("close")[0];

// При клике на изображение открываем модальное окно
img.forEach((item) => {
    item.onclick = function(){
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt; // Текст описания
    }
});

// При клике на (x) мы закрываем модальное окно
span.onclick = () => { 
    modal.style.display = "none";
}
