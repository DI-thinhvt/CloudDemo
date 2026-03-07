// Appreciation messages
const messages = [
    "Thank you for being an inspiration every day! 🌟",
    "Your dedication and excellence make all the difference! 💝",
    "Empowered women empower the world! 🌸",
    "Your strength and wisdom inspire us all! 💪",
    "Thank you for breaking barriers and leading the way! 🚀",
    "Your contributions make Data Impact shine! ✨",
    "Celebrating your achievements today and every day! 🎉",
    "You make the impossible possible! 🌈",
    "Your passion and commitment are truly remarkable! 💖",
    "Here's to strong, brilliant, amazing women! 🌺"
];

// Flower animation
function createFlower() {
    const flowerContainer = document.getElementById('flowers');
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.textContent = ['🌸', '🌺', '🌼', '🌷', '🌹'][Math.floor(Math.random() * 5)];
    flower.style.left = Math.random() * 100 + '%';
    flower.style.animationDuration = (Math.random() * 3 + 5) + 's';
    flower.style.animationDelay = Math.random() * 2 + 's';
    
    flowerContainer.appendChild(flower);
    
    setTimeout(() => {
        flower.remove();
    }, 8000);
}

// Generate flowers periodically
setInterval(createFlower, 800);

// Initialize some flowers
for (let i = 0; i < 5; i++) {
    setTimeout(createFlower, i * 300);
}

// Appreciation button functionality
const appreciationBtn = document.getElementById('appreciationBtn');
const messageDisplay = document.getElementById('messageDisplay');
let lastMessageIndex = -1;

appreciationBtn.addEventListener('click', () => {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * messages.length);
    } while (randomIndex === lastMessageIndex && messages.length > 1);
    
    lastMessageIndex = randomIndex;
    
    // Add animation
    messageDisplay.style.animation = 'none';
    setTimeout(() => {
        messageDisplay.textContent = messages[randomIndex];
        messageDisplay.style.animation = 'fadeInUp 0.5s ease-out';
    }, 10);
    
    // Create confetti effect
    createConfetti();
});

// Confetti effect
function createConfetti() {
    const colors = ['#e91e63', '#9c27b0', '#ff6090', '#ffc107', '#00bcd4'];
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = '50%';
        confetti.style.top = '50%';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);
        
        const angle = (Math.PI * 2 * i) / confettiCount;
        const velocity = 3 + Math.random() * 5;
        const tx = Math.cos(angle) * velocity * 30;
        const ty = Math.sin(angle) * velocity * 30;
        
        confetti.animate([
            { 
                transform: 'translate(0, 0) rotate(0deg)',
                opacity: 1
            },
            { 
                transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0
            }
        ], {
            duration: 1000 + Math.random() * 500,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => confetti.remove();
    }
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Console message
console.log('%cHappy Women\'s Day! 🌸', 'color: #e91e63; font-size: 20px; font-weight: bold;');
console.log('%cMade with 💖 by Data Impact', 'color: #9c27b0; font-size: 14px;');
