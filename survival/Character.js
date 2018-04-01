
class Character{

	constructor(width, height, initX, initY, color, maxSpeed, maxHP, playable){
		this.width = width;
		this.height = height;
		this.radius = Math.sqrt( Math.pow(this.width, 2) + Math.pow(this.height,2) )/2;
		this.color = "hsl("+color+",60%,60%)";

		this.playable = playable;
		this.shot = null;
		this.maxHP = this.hp = maxHP;
		this.damageTickTimer = 0;
		this.damageTickDuration = 5;

		this.x = initX;
		this.y = initY;
		this.xvel = this.yvel = 0;
		this.maxXVel = this.maxYVel = maxSpeed;
		this.friction = 0.5+Math.random()*0.5;
		if(this.playable === true){
		this.friction = 0.5;
		}

		this.item = null;
	}

	putSelfInList(list){
		this.list = list;
		this.index = list.length;
		list.push(this);
	}

	deleteSelfFromList(){
		this.list.splice(this.index, 1, null);
	}

	draw(context){
		let border = 6
		if(this.playable === true){
			context.globalAlpha = 0.5;
			if(this.hp/this.maxHP < 0.25){
				context.fillStyle="orangered";
			} else if(this.hp/this.maxHP < 0.5){
				context.fillStyle="goldenrod";
			} else {
				context.fillStyle="deepskyblue";
			}
			context.fillRect(this.x-this.radius/border, this.y-this.radius/border,
				this.width+2*this.radius/border, this.height+2*this.radius/border);
		}

		context.globalAlpha = 1;
		context.fillStyle=this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
		let w = this.radius/border;
		let h = this.height*this.hp/this.maxHP
		context.fillStyle="hsl(120,70%,40%)";
		context.fillRect(this.x+this.width, this.y+this.height, -1*w, -1*h);
		if(this.shot.timer < this.shot.recharge){
			h = this.height*this.shot.timer/this.shot.recharge;
		} else {
			h = this.height;
		}
		context.fillStyle="hsl(240,70%,40%)";
		context.fillRect(this.x, this.y+this.height, w*0.66, -1*h);
		if(this.damageTickTimer > 0){
			context.globalAlpha = 0.5;
			context.fillStyle="#FF0000";
			context.fillRect(this.x, this.y, this.width, this.height);
			context.globalAlpha = 1;
		}

		if(this.item !== null){
			let hue = 0;
			switch(typeArray.indexOf(this.item.type)){
				case 0: hue = 0;
					break;
				case 1: hue = 120;
					break;
				case 2: hue = 240;
					break;
				default: hue = 180;
					break;
				}
				context.fillStyle="hsl("+hue+",30%,30%)";
				context.fillRect(this.x+this.width/2-0.66*this.radius/border,
					this.y, this.radius/border, this.radius/border);
				context.fillStyle="hsl("+hue+",50%,50%)";
				context.fillRect(1+this.x+this.width/2-0.66*this.radius/border,
					1+this.y, this.radius/border-1, this.radius/border-1);
			}
	}

	processControls(pl, kl){

		if(kl[86] === true || kl[32] == true){ //Space = shoot
			this.shot.shoot(this, pl);
		}
		if(kl[37] === true){ //Left
		  if(Math.abs(this.xvel) <= this.maxXVel){
			this.xvel -= 2;
		  }
		}
		if(kl[39] === true){ //Right
		  if(Math.abs(this.xvel) <= this.maxXVel){
			this.xvel += 2;
		   }
		}
		if(kl[38] === true){ //Up
		  if(Math.abs(this.yvel) <= this.maxYVel){
			this.yvel -= 2;
		  }
		}
		if(kl[40] === true){ //Down
		  if(Math.abs(this.yvel) <= this.maxYVel){
			this.yvel += 2;
		  }
		}
	}

	doKinematics(canvas, kl){

		if(Math.abs(this.xvel) > this.maxXVel){
			if(this.xvel > 0){
				this.xvel = this.maxXVel;
			} else {
				this.xvel = -1*this.maxXVel;
			}
		}
		if(Math.abs(this.yvel) > this.maxYVel){
			if(this.yvel > 0){
				this.yvel = this.maxYVel;
			} else {
				this.yvel = -1*this.maxYVel;
			}
		}

		this.x += this.xvel;
		this.y += this.yvel;

		if(this.playable === true){
			if(kl[37] === false && kl[39] === false){
				this.xvel *= this.friction;
			}
			if(kl[38] === false && kl[40] === false){
				this.yvel *= this.friction;
			}
		} else {
			this.xvel *= this.friction;
			this.yvel *= this.friction;
		}

		if(this.x < 0){
		  this.x = 0;
		} else if(this.x > canvas.width-this.width){
		  this.x = canvas.width-this.width;
		}
		if(this.y < 0){
		  this.y = 0;
		} else if(this.y > canvas.height-this.height){
		  this.y = canvas.height-this.height;
		}
		if(Math.abs(this.xvel) < 0.1){
			this.xvel = 0;
		}
		if(Math.abs(this.yvel) < 0.1){
			this.yvel = 0;
		}
	}

