function toggleClass(event) {
  event.preventDefault();

  const button = event.currentTarget;
  let container = button.previousElementSibling; // Get the element before the button

  // Ensure the correct container is selected (either a <ul> or a <section>)
  if (
    !container ||
    (!container.matches("ul") && !container.matches("section"))
  ) {
    return;
  }

  const listItems = container.querySelectorAll("li, .hidden-quote"); // Select <li> and hidden quotes

  let hasHiddenQuotes = false;

  listItems.forEach((li) => {
    if (li.classList.contains("hidden-quote")) {
      li.classList.remove("hidden-quote");
      li.classList.add("expanded");
    } else if (li.classList.contains("expanded")) {
      li.classList.remove("expanded");
      li.classList.add("hidden-quote");
      hasHiddenQuotes = true;
    }
  });

  button.textContent = hasHiddenQuotes
    ? "Toon 2 andere quotes"
    : "Toon minder quotes";
}

// Apply to both pages
document.querySelectorAll(".toggle-quotes").forEach((button) => {
  button.addEventListener("click", toggleClass);
});
