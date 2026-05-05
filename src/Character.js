import * as THREE from 'three';

import { Mc } from '../models/mc/Mc.js';
import { Vector3 } from 'three';

export class Character extends THREE.Object3D {
    /** @param {THREE.Object3D} pickupModel @param {number} scale  @param {boolean} canSpin  */
    constructor(scale) {
        super();
        this.timer = new THREE.Timer();
        this.model = new Mc(scale);

        this.fpcamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, this.model.radio*scale*1.3, 1000);
        this.fpcamera.position.set(0, this.model.altura*this.model.radio*0.8, this.radio); 
        this.fpcamera.lookAt(new Vector3(0,0,1));
        this.initCamRot = this.fpcamera.rotation.x;

        this.model.add(this.fpcamera);
        this.add(this.model);

        
        this.movement = new Vector3(0,0,0);
        this.teclasPresionadas = {};
        document.addEventListener("keydown", (event) => {
            //console.log("Pulsado: " + event.code);
            this.teclasPresionadas[event.code] = true;
        }, false);
        document.addEventListener('keyup', (event) => {
            //console.log("Soltado: " + event.code);
            this.teclasPresionadas[event.code] = false;
        });

        this.mouse = {
            x: 0,
            y: 0
        };
        window.addEventListener('mousemove', (event) => {
            // Convertimos la posición del ratón en píxeles a un rango de -1 a +1
            this.mouse.x = -(event.clientX / window.innerWidth) * 2 + 1;
            this.mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
        });

        //Colisión
        this.rayo = new THREE.Raycaster () ;
        this.rayo.far = this.model.radio*2*scale;
    }

    //Para establecer los candidatos a colisión
    setCandidatos(candidatos){
        this.candidatos = candidatos
        console.log("Cargados candidatos de colisión: " + candidatos)
    }

    static PLAYER_SPEED = 0.333

    getVectorMov(){
        const SPEED = Character.PLAYER_SPEED;
        var dir = new Vector3(0,0,0);
        this.fpcamera.getWorldDirection(dir)
        var original = dir.clone();
        var eje = new THREE.Vector3(0, 1, 0);
        const candidatas = new Array();

        if(this.teclasPresionadas["KeyW"] == true){
            candidatas.push(dir.clone().multiplyScalar(SPEED))
        }
        if(this.teclasPresionadas["KeyS"] == true){
            dir.applyAxisAngle(eje, Math.PI)
            candidatas.push(dir.clone().multiplyScalar(SPEED));
            dir = original;
        }
        if(this.teclasPresionadas["KeyA"] == true){
            dir.applyAxisAngle(eje, Math.PI/2)
            candidatas.push(dir.clone().multiplyScalar(SPEED));
            dir = original;
        }
        if(this.teclasPresionadas["KeyD"] == true){
            dir.applyAxisAngle(eje, -Math.PI/2)
            candidatas.push(dir.clone().multiplyScalar(SPEED));
            dir = original;
        }
        var dirFinal = new Vector3(0,0,0);
        candidatas.forEach(vec => dirFinal.add(vec));

        //this.logDemanda(dirFinal);
        //this.logDemanda(candidatas);
        //this.logDemanda(this.teclasPresionadas);
        return dirFinal;
    }

    update() {
        //Guardar posición inicial
        var previousPos = this.position.clone();

        //Movimiento
        var dir = this.getVectorMov()
        this.movement.add(new Vector3(dir.x*0.01, 0, dir.z*0.01));
        
        this.position.add(this.movement);
        this.movement.clampLength(0, 0.1);
        this.movement.multiplyScalar(0.1);
        
        //Movimiento con el ratón
        // Definimos los objetivos de rotación
        const targetRotY = this.mouse.x * Math.PI;
        const targetRotX = this.mouse.y * (Math.PI / 4) + (this.initCamRot);
        
        this.model.rotation.y += (targetRotY - this.model.rotation.y) * 0.1; 
        this.fpcamera.rotation.x = targetRotX;
        
        
        //Colisión
        var pos = new Vector3(0,0,0);
        var raydir = this.movement.clone();
        this.getWorldPosition(pos);
        this.rayo.set(pos, raydir.normalize());
        var impactados = this.rayo.intersectObjects(this.candidatos, true);
        if(impactados.length > 0){
            console.log("Colisión con: " + impactados)
            this.position.copy(previousPos);
        }
    }

    logDemanda(printable){
        if(this.teclasPresionadas["ShiftLeft"]){
            console.log(printable);
        }
    }
}