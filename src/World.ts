class World {
    constructor() {}
    public bodies: Body[] = []
    public t = 0
    public timescale = 1.0

    tick(dt: number) {
        dt = dt * this.timescale

        this.bodies.forEach((body) => {
            // TODO: 속성 구분해서 중력 적용
            body.velocity = body.velocity.add(new Vector2(0, -9.8))
            body.tick(dt)
        })
    }
}