const sellBtn = document.getElementById("sellBtn");
const rentBtn = document.getElementById("rentBtn");
const flipCard = document.getElementById("flipCard");

let productType = "sell";


sellBtn.addEventListener("click", () => {

    productType = "sell";

    sellBtn.classList.add("active");
    rentBtn.classList.remove("active");

    flipCard.classList.remove("flip");

});


rentBtn.addEventListener("click", () => {

    productType = "rent";

    rentBtn.classList.add("active");
    sellBtn.classList.remove("active");

    flipCard.classList.add("flip");

});



const imageSell = document.getElementById("imageSell");
const previewSell = document.getElementById("previewSell");

imageSell.addEventListener("change", () => {

    const file = imageSell.files[0];

    if (file) {
        previewSell.src = URL.createObjectURL(file);
    }

});



const imageRent = document.getElementById("imageRent");
const previewRent = document.getElementById("previewRent");

imageRent.addEventListener("change", () => {

    const file = imageRent.files[0];

    if (file) {
        previewRent.src = URL.createObjectURL(file);
    }

});