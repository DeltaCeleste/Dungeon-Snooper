
// Clases de la biblioteca

import * as THREE from 'three'
import { GUI } from 'gui'
import { TrackballControls } from 'trackball'

// Clases de mi proyecto

import { MazeModel } from '../../src/mazeModelGenerator.js';
import { generateMazeDfs } from '../../src/mazegen.js';
import { PickUp } from '../../src/PickUp.js';
import { Key } from '../../models/key/Key.js';
import { Torch } from '../../models/torch/Torch.js';
import { Pickaxe } from '../../models/pickaxe/Pickaxe.js';
import { Eye } from '../../models/Eye/Eye.js';
import { Character } from '../../src/Character.js'
import { ArbitraryTimer } from '../../src/Timer.js';
 
/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
    // Recibe el    div    que se ha creado en el    html    que va a ser el lienzo en el que mostrar
    // la visualización de la escena
    constructor (myCanvas) { 
        super();

        /** @type {THREE.Object3D[]} */
        this.pickables = [];

        // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
        this.renderer = this.createRenderer(myCanvas);
        
        // Se crea la interfaz gráfica de usuario
        this.gui = this.createGUI ();
        
        // Construimos los distinos elementos que tendremos en la escena
        
        // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
        // Tras crear cada elemento se añadirá a la escena con     this.add(variable)
        this.createLights ();

        this.createMaze('cocosete');
        
        this.addPickUps();
        
        Character.PLAYER_SPEED = 6.0;
        this.addPlayer();
        

        this.setupCollisions();
        
        //Cameras setup
        this.cameras = [];
        this.currentCameraIndex = 0;
        this.setupTrackballCamera();
        this.cameras.push(this.player.fpcamera);
        this.IDX_FP_CAMERA = this.cameras.length-1;
        //Camara aérea
        const distancia = 23;
        this.floatCamera = new THREE.OrthographicCamera(-distancia/2, distancia/2, distancia/2, -distancia/2, 1, distancia*2)
        this.floatCamera.position.set(0, distancia, 0); 
        this.floatCamera.lookAt(new THREE.Vector3(0,0,0));
        this.add(this.floatCamera);
        this.cameras.push(this.floatCamera);
        this.IDX_FLOATING_CAMERA = this.cameras.length-1; 

        // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
        // Todas las unidades están en metros
        this.axis = new THREE.AxesHelper (0.1);
        this.add (this.axis);
        

        this.mousePosition = new THREE.Vector2();
        this.mouseRaycast = new THREE.Raycaster();
        this.mouseRaycast.far = this.mazeModel.blockWidth*3;

        this.eyeTimer = new ArbitraryTimer();
        this.torchTimer = new ArbitraryTimer();
        this.EYE_VISION_TIME = 5000;
        this.TORCH_LIGHT_TIME = 10000;
    }
    
    addPickUps() {
        var pickUp1 = new PickUp(new Key(this.gui), 0.5, true);
        this.locatePickUp(pickUp1, 1, 1, 0.5)
        var pickUp2 = new PickUp(new Torch(this.gui), 1.0, true);
        this.locatePickUp(pickUp2, 2, 2, 0.4)
        var pickUpTorch2 = new PickUp(new Torch(this.gui), 1.0, false);
        this.locatePickUp(pickUpTorch2, 0, 2, 0.4)
        var pickUpPickaxe = new PickUp(new Pickaxe(this.gui), 2, true);
        this.locatePickUp(pickUpPickaxe, 1, 2, 0.5);
        var pickUpEye = new PickUp(new Eye(this.gui), 2, true);
        this.locatePickUp(pickUpEye, 2, 1, 0.5);
        
        this.add(pickUp1);
        this.add(pickUp2);
        this.add(pickUpTorch2);
        this.add(pickUpPickaxe);
        this.add(pickUpEye);
        this.pickables.push(pickUp1, pickUp2, pickUpTorch2, pickUpPickaxe, pickUpEye);

        // Weak Walls, no son pickUps pero los trataremos como tal para la interacción
        this.pickables = this.pickables.concat(this.mazeModel.weakBlockMeshes);

        // Muros normales también para prevenir de la interacción a través de las paredes
        this.pickables = this.pickables.concat(this.mazeModel.blockMeshes);
    }

    resetPickUps(){
        this.pickables.forEach(element => {
            if(element instanceof PickUp){
                this.remove(element)
            }
        });
        this.pickables = []
    }

    locatePickUp(pickUp, row, column, floatY){
        var pickUpPos = this.mazeModel.getRelativePosOfCell(row, column);
        pickUp.position.set(pickUpPos.x, pickUpPos.y + floatY, pickUpPos.z)
    }

    addPlayer() {
        console.log('jugador añadido')
        this.player = new Character(10, this.renderer);
        var playerPosition = this.mazeModel.getRelativePosOfCell(0,0);
        this.player.position.copy(playerPosition);
        this.player.position.y = 0.5;
        this.add(this.player);
    }

    removePickUpable(pickUpToRemove) {
        const idx = this.pickables.findIndex((pickUp) => pickUp === pickUpToRemove);
        if(idx !== -1) {
            this.pickables.splice(idx, 1);
        }
    }

    createMaze(seed) {
        if(this.mazeModel !== undefined) {
            this.remove(this.mazeModel);
            this.mazeModel = undefined;
            //this.collidables = this.collidables.filter((obj) => (obj instanceof PickUp));
        }
        this.maze = generateMazeDfs(15, 15, seed);
        let mazeStrings = this.maze.getAsStrings();
        
        // Por último creamos el modelo.
        // Le pasamos una variable de sincronizacion
        let canReturn = false;
        var mazeLoaded = $.Deferred();
        this.mazeModel = new MazeModel(mazeLoaded, mazeStrings, 0.5, 1.5);
        this.add (this.mazeModel);
        mazeLoaded.done (() => {
            canReturn = true;
        });
        while(!canReturn); // Ya sé, la espera ocupada está mal, pero qué se le va a hacer

        if(this.pickables.length > 0){
            this.resetPickUps();
            this.addPickUps();
            this.setupCollisions();
        }
    }

    setupCollisions() {
        this.collidables = this.pickables.slice();
        //this.collidables = this.collidables.concat(this.mazeModel.blockMeshes);
        this.player.setCandidatos(this.collidables);
    }

    /** @param {PointerEvent} event */
    onClick(event) {
        /*this.mousePosition.set(
            2 * (event.clientX / window.innerWidth) - 1,
            1 - 2 * (event.clientY / window.innerHeight),
        );*/
        this.mouseRaycast.setFromCamera(new THREE.Vector2(0,0), this.getCamera());
        var collidedObjects = this.mouseRaycast.intersectObjects(this.pickables, true);
        if(collidedObjects.length > 0) {
            var pickedMesh = collidedObjects[0].object;
            if(pickedMesh.userData) {
                /** @type {THREE.Object3D} */
                var clickReceiver = pickedMesh.userData;
                if(clickReceiver.onClick !== undefined) {
                    var item = clickReceiver.onClick(pickedMesh);
                    if(item == 'Eye'){
                        this.currentCameraIndex = this.IDX_FLOATING_CAMERA;
                        this.getCamera()
                        this.eyeTimer.start(this.EYE_VISION_TIME);
                        this.setAmbientIntensity(1.0);
                        this.ambientLight.color.setHex(0xAADDFF);
                    }
                    else if(item == 'Torch'){
                        var timeleft = this.torchTimer.getTimeLeft();
                        this.torchTimer.start(this.TORCH_LIGHT_TIME+timeleft);
                    }
                    this.player.addItem(item);
                }
                else{ // Es un muro
                    if(this.player.pickaxe && pickedMesh.name == 'WeakBlock'){
                        //console.log(pickedMesh)
                        this.player.removeCollidable(pickedMesh);
                        this.removePickUpable(pickedMesh);
                        pickedMesh.parent.remove(pickedMesh);
                    }
                }
            }
        }
    }

    setupTrackballCamera () {
        // Para crear una cámara le indicamos
        //     El ángulo del campo de visión vértical en grados sexagesimales
        //     La razón de aspecto ancho/alto
        //     Los planos de recorte cercano y lejano
        var trackballCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
        // También se indica dónde se coloca
        trackballCamera.position.set (0, 10, 10);
        // Y hacia dónde mira
        var look = new THREE.Vector3 (0,0,0);
        trackballCamera.lookAt(look);
        this.add (trackballCamera);
        
        // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
        var trackballCameraControl = new TrackballControls (trackballCamera, this.renderer.domElement);
        
        // Se configuran las velocidades de los movimientos
        trackballCameraControl.rotateSpeed = 5;
        trackballCameraControl.zoomSpeed = -2;
        trackballCameraControl.panSpeed = 0.5;
        // Debe orbitar con respecto al punto de mira de la cámara
        trackballCameraControl.target = look;
        this.cameras.push(trackballCamera);
        this.cameraControl = trackballCameraControl;
    }
    
    createGround () {
        // El suelo es un Mesh, necesita una geometría y un material.
        
        // La geometría es una caja con muy poca altura
        var geometryGround = new THREE.BoxGeometry (9,0.02,9);
        
        // El material se hará con una textura de madera
        var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
        var materialGround = new THREE.MeshStandardMaterial ({map: texture});
        
        // Ya se puede construir el Mesh
        var ground = new THREE.Mesh (geometryGround, materialGround);
        
        // Todas las figuras se crean centradas en el origen.
        // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
        ground.position.y = -0.01;
        
        // Que no se nos olvide añadirlo a la escena, que en este caso es    this
        this.add (ground);
    }
    
    createGUI () {
        // Se crea la interfaz gráfica de usuario
        var gui = new GUI();
        
        // La escena le va a añadir sus propios controles. 
        // Se definen mediante un objeto de control
        // En este caso la intensidad de la luz y si se muestran o no los ejes
        this.guiControls = {
            // En el contexto de una función     this     alude a la función
            lightPower : 500.0,    // La potencia de esta fuente de luz se mide en lúmenes
            ambientIntensity : 0.5,     
            axisOnOff : true,
            seed: 'cocosete',
            regen: () => {
                this.createMaze(this.guiControls.seed);
                this.setupCollisions();
            }
        }

        // Se crea una sección para los controles de esta clase
        var folder = gui.addFolder ('Luz y Ejes');
        
        // Se le añade un control para la potencia de la luz puntual
        folder.add (this.guiControls, 'lightPower', 0, 1000, 20)
            .name('Luz puntual : ')
            .onChange ( (value) => this.setLightPower(value) );
        
        // Otro para la intensidad de la luz ambiental
        folder.add (this.guiControls, 'ambientIntensity', 0, 1, 0.05)
            .name('Luz ambiental: ')
            .onChange ( (value) => this.setAmbientIntensity(value) );
            
        // Y otro para mostrar u ocultar los ejes
        folder.add (this.guiControls, 'axisOnOff')
            .name ('Mostrar ejes : ')
            .onChange ( (value) => this.setAxisVisible (value) );
        
        var map = gui.addFolder ('Mapa');

        map.add(this.guiControls, 'seed')
            .name('Semilla');

        map.add(this.guiControls, 'regen')
            .name('Regenerar laberinto');
        
        return gui;
    }
    
    createLights () {
        // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
        // La luz ambiental solo tiene un color y una intensidad
        // Se declara como     var     y va a ser una variable local a este método
        //        se hace así puesto que no va a ser accedida desde otros métodos
        this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
        // La añadimos a la escena
        this.add (this.ambientLight);
        
        // Se crea una luz focal que va a ser la luz principal de la escena
        // La luz focal, además tiene una posición, y un punto de mira
        // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
        // En este caso se declara como     this.atributo     para que sea un atributo accesible desde otros métodos.
        this.pointLight = new THREE.PointLight( 0xffffff, 100.0, 100.0, 2.0);
        this.pointLight.power = this.guiControls.lightPower;
        this.pointLight.position.set( 0, 9, 0 );
        //console.log (this.pointLight);
        this.add (this.pointLight);
        
    }
    
    setLightPower (valor) {
        this.pointLight.power = valor;
    }

    setAmbientIntensity (valor) {
        this.ambientLight.intensity = valor;
    }    
    
    setAxisVisible (valor) {
        this.axis.visible = valor;
    }
    
    createRenderer (myCanvas) {
        // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
        
        // Se instancia un Renderer     WebGL
        var renderer = new THREE.WebGLRenderer();
        
        // Se establece un color de fondo en las imágenes que genera el render
        renderer.setClearColor(new THREE.Color(0x111111), 1.0);
        
        // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.physicallyCorrectLights = true;

        // La visualización se muestra en el lienzo recibido
        $(myCanvas).append(renderer.domElement);
        
        return renderer;    
    }
    
    setCameraAspect (ratio) {
        // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
        // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
        this.getCamera().aspect = ratio;
        // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
        this.getCamera().updateProjectionMatrix();
    }
        
    onWindowResize () {
        // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
        // Hay que actualizar el ratio de aspecto de la cámara
        this.setCameraAspect (window.innerWidth / window.innerHeight);
        
        // Y también el tamaño del renderizador
        this.renderer.setSize (window.innerWidth, window.innerHeight);
    }

    update () {
        //Comprobamos si se acaba el timer del ojo, si es que estuviera en modo aereo
        if(this.eyeTimer.isRunning){
            //console.log(this.eyeTimer.getTimeLeft());
            if(this.eyeTimer.hasFinished()){
                this.eyeTimer.stop();
                this.currentCameraIndex = this.IDX_FP_CAMERA;
                this.player.removeItem('Eye');
                this.setAmbientIntensity(this.guiControls.ambientIntensity)
                this.ambientLight.color.setHex(0xFFFFFF);
            }
        }

        //Comprobamos cuanto tiempo de luz le queda a la antorcha para eliminarla si esta se apaga
        if(this.torchTimer.isRunning){
            //console.log(this.torchTimer.getTimeLeft());
            if(this.torchTimer.hasFinished()){
                this.torchTimer.stop();
                this.player.removeItem('Torch');
            }
        }

        // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
        this.renderer.render (this, this.getCamera());

        // Se actualiza la posición de la cámara según su controlador
        this.cameraControl.update();
        
        // Se actualiza el resto del modelo
        this.mazeModel.update();
        for(let child of this.children) {
            if(child.update !== undefined) {
                child.update();
            }
        }
        // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
        // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
        // Si no existiera esta línea,    update()    se ejecutaría solo la primera vez.
        requestAnimationFrame(() => this.update())
    }

    getCamera() {
        return this.cameras[this.currentCameraIndex];
    }
    
    switchCamera() {
        this.currentCameraIndex++;
        this.currentCameraIndex %= this.cameras.length;
    }
}


/// La función     main
$(function () {
    
    // Se instancia la escena pasándole el    div    que se ha creado en el html para visualizar
    var scene = new MyScene("#WebGL-output");

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