	doCPUAction(canvas, el, pl, il){
		this.behavior.target(this, el, pl);
		if(Math.random() < this.behavior.itemTargetChance && this.behavior.targetItem === null && this.item === null){
			this.behavior.seekItem(this, il);
		}
		if(pl.length > 0 && Math.random() < this.behavior.evadeChance){
			this.behavior.evade(this, el, pl);
		}
		if(Math.random() < this.behavior.shotChance){
			if(this.behavior.targetEntity !== null){
				let tempx = this.xvel, tempy = this.yvel;
				this.xvel = this.behavior.targetEntity.x-this.x-this.width/2;
				this.yvel = this.behavior.targetEntity.y-this.y-this.height/2;
				this.shot.shoot(this, pl);
				this.xvel = tempx;
				this.yvel = tempy;
			}
		}
		if(this.item !== null){
			this.behavior.itemBehavior(this, el, pl);
		}
	//	console.log(this.behavior.itemTargetChance)

	}

}
//BEGIN DEFINITION OF SHOT CLASS----------------------------------------------------------
class Shot{

	constructor(recharge, type, params){
		this.recharge = recharge;
		this.type = type;
		this.m = (Math.random()+1);
		if(type === "basic"){
			this.radius = params[0];
			this.color = params[1];
			this.speed = params[2]
			this.damage = params[3];
		} else if(type === "radial"){
			this.offsetAngle = params[0];
			this.number = params[1];
			this.radius = params[2];
			this.color = params[3];
			this.speed = params[4];
			this.damage = params[5];
		}
		this.timer = 0;
	}

	shoot(owner, pl){

		if(this.timer >= this.recharge){
			if(owner.playable === true && this.speed < owner.maxXVel){
				this.speed = owner.maxXVel * this.m;
			}
			if(this.type === "basic"){

				let angle = Math.atan(owner.yvel/owner.xvel);
				if(owner.xvel < 0){
					angle += Math.PI;
				} else if(owner.yvel < 0 && owner.xvel === 0){
					angle = -1*Math.PI/2;
				}
				let xv = this.speed * Math.cos(angle);
				let yv = this.speed * Math.sin(angle);
				if(owner.xvel === 0 && owner.yvel === 0){
					xv = this.speed;
					yv = 0;
					angle = 0;
				}
				let xp = owner.x+owner.width/2+owner.radius*Math.cos(angle)/2;
				let yp = owner.y+owner.height/2+owner.radius*Math.sin(angle)/2;
				let params = [owner, xp, yp,
					this.radius, this.color, xv, yv, this.damage];
				let p = new Projectile(...params);
				p.putSelfInList(pl);
				//console.log(p.list === projectileList, "shot.shoot");

			} else if(this.type === "radial"){

				let angle = Math.atan(owner.yvel/owner.xvel);
				if(owner.xvel < 0){
					angle += Math.PI;
				} else if(owner.yvel < 0 && owner.xvel === 0){
					angle = -1*Math.PI/2;
				}
				let xv = this.speed * Math.cos(angle);
				let yv = this.speed * Math.sin(angle);
				if(owner.xvel === 0 && owner.yvel === 0){
					xv = this.speed;
					yv = 0;
					angle = 0;
				}

				let initAngle = angle-this.offsetAngle;
				let finalAngle = angle+this.offsetAngle;
				let step = (finalAngle-initAngle)/(this.number-1);

				//console.log(finalAngle, initAngle, step);

				for(let a = initAngle; tr(a,10) <= tr(finalAngle, 10); a += step){
					let xv = this.speed * Math.cos(a);
					let yv = this.speed * Math.sin(a);

					let xp = owner.x+owner.width/2+owner.radius*Math.cos(a)/2;
					let yp = owner.y+owner.height/2+owner.radius*Math.sin(a)/2;
					let params = [owner, xp, yp,
						this.radius, this.color, xv, yv, this.damage];
					let p = new Projectile(...params);
					p.putSelfInList(pl);
					//console.log(a, finalAngle);
				}

			}

			this.timer = 0;
		}
	}

	cooldown(){
		this.timer++;
	}

}

var tr = (n, d) => Math.trunc(Math.pow(10, d)*n)/Math.pow(10, d);
//BEGIN DEFINITION OF BEHAVIOR CLASS------------------------------------------------------
class Behavior{

