class Renderer {
    constructor(protected readonly ctx: CanvasRenderingContext2D, protected readonly world: World) {}
    public baseYPx = 750
    public baseXPx = 10
    public scalePx = 50  // Draw 1m to (??)px

    protected toCanvasVector(vec: Vector2) {
        return new Vector2(vec.x * this.scalePx + this.baseXPx, -vec.y * this.scalePx + this.baseYPx)
    }

    drawBox(box: Box) {
        const boxPos = this.toCanvasVector(box.position)
        const width = box.width * this.scalePx
        const height = box.height * this.scalePx
        const x1 = boxPos.x - width / 2
        const y1 = boxPos.y - height / 2
        
        this.ctx.strokeStyle = "#008877"
        this.ctx.fillStyle = "#00887766"
        this.ctx.lineWidth = 2
        this.ctx.fillRect(x1, y1, width, height)
        this.ctx.strokeRect(x1, y1, width, height)
    }

    drawBody(body: Body) {
        // TODO: 추상화 필요
        this.drawBox(body as Box)
    }

    drawArrowGizmo(scrFrom: Vector2, scrTo: Vector2) {
        const headlen = 10; // length of head in pixels
        const dx = scrTo.x - scrFrom.x;
        const dy = scrTo.y - scrFrom.y;
        const angle = Math.atan2(dy, dx);
        this.ctx.beginPath()
        this.ctx.moveTo(scrFrom.x, scrFrom.y);
        this.ctx.lineTo(scrTo.x, scrTo.y);
        this.ctx.lineTo(scrTo.x - headlen * Math.cos(angle - Math.PI / 6), scrTo.y - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(scrTo.x, scrTo.y);
        this.ctx.lineTo(scrTo.x - headlen * Math.cos(angle + Math.PI / 6), scrTo.y - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke()
    }

    drawGizmos() {
        const scrW = this.ctx.canvas.width
        const scrH = this.ctx.canvas.height
        this.ctx.fillStyle = "#000000"
        this.ctx.strokeStyle = "#000000"
        this.ctx.lineWidth = 2

        // X축
        this.drawArrowGizmo(
            new Vector2(5, this.baseYPx),
            new Vector2(scrW - 10, this.baseYPx)
        )

        // Y축
        this.drawArrowGizmo(
            new Vector2(this.baseXPx, scrH - 10),
            new Vector2(this.baseXPx, 10)
        )

        // 축척
        const baseMargin = 25
        this.ctx.lineWidth = 1
        this.ctx.textAlign = "right"
        this.ctx.font = "12px sans-serif"

        this.ctx.beginPath()
        this.ctx.moveTo(scrW - baseMargin, scrH - baseMargin)
        this.ctx.lineTo(scrW - baseMargin - this.scalePx, scrH - baseMargin)
        this.ctx.lineTo(scrW - baseMargin - this.scalePx, scrH - baseMargin + 10)
        this.ctx.moveTo(scrW - baseMargin, scrH - baseMargin)
        this.ctx.lineTo(scrW - baseMargin, scrH - baseMargin + 10)
        this.ctx.stroke()
        this.ctx.fillText("1m", scrW - baseMargin, scrH - baseMargin - 5)
    }

    drawVelocityArrow(body: Body) {
        if (body.velocity.equals(Vector2.zero)) {return}

        const scrPos = this.toCanvasVector(body.position)
        const velPos = body.velocity.mul(new Vector2(1, -1)).mul(this.scalePx).add(scrPos)
        this.ctx.strokeStyle = "#44aaddcc"
        this.ctx.lineWidth = 4
        this.drawArrowGizmo(scrPos, velPos)
    }

    drawMass(body: Body) {
        if (this.scalePx < 20) return;
        if (body.isStatic) return;

        const pos = this.toCanvasVector(body.position)
        this.ctx.font = "14px sans-serif bold"
        this.ctx.textAlign = "center"
        this.ctx.fillStyle = "#000000bb"
        this.ctx.fillText(`${body.mass}kg`, pos.x, pos.y)
    }
    
    renderWorld() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.drawGizmos()
        this.world.bodies.forEach((body) => {
            this.drawBody(body)
            this.drawVelocityArrow(body)
            this.drawMass(body)
        })
    }
}