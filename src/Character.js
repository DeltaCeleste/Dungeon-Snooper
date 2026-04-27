import * as THREE from 'three';

import { Mc } from '../models/mc/Mc.js';
import { Vector3 } from 'three';

export class Character extends THREE.Object3D {
    /** @param {THREE.Object3D} pickupModel @param {number} scale  @param {boolean} canSpin  */
    constructor(scale) {
        super();
        this.timer = new THREE.Timer();
        this.model = new Mc();

        this.model.scale.setScalar(scale);
        this.fpcamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.fpcamera.position.set(0, this.model.altura*this.model.radio, this.radio); 
        this.fpcamera.lookAt(new Vector3(0,0,1));

        this.model.add(this.fpcamera);
        this.add(this.model);

        this.movement = new Vector3(0,0,0);
        document.addEventListener("keydown", (event) => {
            console.log("Pulsado: " + event.code);
            switch(event.code) {
                case "ArrowUp":
                    this.movement.add(new Vector3(0.01, 0, 0));
                    break;
                case "ArrowDown":
                    this.movement.add(new Vector3(-0.01, 0, 0));
                    break;
                case "ArrowLeft":
                    this.movement.add(new Vector3(0, 0, 0.01));
                    break;
                case "ArrowRight":
                    this.movement.add(new Vector3(0, 0, -0.01));
                    break;
                default: break;
            }
        }, false);

        this.mouse = {
            x: 0,
            y: 0
        };
        window.addEventListener('mousemove', (event) => {
            // Convertimos la posición del ratón en píxeles a un rango de -1 a +1
            this.mouse.x = -(event.clientX / window.innerWidth) * 2 + 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }

    update() {
        //console.log(this.movement);
        this.position.add(this.movement);
        this.movement.clampLength(0, 0.1);
        this.movement.multiplyScalar(0.1);

        //Movimiento con el ratón
        // Definimos los objetivos de rotación
        const targetRotY = this.mouse.x * Math.PI;
        const targetRotX = -this.mouse.y * (Math.PI / 4);

        this.model.rotation.y += (targetRotY - this.model.rotation.y) * 0.1; 
        this.rotation.x += (targetRotX - this.rotation.x) * 0.1;
    }

}