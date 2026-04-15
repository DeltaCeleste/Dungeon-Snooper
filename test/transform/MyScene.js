import * as THREE from 'three';
import { TrackballControls } from 'trackball'

class MyScene extends THREE.Scene {
    /** @param {HTMLCanvasElement} canvas @returns {THREE.WebGLRenderer}  */
    createRenderer(canvas) {
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xEAEAEA), 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        $(canvas).append(renderer.domElement);
        return renderer;
    }

    createCamera () {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 10);
        this.camera.position.set (0.2, 0.05, 0.2);
        var look = new THREE.Vector3 (0,0,0);
        this.camera.lookAt(look);
        this.add (this.camera);
    
        this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);
    
        this.cameraControl.rotateSpeed = 5;
        this.cameraControl.zoomSpeed = -2;
        this.cameraControl.panSpeed = 0.5;
        
        this.cameraControl.target = look;
    }

    createLight() {
        var light = new THREE.PointLight(THREE.Color.NAMES.white, 1.0, 0.33);
        this.light = light;
        light.position.set(0.2, 0.15, 0.1);
        this.add(light)
    }

    makeMainModel() {
        this.main = new THREE.Mesh(
            new THREE.BoxGeometry(.1, .1, .1, 4, 4, 4),
            new THREE.MeshPhongMaterial({color: THREE.Color.NAMES.blue, shininess: 124, side: THREE.DoubleSide})
        );
        this.main.scale.set(3,1,1);
        this.main.rotateZ(-Math.PI/4);
        this.main.position.set(0.1, 0.1, 0);
        this.add(this.main);
        
        var center = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 8, 4),
            new THREE.MeshStandardMaterial({color: THREE.Color.NAMES.yellow})
        );
        this.add(center);
    }

    constructor(canvas) {
        super();
        this.renderer = this.createRenderer(canvas);
        this.createCamera();
        this.createLight();
        this.makeMainModel();

        this.axis = new THREE.AxesHelper (0.1);
        this.add (this.axis);
    }

    update() {
        this.renderer.render(this, this.camera);
        this.cameraControl.update();
        this.main.rotateX(0.01);
        requestAnimationFrame(() => this.update());
    }

    onWindowResize() {
        this.camera.aspect = (window.innerWidth / window.innerHeight);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize (window.innerWidth, window.innerHeight);
    }
}

$(function () {

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
