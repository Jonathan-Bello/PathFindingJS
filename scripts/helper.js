/**
 * Crea un grid de líneas dentro del canvas
 * @param {CanvasRenderingContext2DSettings} context contexto del canvas 2D
 * @param {number} distanceX distancia horizontal entre líneas
 * @param {number} distanceY distancia vertical entre líneas
 * @param {string} colorLine color de la línea
 * @param {number} lineWidth tamaño de la línea
 */
export const drawGrid = (context, distanceX, distanceY, colorLine, lineWidth) => {

    // distanceX = Math.floor(distanceX)
    // distanceY = Math.floor(distanceY)

    // Dibuja columnas
    for (let i = distanceX + lineWidth; i < context.canvas.width; i += distanceX) {
        context.beginPath()
        context.moveTo(i, 0)
        context.lineTo(i, context.canvas.height)
        context.strokeStyle = colorLine
        context.lineWidth = lineWidth
        context.stroke()
        context.closePath()
    }

    // Dibuja filas
    for (let i = distanceY + lineWidth; i < context.canvas.width; i += distanceY) {
        context.beginPath()
        context.moveTo(0, i)
        context.lineTo(context.canvas.height, i)
        context.strokeStyle = colorLine
        context.lineWidth = lineWidth
        context.stroke()
        context.closePath()
    }
}
