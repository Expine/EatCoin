class GameScene extends Scene {
    /**
     * Initialize scene
     * @abstract
     */
    init() {}

    /**
     * Update scene
     * @abstract
     * @param {number} dt Delta time
     */
    update(dt) {}

    /**
     * Render scene
     * @abstract
     * @param {Context} ctx Canvas context
     */
    render(ctx) {}
}

class TitleScene extends Scene {
    /**
     * Initialize scene
     * @abstract
     */
    init() {}

    /**
     * Update scene
     * @abstract
     * @param {number} dt Delta time
     */
    update(dt) {}

    /**
     * Render scene
     * @abstract
     * @param {Context} ctx Canvas context
     */
    render(ctx) {
        ctx.fillText(`Test`, 400, 300, 0.5, 0.5, 50, `white`);
    }
}

new UnderEngineBuilder().build().execute(new TitleScene());
