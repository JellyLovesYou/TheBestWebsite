const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let dots = [];
const numDots = 1000;
const maxDistance = 100;
const connectionDistance = 50;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
const dotSpeed = 0.5;
const flyAwaySpeed = 0.5;

function toggleTab(tabId) {
    var tab = document.getElementById(tabId);
    var isCurrentlyVisible = tab.style.display === 'block';
    document.querySelectorAll('.tab-content').forEach(function(tabContent) {
        tabContent.style.display = 'none';
    });
    var cogsContainer = document.querySelector('.cogs-container');
    cogsContainer.style.display = 'block';
    tab.style.display = isCurrentlyVisible ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    toggleTab('Credits');
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initDots();
}

function initDots() {
    dots = [];
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    for (let i = 0; i < numDots; i++) {
        dots.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: Math.random() * 0.1 + 1,
            dx: (Math.random() - 0.5) * dotSpeed,
            dy: (Math.random() - 0.5) * dotSpeed,
            connectedTo: null
        });
    }
}

function updateDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => dot.connectedTo = null);

    for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const distToMouse = Math.sqrt((mouseX - dot.x) ** 2 + (mouseY - dot.y) ** 2);
        const alpha = Math.max(0, 1 - distToMouse / maxDistance);

        dot.x += dot.dx;
        dot.y += dot.dy;

        if (dot.x < 0 || dot.x > canvas.width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.dy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.fill();

        let closestDot = null;
        let minDistance = connectionDistance;

        if (distToMouse < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.stroke();
            dot.connectedTo = 'mouse';
        }

        for (let j = i + 1; j < dots.length; j++) {
            const otherDot = dots[j];
            const distToOtherDot = Math.sqrt((otherDot.x - dot.x) ** 2 + (otherDot.y - dot.y) ** 2);
            if (distToOtherDot < connectionDistance && !otherDot.connectedTo && distToOtherDot < minDistance) {
                minDistance = distToOtherDot;
                closestDot = otherDot;
            }
        }

        if (closestDot) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(closestDot.x, closestDot.y);
            ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.stroke();
            dot.connectedTo = closestDot;
            closestDot.connectedTo = dot;
        }
    }
}

function animate() {
    updateDots();
    requestAnimationFrame(animate);
}

function handleClick(event) {
    const clickX = event.clientX;
    const clickY = event.clientY;

    dots.forEach(dot => {
        const distToClick = Math.sqrt((clickX - dot.x) ** 2 + (clickY - dot.y) ** 2);
        if (distToClick < maxDistance) {
            const angle = Math.atan2(dot.y - clickY, dot.x - clickX);
            dot.dx += Math.cos(angle) * flyAwaySpeed;
            dot.dy += Math.sin(angle) * flyAwaySpeed;
        }
    });
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});
window.addEventListener('click', handleClick);

resizeCanvas();
animate();
