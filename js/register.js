document.addEventListener("DOMContentLoaded", function () {

    const slides = document.querySelectorAll(".register-image");

    const previousButton =
        document.querySelector(".slider-prev");

    const nextButton =
        document.querySelector(".slider-next");


    if (slides.length === 0) {
        return;
    }


    let currentSlide = 0;



    function showSlide(index) {

        slides.forEach((slide, i) => {

            slide.style.opacity =
                i === index ? "1" : "0";

        });

    }



    function nextSlide() {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        showSlide(currentSlide);

    }




    function previousSlide() {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        showSlide(currentSlide);

    }


    // ARROW BUTTONS

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextSlide
        );

    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousSlide
        );

    }


  

    showSlide(currentSlide);


    // AUTOMATIC SLIDE

    setInterval(
        nextSlide,
        4000
    );

});