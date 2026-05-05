import * as THREE from 'three';

export class PickUp extends THREE.Object3D {
    /** @param {THREE.Object3D} pickupModel @param {number} scale  @param {boolean} canSpin  */
    constructor(pickupModel, scale, canSpin) {
        super();
        this.timer = new THREE.Timer();
        this.model = pickupModel;
        if(this.model.setUserData !== undefined) {
            this.model.setUserData(this);
        } else {
            console.error(`PickUp: No se ha encontrado el método 'setUserData' en la clase de modelo '${this.model.constructor.name}'`);
        }
        this.model.scale.setScalar(scale);
        this.add(this.model);
        this.canSpin = canSpin;
    }

    static FloatAmplitude = 0.25;
    static FloatFrequency = 0.6666;
    static RotationSpeed = 1.4;

    update() {
        this.timer.update();
        // y(t) = y_0 + Asin(kt)
        // dy = Akcos(kt)dt ???
        if(this.model.update !== undefined) {
            this.model.update();
        }
        let delta = this.timer.getDelta();
        let totalTime = this.timer.getElapsed();
        this.position.y += PickUp.FloatAmplitude 
                        * PickUp.FloatFrequency 
                        * Math.cos(PickUp.FloatFrequency * totalTime) 
                        * delta;
        if(this.canSpin) {
            this.rotation.y += PickUp.RotationSpeed * delta;
        }
    }
    onClick(mesh) {
        console.log(`clicked on ${this.model.constructor.name}`);
    }
}