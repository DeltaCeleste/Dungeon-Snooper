/** 
 * @typedef {string} Cell
 */

/**
 * @param {number} row 
 * @param {number} col 
 * @returns {Cell}
 * Toma una fila y columna y las convierte a un string representativo de una celda del laberinto.
 * ¿Por qué un string? Porque se pueden hashear. En un mundo perfecto hubiéramos usado objetos de la forma 
 * { row: number, col: number }, pero JS compara la igualdad de objetos mediante punteros, y no hay manera
 * de sustituir esta comprobación. Por tanto tenemos que hacer este truco de "serialización" y esperar que
 * no tankee las prestaciones. 
 * Gracias, Brendan Eich.
 */
export function toCell(row, col) {
    return `${row}:${col}`
}

/** 
 * @param {Cell} cell 
 * @returns {[number, number]}
 * Hace lo mismo que la función anterior pero a la inversa. Devuelve una tupla que se puede desestructurar fácilmente.
 */
export function toCoords(cell) {
    var numberStrings = cell.split(':');
    if(numberStrings.length !== 2) {
        throw Error('Invalid cell string format');
    }
    return [parseInt(numberStrings[0]), parseInt(numberStrings[1])];
}

/**
 * @param {Cell} cell1 
 * @param {Cell} cell2 
 * @returns {boolean}
 * Comprueba si las celdas son adyacentes.
 */
export function cellAdjacent(cell1, cell2) {
    const [row1, col1] = toCoords(cell1);
    const [row2, col2] = toCoords(cell2);
    const dRow = row2 - row1;
    const dCol = col2 - col1;
    return (dRow === 1  && dCol === 0) 
        || (dRow === -1 && dCol === 0) 
        || (dRow === 0  && dCol === 1) 
        || (dRow === 0  && dCol === -1);
}

/**
 * @param {Cell} cell
 * @returns {Cell[]} 
 * Devuelve un array con las cuatro celdas adyacentes a la dada. Puede que sea útil para los algoritmos de generación de laberintos.
 */
export function getCellsAdjacent(cell) {
    const [row, col] = toCoords(cell);
    return [
        toCell(row - 1, col),
        toCell(row + 1, col),
        toCell(row, col - 1),
        toCell(row, col + 1)
    ];
}

export class Maze {
    /** 
     * @type {Map.<Cell, Array.<Cell>>} 
     * Grafo interno que asigna a cada celda las celdas adyacentes a las que puede acceder (i.e., las que no tienen muro de por medio). 
     */ 
    #graph;

    /** 
     * @type {Map.<Cell, Array.<Cell>>} 
     * Almacena solo las paredes "débiles" (que pueden ser rotas con el pico).
     */ 
    #weakWalls;

    /** @readonly @enum {number} */
    static WallType = {
        Full: 2,
        Weak: 1,
        None: 0
    };

    /** 
     * @readonly @enum {number} 
     * Enumerado que representa los muros asignados a una celda. Debido a que celdas adyacentes comparten muros,
     * solo es necesario que una celda dada tenga los muros hacia arriba y hacia la izquierda (el muro hacia abajo
     * es el muro hacia arriba de la celda por debajo). `Corner` es un estado especial que solo llena la esquina superior
     * izquierda para que el laberinto se vea bien.
     */ 
    static WallState = {
        Empty: 0,
        WestWall: 1,
        NorthWall: 2,
        BothWalls: 3,
        Corner: -1
    }
    /** 
     * @type {WallState[][]?} 
     * Matriz auxiliar que almacena el estado de los muros de cada celda para su representación en string.
     * Tiene que ser calculada previamente.
     */ 
    #stringReprMatrix = null;


