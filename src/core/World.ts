class World {
    constructor() {}
    public bodies: Body[] = []
    public t = 0
    public timescale = 1.0
    public maxDeltaTime = 0.5
    public gravity = new Vector2(0, -10.0)
    public readonly thrower = new Thrower()

    tick(dt: number) {
        dt = Math.min(dt * this.timescale, this.maxDeltaTime)
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
        // 맥락상 O(n^2). 최적화할 수 있는 방법은 있을테지만 아직은 이 정도로도 충분.
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
        // if (!normal.equals(new Vector2(0, 1))) debugger;
        const moveDelta = collider.bounds.resolveIntersection(collidee.bounds) // 변위 벡터
        collider.position = collider.position.add(moveDelta)

        // 둘 중 하나의 .consumeAllEnergy가 true인가?
        if (collider.consumeAllEnergy || collidee.consumeAllEnergy) {
            // 1) 그렇다면 완전 비탄성 충돌한다.
            // 1-1) 벽과의 완전 비탄성 충돌
            if (collidee.isStatic) {
                collider.velocity = collider.velocity.stopByReflection(normal)
                return
            }

            // 1-2) 물체와의 완전 비탄성 충돌
            const momentum1 = collider.momentum
            const momentum2 = collidee.momentum
            const massSum = collider.mass + collidee.mass
            collider.momentum = momentum2.mul(collider.mass / massSum)
            collidee.momentum = momentum1.mul(collidee.mass / massSum)
        } else {
            // 2) 아니라면 완전 탄성 충돌한다.
            // 2-1) 벽과의 완전 탄성 충돌
            if (collidee.isStatic) {
                // 반사각을 계산해서 collider를 튕겨날려주자.
                collider.velocity = collider.velocity.reflect(normal)
                return
            }
            
            // 2-2) 물체와의 완전 탄성 충돌
            const momentum1 = collider.momentum
            const momentum2 = collidee.momentum
            collider.momentum = momentum2
            collidee.momentum = momentum1
        }
    }

    findBodyInPos(pos: Vector2) {
        return this.bodies.find((body) => body.bounds.contains(pos))
    }
}