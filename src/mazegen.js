import { getCellsAdjacent, Maze, toCell, toCoords } from './maze.js';
import * as rand from './external/seedrandom.js';

/**
 * @param {number} x 
 * @param {number} m 
 * @returns {number}
 */
function mod(x, m) {
    return (x % m + m) % m;
}

/**
 * @param {number} rows 
 * @param {number} cols 
 * @param {number} seed 
 * @param {string?} startingCell 
 * @returns {Maze}
 */
export function generateMazeDfs(rows, cols, seed, startingCell) {
    const rand = new Math.seedrandom(seed);
    var maze = new Maze(rows, cols);
    /** @type {Set.<string>} */
    var visited = new Set();
    /** @type {string[]} funciona como una pila, para hacer DFS */
    var frontier = [];
    if(startingCell === null | startingCell === undefined) {
        let row = mod(rand.int32(), rows);
        let col = mod(rand.int32(), cols);
        startingCell = toCell(row, col);
    }

    // Hace la búsqueda DFS iterativa propiamente dicha.
    visited.add(startingCell);
    frontier.push(startingCell);

    while(frontier.length > 0) {
        let currentCell = frontier.pop();
        let unvisitedNeighbors = getCellsAdjacent(currentCell).filter(cell => (!visited.has(cell) && maze.contains(cell)));
        if(unvisitedNeighbors.length > 0) {
            frontier.push(currentCell); // Vuelve a poner la celda en la pila porque no ha terminado con ella todavía
            let chosenCellIdx = mod(rand.int32(), unvisitedNeighbors.length);
            let chosenCell = unvisitedNeighbors[chosenCellIdx];

            let [row, col] = toCoords(chosenCell);
            let canMakeWeakWall = (row >= maze.rows / 3 && col >= maze.cols / 3);

            if(rand.int32() % 4 == 0 && canMakeWeakWall) {
                maze.makeWeakWall(currentCell, chosenCell);
            } else {
                maze.connectCells(currentCell, chosenCell);
            }

            visited.add(chosenCell);
            frontier.push(chosenCell);
        }
    }

    return maze;
}

function __maze_test() {
    var maze = generateMazeDfs(20, 20, 'laberintos');
    maze.prettyPrint();
}
