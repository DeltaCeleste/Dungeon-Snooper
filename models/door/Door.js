// @ts-check
import * as THREE from 'three';
// @ts-ignore
import * as CSG from 'csg';

export class DoorModel extends THREE.Object3D {
    constructor() {
        const DOOR_SCALE = DoorModel.DOOR_SCALE;
        super();
        const loader = new THREE.TextureLoader();
        const doorShape = this.createDoorShape();
        this.doorFrame = this.createDoorFrame(doorShape, loader);
        /** @type {THREE.Mesh} */ this.doorHandle;
        this.door = this.createDoor(doorShape, loader);
        this.door.position.set(-DOOR_SCALE, 0, 0);
        this.add(this.doorFrame);
        this.add(this.door);

        this.timer = new THREE.Timer();
        this.targetAngle = 0.0;
    }

    static DOOR_SCALE = 0.4;
    /** @param {THREE.Shape} shape  @param {THREE.TextureLoader} loader */
    createDoor(shape, loader) {
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
        const doorTexture = loader.load('/imgs/wood.jpg', (_) => {}, (_) => {}, (e) => console.error(e));
        doorTexture.wrapS = THREE.RepeatWrapping;
        doorTexture.wrapT = THREE.RepeatWrapping;
        doorGeometry.translate(1, 1, 0) // Para que el centro de la geometría esté en la bisagra
                    .scale(DOOR_SCALE, DOOR_SCALE, DOOR_SCALE);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.beige,
            map: doorTexture,
        });
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        this.doorHandle = this.createDoorHandle();
        this.doorHandle.position.set(1.6 * DOOR_SCALE, 1.3 * DOOR_SCALE, 0.3 * DOOR_SCALE);
        doorMesh.add(this.doorHandle);
        return doorMesh;
    }

    /** @param {THREE.Shape} shape @param {THREE.TextureLoader} loader  @returns {THREE.Mesh} */
    createDoorFrame(shape, loader) {
        const DOOR_SCALE = DoorModel.DOOR_SCALE;
        const frameTexture = loader.load('/imgs/wall-strong.png', (_) => {}, (_) => {}, (e) => console.error(e))
        const frameBlockMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.aliceblue,
            map: frameTexture,
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
        this.targetAngle = 2 * Math.PI / 3 - 0.2; // El -0.2 es porque exactamente en 2π/3 se clipea con el marco visiblemente
    }

    doAnimationClose() {
        this.targetAngle = 0.0;
    }

    static OPEN_SPEED = 1.5;

    update() {
        const deltaTime = this.timer.getDelta();
        const angleDiff = this.targetAngle - this.door.rotation.y;
        if(Math.abs(angleDiff) >= 0.01) {
            this.door.rotation.y += DoorModel.OPEN_SPEED * angleDiff * deltaTime
        }
        this.timer.update();
    }

    /** @param {any} parent  */
    setUserData(parent) {
        this.door.userData = parent;
        this.doorFrame.userData = parent;
        this.doorHandle.userData = parent;
    }
}