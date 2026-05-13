import * as THREE from 'three';

import { Mc } from '../models/mc/Mc.js';
import { Vector3 } from 'three';

export class Character extends THREE.Object3D {
    /** @param {THREE.Object3D} pickupModel @param {number} scale  @param {boolean} canSpin  */
    constructor(scale, renderer) {
        super();
        this.timer = new THREE.Timer();
        this.model = new Mc(scale);

        this.fpcamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, this.model.radio*scale*1.3, 1000);
        this.fpcamera.position.set(0, this.model.altura*this.model.radio*scale*0.8, this.radio); 
        this.fpcamera.lookAt(new Vector3(0,0,1));
        this.initCamRot = this.fpcamera.rotation.x;

        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        // Crear una cruz simple
        const points = [];
        points.push(new THREE.Vector3(0, 0.01, 0));
        points.push(new THREE.Vector3(0, -0.01, 0));
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(0.01, 0, 0));
        points.push(new THREE.Vector3(-0.01, 0, 0));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);

        // Posicionar frente a la cámara
        line.position.set(0, 0, -this.model.altura*this.model.radio*scale);
        line.renderOrder = 999;
        line.material.depthTest = false;
        line.material.depthWrite = false;
        this.fpcamera.add(line);


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

        //Movimiento de camara
        this.mouse = {
            x: 0,
            y: 0,
            sensitivity: 0.002
        };
        window.addEventListener('mousemove', (event) => {
            /* Old version
            // Convertimos la posición del ratón en píxeles a un rango de -1 a +1
            this.mouse.x = -(event.clientX / window.innerWidth) * 2 + 1;
            this.mouse.y = (event.clientY / window.innerHeight) * 2 - 1;*/

            this.mouse.y -= event.movementX * this.mouse.sensitivity;
            this.mouse.x -= event.movementY * this.mouse.sensitivity;

            const minPitch = -Math.PI / 2 + 0.1;
            const maxPitch = Math.PI / 2 - 0.1;
            this.mouse.x = Math.max(minPitch, Math.min(maxPitch, this.mouse.x));
        });
        document.addEventListener('keydown', (event) => {
            if(event.code == 'AltLeft'){
                renderer.domElement.requestPointerLock();
            }
        });

        //Colisión
        this.rayo = new THREE.Raycaster();
        this.rayo.far = this.model.radio*4*scale;
        this.arrowHelper =  new THREE.ArrowHelper( this.rayo.ray.direction, this.rayo.ray.origin, this.rayo.far, 0xFF0000 );
        this.add( this.arrowHelper );
        this.modelScale = scale;

        //Objetos iniciales
        this.pickaxe = false;
    }

    //Para establecer los candidatos a colisión
    setCandidatos(candidatos){
        /** @type {THREE.Object3D[]} */ this.candidatos = candidatos
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

    addItem(item){
        if(item === 'Pickaxe'){
            this.pickaxe = true;
        }
        console.log(`${item} equipado`)
        //updateModel() //Para añadir el objeto al modelo si se quiere
    }

    removeCollidable(collidableToRemove) {
        const idx = this.candidatos.findIndex((collidable) => collidable === collidableToRemove);
        console.log(idx)
        if(idx !== -1) {
            this.candidatos.splice(idx, 1);
        }
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
        /* Old version
        // Definimos los objetivos de rotación
        const targetRotY = this.mouse.x * Math.PI;
        const targetRotX = this.mouse.y * (Math.PI / 4) + (this.initCamRot);
        
        this.model.rotation.y += (targetRotY - this.model.rotation.y) * 0.1; 
        this.fpcamera.rotation.x = targetRotX;*/

        this.model.rotation.y = (this.mouse.y);

        this.fpcamera.rotation.x = -this.mouse.x + (this.initCamRot);
        
        
        //Colisión
        var pos = new Vector3(0,0,0);
        var raydir = this.movement.clone();
        raydir.normalize();
        var raydirScaled = raydir.clone().multiplyScalar(this.model.radio * this.modelScale * 2);
        pos.sub(raydirScaled);
        pos.add(this.getWorldPosition(new Vector3()));
        this.rayo.set(pos, raydir);
        if(this.candidatos !== undefined) {
            var impactados = this.rayo.intersectObjects(this.candidatos, true);
            if(impactados.length > 0){
                console.log("Colisión con: " + impactados)
            this.position.copy(previousPos);
            }
        }

        this.arrowHelper.dispose()
        this.remove(this.arrowHelper)
        this.arrowHelper = new THREE.ArrowHelper( this.rayo.ray.direction, new Vector3(0,0,0).sub(raydirScaled), this.rayo.far, 0xFF0000 );
        this.add(this.arrowHelper)
        //this.logDemanda(JSON.stringify(new Vector3().sub(raydirScaled)));
    }

    logDemanda(printable){
        if(this.teclasPresionadas["ShiftLeft"]){
            console.log(printable);
        }
    }
}