	constructor(targetType, evasionStyle, evadeChance, shotChance, itemTargetChance, damageThreshold, examinationRadius){
		this.targetType = targetType;
		this.evasionStyle = evasionStyle;

		this.lastShooter = null;
		this.examinationRadius = examinationRadius;

		this.evadeChance = evadeChance;
		this.shotChance = shotChance;

		this.itemTargetChance = itemTargetChance;
		this.damageThreshold = damageThreshold;

		this.targetEntity = null;
		this.targetItem = null;
	}

	target(self, el, pl){
		if(this.targetType === 'player'){
			for(entity of el){
				if(entity.playable === true){
					this.targetEntity = entity;
				}
			}
		} else if(this.targetType === 'lastShooter'){
			if(this.lastShooter !== null){
				this.targetEntity = this.lastShooter;
			}
		} else if(this.targetType === 'random'){
			this.targetEntity = el[Math.floor(Math.random()*el.length)];
		}
	}

	seekItem(self, il){
		//console.log("hi");
		let itemSet = new Set(il);
		//console.log(itemSet)
		if(itemSet.size === 0){
			return;
		} else if (self.item == null) {
			let items = il.slice(0, il.length).sort();
			if(items.indexOf(null) > -1){
				items = items.slice(0, items.indexOf(null));
			}
			this.targetItem = items[Math.floor(Math.random()*items.length)];
			let dx = this.targetItem.x-self.x, dy = this.targetItem.y-self.y;
			let dSquared = dx*dx+dy*dy, vSquared = self.maxXVel*self.maxXVel;
			let scale = Math.sqrt(dSquared/vSquared);
			if(dx != 0){
				let direction = dx/Math.abs(dx);
				self.xvel += direction
				self.yvel += direction*dy/dx;
			} else {
				self.xvel = 0;
				let direction = dy/Math.abs(dy);
				self.yvel += direction;
			}
		}
	}

	itemBehavior(self, el, pl){
		let totalDamage = 0;
		for(let i=0;i<pl.length;i++){
			if(pl[i].owner.index !== self.index){
				let dx = pl[i].x - self.x - self.width/2;
				if(dx <= this.examinationRadius){
					let dy = pl[i].y - self.y - self.height/2;
					if(dy < this.examinationRadius){
						let dSquared = dx*dx + dy*dy;
						if(Math.sqrt(dSquared) < this.examinationRadius){
							//console.log(dx, dy);
							totalDamage += pl[i].damage;
						}
					}
				}
			}
		}
		let pctLeft = (self.hp-totalDamage)/self.maxHP;
	//	console.log(pctLeft < this.damageThreshold)
		if(pctLeft <= this.damageThreshold){
			self.item.effect(self, el, pl);
			self.item = null;
			this.targetItem = null;
		}
	}

	evade(self, el, pl){
		this.targetItem = null;
		if(this.evasionStyle === 'nearestBullet'){
			let minDSquared = Infinity;
			let index = -1;
			for(let i=0;i<pl.length;i++){
				if(pl[i].owner.index !== self.index){
					let dx = self.x + self.width/2 - pl[i].x;
					if(dx <= minDSquared){
						let dy = self.y + self.height/2 - pl[i].y;
						if(dy < minDSquared){
							let dSquared = dx*dx + dy*dy;
							if(dSquared < minDSquared){
								minDSquared = dSquared;
								index = i;
							}
						}
					}
				}
			}
			let projectile = pl[index];
			if(projectile !== undefined){
				if(projectile.xvel === 0){
					if(self.x > projectile.x){
						self.xvel += 1;
						return;
					} else {
						self.xvel += -1;
						return;
					}
				}
				let slope = projectile.yvel/projectile.xvel;
				let trajectory = (x)=>slope*(x-projectile.x)+projectile.y;
				if(self.y > trajectory(self.x)){
					self.xvel += -1*projectile.yvel/Math.abs(projectile.yvel);
					self.yvel = projectile.xvel/Math.abs(projectile.xvel);
				} else {
					self.xvel = projectile.yvel/Math.abs(projectile.yvel);
					self.yvel = -1*projectile.xvel/Math.abs(projectile.xvel);
				}
			/*	let angle = Math.atan(self.yvel/self.xvel);
				if(self.xvel < 0){
					angle += Math.PI;
				} else if(self.yvel < 0 && self.xvel === 0){
					angle = -1*Math.PI/2;
				}
				self.xvel = self.maxXVel * Math.cos(angle);
				self.yvel = self.maxYVel * Math.sin(angle);*/
			}
		} else if(this.evasionStyle === 'centerOfDamage'){
			let cdx = 0, cdy = 0;
			let damageX = 0, damageY = 0;
			let totalDamage = 0;
			for(let i=0;i<pl.length;i++){
				if(pl[i].owner.index !== self.index){
					let dx = pl[i].x - self.x - self.width/2;
					if(dx <= this.examinationRadius){
						let dy = pl[i].y - self.y - self.height/2;
						if(dy < this.examinationRadius){
							let dSquared = dx*dx + dy*dy;
							if(Math.sqrt(dSquared) < this.examinationRadius){
								//console.log(dx, dy);
								totalDamage += pl[i].damage;
								damageX += dx*pl[i].damage;
								damageY += dy*pl[i].damage;
							}
						}
					}
				}
			}
			if(totalDamage !== 0){
				cdx = damageX/totalDamage;
				cdy = damageY/totalDamage;
				//console.log(cdx, cdy);
				let xvel = -1*cdx;
				if(xvel === 0){
					xvel = self.maxXVel*Math.sign(canvas.width/2 - self.x);
				}
				let yvel = -1*cdy;
				if(yvel === 0){
					yvel = self.maxYVel*Math.sign(canvas.height/2 - self.y);
				}
				let angle = Math.atan(yvel/xvel);
				if(xvel < 0){
					angle += Math.PI;
				} else if(yvel < 0 && xvel === 0){
					angle = -1*Math.PI/2;
				}
				self.xvel = self.maxXVel * Math.cos(angle);
				self.yvel = self.maxYVel * Math.sin(angle);
			//	console.log(xvel, yvel);
			}
		}
	}

}

