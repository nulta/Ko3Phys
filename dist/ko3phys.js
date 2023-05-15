"use strict";
class Body {
    position;
    constructor(position) {
        this.position = position;
    }
    velocity = new Vector2(0, 0);
}
class Box extends Body {
    height;
    width;
    constructor(position, height, width) {
        super(position);
        this.height = height;
        this.width = width;
    }
}
class Renderer {
    ctx;
    world;
    constructor(ctx, world) {
        this.ctx = ctx;
        this.world = world;
    }
    baseY = 600;
    toCanvasVector(vec) {
        return new Vector2(vec.x, vec.y * -1 + this.baseY);
    }
    drawBox(box) {
        const x1 = box.position.x - box.width / 2;
        const y1 = box.position.y - box.height / 2;
        this.ctx.strokeStyle = "#008877";
        this.ctx.fillStyle = "#00887766";
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(x1, y1, box.width, box.height);
        this.ctx.strokeRect(x1, y1, box.width, box.height);
    }
}
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vec) {
        return new Vector2(this.x + vec.x, this.y + vec.y);
    }
    sub(vec) {
        return new Vector2(this.x - vec.x, this.y - vec.y);
    }
    mul(num) {
        return new Vector2(this.x * num, this.y * num);
    }
    div(num) {
        return new Vector2(this.x / num, this.y / num);
    }
}
class World {
    bodies = [];
    constructor() { }
}
