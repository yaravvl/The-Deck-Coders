document.addEventListener("DOMContentLoaded", () => {
  const profilePicture = document.querySelector(".image");
  const changePictureBtn = document.querySelector(".change-picture-button");
  const modal = document.querySelector(".profiel-fotos-modal");
  const pictureOptions = document.querySelectorAll(".picture-option");

  const toggleButton = document.querySelector(".bi-cloud-sun-fill");
  const body = document.body;

  const savedProfilePic = localStorage.getItem("profilePicture");
  if (savedProfilePic) {
    profilePicture.src = savedProfilePic;
  }

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      localStorage.setItem(
        "theme",
        body.classList.contains("dark-mode") ? "dark" : "light"
      );
    });
  }

  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
  }

  changePictureBtn.addEventListener("click", () => {
    modal.showModal();
  });

  pictureOptions.forEach((option) => {
    option.addEventListener("click", function () {
      profilePicture.src = this.src;
      localStorage.setItem("profilePicture", this.src)
      modal.close();
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });
});

//Doorverwijzen van de pagina's nadat er op submit wordt gedrukt
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();
  window.location.href = "./welcomepage.html";
});
