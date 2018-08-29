/**
 * Playable interface
 * - ### Player function interface
 * @interface
 * @classdesc Playable interface for player function
 */
class IEatPlayable extends IPlayable { // eslint-disable-line  no-unused-vars
    extend() {}
}

class EatPlayer extends Player {
    extend() {
        this.x -= 2;
        this.y -= 2;
        this.width += 4;
        this.height += 4;
        this.material.massVal += 10;
        this.image.setAllSize(this.width, this.height);
        this.collider.fixBound(this.width / 32, this.height / 32, this.width * 15 / 16, this.height * 15 / 16);
    }
}

/**
 * Enemy respawn entityenemy
 * - Object present on the stage that has coordinate and size
 * - Generate some entity
 * - ### Generates enemy
 * @extends {RespawnEntity}
 * @classdesc Enemy respawn entity to generate
 */
class EREntity extends EnemyRespawnEntity { // eslint-disable-line  no-unused-vars
    constructor(respawnInterval, respawnMax, dirX) {
        super(respawnInterval, respawnMax);

        this.dirX = dirX;
    }

    /**
     * Generates entity and add to stage
     * @override
     * @protected
     * @return {Entity} Generated entity
     */
    createRespawnEntity() {
        let ret = super.createRespawnEntity();
        if (ret !== null) {
            ret.body.enforce(ret.material.mass * this.dirX * 5000, 0);
        }
        return ret;
    }
}

/**
 * Stationary state
 * - Determines the operation by AI according to the state and renders based on state
 * - Initialize state image
 * - ### Moves, jumps, and attacks
 * @extends {BaseState}
 * @classdesc Stationary state to move, jump, and attack
 */
class PSState extends BaseState { // eslint-disable-line  no-unused-vars
    /**
     * Apply AI and decide action
     * @override
     * @param {number} dt Delta time
     * @return {boolean} Whether decided on action
     */
    apply(dt) {
        if (Util.onGround(this.entity)) {
            if (Input.key.isPress(Input.key.up()) || Input.key.isPress(Input.key.a() + 25) || Input.mouse.isPress(Input.mouse.mLeft())) {
                this.ai.changeState(`jump`);
            }
        }
        return true;
    }
}

/**
 * Player jump state
 * - Determines the operation by AI according to the state and renders based on state
 * - Initialize state image
 * - ### Prepares for jumping
 * @extends {BaseState}
 * @classdesc Player jump state to prepare for jumping
 */
class PJState extends BaseState { // eslint-disable-line  no-unused-vars
    /**
     * Player jump state constructor
     * @constructor
     * @param {number} jumpPower Jumping force
     */
    constructor(jumpPower) {
        super();

        /**
         * Jumping force
         * @protected
         * @type {number}
         */
        this.jumpPower = jumpPower;
    }

    /**
     * Initialize
     * @override
     */
    init() {
        super.init();

        this.entity.body.setNextAddVelocity(0, -this.entity.body.velocityY);
        this.entity.body.enforce(0, -this.jumpPower * this.entity.material.mass);
    }

    /**
     * Apply AI and decide action
     * @override
     * @param {number} dt Delta time
     * @return {boolean} Whether decided on action
     */
    apply(dt) {
        if (Util.getUnderEntity(this.entity) instanceof ImmutableEntity) {
            this.ai.changeState(`stationary`);
        }
        if (Input.key.isPress(Input.key.up()) || Input.key.isPress(Input.key.a() + 25) || Input.mouse.isPress(Input.mouse.mLeft())) {
            this.ai.changeState(`djump`);
        }
        return true;
    }
}

/**
 * Player jump state
 * - Determines the operation by AI according to the state and renders based on state
 * - Initialize state image
 * - ### Prepares for jumping
 * @extends {BaseState}
 * @classdesc Player jump state to prepare for jumping
 */
