import * as helper from './helper.js'

const wallColor = '#000000'
const emptyColor = '#9C9090'

export default class Cell {
    constructor(x, y) {
        // Posicion
        this.x = x
        this.y = y
        // Tipo  1 = obstaculo, vacio = 0
        // Devuelve un valor entre 0-4, asegura que la mayoria sean vacio
        this.type = 0

        // Pesos
        this.f = 0 // Coste total (g+h)
        this.g = 0 // pasos dados
        this.h = 0 // heuristica (distancia sin obstaculos al destino)

        // Casillas adyacentes
        this.neighbours = []
        // Padre
        this.father = null
    }

    /**
     * drawCell dibuja el cuadrado que representa la celda en el canvas
     * @param {CanvasRenderingContext2D} canvasContext
     * @param {number} widthCell
     * @param {number} heightCell
     */
    drawCell(canvasContext, widthCell, heightCell) {
        const color = this.type === 1 ? wallColor : emptyColor
        canvasContext.beginPath()
        canvasContext.fillStyle = color
        canvasContext.fillRect(this.x * widthCell, this.y * heightCell, widthCell, heightCell)
        canvasContext.closePath()


        // Dibuja datos de la casilla
        const colorT = this.type === 1 ? emptyColor : wallColor
        this.drawCellData(canvasContext, colorT, widthCell, heightCell, this)
    }

    /**
     * addNeighbours Agrega a cada casilla sus respectivos vecinos
     * @param {Array<Cell>} sceneArray Array about grid of game
     * @param {number} nRows
     * @param {number} nColumns
     */
    addNeighbours(sceneArray, nRows, nColumns) {
        // Verifica si es posible tener un vecino izquierdo y lo agrega
        // vecino abajo
        if (this.x > 0) {
            this.neighbours.push(sceneArray[this.y][this.x - 1])
        }

        // Vecino derecho
        if (this.x < nColumns - 1) {
            this.neighbours.push(sceneArray[this.y][this.x + 1])
        }

        // Vecino de arriba
        if (this.y > 0) {
            this.neighbours.push(sceneArray[this.y - 1][this.x])
        }

        // Vecino derecho
        if (this.y < nRows - 1) {
            this.neighbours.push(sceneArray[this.y + 1][this.x])
        }

        // console.log(this.neighbours);
    }

    /**
     * drawOpenSet pinta las casillas que estan en el OpenSet
     * @param {CanvasRenderingContext2D} canvasContext
     * @param {number} widthCell
     * @param {number} heightCell
     */
    drawOpenSet(canvasContext, widthCell, heightCell) {
        canvasContext.fillStyle = '#2AA112'
        canvasContext.fillRect(this.x * widthCell, this.y * heightCell, widthCell, heightCell)
        this.drawCellData(canvasContext, '#FFFFFF', widthCell, heightCell, this)
    }

    /**
     * drawCloseSet pinta las casillas que estan en el CloseSet
     * @param {CanvasRenderingContext2D} canvasContext
     * @param {number} widthCell
     * @param {number} heightCell
     */
    drawCloseSet(canvasContext, widthCell, heightCell) {
        canvasContext.fillStyle = '#A11712'
        canvasContext.fillRect(this.x * widthCell, this.y * heightCell, widthCell, heightCell)
        this.drawCellData(canvasContext, '#FFFFFF', widthCell, heightCell, this)
    }

    /**
     * drawRoute pinta las casillas que conforman la ruta final
     * @param {CanvasRenderingContext2D} canvasContext
     * @param {number} widthCell
     * @param {number} heightCell
     */
    drawRoute(canvasContext, widthCell, heightCell) {
        canvasContext.fillStyle = '#1274A1'
        canvasContext.fillRect(this.x * widthCell, this.y * heightCell, widthCell, heightCell)
        this.drawCellData(canvasContext, '#FFFFFF', widthCell, heightCell, this)
    }

    /**
     * Dibuja los datos pertenecientes a la celda
     * @param {CanvasRenderingContext2D} canvasContext contexto del canvas 2D
     * @param {string} colorFont color de la letra
     * @param {number} widthCell ancho de la celda
     * @param {number} heightCell alto de la celda
     * @param {Cell} cell Celda de la cual colocar los datos
     */
    drawCellData(canvasContext, colorFont, widthCell, heightCell) {
        canvasContext.beginPath()
        canvasContext.fillStyle = colorFont
        canvasContext.font = `${widthCell * 0.28}px Arial`
        canvasContext.fillText(`(${this.y}, ${this.x})`, this.x * widthCell, this.y * heightCell + (heightCell * 0.3))
        canvasContext.fillText(`g: ${this.g}`, this.x * widthCell, this.y * heightCell + (heightCell * 0.7))
        canvasContext.closePath()
    }
}