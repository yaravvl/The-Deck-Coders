function boxSelector() {
    let character_choices: NodeListOf<HTMLElement> = document.querySelectorAll(".character_choices");
    let movie_choices: NodeListOf<HTMLElement> = document.querySelectorAll(".movie_choices");
    let like_button: HTMLElement | null = document.querySelector(".bi-hand-thumbs-up");
    let dislike_button: HTMLElement | null= document.querySelector(".bi-hand-thumbs-down");
    let character_id : HTMLInputElement | null= document.getElementById("profile_picture") as HTMLInputElement
    let movie_id : HTMLInputElement | null = document.getElementById("movie_id") as HTMLInputElement
    let quote_choice : HTMLInputElement | null = document.getElementById("quote_id") as HTMLInputElement

    quote_choice.value = "";
    movie_id.value = "";
    character_id.value = "";
    if(dislike_button || like_button) {
        like_button!.addEventListener("click", (e) => {
           quote_choice.value = "favorited"
           alert('Quote toegevoegd aan favorieten!');
        })
        dislike_button!.addEventListener("click", (e) => {
           quote_choice.value = "blacklist"
           alert('test!');
        })
     }

    console.log(character_choices, movie_choices)
    if (character_choices) {
        character_choices.forEach((option) => {
            option.addEventListener("click", () => {
                character_choices.forEach((e) => {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"))
                character_id.value = option.getAttribute("name")!
            });
        });
    }

    if (movie_choices) {
        movie_choices.forEach((option) => {
            option.addEventListener("click", (e) => {
                movie_choices.forEach((e) => {
                    e.classList.remove("selected");
                });
                option.classList.add("selected");
                console.log(option.getAttribute("name"))
                movie_id.value = option.getAttribute("name")!
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    boxSelector();
});