class PDJState extends BaseState { // eslint-disable-line  no-unused-vars
    /**
     * Player jump state constructor
     * @constructor
     * @param {number} jumpPower Jumping force
     */
    constructor(jumpPower) {
        super();

        /**
         * Jumping force
         * @protected
         * @type {number}
         */
        this.jumpPower = jumpPower;

        this.decPower = jumpPower;
    }

    /**
     * Initialize
     * @override
     */
    init() {
        super.init();

        this.entity.body.setNextAddVelocity(0, -this.entity.body.velocityY);
        this.entity.body.enforce(0, -this.jumpPower * this.entity.material.mass);

        this.decPower = this.jumpPower;
    }

    /**
     * Apply AI and decide action
     * @override
     * @param {number} dt Delta time
     * @return {boolean} Whether decided on action
     */
    apply(dt) {
        if (Util.getUnderEntity(this.entity) instanceof ImmutableEntity) {
            this.ai.changeState(`stationary`);
        }
        if (Input.key.isPress(Input.key.up()) || Input.key.isPress(Input.key.a() + 25) || Input.mouse.isPress(Input.mouse.mLeft())) {
            this.entity.body.enforce(0, -this.decPower * this.entity.material.mass);
            this.decPower *= 0.9;
        }
        return true;
    }
}

class SAI extends AI {
    /**
     * Straight AI Constructor
     * @constructor
     * @param {number} mvx Maximum speed vector of x
     * @param {number} px Force applied when moving
     */
    constructor(mvx, px) {
        super();

        /**
         * Maximum speed vector of x
         * @protected
         * @type {number}
         */
        this.maxVelocityX = mvx;
        /**
         * Force applied when moving
         * @protected
         * @type {number}
         */
        this.walkPower = px;
    }

    /**
     * Apply AI and decide action
     * @override
     * @param {number} dt Delta time
     * @return {boolean} Whether decided on action
     */
    apply(dt) {
        // check on ground
        this.entity.setDirection(Math.sign(this.walkPower), this.entity.directionY);
        if (!Util.onGround(this.entity)) {
            return true;
        }
        if (Math.abs(this.entity.body.velocityX) < this.maxVelocityX) {
            this.entity.body.enforce(this.walkPower * this.entity.material.mass, 0);
        }
        return true;
    }
}

/**
 * Straight AI
 * - Determines the behavior of an entity
 * - ### AI to go straight ahead and reverses direction if it hit something
 * @extends {AI}
 * @classdesc Straight AI to go straight ahead and reverses direction if it hit something
 */
class BounceAI extends AI { // eslint-disable-line  no-unused-vars
    /**
     * Straight AI Constructor
     * @constructor
     * @param {number} mvx Maximum speed vector of x
     * @param {number} px Force applied when moving
     */
    constructor(mvx, px, jpmax, jpmin) {
        super();

        /**
         * Maximum speed vector of x
         * @protected
         * @type {number}
         */
        this.maxVelocityX = mvx;
        /**
         * Force applied when moving
         * @protected
         * @type {number}
         */
        this.walkPower = px;

        this.jumpPowerMax = jpmax;
        this.jumpPowerMin = jpmin;
        this.jumpPower = ((Math.random() * (this.jumpPowerMax - this.jumpPowerMin)) + this.jumpPowerMin);
    }

    /**
     * Apply AI and decide action
     * @override
     * @param {number} dt Delta time
     * @return {boolean} Whether decided on action
     */
    apply(dt) {
        // check on ground
        if (Util.onGround(this.entity)) {
            this.entity.body.setNextAddVelocity(0, -this.entity.body.velocityY);
            this.entity.body.enforce(0, -this.jumpPower * this.entity.material.mass * 1000 / dt);
        }
        return true;
    }
}

/**
 * Enemy AI
 * - Determines the behavior of an entity
 * - ### Damages to the collided opponent
 * @extends {AI}
 * @classdesc Enemy AI to damage to the conflicting opponent
 */
