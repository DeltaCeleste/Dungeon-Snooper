// @ts-check
import * as THREE from 'three';
// @ts-ignore
import * as CSG from 'csg';

export class DoorModel extends THREE.Object3D {
    constructor() {
        const DOOR_SCALE = DoorModel.DOOR_SCALE;
        super();
        const doorShape = this.createDoorShape();
        this.doorFrame = this.createDoorFrame(doorShape);
        this.door = this.createDoor(doorShape);
        this.door.position.set(-DOOR_SCALE, 0, 0);
        this.add(this.doorFrame);
        this.add(this.door);

        this.timer = new THREE.Timer();
    }

    static DOOR_SCALE = 0.4;
    /** @param {THREE.Shape} shape  */
    createDoor(shape) {
        const DOOR_SCALE = DoorModel.DOOR_SCALE;
        const doorGeometry = new THREE.ExtrudeGeometry(shape, {
            steps: 1,
            depth: 0.2,
            bevelEnabled: true,
            bevelSegments: 1,
            bevelOffset: -0.1,
            bevelSize: 0.1,
            bevelThickness: 0.1,
        });
        doorGeometry.translate(1, 1, 0) // Para que el centro de la geometría esté en la bisagra
                    .scale(DOOR_SCALE, DOOR_SCALE, DOOR_SCALE);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.darkkhaki
        });
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        const doorHandle = this.createDoorHandle();
        doorHandle.position.set(1.6 * DOOR_SCALE, 1.3 * DOOR_SCALE, 0.3 * DOOR_SCALE);
        doorMesh.add(doorHandle);
        return doorMesh;
    }

    /** @param {THREE.Shape} shape @returns {THREE.Mesh} */
    createDoorFrame(shape) {
        const DOOR_SCALE = DoorModel.DOOR_SCALE;
        const frameBlockMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.darkgray,
        });
        const frameBlock = new THREE.BoxGeometry(1.0, 1.5, 0.5).translate(0, 0.75, 0);
        const doorSubtractChunkGeometry = new THREE.ExtrudeGeometry(shape, {
            depth: 10,
            bevelEnabled: false,
        }).translate(0, 1, -5).scale(DOOR_SCALE, DOOR_SCALE, DOOR_SCALE);
        const frameBlockBrush = new CSG.Brush(frameBlock, frameBlockMaterial);
        const doorSubtractChunkBrush = new CSG.Brush(doorSubtractChunkGeometry, frameBlockMaterial);
        const evaluator = new CSG.Evaluator();
        /** @type {CSG.Brush} */ const doorFrameBrush = evaluator.evaluate(frameBlockBrush, doorSubtractChunkBrush, CSG.SUBTRACTION);
        return doorFrameBrush;
    }

    /** @returns {THREE.Mesh} */
    createDoorHandle() {
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.gray,
            roughness: 0.35,
            metalness: 0.65,
        });
        const handleBaseGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.05);
        const handleProperGeometry = new THREE.TorusGeometry(0.075, 0.03, 6, 16)
                                              .translate(0, -0.1, 0) // Centramos el toro en uno de sus bordes
                                              .rotateX(-0.5); // Ligera rotación
        const handleBaseBrush = new CSG.Brush(handleBaseGeometry, handleMaterial);
        const handleProperBrush = new CSG.Brush(handleProperGeometry, handleMaterial);
        const evaluator = new CSG.Evaluator();
        /** @type {CSG.Brush} */ const handleBrush = evaluator.evaluate(handleBaseBrush, handleProperBrush, CSG.ADDITION);
        return handleBrush;
    }

    createDoorShape() {
        const shape = new THREE.Shape();
        shape.moveTo(-1, -1)
             .lineTo(1, -1)
             .lineTo(1, 1)
             .absarc(
                0, 1,      // Centro
                1,         // Radio
                0, Math.PI // Ángulo
             ).lineTo(-1, -1);
        return shape;
    }

    doAnimationOpen() {

    }

    doAnimationClose() {

    }

    update() {
        const totalTime = this.timer.getElapsed();
        const deltaTime = this.timer.getDelta();
        this.door.rotateY(Math.sin(totalTime) * deltaTime)
        this.timer.update();
    }
}