    /**
     * @param {number} rows 
     * @param {number} cols 
     * Inicializa el laberinto rows × cols, con todas las celdas enteramente bloqueadas.
     */
    constructor(rows, cols) {
        /** @type {number} */ this.rows = rows;
        /** @type {number} */ this.cols = cols;

        this.#graph = new Map();
        this.#weakWalls = new Map();

        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                this.#graph.set(toCell(i,j), []);
                this.#weakWalls.set(toCell(i, j), []);
            }
        }
    }

    /**
     * @param {Cell} cell 
     * @returns {boolean}
     * Comprueba si la celda dada está en el rango del laberinto.
     */
    contains(cell) { 
        const [row, col] = toCoords(cell);
        return (row >= 0 && row < this.rows)
            && (col >= 0 && col < this.cols);
    }

    /**
     * @param {Cell} cell1 
     * @param {Cell} cell2 
     * Conecta las dos celdas dadas (rompiendo el muro entre ellas). 
     * Deben de ser adyacentes y estar ambas en rango del laberinto.
     * Si ya están conectadas, no hace nada.
     */
    connectCells(cell1, cell2) {
        if(!cellAdjacent(cell1, cell2)) {
            throw Error("Cells not adjacent");
        }

        if(!this.contains(cell1)) {
            throw Error(`${cell1} out of range`);
        }

        if(!this.contains(cell2)) {
            throw Error(`${cell2} out of range`);
        }

        if(this.#graph.get(cell1).indexOf(cell2) === -1) {
            this.#graph.get(cell1).push(cell2);
        }
        if(this.#graph.get(cell2).indexOf(cell1) === -1) {
            this.#graph.get(cell2).push(cell1);
        }
    }

    /**
     * @param {Cell} cell1 
     * @param {Cell} cell2 
     * Hace el muro entre las dos celdas dadas "débil" (es decir, rompible con el pico).
     * Deben de ser adyacentes y estar ambas en rango del laberinto.
     * Si ya están separadas por un muro débil, no hace nada.
     */
    makeWeakWall(cell1, cell2) {
        if(!cellAdjacent(cell1, cell2)) {
            throw Error("Cells not adjacent");
        }

        if(!this.contains(cell1)) {
            throw Error(`${cell1} out of range`);
        }

        if(!this.contains(cell2)) {
            throw Error(`${cell2} out of range`);
        }

        if(this.#graph.get(cell1).indexOf(cell2) === -1) {
            this.#weakWalls.get(cell1).push(cell2);
        }
        if(this.#graph.get(cell2).indexOf(cell1) === -1) {
            this.#weakWalls.get(cell2).push(cell1);
        }
    }

    /**
     * @param {Cell} cell1 
     * @param {Cell} cell2 
     * Desconecta las dos celdas dadas (creando un muro entre ellas).
     * Deben de ser adyacentes y estar ambas en rango del laberinto.
     * Si ya están desconectadas, no hace nada.
     */
    disconnectCells(cell1, cell2) {
        if(!cellAdjacent(cell1, cell2)) {
            throw Error("Cells not adjacent");
        }

        if(!this.contains(cell1)) {
            throw Error(`${cell1} out of range`);
        }

        if(!this.contains(cell2)) {
            throw Error(`${cell2} out of range`);
        }

        const cell1InCell2 = this.#graph.get(cell2).indexOf(cell1);
        const cell2InCell1 = this.#graph.get(cell1).indexOf(cell2);
        if(cell1InCell2 !== -1) { 
            this.#graph.get(cell2).splice(cell1InCell2, 1); 
        }
        if(cell2InCell1 !== -1) { 
            this.#graph.get(cell1).splice(cell2InCell1, 1); 
        }

        // Hacemos lo mismo quitando muros débiles.
        cell1InCell2 = this.#weakWalls.get(cell2).indexOf(cell1);
        cell2InCell1 = this.#weakWalls.get(cell1).indexOf(cell2);
        if(cell1InCell2 !== -1) { 
            this.#weakWalls.get(cell2).splice(cell1InCell2, 1); 
        }
        if(cell2InCell1 !== -1) { 
            this.#weakWalls.get(cell1).splice(cell2InCell1, 1); 
        }
    }

    /**
     * @param {Cell} cell 
     * @returns {WallType}
     * Comprueba si la celda dada debería tener un muro hacia arriba (es decir, si no está conectada a su celda superior)
     */
    upperWall(cell) {
        const [row, col] = toCoords(cell);
        if(this.#weakWalls.get(cell).indexOf(toCell(row - 1, col)) !== -1) {
            return Maze.WallType.Weak;
        } else if(this.#graph.get(cell).indexOf(toCell(row - 1, col)) === -1) {
            return Maze.WallType.Full;
        } else {
            return Maze.WallType.None;
        }
    }

    /**
     * @param {number} row 
     * @param {number} col 
     * @returns {WallType}
     * Lo mismo que con (cell), pero toma fila y columna en lugar de una celda preconstruida para evitar tener que deconstruirla.
     */
    upperWall(row, col) {
        if(this.#weakWalls.get(toCell(row, col)).indexOf(toCell(row - 1, col)) !== -1) {
            return Maze.WallType.Weak;
        } else if(this.#graph.get(toCell(row, col)).indexOf(toCell(row - 1, col)) === -1) {
            return Maze.WallType.Full;
        } else {
            return Maze.WallType.None;
        }
    }

    /**
     * @param {Cell} cell 
     * @returns {WallType}
     * Comprueba si la celda dada debería tener un muro hacia la izquierda (es decir, si no está conectada a su celda izquierda)
     */
    leftWall(cell) {
        const [row, col] = toCoords(cell);
        if(this.#weakWalls.get(cell).indexOf(toCell(row, col - 1)) !== -1) {
            return Maze.WallType.Weak;
        } else if(this.#graph.get(cell).indexOf(toCell(row, col -1)) === -1) {
            return Maze.WallType.Full;
        } else {
            return Maze.WallType.None;
        }
    }

    /**
     * @param {number} row 
     * @param {number} col 
     * @returns {WallType}
     * Lo mismo que con (cell), pero toma fila y columna en lugar de una celda preconstruida para evitar tener que deconstruirla.
     */
    leftWall(row, col) {
        if(this.#weakWalls.get(toCell(row, col)).indexOf(toCell(row, col - 1)) !== -1) {
            return Maze.WallType.Weak;
        } else if(this.#graph.get(toCell(row, col)).indexOf(toCell(row, col - 1)) === -1) {
            return Maze.WallType.Full;
        } else {
            return Maze.WallType.None;
        }
    }

    /**
     * Calcula la matriz auxiliar para la representación.
     */
    #fillStringReprMatrix() {
        const WallState = Maze.WallState;
        const WallType = Maze.WallType;
        
        // Notemos que el valor de la esquina solo se debe dar si la celda superior tiene un muro vertical, 
        // o si la celda izquierda tiene un muro horizontal. Esto depende de las celdas en posiciones anteriores y
        // hace que tengamos que llenar la matriz recursivamente.

        this.#stringReprMatrix = [];
        for(let i = 0; i < this.rows; i++) {
            this.#stringReprMatrix.push([]);
            for(let j = 0; j < this.cols; j++) {
                this.#stringReprMatrix[i].push(WallState.Empty);
            }
        }

        // La primera casilla siempre tiene muros arriba y a la izquierda
        this.#stringReprMatrix[0][0] = WallState.NorthWall | WallState.WestWall;

        // Rellenamos la primera fila (siempre tiene muros arriba)
        for(let j = 1; j < this.cols; j++) {
            this.#stringReprMatrix[0][j] = WallState.NorthWall;
            if(this.leftWall(0, j) !== WallType.None) {
                this.#stringReprMatrix[0][j] |= WallState.WestWall;
            }
        }

        // Rellenamos la primera columna (siempre tiene muros a la derecha)
        for(let i = 1; i < this.rows; i++) {
            this.#stringReprMatrix[i][0] = WallState.WestWall;
            if(this.upperWall(i, 0) !== WallType.None) {
                this.#stringReprMatrix[i][0] |= WallState.NorthWall;
            }
        }

        // Rellenamos el resto de casillas recursivamente 
        for(let i = 1; i < this.rows; i++) {
            for(let j = 1; j < this.cols; j++) {
                if(this.upperWall(i, j) !== WallType.None) {
                    this.#stringReprMatrix[i][j] += WallState.NorthWall;
                }
                if(this.leftWall(i, j) !== WallType.None) {
                    this.#stringReprMatrix[i][j] += WallState.WestWall;
                }

                // Recursión: Si la casilla está vacía y arriba hay muro vertical, o a la izquierda hay muro horizontal, 
                // llenar solo la esquina.
                if(this.#stringReprMatrix[i][j] === WallState.Empty) {
                    const upperCell = this.#stringReprMatrix[i-1][j];
                    const leftCell = this.#stringReprMatrix[i][j-1];
                    if(upperCell | WallState.WestWall || upperCell | WallState.BothWalls
                     || leftCell | WallState.NorthWall || leftCell | WallState.BothWalls) {
                        this.#stringReprMatrix[i][j] = WallState.Corner;
                    }
                }
            }
        }
    } // Dios mío, cuántas llaves

    /**
     * @returns {string[]}
     * Devuelve una representación humanamente legible del laberinto, como un array de strings. Por ejemplo:
    
            ##########
            #     #  #
            #     #  #
            ####  #  #
            #  #     #
            #  #     #
            #  ####  #
            #        #
            #        #
            ##########
     */
    getAsStrings() {
        const WallState = Maze.WallState;
        const WallType = Maze.WallType;
        // Tamaño (n x n) que una sola celda del laberinto tendrá en el resultado. 
        // Con el valor de 5, una celda con los muros arriba y a la izquierda se verá así:
        /*
            #####
            #␣␣␣␣
            #␣␣␣␣
            #␣␣␣␣
            #␣␣␣␣
        */
        // Los pasillos del laberinto tendrán entonces una anchura de CELL_SIZE - 1 caracteres 
        const CELL_SIZE = 3;
        // Carácter que representa espacio vacío
        const FREE_CELL = ' '.charCodeAt(0);
        // Carácter que representa un muro entre dos celdas
        const WALL_CELL = '#'.charCodeAt(0);
        // Carácter que representa un muro débil
        const WALL_WEAK = 'X'.charCodeAt(0);
        
        this.#fillStringReprMatrix();
        
        /** 
         * @type {Uint8Array[]} 
         * Usamos un Uint8Array por cada 'línea de texto' porque JS no permite sustituir exactamente un carácter en una cadena.
         * Gracias de nuevo, Brendan Eich
        */
        var chars = [];

        for(let i = 0; i < this.rows; i++) {
            // Crear nueva "fila" en el aray de strings
            for(let strRow = 0; strRow < CELL_SIZE; strRow++) {
                chars.push(new Uint8Array(CELL_SIZE * this.cols + 1)); // Menos mal que las filas tienen tamaño fijo. 
                                                                       // Sumamos 1 para el muro de la derecha del todo, que siempre estará ahí
            }

            for(let j = 0; j < this.cols; j++) {
                // Inicializa un espacio vacío

                for(let strRow = i * CELL_SIZE; strRow < (i + 1) * CELL_SIZE; strRow++) {
                    for(let strCol = j * CELL_SIZE; strCol < (j + 1) * CELL_SIZE; strCol++) {
                        chars[strRow][strCol] = FREE_CELL;
                    }
                }

                const currentCell = this.#stringReprMatrix[i][j]
                let isWeakUpperWall = (this.upperWall(i, j) === WallType.Weak);
                let isWeakLeftWall = (this.leftWall(i, j) === WallType.Weak);

                // Todas las celdas no vacías tienen la esquina
                if(currentCell !== WallState.Empty) {
                    chars[i * CELL_SIZE][j * CELL_SIZE] = (isWeakUpperWall || isWeakLeftWall) ? WALL_WEAK : WALL_CELL;
                }
                // Se encarga del muro de arriba (primera fila del bloque)
                if(currentCell === WallState.NorthWall || currentCell === WallState.BothWalls) {
                    for(let strCol = j * CELL_SIZE; strCol < (j + 1) * CELL_SIZE; strCol++) {
                        chars[i * CELL_SIZE][strCol] = isWeakUpperWall ? WALL_WEAK : WALL_CELL;
                    }
                }
                // Se encarga del muro de la izquierda (primera columna del bloque)
                if(currentCell === WallState.WestWall || currentCell === WallState.BothWalls) {
                    for(let strRow = i * CELL_SIZE; strRow < (i + 1) * CELL_SIZE; strRow++) {
                        chars[strRow][j * CELL_SIZE] = isWeakLeftWall ? WALL_WEAK : WALL_CELL;
                    }
                }
            }
            // Rellenamos el muro de la derecha al final de la fila
            for(let strRow = i * CELL_SIZE; strRow < (i + 1) * CELL_SIZE; strRow++) {
                chars[strRow][CELL_SIZE * this.cols] = WALL_CELL;
            }
        }
        
        let lastRow = new Uint8Array(this.cols * CELL_SIZE + 1);
        for(let j = 0; j < lastRow.length; j++) {
            lastRow[j] = WALL_CELL;
        }
        chars.push(lastRow); // Última fila es el muro de abajo, siempre relleno

        var strings = [];
        var decoder = new TextDecoder();
        for(let byteArray of chars) {
            strings.push(decoder.decode(byteArray));
        }
        return strings
    }

    prettyPrint() { // TODO: pasar esto al conversor laberinto -> modelo, de algún modo.
        var strings = this.getAsStrings();
        console.log(strings.join('\n'));
    }

    printDebug() {
        console.log(this.#graph);
    }
}

// Programa de prueba.
function __maze_test() {
    var maze = new Maze(3, 3);

    maze.connectCells(toCell(0,0), toCell(0,1));
    maze.connectCells(toCell(0,1), toCell(1,1));
    maze.connectCells(toCell(1,1), toCell(1,2));
    maze.connectCells(toCell(1,2), toCell(0,2));
    maze.connectCells(toCell(1,2), toCell(2,2));
    maze.connectCells(toCell(1,0), toCell(2,0));
    maze.connectCells(toCell(2,0), toCell(2,1));
    maze.connectCells(toCell(2,1), toCell(2,2));
    maze.printDebug();
    maze.prettyPrint();
}