class CoinAI extends AI { // eslint-disable-line  no-unused-vars
    /**
     * Enemy AI constructor
     * @constructor
     * @param {AI} baseAI Base delegation AI
     */
    constructor(baseAI) {
        super();

        /**
         * Base delegation AI
         * @protected
         * @type {AI}
         */
        this.baseAI = baseAI;

        /**
         * X direction of entity before applying
         * @protected
         * @type {number}
         */
        this.preDirectionX = 0;
        /**
         * Y direction of entity before applying
         * @protected
         * @type {number}
         */
        this.preDirectionY = 0;
    }

    /**
     * Set autonomy entity
     * @override
     * @param {AutonomyEntity} entity Autonomy entity
     */
    setEntity(entity) {
        super.setEntity(entity);
        this.baseAI.setEntity(entity);
    }

    /**
     * Initialize AI
     * @override
     */
    init() {
        this.baseAI.init();
    }

    /**
     * Update AI
     * @override
     * @param {number} dt Delta time
     */
    update(dt) {
        this.baseAI.update(dt);
        this.preDirectionX = this.entity.directionX;
        this.preDirectionY = this.entity.directionY;
    }

    /**
     * Apply AI and decide action
     * @override
     * @param {number} dt Delta time
     * @return {boolean} Whether decided on action
     */
    apply(dt) {
        // apply base AI
        if (this.baseAI.apply(dt)) {
            // check collided
            for (const it of this.entity.collider.collisions) {
                const opponent = Util.getCollidedEntity(this.entity, it);
                if (BaseUtil.implementsOf(opponent, IEatPlayable)) {
                    opponent.extend();
                    this.entity.stage.removeEntity(this.entity);
                }
            }
            if (this.entity.y > 600 + this.entity.height) {
                this.entity.stage.removeEntity(this.entity);
            }
            return true;
        }
        return false;
    }
}

/**
 * Player base State AI
 * - Determines the behavior of an entity
 * - Determines by state
 * - Manages state by name
 * - ### Manages player state
 * @extends {NamedStateAI}
 * @classdesc Player base State AI to manage player state
 */
class PBStateAI extends NamedStateAI { // eslint-disable-line  no-unused-vars
    /**
     * Player base State AI Constructor
     * @constructor
     */
    constructor() {
        super(`stationary`);

        this.namedStates[`stationary`] = new PSState();
        this.namedStates[`jump`] = new PJState(35000);
        this.namedStates[`djump`] = new PDJState(30000);
    }
}

class CBuilder extends CharacterBuilder {
    /**
     * Make underlying entity
     * @protected
     * @param {JSON} deploy Entity deploy json data
     * @param {JSON} entity Entity information json data
     * @return {Entity} Underlying entity
     */
    makeEntityBase(deploy, entity) {
        switch (entity.type) {
            case `EREntity`:
                {
                    const ret = new EREntity(this.tryReplace(deploy, entity, `interval`), this.tryReplace(deploy, entity, `max`), this.tryReplace(deploy, entity, `dirX`));
                    for (let it of this.tryReplace(deploy, entity, `enemies`)) {
                        ret.addEnemyID(it);
                    }
                    return ret;
                }
            case `EatPlayer`:
                return new EatPlayer();
            default:
                return super.makeEntityBase(deploy, entity);
        }
    }

    /**
     * Make AI
     * @protected
     * @param {JSON} ai AI information json data
     * @return {AI} AI
     */
    makeAI(ai) {
        switch (ai.type) {
            case `PBStateAI`:
                return new PBStateAI();
            case `CoinAI`:
                return new CoinAI(this.makeAI(ai.ai));
            case `BounceAI`:
                return new BounceAI(ai.mvx, ai.px, ai.jpmax, ai.jpmin);
            case `SAI`:
                return new SAI(ai.mvx, ai.px);
            default:
                return super.makeAI(ai);
        }
    }
}

