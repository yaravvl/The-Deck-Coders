document.addEventListener("DOMContentLoaded", () => {
    const profilePicture = document.querySelector(".image")
    const changePictureBtn = document.querySelector(".change-picture-button");
    const modal = document.querySelector(".profiel-fotos-modal");
    const pictureOptions = document.querySelectorAll(".picture-option");

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