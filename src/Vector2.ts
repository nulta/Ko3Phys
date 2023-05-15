class Vector2 {
    constructor(public readonly x: number, public readonly y: number) {}

    add(value: Vector2|number) {
        if (typeof value === "number") {
            return new Vector2(this.x + value, this.y + value)
        } else {
            return new Vector2(this.x + value.x, this.y + value.y)
        }
    }
    sub(value: Vector2|number) {
        if (typeof value === "number") {
            return new Vector2(this.x - value, this.y - value)
        } else {
            return new Vector2(this.x - value.x, this.y - value.y)
        }
    }
    mul(value: Vector2|number) {
        if (typeof value === "number") {
            return new Vector2(this.x * value, this.y * value)
        } else {
            return new Vector2(this.x * value.x, this.y * value.y)
        }
    }
    div(value: Vector2|number) {
        if (typeof value === "number") {
            return new Vector2(this.x / value, this.y / value)
        } else {
            return new Vector2(this.x / value.x, this.y / value.y)
        }
    }

    dot(vec: Vector2) {
        return this.x * this.y + vec.x * vec.y
    }

    get length() {
        return Math.sqrt(this.x**2 + this.y**2)
    }

    get normalized() {
        return this.div(this.length)
    }

    get reverse() {
        return this.mul(-1)
    }
}