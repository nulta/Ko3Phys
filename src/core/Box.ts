class Box extends Body {
    constructor(position: Vector2, public width: number, public height: number) {
        super(position)
    }

    override get bounds() {
        const x1 = this.position.x - this.width / 2
        const x2 = this.position.x + this.width / 2
        const y1 = this.position.y - this.height / 2
        const y2 = this.position.y + this.height / 2
        return new Bounds(new Vector2(x1, y1), new Vector2(x2, y2))
    }
}