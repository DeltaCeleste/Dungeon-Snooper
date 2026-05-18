import * as THREE from 'three';
import { DoorModel } from '../models/door/Door.js';
import { Character } from './Character.js';


export class Door extends THREE.Object3D {
    constructor() {
        super();
        this.model = new DoorModel();
        this.model.setUserData(this);
        this.add(this.model);
    }

    /** @param {THREE.Mesh} mesh @param {Character} player */
    onClick(mesh, player) {
        if(player.hasGottenKey && player.hasGottenPick && player.hasGottenTorch && player.hasGottenEye) {
            this.model.doAnimationOpen();
        } else {
            window.alert('tienes que coger todos los pickups!'); // TODO: no usar un mensaje cutre por defecto del navegador
        }
    }

    update() {
        this.model.update();
    }
}