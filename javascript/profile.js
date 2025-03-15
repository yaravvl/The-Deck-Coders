document.addEventListener("DOMContentLoaded", () => {
    const profilePicture = document.querySelector(".image")
    const changePictureBtn = document.querySelector(".change-picture-button");
    const modal = document.querySelector(".profiel-fotos-modal");
    const pictureOptions = document.querySelectorAll(".picture-option");

    const toggleButton = document.querySelector(".bi-cloud-sun-fill"); 
    const body = document.body;

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
        });
    }


    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    }
    
    changePictureBtn.addEventListener("click", () => {
        modal.showModal();
    });

    pictureOptions.forEach(option => {
        option.addEventListener("click", function () {
            profilePicture.src = this.src;
            modal.close();
        });
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.close();
        }
    });
});