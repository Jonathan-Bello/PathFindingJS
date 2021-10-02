import Cell from './cell.js'

// Para que VSCode autocomplete con metodos de canvas
/** @type {HTMLCanvasElement} */
let CANVAS
let CONTEXT
const FPS = 15

// Table
const nColumns = 20
const nRows = 20
let scene //Matriz del nivel

// Cell
let cellWidth
let cellHeight


// createArrayScene crea un array de arrays, que simboliza nuestro tablero
const createArrayScene = (nColumn, nRows) => {
    // ? si hay error, checa invertir las columnas y filas
    let scene2D = new Array(nRows)
    for (let i = 0; i < nRows; i++) {
        scene2D[i] = new Array(nColumn)
    }
    return scene2D
}

// drawScene dibuja las casillas en el canvas
const drawScene = () => {
    for (let i = 0; i < nColumns; i++) {
        for (let j = 0; j < nRows; j++) {
            scene[i][j].drawCell(CONTEXT, cellWidth, cellHeight)
        }
    }
}

// init es la funcion que inicializa el juego
const init = () => {
    CANVAS = document.getElementById('canvas')
    CONTEXT = CANVAS.getContext('2d')

    // Definimos el tamaño de las celdas
    cellWidth = parseInt(CANVAS.width / nColumns)
    cellHeight = parseInt(CANVAS.height / nRows)

    // Creamos la matriz del escenario
    scene = createArrayScene(nRows, nColumns)

    // Asignamos un objeto Cell a cada casilla del escenario
    for (let i = 0; i < nColumns; i++) {
        for (let j = 0; j < nRows; j++) {
            const c = new Cell(i, j);
            scene[i][j] = c
        }
    }

    // Asignamos los vecinos
    for (let i = 0; i < nColumns; i++) {
        for (let j = 0; j < nRows; j++) {
            scene[i][j].addNeighbours(scene, nRows, nColumns)
        }
    }


    console.log('inicalizo el juego');
    drawScene()

    // Ejecutar bucle principal
    setInterval(() => {
        main()
    }, 1000 / FPS)
}

// main manda a llamar las funciones activas para que funcione el juego
const main = () => {
    drawScene()
}

window.addEventListener('load', () => {
    init()
})