document.addEventListener('DOMContentLoaded', function() {
    const timerElement = document.getElementById("quiz-timer")
    const input = document.getElementById("timer")
    
    let timeLeft = parseInt(timerElement.textContent)
    if (timeLeft > 10) timerElement.classList.remove('time-warning');
    if (timeLeft > 5) timerElement.classList.remove('time-critical');

    const quizContainer = document.querySelector('.quiz');
    quizContainer.appendChild(timerElement);
    
    const countdownTimer = setInterval(function() {
        timeLeft--;
        input.value = timeLeft
        timerElement.textContent = timeLeft;
        if (timeLeft <= 10) {
            timerElement.classList.add('time-warning');
        }
        if (timeLeft <= 5) {
            timerElement.classList.add('time-critical');
        }
        
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            timerElement.textContent = '0';
        }
    }, 1000);
});