function boxSelector() {
    var character_choices = document.querySelectorAll(".character_choices");
    var movie_choices = document.querySelectorAll(".movie_choices");
    console.log(character_choices, movie_choices);
    if (character_choices) {
        character_choices.forEach(function (option) {
            option.addEventListener("click", function () {
                character_choices.forEach(function (e) {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"));
            });
        });
    }
    if (movie_choices) {
        movie_choices.forEach(function (option) {
            option.addEventListener("click", function () {
                movie_choices.forEach(function (e) {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"));
            });
        });
    }
}
document.addEventListener("DOMContentLoaded", function () {
    boxSelector();
});
