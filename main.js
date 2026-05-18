import { GameScene } from './src/GameScene.js'; 

$(function () {
    
    // Se instancia la escena pasándole el    div    que se ha creado en el html para visualizar
    var scene = new GameScene("#WebGL-output", 'cocosete');

    // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
    window.addEventListener ("resize", () => scene.onWindowResize());
    window.addEventListener("click", (event) => scene.onClick(event));
    window.addEventListener("keypress", (event) => {
        if(event.key === ' ') {
            scene.switchCamera()
        }
    })
    // Que no se nos olvide, la primera visualización.
    scene.update();
});
