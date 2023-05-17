class Body {
    constructor(public position: Vector2) {}
    public velocity = Vector2.zero
    public mass = 1
    public isStatic = false
    public consumeAllEnergy = false  // 반드시 완전 비탄성 충돌하는 물체. 예) 바닥.

    tick(dt: number) {
        if (this.isStatic) {
            this.velocity = Vector2.zero
            return
        }
        this.position = this.velocity.mul(dt).add(this.position)
    }

    get momentum() {
        return this.velocity.mul(this.mass)
    }

    set momentum(p: Vector2) {
        this.velocity = p.div(this.mass)
    }

    get bounds() {
        return new Bounds(Vector2.zero, Vector2.zero)
    }
}