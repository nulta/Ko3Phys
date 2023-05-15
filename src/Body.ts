class Body {
    constructor(public position: Vector2) {}
    public velocity = new Vector2(0, 0)

    tick(dt: number) {
        this.position = this.velocity.mul(dt).add(this.position)
    }
}