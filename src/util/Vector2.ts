class Vector2 {
    constructor(public readonly x: number, public readonly y: number) {}
    public static readonly zero = new Vector2(0, 0)

    get length() {
        return Math.sqrt(this.x**2 + this.y**2)
    }

    get normalized() {
        if (this.equals(Vector2.zero)) {
            return Vector2.zero
        }
        return this.div(this.length)
    }

    get reverse() {
        return this.mul(-1)
    }

    toString() {
        return `Vector2(${this.x}, ${this.y})`
    }

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
        return this.x * vec.x + this.y * vec.y
    }

    equals(vec: Vector2) {
        return (this.x == vec.x) && (this.y == vec.y)
    }

    reflect(normal: Vector2) {
        return this.add(normal.mul(this.reverse.dot(normal)).mul(2))
    }

    stopByReflection(normal: Vector2) {
        return this.add(normal.mul(this.reverse.dot(normal)))
    }
}