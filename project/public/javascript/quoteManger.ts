import { Quote } from '../../types';

let blacklistedQuotes: Quote[] = [
    { _id: "1", dialog: "We set out to save the Shire, Sam, and it has been saved. But not for me.", movie: "The Lord of the Rings: The Return of the King", character: "Frodo" },
    { _id: "2", dialog: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", movie: "The Lord of the Rings: The Two Towers", character: "Legolas" },
    { _id: "3", dialog: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.", movie: "The Lord of the Rings: The Fellowship of the Ring", character: "Gandalf" }
];

let favoriteQuotes: Quote[] = [];

document.addEventListener('DOMContentLoaded', function() {
    let removeIcons = document.querySelectorAll('.bi-x-circle-fill');
    for (let i = 0; i < removeIcons.length; i++) {
        removeIcons[i].addEventListener('click', function(event) {
            let quoteItem = (event.currentTarget as HTMLElement).closest('li');
            if (!quoteItem) return;
            let quoteText = quoteItem.textContent ? quoteItem.textContent.trim() : '';
            for (let j = 0; j < blacklistedQuotes.length; j++) {
                if (quoteText.includes(blacklistedQuotes[j].dialog)) {
                    blacklistedQuotes.splice(j, 1);
                    break;
                }
            }
            quoteItem.remove();
            alert('Quote verwijderd!');
        });
    }

    let dislikeButton = document.querySelector('.bi-hand-thumbs-down');
    if (dislikeButton) {
        dislikeButton.addEventListener('click', function(event) {
            let quoteElement = (event.currentTarget as HTMLElement).closest('h2');
            if (!quoteElement) return;
            let quoteText = quoteElement.textContent ? quoteElement.textContent.trim() : '';
            let character = (document.querySelector('figcaption') as HTMLElement)?.textContent?.trim() || '';
            let movie = (document.querySelector('.movie-title') as HTMLElement)?.textContent?.trim() || 'Onbekende film';
            let newId = (blacklistedQuotes.length + 1).toString();
            blacklistedQuotes.push({
                _id: newId,
                dialog: quoteText,
                movie: movie,
                character: character
            });
            alert('Quote geblacklist!');
        });
    }

    let likeButton = document.querySelector('.bi-hand-thumbs-up');
    if (likeButton) {
        likeButton.addEventListener('click', function(event) {
            let quoteElement = (event.currentTarget as HTMLElement).closest('h2');
            if (!quoteElement) return;
            let quoteText = quoteElement.textContent ? quoteElement.textContent.trim() : '';
            let character = (document.querySelector('figcaption') as HTMLElement)?.textContent?.trim() || '';
            let movie = (document.querySelector('.movie-title') as HTMLElement)?.textContent?.trim() || 'Onbekende film';
            let alreadyFavorite = false;
            for (let i = 0; i < favoriteQuotes.length; i++) {
                if (favoriteQuotes[i].dialog === quoteText && favoriteQuotes[i].character === character) {
                    alreadyFavorite = true;
                }
            }
            if (alreadyFavorite) {
                alert('Deze quote staat al in je favorieten!');
                return;
            }
            let newId = (favoriteQuotes.length + 1).toString();
            favoriteQuotes.push({
                _id: newId,
                dialog: quoteText,
                movie: movie,
                character: character
            });
            alert('Quote toegevoegd aan favorieten!');
        });
    }

    let favRemoveIcons = document.querySelectorAll('.remove-favorite');
    for (let i = 0; i < favRemoveIcons.length; i++) {
        favRemoveIcons[i].addEventListener('click', function(event) {
            let quoteItem = (event.currentTarget as HTMLElement).closest('li');
            if (!quoteItem) return;
            let quoteText = quoteItem.textContent ? quoteItem.textContent.trim() : '';
            for (let j = 0; j < favoriteQuotes.length; j++) {
                if (quoteText.includes(favoriteQuotes[j].dialog)) {
                    favoriteQuotes.splice(j, 1);
                    break;
                }
            }
            quoteItem.remove();
            alert('Quote verwijderd uit favorieten!');
        });
    }
});
    // Verwijder quotes van blacklist
    let removeIcons = document.querySelectorAll('.bi-x-circle-fill');
    
    for(let i = 0; i < removeIcons.length; i++) {
        removeIcons[i].addEventListener('click', function(event: Event) {
            const target = event.currentTarget as HTMLElement;
            let quoteItem = target.closest('li');
            if (!quoteItem) return;
            let quoteText = quoteItem.textContent?.trim() ?? '';
            
            // Verwijder uit array
            for(let j = 0; j < blacklistedQuotes.length; j++) {
                if(quoteText.includes(blacklistedQuotes[j].dialog)) {
                    blacklistedQuotes.splice(j, 1);
                    break;
                }
            }
            quoteItem.remove();
            alert('Quote verwijdert!');
        });
    }

    // Voeg blacklist functie toe aan dislike knop
    function setupDislikeButton() {
        if(window.location.pathname.includes('10-rounds') || 
           window.location.pathname.includes('sudden-death') || 
           window.location.pathname.includes('timed-quiz')) {
            let dislikeButton = document.querySelector('.bi-hand-thumbs-down');
            if(dislikeButton) {
                dislikeButton.addEventListener('click', function(event: Event) {
                    const target = event.currentTarget as HTMLElement;
                    let quoteElement = target.closest('h2');
                    if (!quoteElement) return;
                    let quoteText = quoteElement.textContent?.trim() ?? '';
                    let character = document.querySelector('figcaption')?.textContent?.trim() ?? '';
                    let movie = document.querySelector('.movie-title')?.textContent?.trim() ?? 'Onbekende film';
                    // Nieuwe _id maken
                    let newId = "1";
                    if (blacklistedQuotes.length > 0) {
                        let highestId = 0;
                        for (let i = 0; i < blacklistedQuotes.length; i++) {
                            let idNum = parseInt(blacklistedQuotes[i]._id, 10);
                            if (idNum > highestId) {
                                highestId = idNum;
                            }
                        }
                        newId = (highestId + 1).toString();
                    }
                    blacklistedQuotes.push({
                        _id: newId,
                        dialog: quoteText,
                        movie: movie,
                        character: character
                    });
                    alert('Quote geblacklist!');
                });
            }
        }
    }

    // Like button functionaliteit - voeg toe aan favorieten
    function setupLikeButton() {
        if(window.location.pathname.includes('10-rounds') || 
           window.location.pathname.includes('sudden-death') || 
           window.location.pathname.includes('timed-quiz')) {
            let likeButton = document.querySelector('.bi-hand-thumbs-up');
            if(likeButton) {
                likeButton.addEventListener('click', function(event: Event) {
                    const target = event.currentTarget as HTMLElement;
                    let quoteElement = target.closest('h2');
                    if (!quoteElement) return;
                    let quoteText = quoteElement.textContent?.trim() ?? '';
                    let character = document.querySelector('figcaption')?.textContent?.trim() ?? '';
                    let movie = document.querySelector('.movie-title')?.textContent?.trim() ?? 'Onbekende film';
                    // Controleer of deze quote al in favorieten zit
                    let alreadyFavorite = favoriteQuotes.some(q => q.dialog === quoteText && q.character === character);
                    if (alreadyFavorite) {
                        alert('Deze quote staat al in je favorieten!');
                        return;
                    }
                    // Nieuwe _id maken
                    let newId = "1";
                    if (favoriteQuotes.length > 0) {
                        let highestId = 0;
                        for (let i = 0; i < favoriteQuotes.length; i++) {
                            let idNum = parseInt(favoriteQuotes[i]._id, 10);
                            if (idNum > highestId) {
                                highestId = idNum;
                            }
                        }
                        newId = (highestId + 1).toString();
                    }
                    favoriteQuotes.push({
                        _id: newId,
                        dialog: quoteText,
                        movie: movie,
                        character: character
                    });
                    alert('Quote toegevoegd aan favorieten!');
                });
            }
        }
    }

    // Favorieten functionaliteit voor de favorites pagina (voorbeeld)
    // Gebruik deze functie op de favorites pagina om quotes te verwijderen
    function setupRemoveFavoriteButton() {
        let removeIcons = document.querySelectorAll('.remove-favorite');
        for(let i = 0; i < removeIcons.length; i++) {
            removeIcons[i].addEventListener('click', function(event: Event) {
                const target = event.currentTarget as HTMLElement;
                let quoteItem = target.closest('li');
                if (!quoteItem) return;
                let quoteText = quoteItem.textContent?.trim() ?? '';
                for(let j = 0; j < favoriteQuotes.length; j++) {
                    if(quoteText.includes(favoriteQuotes[j].dialog)) {
                        favoriteQuotes.splice(j, 1);
                        break;
                    }
                }
                quoteItem.remove();
                alert('Quote verwijderd uit favorieten!');
            });
        }
    }

    setupDislikeButton();
    setupLikeButton();
    // Roep deze functie aan op de favorieten pagina indien nodig:
    // setupRemoveFavoriteButton();

