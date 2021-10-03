import Cell from './cell.js'
import * as helper from "./helper.js";

// Para que VSCode autocomplete con metodos de canvas
/** @type {HTMLCanvasElement} */
let CANVAS
let CONTEXT
const FPS = 60

// Table
const nColumns = 10
const nRows = 10
/**
 * Matriz del nivel
 * @type {Array<Array<Cell>>}
 */
let scene

// Cell
let cellWidth
let cellHeight

//Route
// TODO: Pasar estas variables globales dentro de una clase
/**
 * @type {Cell}
 */
let startPoint
/**
 * @type {Cell}
 */
let endPoint
/**
 * @type {Array<Cell>}
 */
let openSet = [] //Casillas disponibles para buscar camino
/**
 * @type {Array<Cell>}
 */
let closeSet = [] // Casillas ya evaluadas como no validas
/**
 * @type {Array<Cell>}
 */
let route = [] // Array de casillas que forman la ruta optima
let finishedRoute = false

// createArrayScene crea un array de arrays, que simboliza nuestro tablero
const createArrayScene = (nRows, nColumn) => {
    // ? si hay error, checa invertir las columnas y filas
    let scene2D = new Array(nRows)
    for (let i = 0; i < nRows; i++) {
        scene2D[i] = new Array(nColumn)
    }
    return scene2D
}

// drawScene dibuja las casillas en el canvas
const drawScene = () => {
    // Dibuja paredes y camino
    for (let i = 0; i < nColumns; i++) {
        for (let j = 0; j < nRows; j++) {
            scene[j][i].drawCell(CONTEXT, cellWidth, cellHeight)
        }
    }

    // Colorea las casillas en openSet
    openSet.forEach(element => {
        element.drawOpenSet(CONTEXT, cellWidth, cellHeight)
    });

    // Colorea las casillas en closeSet
    closeSet.forEach(element => {
        element.drawCloseSet(CONTEXT, cellWidth, cellHeight)
    });

    // Colorea las casillas de la ruta final
    route.forEach(element => {
        element.drawRoute(CONTEXT, cellWidth, cellHeight)
    });

    // Dibuja las líneas de dibición del canvas
    helper.drawGrid(CONTEXT, cellWidth, cellHeight, 'red', .5)
}

// crearCanvas limpia todo nuestro canvas
const clearCanvas = () => {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
}

/**
 * removeItemFromArray helper que borra un elemento en concreto de un array
 * @param {Array} array array a eliminar
 * @param {*} item item a buscar y eliminar
 */
const removeItemFromArray = (array, item) => {
    // return arr.filter(e => e !== item);
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] === item) {
            array.splice(i, 1)
        }
    }
};

// heuristic calcula la distancia absolita en línea recta
/**
 * @param {Cell} cellA
 * @param {Cell} cellB
 * */
const heuristic = (cellA, cellB) => {
    const xDistance = Math.abs(cellA.x - cellB.x)
    const yDistance = Math.abs(cellA.y - cellB.y)
    return xDistance + yDistance
}



