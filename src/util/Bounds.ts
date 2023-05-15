// Axis-Aligned Bounding Box (AABB)
class Bounds {
    public readonly min: Vector2
    public readonly max: Vector2

    constructor(v1: Vector2, v2: Vector2) {
        /*
         *  +--+       max
         *  |  |   center
         *  +--+  min
         */

        const x1 = v1.x
        const x2 = v2.x
        const y1 = v1.y
        const y2 = v2.y

        const minX = (x1 < x2) ? x1 : x2
        const maxX = (x1 < x2) ? x2 : x1
        const minY = (y1 < y2) ? y1 : y2
        const maxY = (y1 < y2) ? y2 : y1

        this.min = new Vector2(minX, minY)
        this.max = new Vector2(maxX, maxY)
    }

    get center() {
        // Center of two vectors
        return this.min.add(this.max).div(2)
    }

    contains(vec: Vector2) {
        const containsX = this.min.x <= vec.x && vec.x <= this.max.x
        const containsY = this.min.y <= vec.y && vec.y <= this.max.y
        return containsX && containsY
    }

    intersects(bounds: Bounds) {
        // Assertion: x1 <= x2 and y1 <= y2
        const ax1 = this.min.x
        const ax2 = this.max.x
        const ay1 = this.min.y
        const ay2 = this.max.y

        const bx1 = bounds.min.x
        const bx2 = bounds.max.x
        const by1 = bounds.min.y
        const by2 = bounds.max.y

        let containsX = false
        let containsY = false
        if (ax1 <= bx1 && bx1 <= ax2) {containsX = true}  // A---b1---A   b2
        if (bx1 <= ax1 && ax1 <= bx2) {containsX = true}  // B---a1---B   a2
        if (ay1 <= by1 && by1 <= ay2) {containsY = true}
        if (by1 <= ay1 && ay1 <= by2) {containsY = true}
        return containsX && containsY
    }

    resolveIntersection(bounds: Bounds) {
        // How to resolve intersection by moving "this"
        const ax1 = this.min.x
        const ax2 = this.max.x
        const ay1 = this.min.y
        const ay2 = this.max.y

        const bx1 = bounds.min.x
        const bx2 = bounds.max.x
        const by1 = bounds.min.y
        const by2 = bounds.max.y

        let distX = 0
        let distY = 0
        if (ax1 <= bx1 && bx1 <= ax2) {distX = bx1 - ax2}  // A1---b1---A2   b2
        if (bx1 <= ax1 && ax1 <= bx2) {distX = bx2 - ax1}  // B1---a1---B2   a2
        if (ay1 <= by1 && by1 <= ay2) {distY = by1 - ay2}  // A1---b1---A2   b2
        if (by1 <= ay1 && ay1 <= by2) {distY = by2 - ay1}  // B1---a1---B2   a2

        if (distX < distY) {
            return new Vector2(distX, 0)
        } else {
            return new Vector2(0, distY)
        }
    }

    nearestResolveNormal(bounds: Bounds) {
        return this.resolveIntersection(bounds).normalized
    }
}