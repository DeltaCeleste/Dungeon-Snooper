import * as THREE from 'three'
import { toCoords } from './maze.js';

export class MazeModel extends THREE.Object3D {
    static WallMaterial = new THREE.MeshStandardMaterial({ color: THREE.Color.NAMES.white });
    static WeakWallMaterial = new THREE.MeshStandardMaterial({ color: THREE.Color.NAMES.bisque });

    /** @param {string[]} mazeStrings @param {number} blockWidth @param {number} blockHeight */
    constructor(mazeStrings, blockWidth, blockHeight) {
        super();
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;
        const loader = new THREE.TextureLoader();
        const wallTexture = loader.load('/imgs/wall-strong.png', (_) => {}, (_) => {}, (error) => {
            console.error(error);
        });
        MazeModel.WallMaterial.map = wallTexture;
        const weakWallTexture = loader.load('/imgs/wall-weak.png', (_) => {}, (_) => {}, (error) => {
            console.error(error);
        });
        MazeModel.WeakWallMaterial.map = weakWallTexture;

        const blockGeometry = new THREE.BoxGeometry(blockWidth, blockHeight, blockWidth, 2, 2, 2);
        blockGeometry.translate(0, blockHeight / 2, 0);

        if(mazeStrings.length === 0 || mazeStrings[0].length === 0) {
            console.error('Invalid maze size');
            return;
        }
        const rows = mazeStrings.length;
        const cols = mazeStrings[0].length;
        this.rows = rows;
        this.cols = cols;

        const topLeftBlockPosition = new THREE.Vector3(
            -(cols / 2) * blockWidth - blockWidth / 4,
            0,
            -(rows / 2) * blockWidth - blockWidth / 4,
        );

        /** @type {THREE.Mesh[]} */ this.blockMeshes = [];

        for(let i = 0; i < rows; i++) {
            const thisRow = mazeStrings[i];
            for(let j = 0; j < cols; j++) {
                const thisCell = thisRow.charAt(j);
                const thisBlockPosition = topLeftBlockPosition.clone();
                thisBlockPosition.add(new THREE.Vector3(j * blockWidth, 0, i * blockWidth));

                switch(thisCell) {
                    case '#': {
                        let strongBlockMesh = new THREE.Mesh(blockGeometry, MazeModel.WallMaterial);
                        strongBlockMesh.position.set(thisBlockPosition.x, thisBlockPosition.y, thisBlockPosition.z);
                        strongBlockMesh.userData = this;
                        this.add(strongBlockMesh);
                        this.blockMeshes.push(strongBlockMesh);
                        break;
                    }
                    case 'X': {
                        let weakBlockMesh = new THREE.Mesh(blockGeometry, MazeModel.WeakWallMaterial);
                        weakBlockMesh.position.set(thisBlockPosition.x, thisBlockPosition.y, thisBlockPosition.z);
                        weakBlockMesh.userData = this;
                        this.add(weakBlockMesh);
                        this.blockMeshes.push(weakBlockMesh);
                        break;
                    }
                    default: break;
                }
            }
        }

        const floorXWidth = (cols + 4) * blockWidth;
        const floorZDepth = (rows + 4) * blockWidth;
        const floorGeometry = new THREE.PlaneGeometry(floorXWidth, floorZDepth, 1, 1).rotateX(-Math.PI / 2);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: THREE.Color.NAMES.darkgray });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(-0.5 * blockWidth, 0, -0.5 * blockWidth);
        this.add(floor);
    }

    update() { /* Intencionalmente en blanco */ }

    /** @param {number} row @param {number} col  @returns {Vector3} */
    getRelativePosOfCell(row, col) {
        row = 3 * row + 1.5;
        col = 3 * col + 1.5;
        const rows = this.rows;
        const cols = this.cols;
        const blockWidth = this.blockWidth;
        const position = new THREE.Vector3(
            -(cols / 2) * blockWidth - blockWidth / 4 + (col) * blockWidth,
            0,
            -(rows / 2) * blockWidth - blockWidth / 4 + (row) * blockWidth,
        );
        return position;
    }
}