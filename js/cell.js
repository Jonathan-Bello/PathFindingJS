const wallColor = '#000000'
const emptyColor = '#9C9090'

export default class Cell {
    constructor(x, y) {
        // Posicion
        this.x = x
        this.y = y
        // Tipo  1 = obstaculo, vacio = 0
        // Devuelve un valor entre 0-4, asegura que la mayoria sean vacio
        this.type = (Math.floor(Math.random() * 5)) === 1 ? 1 : 0

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
        // const color = '#000000'
        canvasContext.fillStyle = color
        canvasContext.fillRect(this.x * widthCell, this.y * heightCell, widthCell, heightCell)
    }

    /**
     * addNeighbours Agrega a cada casilla sus respectivos vecinos
     * @param {Array<Cell>} sceneArray Array about grid of game
     * @param {number} nRows
     * @param {number} nColumns
     */
    addNeighbours(sceneArray, nRows, nColumns) {
        // Verifica si es posible tener un vecino izquierdo y lo agrega
        if (this.x > 0) {
            this.neighbours.push(sceneArray[this.y][this.x - 1])
        }

        // Vecino derecho
        if (this.x < nRows - 1) {
            this.neighbours.push(sceneArray[this.y][this.x + 1])
        }

        // Vecino de arriba
        if (this.y > 0) {
            this.neighbours.push(sceneArray[this.y - 1][this.x])
        }

        // Vecino derecho
        if (this.y < nColumns - 1) {
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
    }
}