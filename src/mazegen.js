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

var randGen = new Math.seedrandom('');

/**
 * @param {number} rows 
 * @param {number} cols 
 * @param {number} seed 
 * @param {string?} startingCell 
 * @returns {Maze}
 */
export function generateMazeDfs(rows, cols, seed, startingCell) {
    randGen = new Math.seedrandom(seed);
    var maze = new Maze(rows, cols);
    /** @type {Set.<string>} */
    var visited = new Set();
    /** @type {string[]} funciona como una pila, para hacer DFS */
    var frontier = [];
    if(startingCell === null || startingCell === undefined) {
        let row = mod(randGen.int32(), rows);
        let col = mod(randGen.int32(), cols);
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
            let chosenCellIdx = mod(randGen.int32(), unvisitedNeighbors.length);
            let chosenCell = unvisitedNeighbors[chosenCellIdx];

            let [row, col] = toCoords(chosenCell);
            let canMakeWeakWall = (row >= maze.rows / 3 && col >= maze.cols / 3);

            if(randGen.int32() % 4 == 0 && canMakeWeakWall) {
                maze.makeWeakWall(currentCell, chosenCell);
            } else {
                maze.connectCells(currentCell, chosenCell);
            }

            visited.add(chosenCell);
            frontier.push(chosenCell);
        }
    }

    //console.log(maze.prettyPrint())
    //console.log(maze)

    return maze;
}

/**
 * @param {maze} maze 
 * @param {number} seed 
 * @param {string} item 
 * @param {Cell} start 
 * @param {Cell?} end 
 * @returns {Cell}
 * Busca un camino accesible (sin muros de ningún tipo) desde start. el camino lo busca 
 * hasta encontrar un callejón sin salida.
 */
export function suitableLocationForItem(maze, seed, item, start, end){
    //const rand = new Math.seedrandom(seed);
    /** @type {Set.<string>} */
    var visited = new Set();


    let currentCell = start;
    if(item == 'Pickaxe'){ // Su posición debe ser accesible desde el inicio, deiseñado para un único pico y el primer item
        var cond = true;
        while (cond){
            //console.log(currentCell)
            visited.add(currentCell);
            let candidatos = maze.getAccesible(currentCell).filter(cell => (!visited.has(cell)));
            //console.log(candidatos);
            if(candidatos.length == 0){
                console.log('Casilla elegida para el item ' + item + ' ' + currentCell)
                cond = false
            }
            else{
                let chosenCellIdx = mod(randGen.int32(), candidatos.length);
                currentCell = candidatos[chosenCellIdx];
            }
        }
    }
    else if(item == 'Key'){
        if(end === null || end === undefined) {
            currentCell = randomLocationInArea(maze, seed, toCell(Math.floor(maze.cols/2), Math.floor(maze.rows/2)), Math.floor(maze.cols/2), Math.floor(maze.rows/2));
        }
        else currentCell = randomLocationInArea(maze, seed, start, toCoords(end)[0]-toCoords(start)[0], toCoords(end)[1]-toCoords(start)[1]);
    }
    else if(item == 'Eye'){
        if(end === null || end === undefined) {
            currentCell = randomLocationInArea(maze, seed, toCell(Math.floor(maze.cols/2), Math.floor(maze.rows/2)), Math.floor(maze.cols/3), Math.floor(maze.rows/3));
        }
        else currentCell = randomLocationInArea(maze, seed, start, toCoords(end)[0]-toCoords(start)[0], toCoords(end)[1]-toCoords(start)[1]);
    }
    else if(item == 'Torch'){
        if(end === null || end === undefined) {
            currentCell = randomLocationInArea(maze, seed, toCell(0,0), maze.cols, maze.rows);
        }
        else currentCell = randomLocationInRow(maze, seed, start, end, maze.rows);
    }
    maze.occupied(currentCell);
    return currentCell;
} 

function randomLocationInArea(maze, seed, leftTop, width, height){
    //const rand = new Math.seedrandom(seed);

    var cell;
    while(true){
        var cell = toCell(
                mod(randGen.int32(), width) + toCoords(leftTop)[0],
                mod(randGen.int32(), height) + toCoords(leftTop)[1],
                );
        if(!maze.getOccupied(cell)){
            return cell
        }
    }

}

function randomLocationInRow(maze, seed, start, end, width){
    //const rand = new Math.seedrandom(seed);

    var filaInicio =toCoords(start)[0];
    var colInicio =toCoords(start)[1];
    var filaFin =toCoords(end)[0];
    var colFin =toCoords(end)[1];

    const numInicio = filaInicio * width + colInicio;
    const numFin = filaFin * width + colFin;
    
    while(true){

        const numAleatorio = mod(randGen.int32(), (numFin - numInicio)) + numInicio;
        
        // Convertir de vuelta a coordenada
        const fila = Math.floor(numAleatorio / width);
        const columna = numAleatorio % width;

        //console.log(toCell(fila, columna))

        if(!maze.getOccupied(toCell(fila, columna))){
            return toCell(fila, columna);
        }

    }
}

function __maze_test() {
    var maze = generateMazeDfs(20, 20, 'laberintos');
    maze.prettyPrint();
}
