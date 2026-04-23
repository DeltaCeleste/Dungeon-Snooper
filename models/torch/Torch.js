import * as THREE from 'three'
import * as CSG from 'csg'
export class Torch extends THREE.Object3D {
    constructor() {
        super();
        var bodyMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.goldenrod,
            metalness: 0.75,
            roughness: 0.32
        });

        var bodyGeometry = this.createBodyGeometry();
        this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyMesh.translateY(0.15);
        this.add(this.bodyMesh);

        this.loadFireTextures();
        this.fireFrameCounter = 0;
        this.fireMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            map: this.fireTextures[this.fireFrameCounter],
            emissive: THREE.Color.NAMES.white,
            emissiveIntensity: 0.33,
        })
        this.addFire();
        var fireLight = new THREE.PointLight(THREE.Color.NAMES.orangered, 0.25, 1.0);
        fireLight.position.set(0.0, 0.3, 0.0);
        this.add(fireLight);

        this.frameTimer = 0;
    }

    addFire() {
        const SIZE = 0.2;
        const originalGeometry = new THREE.PlaneGeometry(SIZE, SIZE);
        /** @type {THREE.Mesh[]} */
        this.fireMeshes = [];
        for(let i = 0; i < 4; i++) {
            const rotatedGeometry = originalGeometry.clone().rotateY(Math.PI * i * 0.5);
            var fireMesh = new THREE.Mesh(rotatedGeometry, this.fireMaterial);
            fireMesh.translateY(0.35);
            this.add(fireMesh);
            this.fireMeshes.push(fireMesh);
        }
    }

    loadFireTextures() {
        var loader = new THREE.TextureLoader();

        /** @type {Array<THREE.Texture>} */
        this.fireTextures = [];

        for(let i = 1; i <= 13; i++) {
            let currFrameName = "/imgs/fire/fire1_" + i.toString().padStart(2, '0') + ".png";
            //let frame_i_name = "/imgs/wood.jpg";
            let currFrame = loader.load(currFrameName, (_) => {}, (_) => {}, (err) => {console.error(err);});
            this.fireTextures.push(currFrame);
        }
    }

    createBodyGeometry() {
        const mat = new THREE.Material();
        var baseRevolutionGeometry = this.createBaseRevolutionGeometry();
        baseRevolutionGeometry = new CSG.Brush(baseRevolutionGeometry, mat);

        var baseBox = new THREE.BoxGeometry(0.025, 0.05, 0.5, 1, 1, 1);
        baseBox.translate(0, 0.15, 0);
        var boxes = [baseBox];
        for(let i = 0; i < 3; i++) {
            let newBox = boxes[boxes.length - 1].clone();
            newBox.rotateY(Math.PI/4);
            boxes.push(newBox);
        }
        var boxBrushes = [];
        for(let box of boxes) {
            boxBrushes.push(new CSG.Brush(box, mat));
        }
        
        var finalGeometry = baseRevolutionGeometry;
        var evaluator = new CSG.Evaluator();
        for(let box of boxBrushes) {
            console.log(box instanceof CSG.Brush);
            finalGeometry = evaluator.evaluate(finalGeometry, box, CSG.SUBTRACTION);
        }
        
        return finalGeometry.geometry;
    }

    createBaseRevolutionGeometry() {
        var baseShape = this.createBaseShape();
        var revolvedShape = new THREE.LatheGeometry(
            baseShape.extractPoints(6).shape,
        );
        return revolvedShape;
    }

    createBaseShape() {
        var shape = new THREE.Shape();
        shape.moveTo(0, -0.15)
             .lineTo(0.02, -0.15)
             .lineTo(0.03, 0.1)
             .bezierCurveTo(
                0.05, 0.1,
                0.07, 0.12,
                0.08, 0.15
             )
             .lineTo(0.07, 0.15)
             .bezierCurveTo(
                0.06, 0.12,
                0.04, 0.11,
                0, 0.11
             );
        return shape;
    }

    updateFireMaterial() {
        this.fireFrameCounter++;
        this.fireFrameCounter %= this.fireTextures.length;
        this.fireMaterial.map = this.fireTextures[this.fireFrameCounter];
        this.fireMaterial.needsUpdate = true;
    }
    
    static get fireUpdateSpeed() { return 5; }

    update() {
        this.frameTimer++;
        if(this.frameTimer === Torch.fireUpdateSpeed) {
            this.updateFireMaterial();
            this.frameTimer = 0;
        }
    }

    setUserData(parent) {
        this.bodyMesh.userData = parent;
        for(let fireMesh of this.fireMeshes) {
            fireMesh.userData = parent;
        }
    }
}