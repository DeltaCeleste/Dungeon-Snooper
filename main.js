import { GameScene } from './src/GameScene.js'; 

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('game-start-button').addEventListener('click', (event) => onGameStartButtonClicked(event));
})

/** @param {string} seed */
function startGame(seed) {
    var scene = new GameScene("#WebGL-output", seed);

    // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
    window.addEventListener ("resize", () => scene.onWindowResize());
    window.addEventListener("click", (event) => scene.onClick(event));
    /*window.addEventListener("keypress", (event) => {
        if(event.key === ' ') {
            scene.switchCamera()
        }
    })*/
    // Que no se nos olvide, la primera visualización.
    scene.update();
}

/** @param {Event} event */
function onGameStartButtonClicked(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('game-form'));
    alert(formData.get('seed'));
    const seed = formData.get('seed') ?? 'laberinto';
    const _difficulty = formData.get('difficulty') ?? 'medium';
    
    document.getElementById('menu').style.display = 'none';
    document.getElementById('WebGL-output').style.display = 'block';

    startGame(seed);
}
