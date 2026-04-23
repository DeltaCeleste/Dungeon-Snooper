import * as THREE from 'three'
import * as CSG from 'csg'

export class Pickaxe extends THREE.Object3D {
    constructor() {
        super();
        var headMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.slategray,
            metalness: 0.7,
            roughness: 0.64
        });
        var handleMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.chocolate,
            normalMap: new THREE.TextureLoader().load('../../imgs/noise_normal.jpeg')
        });

        var headGeometry = this.createHeadGeometry();
        var handleGeometry = this.createHandleGeometry();

        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.handle = new THREE.Mesh(handleGeometry, handleMaterial);

        this.head.translateY(0.11);
        this.handle.translateY(0.065);
        this.add(this.head)
        this.add(this.handle);
    }

    createHeadGeometry() {
        const SCALE_FACTOR = 0.01
        var baseShape = this.createHeadBaseShape()
        var extrudedBaseShape = new THREE.ExtrudeGeometry(baseShape, {
            steps: 2,
            depth: 1,
            bevelEnabled: false,
        });
        extrudedBaseShape.translate(0, 0, -0.5);
        extrudedBaseShape.scale(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
        var headCube = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        headCube.scale(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
        var cilynderHole = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 8);
        cilynderHole.scale(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
        var mat = new THREE.Material();
        extrudedBaseShape = new CSG.Brush(extrudedBaseShape, mat);
        headCube = new CSG.Brush(headCube, mat);
        cilynderHole = new CSG.Brush(cilynderHole, mat);

        var evaluator = new CSG.Evaluator();
        var tempheadWithoutCube = evaluator.evaluate(headCube, extrudedBaseShape, CSG.ADDITION);
        var finalHead = evaluator.evaluate(tempheadWithoutCube, cilynderHole, CSG.SUBTRACTION);
        return finalHead.geometry;
    }

    createHeadBaseShape() {
        var shape = new THREE.Shape()
        shape.moveTo(1.0, 0.5);
        shape.bezierCurveTo(
            3.0, 0.5,
            5.0, -0.5,
            5.0, -1.0
        );
        shape.bezierCurveTo(
            5.0, -0.75,
            3.0, -0.5,
            1.0, -0.5
        );
        shape.lineTo(-1.0, -0.5);
        shape.bezierCurveTo(
            -3.0, -0.5,
            -5.0, -0.75,
            -5.0, -1.0
        );
        shape.bezierCurveTo(
            -5.0, -0.5,
            -3.0, 0.5,
            -1.0, 0.5
        );
        shape.lineTo(1.0, 0.5);
        return shape;
    }

    createHandleGeometry() {
        return new THREE.CylinderGeometry(0.004, 0.004, 0.12, 8, 6);
    }

    update() {

    }

    setUserData(parent) {
        this.head.userData = parent;
        this.handle.userData = parent;
    }
}