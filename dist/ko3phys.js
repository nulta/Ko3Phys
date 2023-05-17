"use strict";
class Body {
    position;
    constructor(position) {
        this.position = position;
    }
    velocity = Vector2.zero;
    mass = 1;
    isStatic = false;
    consumeAllEnergy = false; // 반드시 완전 비탄성 충돌하는 물체. 예) 바닥.
    tick(dt) {
        if (this.isStatic) {
            this.velocity = Vector2.zero;
            return;
        }
        this.position = this.velocity.mul(dt).add(this.position);
    }
    get momentum() {
        return this.velocity.mul(this.mass);
    }
    set momentum(p) {
        this.velocity = p.div(this.mass);
    }
    get bounds() {
        return new Bounds(Vector2.zero, Vector2.zero);
    }
}
class Box extends Body {
    width;
    height;
    constructor(position, width, height) {
        super(position);
        this.width = width;
        this.height = height;
    }
    get bounds() {
        const x1 = this.position.x - this.width / 2;
        const x2 = this.position.x + this.width / 2;
        const y1 = this.position.y - this.height / 2;
        const y2 = this.position.y + this.height / 2;
        return new Bounds(new Vector2(x1, y1), new Vector2(x2, y2));
    }
}
class Thrower {
    selectedBody = null;
    targetPosition = null;
    throwBody() {
        if (!this.selectedBody)
            return;
        if (!this.targetPosition)
            return;
        this.selectedBody.velocity = this.targetPosition.sub(this.selectedBody.position);
        this.selectedBody = null;
        this.targetPosition = null;
    }
}
class World {
    constructor() { }
    bodies = [];
    t = 0;
    timescale = 1.0;
    maxDeltaTime = 0.5;
    gravity = new Vector2(0, -10.0);
    thrower = new Thrower();
    tick(dt) {
        dt = Math.min(dt * this.timescale, this.maxDeltaTime);
        if (dt == 0) {
            return;
        }
        this.t += dt;
        this.bodies.forEach((body) => {
            this.giveGravity(body, dt);
            body.tick(dt);
            if (!body.isStatic) {
                this.findAndResolveCollision(body);
            }
        });
    }
    giveGravity(body, delta) {
        body.velocity = body.velocity.add(this.gravity.mul(delta));
    }
    findAndResolveCollision(movingBody) {
        // 맥락상 O(n^2). 최적화할 수 있는 방법은 있을테지만 아직은 이 정도로도 충분.
        this.bodies.forEach((worldBody) => {
            if (movingBody === worldBody) {
                return;
            }
            if (movingBody.bounds.intersects(worldBody.bounds)) {
                this.resolveCollision(movingBody, worldBody);
            }
        });
    }
    resolveCollision(collider, collidee) {
        // collider - 와서 박은 놈
        // collidee - 박힌 놈
        // 모두 완전 탄성 충돌이라고 하자.
        // 사실 각도도 계산해야 하는데, 일단 지금은 전부 AABB니까 각도 계산은 제외하자.
        // 일단, 끼이지 않도록 위치를 조정해 줘야 한다..!
        const normal = collider.bounds.nearestResolveNormal(collidee.bounds); // 대충 구한 법선
        // if (!normal.equals(new Vector2(0, 1))) debugger;
        const moveDelta = collider.bounds.resolveIntersection(collidee.bounds); // 변위 벡터
        collider.position = collider.position.add(moveDelta);
        // 둘 중 하나의 .consumeAllEnergy가 true인가?
        if (collider.consumeAllEnergy || collidee.consumeAllEnergy) {
            // 1) 그렇다면 완전 비탄성 충돌한다.
            // 1-1) 벽과의 완전 비탄성 충돌
            if (collidee.isStatic) {
                collider.velocity = collider.velocity.stopByReflection(normal);
                return;
            }
            // 1-2) 물체와의 완전 비탄성 충돌
            const momentum1 = collider.momentum;
            const momentum2 = collidee.momentum;
            const massSum = collider.mass + collidee.mass;
            collider.momentum = momentum2.mul(collider.mass / massSum);
            collidee.momentum = momentum1.mul(collidee.mass / massSum);
        }
        else {
            // 2) 아니라면 완전 탄성 충돌한다.
            // 2-1) 벽과의 완전 탄성 충돌
            if (collidee.isStatic) {
                // 반사각을 계산해서 collider를 튕겨날려주자.
                collider.velocity = collider.velocity.reflect(normal);
                return;
            }
            // 2-2) 물체와의 완전 탄성 충돌
            const momentum1 = collider.momentum;
            const momentum2 = collidee.momentum;
            collider.momentum = momentum2;
            collidee.momentum = momentum1;
        }
    }
    findBodyInPos(pos) {
        return this.bodies.find((body) => body.bounds.contains(pos));
    }
}
// Axis-Aligned Bounding Box (AABB)
class Bounds {
    min;
    max;
    constructor(v1, v2) {
        /*
         *  +--+       max
         *  |  |   center
         *  +--+  min
         */
        const x1 = v1.x;
        const x2 = v2.x;
        const y1 = v1.y;
        const y2 = v2.y;
        const minX = (x1 < x2) ? x1 : x2;
        const maxX = (x1 < x2) ? x2 : x1;
        const minY = (y1 < y2) ? y1 : y2;
        const maxY = (y1 < y2) ? y2 : y1;
        this.min = new Vector2(minX, minY);
        this.max = new Vector2(maxX, maxY);
    }
    get center() {
        // Center of two vectors
        return this.min.add(this.max).div(2);
    }
    contains(vec) {
        const containsX = this.min.x <= vec.x && vec.x <= this.max.x;
        const containsY = this.min.y <= vec.y && vec.y <= this.max.y;
        return containsX && containsY;
    }
    intersects(bounds) {
        // Assertion: x1 <= x2 and y1 <= y2
        const ax1 = this.min.x;
        const ax2 = this.max.x;
        const ay1 = this.min.y;
        const ay2 = this.max.y;
        const bx1 = bounds.min.x;
        const bx2 = bounds.max.x;
        const by1 = bounds.min.y;
        const by2 = bounds.max.y;
        let containsX = false;
        let containsY = false;
        if (ax1 <= bx1 && bx1 <= ax2) {
            containsX = true;
        } // A---b1---A   b2
        if (bx1 <= ax1 && ax1 <= bx2) {
            containsX = true;
        } // B---a1---B   a2
        if (ay1 <= by1 && by1 <= ay2) {
            containsY = true;
        }
        if (by1 <= ay1 && ay1 <= by2) {
            containsY = true;
        }
        return containsX && containsY;
    }
    resolveIntersection(bounds) {
        // How to resolve intersection by moving "this"
        const ax1 = this.min.x;
        const ax2 = this.max.x;
        const ay1 = this.min.y;
        const ay2 = this.max.y;
        const bx1 = bounds.min.x;
        const bx2 = bounds.max.x;
        const by1 = bounds.min.y;
        const by2 = bounds.max.y;
        let distX = 0;
        let distY = 0;
        if (ax1 <= bx1 && bx1 <= ax2) {
            distX = bx1 - ax2;
        } // A1---b1---A2   b2
        if (bx1 <= ax1 && ax1 <= bx2) {
            distX = bx2 - ax1;
        } // B1---a1---B2   a2
        if (ay1 <= by1 && by1 <= ay2) {
            distY = by1 - ay2;
        } // A1---b1---A2   b2
        if (by1 <= ay1 && ay1 <= by2) {
            distY = by2 - ay1;
        } // B1---a1---B2   a2
        if (Math.abs(distX) < Math.abs(distY)) {
            return new Vector2(distX, 0);
        }
        else {
            return new Vector2(0, distY);
        }
    }
    nearestResolveNormal(bounds) {
        return this.resolveIntersection(bounds).normalized;
    }
}
class Renderer {
    ctx;
    world;
    constructor(ctx, world) {
        this.ctx = ctx;
        this.world = world;
    }
    baseYPx = 750;
    baseXPx = 10;
    scalePx = 50; // Draw 1m to (??)px
    toCanvasVector(vec) {
        return new Vector2(vec.x * this.scalePx + this.baseXPx, -vec.y * this.scalePx + this.baseYPx);
    }
    canvasToWorldVector(vec) {
        return new Vector2((vec.x - this.baseXPx) / this.scalePx, -(vec.y - this.baseYPx) / this.scalePx);
    }
    drawBox(box) {
        const boxPos = this.toCanvasVector(box.position);
        const width = box.width * this.scalePx;
        const height = box.height * this.scalePx;
        const x1 = boxPos.x - width / 2;
        const y1 = boxPos.y - height / 2;
        if (box.consumeAllEnergy) {
            // 그렇다면 색을 다르게 칠해 준다.
            this.ctx.strokeStyle = "#777";
            this.ctx.fillStyle = "#3336";
        }
        else {
            this.ctx.strokeStyle = "#087";
            this.ctx.fillStyle = "#0876";
        }
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(x1, y1, width, height);
        this.ctx.strokeRect(x1, y1, width, height);
    }
    drawBody(body) {
        // TODO: 추상화 필요
        this.drawBox(body);
    }
    drawArrowGizmo(scrFrom, scrTo) {
        const headlen = 10; // length of head in pixels
        const dx = scrTo.x - scrFrom.x;
        const dy = scrTo.y - scrFrom.y;
        const angle = Math.atan2(dy, dx);
        this.ctx.beginPath();
        this.ctx.moveTo(scrFrom.x, scrFrom.y);
        this.ctx.lineTo(scrTo.x, scrTo.y);
        this.ctx.lineTo(scrTo.x - headlen * Math.cos(angle - Math.PI / 6), scrTo.y - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(scrTo.x, scrTo.y);
        this.ctx.lineTo(scrTo.x - headlen * Math.cos(angle + Math.PI / 6), scrTo.y - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
    }
    drawGizmos() {
        const scrW = this.ctx.canvas.width;
        const scrH = this.ctx.canvas.height;
        this.ctx.fillStyle = "#000000";
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 2;
        // X축
        this.drawArrowGizmo(new Vector2(5, this.baseYPx), new Vector2(scrW - 10, this.baseYPx));
        // Y축
        this.drawArrowGizmo(new Vector2(this.baseXPx, scrH - 10), new Vector2(this.baseXPx, 10));
        // 축척
        const baseMargin = 25;
        this.ctx.lineWidth = 1;
        this.ctx.textAlign = "right";
        this.ctx.font = "12px sans-serif";
        this.ctx.beginPath();
        this.ctx.moveTo(scrW - baseMargin, scrH - baseMargin);
        this.ctx.lineTo(scrW - baseMargin - this.scalePx, scrH - baseMargin);
        this.ctx.lineTo(scrW - baseMargin - this.scalePx, scrH - baseMargin + 10);
        this.ctx.moveTo(scrW - baseMargin, scrH - baseMargin);
        this.ctx.lineTo(scrW - baseMargin, scrH - baseMargin + 10);
        this.ctx.stroke();
        this.ctx.fillText("1m", scrW - baseMargin, scrH - baseMargin - 5);
        // 시간 표시
        const t = Math.floor(this.world.t * 10) / 10;
        const displayTime = (t % 1 == 0) ? t + ".0" : t + "";
        this.ctx.fillText(`t = ${displayTime}s`, scrW - baseMargin, scrH - baseMargin - 22);
    }
    drawVelocityArrow(body) {
        if (body.velocity.equals(Vector2.zero)) {
            return;
        }
        const scrPos = this.toCanvasVector(body.position);
        const velPos = body.velocity.mul(new Vector2(1, -1)).mul(this.scalePx).add(scrPos);
        this.ctx.strokeStyle = "#44aaddcc";
        this.ctx.lineWidth = 4;
        this.drawArrowGizmo(scrPos, velPos);
        // m/s text
        if (this.scalePx >= 20) {
            const speed = Math.floor(body.velocity.length * 10) / 10;
            this.ctx.font = "14px sans-serif bold";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "#2288bb";
            this.ctx.fillText(`${speed} m/s`, velPos.x, velPos.y - 16);
        }
    }
    drawMass(body) {
        if (this.scalePx < 20)
            return;
        if (body.isStatic)
            return;
        const pos = this.toCanvasVector(body.position);
        this.ctx.font = "14px sans-serif bold";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#000000bb";
        this.ctx.fillText(`${body.mass} kg`, pos.x, pos.y);
    }
    drawThrowerArrow() {
        const body = this.world.thrower.selectedBody;
        const targetPos = this.world.thrower.targetPosition;
        if (body && targetPos) {
            const startPos = this.toCanvasVector(body.position);
            const endPos = this.toCanvasVector(targetPos);
            this.ctx.strokeStyle = "#44ddaacc";
            this.ctx.lineWidth = 4;
            this.drawArrowGizmo(startPos, endPos);
        }
    }
    renderWorld() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawGizmos();
        this.world.bodies.forEach((body) => {
            this.drawBody(body);
            this.drawVelocityArrow(body);
            this.drawMass(body);
        });
        this.drawThrowerArrow();
    }
}
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero = new Vector2(0, 0);
    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    get normalized() {
        if (this.equals(Vector2.zero)) {
            return Vector2.zero;
        }
        return this.div(this.length);
    }
    get reverse() {
        return this.mul(-1);
    }
    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
    add(value) {
        if (typeof value === "number") {
            return new Vector2(this.x + value, this.y + value);
        }
        else {
            return new Vector2(this.x + value.x, this.y + value.y);
        }
    }
    sub(value) {
        if (typeof value === "number") {
            return new Vector2(this.x - value, this.y - value);
        }
        else {
            return new Vector2(this.x - value.x, this.y - value.y);
        }
    }
    mul(value) {
        if (typeof value === "number") {
            return new Vector2(this.x * value, this.y * value);
        }
        else {
            return new Vector2(this.x * value.x, this.y * value.y);
        }
    }
    div(value) {
        if (typeof value === "number") {
            return new Vector2(this.x / value, this.y / value);
        }
        else {
            return new Vector2(this.x / value.x, this.y / value.y);
        }
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    equals(vec) {
        return (this.x == vec.x) && (this.y == vec.y);
    }
    reflect(normal) {
        return this.add(normal.mul(this.reverse.dot(normal)).mul(2));
    }
    stopByReflection(normal) {
        return this.add(normal.mul(this.reverse.dot(normal)));
    }
}
//# sourceMappingURL=ko3phys.js.map