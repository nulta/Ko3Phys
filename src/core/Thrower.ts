class Thrower {
    public selectedBody: Body|null = null
    public targetPosition: Vector2|null = null

    throwBody() {
        if (!this.selectedBody) return;
        if (!this.targetPosition) return;

        this.selectedBody.velocity = this.targetPosition.sub(this.selectedBody.position)
        this.selectedBody = null
        this.targetPosition = null
    }
}