var shotTypes = ["basic", "radial"];
var targetTypes = ["player", "lastShooter", "random"];
var evasionStyles = ["nearestBullet", "centerOfDamage"];
function randomCharacter(difficulty, initX, initY, playable){

	let width = Math.floor(Math.random()*20)+30;
	let height = Math.floor(Math.random()*20)+30;
	let maxSpeed = Math.floor(Math.random()*15)+1;
	let maxHP = Math.floor(Math.random()*22) + (2*difficulty)-5;
	let color = Math.floor(Math.random()*360);
	let ch = new Character(width, height, initX, initY, color, maxSpeed, maxHP, playable);

	let recharge = Math.floor(Math.random()*9)+50-difficulty;
	let shotColor = "hsl("+color+",40%,40%)";
	let shotType = shotTypes[Math.floor(Math.random()*shotTypes.length)];
	//let radius = Math.floor(Math.random()*2)+difficulty/2 + 2;
	let radius = Math.floor(Math.random()*difficulty/3)+3;
	//let speed = (Math.floor(Math.random()*3)+difficulty/2-1);
	let speed = Math.floor(Math.random()*difficulty/2.5)+2;
	//let damage = Math.floor(Math.random()*8)+difficulty-4;
	let damage = Math.floor(Math.random()*difficulty)+1;
	let params = [];
	if(shotType === "radial"){
		let number = Math.floor(Math.random()*11)+difficulty-4;
		let offsetAngle = Math.random()*2*Math.PI;
		params = [offsetAngle, number, radius, shotColor, speed, damage];
	} else if(shotType === "basic") {
		params = [radius, shotColor, speed, damage];
	}
	//console.log(params);
	ch.shot = new Shot(recharge, shotType, params);
	//ch.shot = new Shot(50, "basic", [10, "green", 15, 10]);

	let targetType = targetTypes[Math.floor(Math.random()*targetTypes.length)];
	let evasionStyle = evasionStyles[Math.floor(Math.random()*evasionStyles.length)];
	let evadeChance = difficulty/100;
	evadeChance = 10*evadeChance/(1+Math.abs(10*evadeChance));
	let shotChance = 1 - Math.random()/(difficulty/2);
//	console.log(ch.shot, shotChance);
	let exR = Math.floor(Math.random()*20*difficulty)+difficulty*20;;
  let itemTargetChance = 0.5 + Math.random()*difficulty/35;
	//let itemTargetChance = 1;
	let damageThreshold = Math.random();
	ch.behavior = new Behavior(targetType, evasionStyle, evadeChance, shotChance, itemTargetChance, damageThreshold, exR);

	return ch;
}

function spawnRandomCharacter(canvas, el, player, radius, difficulty){
	let position = [], dx = 0, dy = 0, dSquared = 0;
	do{
	position = [Math.floor(Math.random()*canvas.width), Math.floor(Math.random()*canvas.height)];
	dx = player.x - position[0];
	dy = player.y - position[1];
	dSquared = dx*dx+dy*dy;
	}while(dSquared < radius*radius);
	let c = randomCharacter(difficulty, position[0], position[1], false);
	c.putSelfInList(el);
}
