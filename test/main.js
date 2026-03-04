import * as THREE from 'three';
import { Vector3 } from 'three';
import { Color } from 'three';

class ControllableSphere extends THREE.Object3D {
    constructor() {
        super();
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 32, 16),
            new THREE.MeshStandardMaterial({color: 0xFF0000})
        );
        this.add(sphere);
        this.velocity = new Vector3(0,0,0);
        document.addEventListener("keydown", (event) => {
            console.log("Evento de tecla!");
            switch(event.code) {
                case "ArrowUp":
                    this.velocity.add(new Vector3(0, 0.01, 0));
                    break;
                case "ArrowDown":
                    this.velocity.add(new Vector3(0, -0.01, 0));
                    break;
                case "ArrowLeft":
                    this.velocity.add(new Vector3(-0.01, 0,  0));
                    break;
                case "ArrowRight":
                    this.velocity.add(new Vector3(0.01, 0, 0));
                    break;
                default: break;
            }
        }, false)
    }

    move(moveDirection) {
        this.position.add(moveDirection);
    }

    update() {
        this.move(this.velocity);
        this.velocity.clampLength(0, 1);
        this.velocity.multiplyScalar(0.99);
    }
}

class TestScene extends THREE.Scene {
    createRenderer(canvas) {
        var renderer = new THREE.WebGLRenderer()
        renderer.setClearColor(0x444444);
        renderer.setSize(window.innerWidth, window.innerHeight);
        $(canvas).append(renderer.domElement);
        return renderer;
    }

    addCamera() {
        var cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10);
        cam.position.set(0, 0, 3);
        cam.lookAt(new Vector3(0,0,0));
        this.add(cam);
        this.camera = cam;
    }

    addSphere() {
        var sphere = new ControllableSphere();
        sphere.position.set(0, 0, 0);
        this.add(sphere);
    }

    addLights() {
        this.lights = [];
        var ambientLight = new THREE.AmbientLight(new Color("white"), 0.1);
        this.lights.push(ambientLight);
        this.add(ambientLight);
        var pointLight = new THREE.PointLight(new Color("white"), 1.0, 5.0);
        pointLight.position.set(0, 0, 3);
        this.lights.push(pointLight)
        this.add(pointLight);
    }

    constructor(canvas) {
        super();
        this.renderer = this.createRenderer(canvas);
        this.addCamera();
        this.addSphere();
        this.addLights();
    }

    onWindowResize() {
        this.camera.aspect = (window.innerWidth / window.innerHeight);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize (window.innerWidth, window.innerHeight);
    }

    update() {
        this.renderer.render(this, this.camera);
        for(let child of this.children) {
            if(typeof child.update === 'function') {
                child.update();
            }
        }
        requestAnimationFrame(() => this.update());
    }
}

$(function() {
    var scene = new TestScene("#WebGL-output");
    window.addEventListener ("resize", () => scene.onWindowResize());
    scene.update();
}())