const pathfinding = () => {
    console.log('Algoritmo activo');

    // Verificamos que el final sea accesible
    if (endPoint.type === 1) {
        finishedRoute = true
        console.log('salida es una puerta');
    }

    // Continua sino se ha llegado al final
    if (finishedRoute != true) {

        // TODO: Se podria hacer una función recursiva que valide si la salidad no esta bloqueda
        // Verificamos que los vecinos del endPoint, para confirmar que el final no
        // esta encerrado
        let canway = false
        endPoint.neighbours.forEach(e => {
            if (e.type === 0) {
                canway = true
            }
        })
        if (!canway) {
            finishedRoute = true
        }

        // Seguimos mientras tengamos casillas disponibles para evaluar
        if (openSet.length > 0) {
            let indexWinner = 0 // indice de la casilla mas viable en openset

            // Buscamos el indice de la celda con menor costo
            openSet.forEach((cell, i) => {
                if (cell.f < openSet[indexWinner].f) {
                    indexWinner = i
                }
            });

            let winnerCell = openSet[indexWinner]

            // Analizamos la celda ganadora
            if (winnerCell === endPoint) { // Si es la casilla final, terminamos el algoritmo
                finishedRoute = true

                // Llenamos el array route con las celdas ganadoras
                /**
                 * @type {Cell}
                 */
                let tempCell = winnerCell
                route.push(tempCell)
                while (tempCell.father != null) {
                    tempCell = tempCell.father
                    route.push(tempCell)
                }
            } else { // Sino hemos llegado al final
                removeItemFromArray(openSet, winnerCell)
                closeSet.push(winnerCell)

                const neighboursWinner = winnerCell.neighbours
                neighboursWinner.forEach(neighbourCell => {
                    // Comprobar que no es un muro y comprobar que no esta en closeSet
                    if (!closeSet.includes(neighbourCell) && neighbourCell.type != 1) {
                        // Inclementamos los pasos dados, en 1 porque damos un paso para llegar al vecino
                        let tempG = winnerCell.g + 1

                        // Comprobamos que la casilla esta en OpenSet y son menos pasos para llegar a ella
                        if (openSet.includes(neighbourCell)) {
                            // Es cuando encontramos un camino mas corto por otro lado
                            if (tempG < neighbourCell.g) {
                                neighbourCell.g = tempG
                            }
                        } else {
                            // Actualizamos los pasos que hemos dado.
                            neighbourCell.g = tempG
                            openSet.push(neighbourCell)
                        }

                        // actualizamos valores
                        neighbourCell.h = heuristic(neighbourCell, endPoint)
                        neighbourCell.f = neighbourCell.g + neighbourCell.h

                        // guardamos el padre
                        neighbourCell.father = winnerCell
                    }
                });
            }
        } else {
            finishedRoute = true // Llegamos al final
        }
    }
}

// init es la funcion que inicializa el juego
const init = () => {
    CANVAS = document.getElementById('canvas')
    CONTEXT = CANVAS.getContext('2d')

    // Definimos el tamaño de las celdas
    // ? Parece que no necesario el redondo, para que funcione el algoritmo
    // ? si hay error, verificalo aquí
    // cellWidth = parseInt(CANVAS.width / nColumns)
    // cellHeight = parseInt(CANVAS.height / nRows)
    cellWidth = CANVAS.width / nColumns
    cellHeight = CANVAS.height / nRows


    // Creamos la matriz del escenario
    scene = createArrayScene(nRows, nColumns)

    // Asignamos un objeto Cell a cada casilla del escenario
    for (let i = 0; i < nColumns; i++) {
        for (let j = 0; j < nRows; j++) {
            const c = new Cell(i, j);
            scene[j][i] = c
        }
    }

    // Asignamos los vecinos
    for (let i = 0; i < nColumns; i++) {
        for (let j = 0; j < nRows; j++) {
            scene[j][i].addNeighbours(scene, nRows, nColumns)
        }
    }

    // Definimos el origen y destino
    startPoint = scene[0][0]
    endPoint = scene[nRows - 1][nColumns - 1]

    // Inicializamos el OpenSet
    openSet.push(startPoint)

    console.log('inicalizo el juego');
    // Ejecutar bucle principal
    setInterval(() => {
        main()
    }, 1000 / FPS)
}

// main manda a llamar las funciones activas para que funcione el juego
const main = () => {
    clearCanvas()
    drawScene()
    // Para que al momento de encontrar la ruta deje de ejecutar el algoritmo
    // * evita desborde de memoria
    if (!finishedRoute) {
        pathfinding()
    }
}


window.addEventListener('load', () => {
    init()
})

// const startA = document.getElementById('startA');
// const escenarioRandom = document.getElementById('escenarioRandom');

// escenarioRandom.addEventListener('click', () => {
//     // Creamos la matriz del escenario
//     scene = createArrayScene(nRows, nColumns)

//     // Asignamos un objeto Cell a cada casilla del escenario
//     for (let i = 0; i < nColumns; i++) {
//         for (let j = 0; j < nRows; j++) {
//             const c = new Cell(i, j);
//             scene[j][i] = c
//         }
//     }

//     // Asignamos los vecinos
//     for (let i = 0; i < nColumns; i++) {
//         for (let j = 0; j < nRows; j++) {
//             scene[j][i].addNeighbours(scene, nRows, nColumns)
//         }
//     }
// })

// startA.addEventListener('click', () => {
//     init()
// })
