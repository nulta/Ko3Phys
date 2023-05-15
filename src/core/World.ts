class World {
    constructor() {}
    public bodies: Body[] = []
    public t = 0
    public timescale = 1.0
    public gravity = new Vector2(0, -10.0)

    tick(dt: number) {
        dt = dt * this.timescale
        if (dt == 0) {return}
        this.t += dt

        this.bodies.forEach((body) => {
            this.giveGravity(body, dt)
            body.tick(dt)
            if (!body.isStatic) {
                this.findAndResolveCollision(body)
            }
        })
    }

    protected giveGravity(body: Body, delta: number) {
        body.velocity = body.velocity.add(this.gravity.mul(delta))
    }

    protected findAndResolveCollision(movingBody: Body) {
        // 맥락상 O(n^2). 최적화할 수 있는 방법은 있을텐데...
        this.bodies.forEach((worldBody) => {
            if (movingBody === worldBody) {return}
            if (movingBody.bounds.intersects(worldBody.bounds)) {
                this.resolveCollision(movingBody, worldBody)
            }
        })
    }

    protected resolveCollision(collider: Body, collidee: Body) {
        // collider - 와서 박은 놈
        // collidee - 박힌 놈
        // 모두 완전 탄성 충돌이라고 하자.
        // 사실 각도도 계산해야 하는데, 일단 지금은 전부 AABB니까 각도 계산은 제외하자.

        // 일단, 끼이지 않도록 위치를 조정해 줘야 한다..!
        const normal = collider.bounds.nearestResolveNormal(collidee.bounds)   // 대충 구한 법선
        const moveDelta = collider.bounds.resolveIntersection(collidee.bounds) // 변위 벡터
        collider.position = collider.position.add(moveDelta)

        // 벽에 박았을 경우 - 반사각을 계산해서 날려 준다.
        if (collidee.isStatic) {
            // console.log("Normal: ", normal.x, normal.y)
            collider.velocity = collider.velocity.reflect(normal)
            return
        }
        
        // 운동량 보존... 완전 탄성 충돌... 으아악
        collider.momentum, collidee.momentum = collidee.momentum, collider.momentum
    }
}