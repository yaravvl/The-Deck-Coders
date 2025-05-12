function boxSelector() {
    let character_choices: NodeListOf<HTMLElement> = document.querySelectorAll(".character_choices");
    let movie_choices: NodeListOf<HTMLElement> = document.querySelectorAll(".movie_choices");
    console.log(character_choices, movie_choices)
    if (character_choices) {
        character_choices.forEach((option) => {
            option.addEventListener("click", () => {
                character_choices.forEach((e) => {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"))
            });
        });
    }
    if (movie_choices) {
        movie_choices.forEach((option) => {
            option.addEventListener("click", () => {
                movie_choices.forEach((e) => {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"))
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    boxSelector();
});
