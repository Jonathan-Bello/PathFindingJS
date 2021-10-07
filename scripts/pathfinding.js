import Cell from './cell.js'
import * as helper from "./helper.js";
import * as cristiMaps from "./cristiMap.js"

// Para que VSCode autocomplete con metodos de canvas
/** @type {HTMLCanvasElement} */
let CANVAS
let CONTEXT
const FPS = 30

// Table
let nColumns
let nRows
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
let gameStarted = false

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
            // console.log(scene[j][i].x);
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

    if (startPoint.type != 1 && endPoint.type != 1) {
        // Pinta la celda inicial
        startPoint.drawCelltoColor(CONTEXT, cellWidth, cellHeight, '#1993CC')
        startPoint.drawCellDataofString(CONTEXT, '#0000000', 'Inicio', cellWidth, cellHeight)

        // Pinta la celda final
        endPoint.drawCelltoColor(CONTEXT, cellWidth, cellHeight, '#0E5677')
        endPoint.drawCellDataofString(CONTEXT, '#0000000', 'Final', cellWidth, cellHeight)
    }
    // Dibuja las líneas de dibivsión del canvas
    helper.drawGrid(CONTEXT, cellWidth, cellHeight, 'black', .5)
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
    if (!finishedRoute) {
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

/**
 * titleScreenImg muestra la imagen de pantalla de inicio
 */
const titleScreenImg = () => {
    if (!gameStarted) {
        let imgStart = new Image()
        imgStart.src = './img/TitleScreen2.svg'
        imgStart.onload = () => {
            CONTEXT.drawImage(imgStart, 0, 0, 500, 500)
        }
    }
}

// init es la funcion que inicializa el juego
const init = () => {
    CANVAS = document.getElementById('canvas')
    CONTEXT = CANVAS.getContext('2d')
    // Ejecutar bucle principal
}

// main manda a llamar las funciones activas para que funcione el juego
const main = () => {
    clearCanvas()
    // Para que al momento de encontrar la ruta deje de ejecutar el algoritmo
    // * evita desborde de memoria
    if (!finishedRoute) {
        pathfinding()
    }
    if (!gameStarted) {
        titleScreenImg()
    } else {
        drawScene()
    }
}


/**
 * _________________________________________
 * Interacción con HTML
 * _________________________________________
 */

window.addEventListener('load', () => {
    init()
    titleScreenImg()
})

const startA = document.getElementById('startA');
const randomScene = document.getElementById('randomScene');
const cristiScene = document.getElementById('cristiScene');
const inputColumns = document.getElementById('inputColumns')
const inputRows = document.getElementById('inputRows')
const radioButtons = document.querySelectorAll('[type="radio"]');

startA.addEventListener('click', () => {
    // Reinicio los valores para reiniciar el algoritmo
    openSet = []
    closeSet = []
    route = []
    finishedRoute = false
    gameStarted = true

    if (randomScene.disabled) {
        // Definimos el tamaño de las celdas
        nColumns = inputColumns.value
        nRows = inputRows.value
        cellWidth = CANVAS.width / nColumns
        cellHeight = CANVAS.height / nRows

        // Creamos la matriz del escenario
        scene = createArrayScene(nRows, nColumns)
        // Asignamos un objeto Cell a cada casilla del escenario
        for (let i = 0; i < nColumns; i++) {
            for (let j = 0; j < nRows; j++) {
                const c = new Cell(i, j);
                const typeCell = (Math.floor(Math.random() * 5)) === 1 ? 1 : 0
                scene[j][i] = c
                scene[j][i].type = typeCell
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

        startPoint.type = 0
        endPoint.type = 0

        // Inicializamos el OpenSet
        openSet.push(startPoint)

        console.log('inicalizo el juego');
        setInterval(() => {
            main()
        }, 1000 / FPS)
    } else if (cristiScene.disabled) {
        // Reinicio los valores para reiniciar el algoritmo
        openSet = []
        closeSet = []
        route = []
        finishedRoute = false

        // Definimos el tamaño de las celdas
        nColumns = 10
        nRows = 10
        cellWidth = CANVAS.width / nColumns
        cellHeight = CANVAS.height / nRows

        // Obtenemos el radio button selecionado
        const selectedMap = Array.from(radioButtons).find(radio => radio.checked === true)

        let cristiScene
        // Selecionamos el mapa a dibujar
        switch (selectedMap.id) {
            case 'radioScene1':
                nRows = 11
                cellHeight = CANVAS.height / nRows
                cristiScene = cristiMaps.maps.map1
                break;
            case 'radioScene2':
                cristiScene = cristiMaps.maps.map2
                break;
            case 'radioScene3':
                cristiScene = cristiMaps.maps.map3
                break;
            case 'radioScene4':
                cristiScene = cristiMaps.maps.map4
                break;
            case 'radioScene5':
                cristiScene = cristiMaps.maps.map5
                break;
            case 'radioScene6':
                cristiScene = cristiMaps.maps.map6
                break;
            default:
                cristiScene = cristiMaps.maps.map1
                break;
        }

        // Creamos la matriz del escenario
        scene = createArrayScene(nRows, nColumns)
        // Asignamos un objeto Cell a cada casilla del escenario
        for (let i = 0; i < nColumns; i++) {
            for (let j = 0; j < nRows; j++) {
                const c = new Cell(i, j);
                const typeCell = cristiScene.map[j][i]
                scene[j][i] = c
                scene[j][i].type = typeCell
            }
        }

        // Asignamos los vecinos
        for (let i = 0; i < nColumns; i++) {
            for (let j = 0; j < nRows; j++) {
                scene[j][i].addNeighbours(scene, nRows, nColumns)
            }
        }

        // Definimos el origen y destino
        startPoint = scene[cristiScene.startPointX][cristiScene.startPointY]
        endPoint = scene[cristiScene.endPointX][cristiScene.endPointY]

        // Inicializamos el OpenSet
        openSet.push(startPoint)

        console.log('inicalizo el juego');
        setInterval(() => {
            main()
        }, 1000 / FPS)
    }
})

// Ejemplo del boton de random
if (randomScene) {
    randomScene.addEventListener('click', e => {
        e.target.disabled = true
        cristiScene.disabled = false
        inputColumns.disabled = false
        inputRows.disabled = false


        radioButtons.forEach(element => {
            element.disabled = true
        });
    })
}
// Efectos del botón de cristi
if (cristiScene) {
    cristiScene.addEventListener('click', e => {
        e.target.disabled = true
        inputColumns.disabled = true
        inputRows.disabled = true
        randomScene.disabled = false

        radioButtons.forEach(element => {
            element.disabled = false
        });
    })
}

// Reinicia la ruta, para volver a ver el recorrido
if (btnReset) {
    btnReset.addEventListener('click', e => {
        // Reinicio los valores para reiniciar el algoritmo
        openSet = []
        closeSet = []
        route = []
        finishedRoute = false
        openSet.push(startPoint)
    })
}

if (btnBackTitle) {
    btnBackTitle.addEventListener('click', e => {
        window.location.reload()
    })
}