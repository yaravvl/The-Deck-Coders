function boxSelector() {
    var character_choices = document.querySelectorAll(".character_choices");
    var movie_choices = document.querySelectorAll(".movie_choices");
    var like_button = document.querySelector(".bi-hand-thumbs-up");
    var dislike_button = document.querySelector(".bi-hand-thumbs-down");
    var character_id = document.getElementById("profile_picture");
    var movie_id = document.getElementById("movie_id");
    var quote_choice = document.getElementById("quote_id");
    quote_choice.value = "";
    movie_id.value = "";
    character_id.value = "";
    if (dislike_button || like_button) {
        like_button.addEventListener("click", function (e) {
            quote_choice.value = "favorited";
            alert('Quote toegevoegd aan favorieten!');
        });
        dislike_button.addEventListener("click", function (e) {
            quote_choice.value = "blacklist";
            alert('test!');
        });
    }
    console.log(character_choices, movie_choices);
    if (character_choices) {
        character_choices.forEach(function (option) {
            option.addEventListener("click", function () {
                character_choices.forEach(function (e) {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"));
                character_id.value = option.getAttribute("name");
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
                movie_id.value = option.getAttribute("name");
            });
        });
    }
}
document.addEventListener("DOMContentLoaded", function () {
    boxSelector();
});
