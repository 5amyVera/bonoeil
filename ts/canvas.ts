class CanvasDisplay {

	public canvas: HTMLCanvasElement = document.createElement('canvas');
	public cx: CanvasRenderingContext2D = this.canvas.getContext("2d", { alpha: false });
	public zoom: number = 3;
	public animationTime: number = 0;
	public level: Level;
	public viewport: any;

	constructor(parent: HTMLElement, level: Level) {
		this.canvas.width = 16 * scale * this.zoom;
		this.canvas.height = 12 * scale * this.zoom;
		parent.appendChild(this.canvas);
		this.cx.scale(this.zoom, this.zoom);
		this.cx.imageSmoothingEnabled = false;
		this.level = level;

		this.viewport = {
			left: 0,
			top: 1,
			width: this.canvas.width / this.zoom / scale,
			height: this.canvas.height / this.zoom / scale - 2
		};

		this.drawFrame(0);
	}

	public drawFrame = (step: number): void => {
		this.animationTime += step;
		this.updateViewport();
		this.drawBackground();
		this.drawLayer0();
		this.drawActors();
		this.drawLayer1();
		this.drawFront();
		this.drawLayer2();
		this.drawHUD();
	}

	public flipHorizontally = (context: CanvasRenderingContext2D, around: number): void => {
		context.translate(around, 0);
		context.scale(-1, 1);
		context.translate(-around, 0);
	}

	public updateViewport = (): void => {
		var view: any = this.viewport;
		var player: Actor = this.level.actors.get("player");
		var marginWidth: number = view.width / 2;
		var marginHeight: number = view.height / 3;
		var center: Vector2D = player.pos;

		if (center.x < view.left + marginWidth) {
			view.left = Math.max(center.x - marginWidth, 0);
		}
		else if (center.x > view.left + view.width - marginWidth) {
			view.left = Math.min(center.x + marginWidth - view.width,
				this.level.size.x - view.width);
		}
		if (center.y < view.top + marginHeight) {
			view.top = Math.max(center.y - marginHeight, -1);
		}
		else if (center.y > view.top + view.height - marginHeight) {
			view.top = Math.min(center.y + marginHeight - view.height,
				this.level.size.y - view.height);
		}
	}

	public drawHUD = (): void => {
		var view: any = this.viewport;
		var xStart: number = Math.floor(view.left - 4);
		var xEnd: number = Math.ceil(view.left + view.width + 8);
		var yStart: number = Math.floor(view.top - 3);
		var yEnd: number = Math.ceil(view.top + view.height + 6);

		for (let x = xStart; x < xEnd; x++) {
			for (let y = yStart; y < yEnd; y++) {
				var tile: Bloc = this.level.layer1.get(x + ", " + y);

				this.cx.fillStyle = "#4D533C";
				if (tile == null && x >= 0 && x < this.level.size.x && y >= 0 && y < this.level.size.y) {
					this.cx.fillStyle = "#C4CFA1";
				}

				this.cx.fillRect(scale * 14 + (x - xStart), scale * 1.25 + (y - yStart), 1, 1);
			}
		}
		this.cx.fillStyle = "black";
		this.cx.fillRect(scale * 14 + (Math.floor(this.level.actors.get("player").pos.x + 0.25) - xStart) - 1,
			scale * 1.25 + (Math.floor(this.level.actors.get("player").pos.y) + 1 - yStart), 3, 1);
		this.cx.fillRect(scale * 14 + (Math.floor(this.level.actors.get("player").pos.x + 0.25) - xStart),
			scale * 1.25 + (Math.floor(this.level.actors.get("player").pos.y) - yStart), 1, 3);
		this.cx.fillStyle = "white";
		this.cx.fillRect(scale * 14 + (Math.floor(this.level.actors.get("player").pos.x + 0.25) - xStart),
			scale * 1.25 + (Math.floor(this.level.actors.get("player").pos.y) + 1 - yStart), 1, 1);
		var map: HTMLImageElement = document.createElement("img");
		map.src = "img/map.png";
		this.cx.drawImage(map,
			0, 0, 36, 27,
			scale * 13.75, scale, 36, 27);

		this.cx.fillStyle = "black";
		this.cx.fillRect(0, 0, this.canvas.width, scale * 1);
		this.cx.fillRect(0, scale * 10, this.canvas.width, scale * 2);

		this.cx.font = "16px rcr";
		this.cx.fillStyle = "white";
		this.cx.fillText("TEST ZONE", scale * 0.5, scale * 0.75);
		if (this.level.messageBox1 !== "") {
			this.cx.fillText(this.level.messageBox1Actor + " : " + this.level.messageBox1.substring(0, Math.floor(this.level.messageTime1 / 5)), scale * 0.5, scale * 10.75);
		}
		if (this.level.messageBox2 !== "") {
			this.cx.fillText(this.level.messageBox2Actor + " : " + this.level.messageBox2.substring(0, Math.floor(this.level.messageTime2 / 5)), scale * 0.5, scale * 11.75);
		}
	}

	public drawBackground = (): void => {
		var parallax: number = Math.floor(this.level.actors.get("player").pos.x * 16 / this.level.size.x);

		this.cx.fillStyle = "#000";
		this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		var sky: HTMLImageElement = document.createElement("img");
		sky.src = "img/backgrounds/sky.png";
		this.cx.drawImage(sky,
			0, 0, 256, 144,
			0, scale, 256, 144);
		var cloudBack: HTMLImageElement = document.createElement("img");
		cloudBack.src = "img/backgrounds/cloud-back.png";
		this.cx.drawImage(cloudBack,
			0, 0, 256, 144,
			0, scale, 256, 144);
		var chains: HTMLImageElement = document.createElement("img");
		chains.src = "img/backgrounds/chains.png";
		this.cx.drawImage(chains,
			0, 0, 256, 144,
			-parallax / 3, scale, 256, 144);
		var cloudFront: HTMLImageElement = document.createElement("img");
		cloudFront.src = "img/backgrounds/cloud-front.png";
		this.cx.drawImage(cloudFront,
			0, 0, 256, 144,
			0, scale, 256, 144);
	}

	public drawLayer0 = (): void => {
		var view: any = this.viewport;
		var xStart: number = Math.floor(view.left);
		var xEnd: number = Math.ceil(view.left + view.width);
		var yStart: number = Math.floor(view.top);
		var yEnd: number = Math.ceil(view.top + view.height);

		var tileset: HTMLImageElement = document.createElement("img");
		tileset.src = this.level.tileset;

		for (let x = xStart; x < xEnd; x++) {
			for (let y = yStart; y < yEnd; y++) {
				var tile: Bloc = this.level.layer0.get(x + ", " + y);
				if (tile == null) {
					continue;
				}

				var screenX: number = (x - view.left) * scale;
				var screenY: number = (y - view.top) * scale;

				var tileX: number;
				var tileY: number;

				switch (tile.fieldType) {
					case "void":
						{ tileX = 4; tileY = 1; break; }
					case "top-left":
						{ tileX = 3; tileY = 0; break; }
					case "top":
						{ tileX = 4; tileY = 0; break; }
					case "top-right":
						{ tileX = 5; tileY = 0; break; }
					case "center-left":
						{ tileX = 3; tileY = 1; break; }
					case "center":
						{ tileX = 4; tileY = 1; break; }
					case "center-right":
						{ tileX = 5; tileY = 1; break; }
					case "bottom-left":
						{ tileX = 3; tileY = 2; break; }
					case "bottom":
						{ tileX = 4; tileY = 2; break; }
					case "bottom-right":
						{ tileX = 5; tileY = 2; break; }
					case "top-left-corner":
						{ tileX = 3; tileY = 3; break; }
					case "top-right-corner":
						{ tileX = 4; tileY = 3; break; }
					case "bottom-left-corner":
						{ tileX = 3; tileY = 4; break; }
					case "bottom-right-corner":
						{ tileX = 4; tileY = 4; break; }
					case "animated1":
						{ tileX = 6; tileY = Math.floor(this.animationTime * 8) % 3; break; }
					case "animated2":
						{ tileX = 7; tileY = Math.floor(this.animationTime * 8) % 3; break; }
					case "animated3":
						{ tileX = 8; tileY = Math.floor(this.animationTime * 8) % 3; break; }
					default:
						{ tileX = 4; tileY = 1; break; }
				}

				this.cx.drawImage(tileset,
					tileX * scale, tileY * scale, scale, scale,
					screenX, screenY, scale, scale);
			}
		}
	}

	public drawLayer1 = (): void => {
		var view: any = this.viewport;
		var xStart: number = Math.floor(view.left);
		var xEnd: number = Math.ceil(view.left + view.width);
		var yStart: number = Math.floor(view.top);
		var yEnd: number = Math.ceil(view.top + view.height);

		var tileset: HTMLImageElement = document.createElement("img");
		tileset.src = this.level.tileset;

		for (let x = xStart; x < xEnd; x++) {
			for (let y = yStart; y < yEnd; y++) {
				var tile: Bloc = this.level.layer1.get(x + ", " + y);
				if (tile == null) {
					continue;
				}

				var screenX: number = (x - view.left) * scale;
				var screenY: number = (y - view.top) * scale;

				var tileX: number;
				var tileY: number;

				switch (tile.fieldType) {
					case "void":
						{ tileX = 1; tileY = 1; break; }
					case "top-left":
						{ tileX = 0; tileY = 0; break; }
					case "top":
						{ tileX = 1; tileY = 0; break; }
					case "top-right":
						{ tileX = 2; tileY = 0; break; }
					case "center-left":
						{ tileX = 0; tileY = 1; break; }
					case "center":
						{ tileX = 1; tileY = 1; break; }
					case "center-right":
						{ tileX = 2; tileY = 1; break; }
					case "bottom-left":
						{ tileX = 0; tileY = 2; break; }
					case "bottom":
						{ tileX = 1; tileY = 2; break; }
					case "bottom-right":
						{ tileX = 2; tileY = 2; break; }
					case "top-left-corner":
						{ tileX = 0; tileY = 3; break; }
					case "top-right-corner":
						{ tileX = 1; tileY = 3; break; }
					case "bottom-left-corner":
						{ tileX = 0; tileY = 4; break; }
					case "bottom-right-corner":
						{ tileX = 1; tileY = 4; break; }
					case "animated1":
						{ tileX = 6; tileY = Math.floor(this.animationTime * 8) % 3; break; }
					case "animated2":
						{ tileX = 7; tileY = Math.floor(this.animationTime * 8) % 3; break; }
					case "animated3":
						{ tileX = 8; tileY = Math.floor(this.animationTime * 8) % 3; break; }
					default:
						{ tileX = 1; tileY = 1; break; }
				}

				this.cx.drawImage(tileset,
					tileX * scale, tileY * scale, scale, scale,
					screenX, screenY, scale, scale);
			}
		}
	}

	public drawLayer2 = (): void => {
		var view: any = this.viewport;
		var xStart: number = Math.floor(view.left);
		var xEnd: number = Math.ceil(view.left + view.width);
		var yStart: number = Math.floor(view.top);
		var yEnd: number = Math.ceil(view.top + view.height);

		var tileset: HTMLImageElement = document.createElement("img");
		tileset.src = this.level.tileset;

		for (let x = xStart; x < xEnd; x++) {
			for (let y = yStart; y < yEnd; y++) {
				var tile: Bloc = this.level.layer2.get(x + ", " + y);
				if (tile == null) {
					continue;
				}

				var screenX: number = (x - view.left) * scale;
				var screenY: number = (y - view.top) * scale;

				var tileX: number;
				var tileY: number;

				switch (tile.fieldType) {
					case "void":
						{ tileX = 1; tileY = 1; break; }
					case "top-left":
						{ tileX = 0; tileY = 5; break; }
					case "top":
						{ tileX = 1; tileY = 5; break; }
					case "top-right":
						{ tileX = 2; tileY = 5; break; }
					case "center-left":
						{ tileX = 3; tileY = 5; break; }
					case "center":
						{ tileX = 4; tileY = 5; break; }
					case "center-right":
						{ tileX = 5; tileY = 5; break; }
					case "bottom-left":
						{ tileX = 6; tileY = 5; break; }
					case "bottom":
						{ tileX = 7; tileY = 5; break; }
					case "bottom-right":
						{ tileX = 0; tileY = 6; break; }
					case "top-left-corner":
						{ tileX = 1; tileY = 6; break; }
					case "top-right-corner":
						{ tileX = 2; tileY = 6; break; }
					case "bottom-left-corner":
						{ tileX = 3; tileY = 6; break; }
					case "bottom-right-corner":
						{ tileX = 4; tileY = 6; break; }
					case "animated1":
						{ tileX = 5; tileY = 6; break; }
					case "animated2":
						{ tileX = 6; tileY = 6; break; }
					case "animated3":
						{ tileX = 7; tileY = 6; break; }
					default:
						{ tileX = 1; tileY = 1; break; }
				}

				this.cx.drawImage(tileset,
					tileX * scale, tileY * scale, scale, scale,
					screenX, screenY, scale, scale);
			}
		}
	}

	public drawFront = (): void => {
		this.level.actors.forEach((actor: Actor) => {
			var height: number = actor.size.y * scale;
			var posX: number = (actor.pos.x - this.viewport.left) * scale;
			var posY: number = (actor.pos.y - this.viewport.top) * scale;

			if (actor instanceof Npc && actor.messageArrow) {
				let arrow: HTMLImageElement = document.createElement("img");
				var cursorX = Math.floor(this.animationTime * 3) % 4;
				arrow.src = "img/actors/cursor.png";
				this.cx.drawImage(arrow,
					cursorX * scale, 0, scale, scale,
					posX, posY - height - scale * 0.75, scale, scale);
			}
		});
	}

	public drawActors = (): void => {
		this.level.actors.forEach((actor: Actor) => {
			var width: number = actor.size.x * scale;
			var height: number = actor.size.y * scale;
			var posX: number = (actor.pos.x - this.viewport.left) * scale;
			var posY: number = (actor.pos.y - this.viewport.top) * scale;
			var spriteX: number = 0;
			var spriteY: number = 0;
			var sprites: HTMLImageElement = document.createElement("img");
			sprites.src = actor.sprites;

			if (actor.name === "Young girl") {
				spriteX = Math.floor(this.animationTime * 3) % 3;
				this.cx.drawImage(sprites,
					spriteX * width * 2, spriteY * height * 2, width * 2, height * 2,
					posX - scale / 2, posY - scale, width * 2, height * 2);
			}
			else if (actor.name === "Villager" && actor instanceof Npc) {
				spriteX = Math.floor(this.animationTime * 3) % 2;

				this.cx.save();
				if (!actor.direction) { this.flipHorizontally(this.cx, posX + scale / 2); }

				this.cx.drawImage(sprites,
					spriteX * width * 2, spriteY * height * 1.5, width * 2, height * 1.5,
					posX - scale / 2, posY - scale * 2, width * 2, height * 1.5);

				this.cx.restore();
			}
			else if (actor instanceof Player) {
				this.drawPlayer(actor, sprites, spriteX, spriteY, posX, posY, width, height);
			}
		});
	}

	public drawPlayer = (player: Player, sprites: HTMLImageElement, spriteX: number, spriteY: number, posX: number, posY: number, width: number, height: number): void => {
		if (player.status === null) {
			spriteY = 0;
			spriteX = Math.floor(this.animationTime * 3) % 4;

			if (player.speed.x != 0) {
				spriteY = 1;
				spriteX = Math.floor(this.animationTime * 8) % 4;
			}
			if (player.speed.y !== 0) {
				spriteY = 2;
				if (player.speed.y < 0) {
					spriteX = 0;
				}
				else {
					spriteX = 1;
				}
			}
			if (player.action === "grip") {
				spriteY = 2;
				spriteX = 3;
			}
			else if (player.action === "evade") {
				spriteY = 2;
				spriteX = 2;
			}
			else if (player.action === "jabAttack1") {
				spriteX = Math.floor(player.actionFrame / 5) % 4;
				spriteY = 3;
			}
			else if (player.action === "jabAttack2") {
				spriteX = Math.floor(player.actionFrame / 6) % 4;
				spriteY = 5;
			}
			else if (player.action === "aerialAttack") {
				spriteX = Math.floor(player.actionFrame / 6) % 4;
				spriteY = 4;
			}
			else if (player.action === "landingAttack") {
				spriteX = Math.floor(player.actionFrame / 6) % 4;
				spriteY = 4;
			}
			if (Math.floor(this.animationTime * 8) % 24 === 0) {
				spriteX += 4;
			}
		}

		this.cx.save();
		if (!player.direction) { this.flipHorizontally(this.cx, posX + width / 2); }

		this.cx.drawImage(sprites,
			spriteX * width * 4, spriteY * height * 2, width * 4, height * 2,
			posX - width * 1.5, posY - height / 2, width * 4, height * 2);

		this.cx.restore();
	}
}