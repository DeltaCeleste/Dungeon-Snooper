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
        // TODO: crear llama

        var bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.add(bodyMesh);
    }

    createBodyGeometry() {
        const mat = new THREE.Material();
        var baseRevolutionGeometry = this.createBaseRevolutionGeometry();
        baseRevolutionGeometry = new CSG.Brush(baseRevolutionGeometry, mat);

        var baseBox = new THREE.BoxGeometry(0.015, 0.02, 0.05, 4, 4, 4);
        baseBox.translate(0, 0.2, 0);
        var boxes = [baseBox];
        for(let i = 0; i < 3; i++) {
            let newBox = boxes[boxes.length - 1].clone();
            newBox.rotateY(Math.PI/4);
            boxes.push(newBox);
        }
        for(let box of boxes) {
            box = new CSG.Brush(box, mat);
        }
        
        var finalGeometry = baseRevolutionGeometry;
        var evaluator = new CSG.Evaluator();
        for(let box of boxes) {
            finalGeometry = evaluator.evaluate(finalGeometry, boxes, CSG.SUBTRACTION);
        }
        return finalGeometry.geometry;
    }

    createBaseRevolutionGeometry() {
        var baseShape = this.createBaseShape();
        var revolvedShape = new THREE.LatheGeometry(
            baseShape.extractPoints(4),
            16, 0, 2 * Math.PI
        )
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
                0.08, 0.13
             )
             .lineTo(0.07, 0.13)
             .bezierCurveTo(
                0.06, 0.12,
                0.04, 0.11,
                0, 0.11
             );
        return shape;
    }

    update() {

    }
}