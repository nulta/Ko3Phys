class Renderer {
    constructor(protected readonly ctx: CanvasRenderingContext2D, protected readonly world: World) {}
    readonly baseY = 600

    protected toCanvasVector(vec: Vector2) {
        return new Vector2(vec.x, vec.y * -1 + this.baseY)
    }

    drawBox(box: Box) {
        const x1 = box.position.x - box.width / 2
        const y1 = box.position.y - box.height / 2
        
        this.ctx.strokeStyle = "#008877"
        this.ctx.fillStyle = "#00887766"
        this.ctx.lineWidth = 2
        this.ctx.fillRect(x1, y1, box.width, box.height)
        this.ctx.strokeRect(x1, y1, box.width, box.height)
    }

    drawBody(body: Body) {
        // TODO: 추상화 필요
        this.drawBox(body as Box)
    }

    renderWorld() {
        this.world.bodies.forEach((body) => {
            this.drawBody(body)
        })
    }
}