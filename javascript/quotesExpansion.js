function toggleClass(event) {
  event.preventDefault();

  const button = event.currentTarget;
  const ul = button.previousElementSibling; // Get the <ul> before the button
  const listItems = ul.querySelectorAll("li"); // Get all the <li> elements inside <ul>

  // Loop through each <li> and toggle the 'hidden-quote' class only on <li> that has it
  listItems.forEach((li) => {
    if (li.classList.contains("hidden-quote")) {
      li.classList.remove("hidden-quote");
      li.classList.add("expanded");
    } else if (li.classList.contains("expanded")) {
      li.classList.remove("expanded");
      li.classList.add("hidden-quote");
    }
  });

  // Change button text based on the state of the quotes
  const isAnyItemHidden = Array.from(listItems).some((li) =>
    li.classList.contains("hidden-quote")
  );

  if (!isAnyItemHidden) {
    button.textContent = "Toon minder quotes";
  } else {
    button.textContent = "Toon 2 andere quotes";
  }
}

// Add event listener to all toggle buttons
document
  .querySelectorAll(".toggle-quotes")
  .forEach((button) => button.addEventListener("click", toggleClass));