class JSParser extends JSONStageParser {
    /**
     * Make entity factory
     * @protected
     * @param {JSON} stage Stage json data
     * @return {EntityFactory} Entity factory
     */
    makeEntityFactory(stage) {
        const ret = new JSONEntityFactory(undefined, new CBuilder());
        for (const it of stage.tiles) {
            ret.addTileInfo(JSON.parse(Util.loadFile(`src/res/stage/${it}`)));
        }
        for (const it of stage.entities) {
            ret.addEntityInfo(JSON.parse(Util.loadFile(`src/res/stage/${it}`)));
        }
        return ret;
    }
}

class GLayer extends GameoverLayer {
    /**
     * Render scene
     * @abstract
     * @param {Context} ctx Canvas context
     */
    render(ctx) {
        super.render(ctx);
        ctx.fillText(`Press T to tweet or press Z to restart`, 400, 500, 0.5, 0.5, 30, `red`);
    }
}

class GameScene extends BaseLayeredScene {

    /**
     * Initialize stage of game
     * @protected
     */
    initStage() {
        this.gameover = false;
        // set player
        this.stageManager.replaceStage(`stage`);
        this.player = this.stageManager.getStage().getEntitiesByInterface(IPlayable).find((it) => !it.isGameover());

        this.isGameover = false;

        this.getLayers().forEach((it) => {
            this.removeLayer(it);
        });
    }

    /**
     * Initialize scene
     * @abstract
     */
    init() {
        /**
         * Game stage manager
         * @protected
         * @type {StageManager}
         */
        this.stageManager = new StackStageManager();
        this.stageManager.setStageParser(new JSParser());
        this.stageManager.setStageSize(GameScreen.it.width, GameScreen.it.height);

        /**
         * Event manager
         * @protected
         * @type {EventManager}
         */
        this.eventManager = new QueueEventManager();
        this.eventManager.init();

        this.initStage();
    }

    /**
     * Update scene
     * @abstract
     * @param {number} dt Delta time
     */
    update(dt) {
        if (this.player.isGameover() && !this.isGameover) {
            const layer = new GLayer();
            layer.setPosition(0, 0, 1);
            layer.setSize(GameScreen.it.width, GameScreen.it.height);
            this.addLayer(layer);
            this.isGameover = true;
        }

        if (this.isGameover) {
            if (Input.key.isPress(Input.key.a() + 19)) {
                window.open(`http://twitter.com/?status=EatCoinで${this.player.material.mass * 10 - 50}のコインを獲得した。 http://eatcoin.yuu.trap.show  #traP3jam`, `_blank`);
            }
            if (Input.key.isPress(Input.key.up()) || Input.key.isPress(Input.key.a() + 25) || Input.mouse.isPress(Input.mouse.mLeft())) {
                this.initStage();
            }
        }

        this.stageManager.update(dt);
        super.update(dt);
        this.eventManager.update(dt);
    }

    /**
     * Render scene
     * @abstract
     * @param {Context} ctx Canvas context
     */
    render(ctx) {
        this.stageManager.render(ctx);
        super.render(ctx);
        this.eventManager.render(ctx);
        ctx.fillText(`Score: ${this.player.material.mass * 10 - 50}`, 100, 50, 0.0, 0.0, 20, `white`);
    }
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
    update(dt) {
        if (Input.key.isPress(Input.key.a() + 25) || Input.mouse.isPress(Input.mouse.mLeft())) {
            SceneManager.it.replaceScene(new GameScene());
        }
    }

    /**
     * Render scene
     * @abstract
     * @param {Context} ctx Canvas context
     */
    render(ctx) {
        ctx.fillText(`Eat Coin`, 400, 300, 0.5, 0.5, 50, `white`);
        ctx.fillText(`Press Z to start`, 400, 500, 0.5, 0.5, 30, `white`);
    }
}

new UnderEngineBuilder().build().execute(new TitleScene());
