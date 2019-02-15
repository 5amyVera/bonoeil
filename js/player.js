class Player extends Actor {
    constructor(name, pos, size, sprites, direction) {
        super(name, pos, size, sprites);
        this.speed = new Vector2D(0, 0);
        this.direction = true;
        this.input = null;
        this.action = null;
        this.actionFrame = 0;
        this.lastJab1Frame = 33;
        this.status = null;
        this.xSpeed = scale / 2;
        this.jumpSpeed = scale * 1;
        this.gravity = scale * 3;
        this.dashSpeed = scale * 1.5;
        this.dashResistance = scale * 4;
        this.controls = [false, false, false, false, false, false];
        this.controlsMemory = [false, false, false, false, false, false];
        this.attackMoveX = (step, level) => {
            if (this.action === "jabAttack1") {
                this.speed.x = 0;
                if (this.direction) {
                    this.speed.x += this.xSpeed / 8;
                }
                else {
                    this.speed.x -= this.xSpeed / 8;
                }
            }
            else if (this.action === "jabAttack2") {
                this.speed.x = 0;
                if (this.direction) {
                    this.speed.x += this.xSpeed / 4;
                }
                else {
                    this.speed.x -= this.xSpeed / 4;
                }
            }
            var motion = new Vector2D(this.speed.x * step, 0);
            var newPos = this.pos.plus(motion);
            var obstacle = level.obstacleAt(newPos, this.size);
            if (!obstacle) {
                this.pos = newPos;
            }
        };
        this.moveX = (step, level) => {
            if (!this.controls[2] && !this.controls[3]) {
                if (this.speed.x > 0) {
                    this.speed.x -= this.xSpeed / scale;
                }
                else if (this.speed.x < 0) {
                    this.speed.x += this.xSpeed / scale;
                }
            }
            if (this.controls[2] && this.action !== "landingAttack") {
                this.speed.x = this.speed.x - this.xSpeed / scale * 2 > -this.xSpeed ? this.speed.x - this.xSpeed / scale * 2 : -this.xSpeed;
                if (this.action === null || this.action === "jump" || this.action === "recover") {
                    this.direction = false;
                }
            }
            if (this.controls[3] && this.action !== "landingAttack") {
                this.speed.x = this.speed.x + this.xSpeed / scale * 2 < this.xSpeed ? this.speed.x + this.xSpeed / scale * 2 : this.xSpeed;
                if (this.action === null || this.action === "jump" || this.action === "recover") {
                    this.direction = true;
                }
            }
            this.speed.x = Math.round(this.speed.x * 10) / 10;
            var motion = new Vector2D(this.speed.x * step, 0);
            var newPos = this.pos.plus(motion);
            var obstacle = level.obstacleAt(newPos, this.size);
            if (!obstacle || obstacle && (obstacle.fieldType === "wood" || obstacle.fieldType === "wood-left" || obstacle.fieldType === "wood-right")) {
                this.pos = newPos;
            }
        };
        this.moveY = (step, level) => {
            if (this.input === "jump") {
                this.action = "jump";
                this.speed.y = -this.jumpSpeed;
            }
            this.speed.y += step * this.gravity;
            var motion = new Vector2D(0, this.speed.y * step);
            var newPos = this.pos.plus(motion);
            var obstacle = level.obstacleAt(newPos, this.size);
            if (obstacle && (obstacle.fieldType !== "wood" && obstacle.fieldType !== "wood-left" && obstacle.fieldType !== "wood-right") ||
                obstacle && (obstacle.fieldType === "wood" || obstacle.fieldType === "wood-left" || obstacle.fieldType === "wood-right") && this.pos.y + this.size.y < obstacle.pos.y ||
                obstacle && (obstacle.fieldType === "wood" || obstacle.fieldType === "wood-left" || obstacle.fieldType === "wood-right") &&
                    this.pos.y + this.size.y === obstacle.pos.y && !(this.controls[0] && this.controls[5])) {
                if (this.speed.y > 0) {
                    this.speed.y = 0;
                    this.pos.y = Math.round(this.pos.y * 10) / 10;
                    if (this.pos.y % 0.5 !== 0) {
                        this.pos.y = Math.round(this.pos.y);
                    }
                    if (this.action === "aerialAttack" || this.action === "landingAttack") {
                        this.action = "landingAttack";
                    }
                    else {
                        this.action = null;
                    }
                }
                else {
                    this.speed.y = -1;
                }
            }
            else {
                this.pos = newPos;
            }
        };
        this.evade = (step, level) => {
            this.actionFrame++;
            if (this.input === "evade") {
                this.actionFrame = 0;
            }
            if (this.action === "evade") {
                if (this.actionFrame === 32) {
                    this.action = null;
                }
            }
        };
        this.attack = (step, level) => {
            this.actionFrame++;
            if (this.input === "jabAttack1") {
                this.actionFrame = 0;
                this.lastJab1Frame = 0;
            }
            else if (this.input === "jabAttack2" || this.input === "aerialAttack") {
                this.actionFrame = 0;
            }
            if (this.action === "jabAttack1") {
                if (this.actionFrame === 20) {
                    this.action = null;
                }
            }
            else if (this.action === "jabAttack2") {
                if (this.actionFrame === 24) {
                    this.action = null;
                }
            }
            else if (this.action === "aerialAttack" || this.action === "landingAttack") {
                if (this.actionFrame === 24) {
                    this.action = null;
                }
            }
        };
        this.talk = (step, level) => {
            var actor = level.actorAt(this);
            if (actor && actor instanceof Npc) {
                if (level.messageBox1 === "" && level.messageBox2 !== actor.message) {
                    level.messageBox1Actor = actor.name;
                    level.messageBox1 = actor.message;
                    level.messageTime1 = 0;
                }
                else if (level.messageBox1 !== actor.message && level.messageBox2 === "") {
                    level.messageBox2Actor = actor.name;
                    level.messageBox2 = actor.message;
                    level.messageTime2 = 0;
                }
            }
            this.action = null;
        };
        this.act = (step, level, keys) => {
            this.controls = [
                keys.get("a"),
                keys.get("b"),
                keys.get("left"),
                keys.get("right"),
                keys.get("up"),
                keys.get("down")
            ];
            this.lastJab1Frame++;
            var actor = level.actorAt(this);
            var edgePos;
            if (this.direction) {
                edgePos = this.pos.plus(new Vector2D(this.size.x + 0.25, 0.25));
            }
            else {
                edgePos = this.pos.plus(new Vector2D(-0.25, 0.25));
            }
            var edge = level.obstacleAt(edgePos, new Vector2D(0, 0.125));
            var floor = level.obstacleAt(this.pos.plus(new Vector2D(0, 1)), new Vector2D(0, 1));
            var air = level.obstacleAt(edgePos.plus(new Vector2D(0, -0.5)), new Vector2D(0, 0.25));
            if (edge && edge.fieldType !== "wood" && edge.fieldType !== "wood-left" && edge.fieldType !== "wood-right" &&
                !air && !floor && this.action !== "grip" && this.action !== "aerialAttack" && this.controls[2] && !this.direction ||
                edge && edge.fieldType !== "wood" && edge.fieldType !== "wood-left" && edge.fieldType !== "wood-right" &&
                    !air && !floor && this.action !== "grip" && this.action !== "aerialAttack" && this.controls[3] && this.direction) {
                this.action = "grip";
                this.speed.y = 0;
                this.pos.x = Math.round(this.pos.x);
                this.pos.y = Math.round(this.pos.y) - 0.25;
            }
            else if (this.controls[4] && !this.controlsMemory[4] && this.action === null && this.speed.y === 0 && actor && actor instanceof Npc) {
                this.input = "talk";
                this.action = "talk";
            }
            else if (this.controls[1] && this.controls[5] && !this.controlsMemory[1] && this.action === null && this.speed.y === 0) {
                this.input = "evade";
                this.action = "evade";
            }
            else if (this.controls[0] && !this.controls[5] && !this.controlsMemory[0] && this.speed.y === 0 && (this.action === null || this.action === "grip")) {
                this.input = "jump";
                this.action = "jump";
            }
            else if (this.action === "grip" && this.controls[5] && ((!this.controls[2] && !this.direction) || (!this.controls[3] && this.direction))) {
                this.action = "recover";
            }
            else if (!this.controls[0] && this.controls[1] && this.action === null && !this.controlsMemory[1] && this.speed.y === 0 && this.lastJab1Frame <= 32) {
                this.input = "jabAttack2";
                this.action = "jabAttack2";
            }
            else if (!this.controls[0] && this.controls[1] && this.action === null && !this.controlsMemory[1] && this.speed.y === 0) {
                this.input = "jabAttack1";
                this.action = "jabAttack1";
            }
            else if (this.controls[1] && (this.action === null || this.action === "jump") && !this.controlsMemory[1] && this.speed.y !== 0) {
                this.input = "aerialAttack";
                this.action = "aerialAttack";
            }
            else if (this.action === "aerialAttack" && this.speed.y === 0) {
                this.action = "landingAttack";
            }
            if (this.status === null) {
                if (this.action === null) {
                    this.moveX(step, level);
                    this.moveY(step, level);
                }
                else if (this.action === "talk") {
                    this.talk(step, level);
                }
                else if (this.action === "jump") {
                    this.moveX(step, level);
                    this.moveY(step, level);
                }
                else if (this.action === "recover") {
                    this.moveX(step, level);
                    this.moveY(step, level);
                }
                else if (this.action === "evade") {
                    this.evade(step, level);
                }
                else if (this.action === "jabAttack1") {
                    this.attackMoveX(step, level);
                    this.attack(step, level);
                }
                else if (this.action === "jabAttack2") {
                    this.attackMoveX(step, level);
                    this.attack(step, level);
                }
                else if (this.action === "aerialAttack") {
                    this.moveX(step, level);
                    this.moveY(step, level);
                    this.attack(step, level);
                }
                else if (this.action === "landingAttack") {
                    this.moveX(step, level);
                    this.moveY(step, level);
                    this.attack(step, level);
                }
            }
            this.input = null;
            for (let i = 0; i < this.controls.length; i++) {
                this.controlsMemory[i] = this.controls[i];
            }
        };
        this.pos = this.pos.plus(new Vector2D(0, -1));
        this.direction = direction;
    }
}
