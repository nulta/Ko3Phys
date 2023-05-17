class Renderer {
    constructor(protected readonly ctx: CanvasRenderingContext2D, protected readonly world: World) {}
    public baseYPx = 750
    public baseXPx = 10
    public scalePx = 50  // Draw 1m to (??)px

    protected toCanvasVector(vec: Vector2) {
        return new Vector2(vec.x * this.scalePx + this.baseXPx, -vec.y * this.scalePx + this.baseYPx)
    }

    canvasToWorldVector(vec: Vector2) {
        return new Vector2((vec.x - this.baseXPx) / this.scalePx, -(vec.y - this.baseYPx) / this.scalePx)
    }

    drawBox(box: Box) {
        const boxPos = this.toCanvasVector(box.position)
        const width = box.width * this.scalePx
        const height = box.height * this.scalePx
        const x1 = boxPos.x - width / 2
        const y1 = boxPos.y - height / 2
        
        if (box.consumeAllEnergy) {
            // 그렇다면 색을 다르게 칠해 준다.
            this.ctx.strokeStyle = "#777"
            this.ctx.fillStyle = "#3336"
        } else {
            this.ctx.strokeStyle = "#087"
            this.ctx.fillStyle = "#0876"
        }
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

        // 시간 표시
        const t = Math.floor(this.world.t * 10) / 10
        const displayTime = (t%1 == 0) ? t+".0" : t+""
        this.ctx.fillText(`t = ${displayTime}s`, scrW - baseMargin, scrH - baseMargin - 22)
    }

    drawVelocityArrow(body: Body) {
        if (body.velocity.equals(Vector2.zero)) {return}

        const scrPos = this.toCanvasVector(body.position)
        const velPos = body.velocity.mul(new Vector2(1, -1)).mul(this.scalePx).add(scrPos)
        this.ctx.strokeStyle = "#44aaddcc"
        this.ctx.lineWidth = 4
        this.drawArrowGizmo(scrPos, velPos)

        // m/s text
        if (this.scalePx >= 20) {
            const speed = Math.floor(body.velocity.length * 10) / 10
            this.ctx.font = "14px sans-serif bold"
            this.ctx.textAlign = "center"
            this.ctx.fillStyle = "#2288bb"
            this.ctx.fillText(`${speed} m/s`, velPos.x, velPos.y - 16)
        }
    }

    drawMass(body: Body) {
        if (this.scalePx < 20) return;
        if (body.isStatic) return;

        const pos = this.toCanvasVector(body.position)
        this.ctx.font = "14px sans-serif bold"
        this.ctx.textAlign = "center"
        this.ctx.fillStyle = "#000000bb"
        this.ctx.fillText(`${body.mass} kg`, pos.x, pos.y)
    }

    drawThrowerArrow() {
        const body = this.world.thrower.selectedBody
        const targetPos = this.world.thrower.targetPosition
        if (body && targetPos) {
            const startPos = this.toCanvasVector(body.position)
            const endPos = this.toCanvasVector(targetPos)
            this.ctx.strokeStyle = "#44ddaacc"
            this.ctx.lineWidth = 4
            this.drawArrowGizmo(startPos, endPos)
        } 
    }
    
    renderWorld() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.drawGizmos()
        this.world.bodies.forEach((body) => {
            this.drawBody(body)
            this.drawVelocityArrow(body)
            this.drawMass(body)
        })
        this.drawThrowerArrow()
    }
}