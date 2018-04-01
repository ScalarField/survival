const typeArray = ['pulverizer', 'immunity', 'counterstrike'];
class Item{
	constructor(x, y, type, range){
		this.x = x;
		this.y = y;
		this.type = type;
		this.radius = 10;
		//Pulverizer, Immunity, Counterstrike
		this.range = range;

		this.list = null;
		this.index = -1;
	}

	putSelfInList(list){
		this.list = list;
		this.index = list.length;
		this.list.push(this);
	}

	deleteSelfFromList(){
		this.list.splice(this.index, 1, null);
	}

	draw(context){
		let hue = 0;
		switch(typeArray.indexOf(this.type)){
			case 0: hue = 0;
				break;
			case 1:	hue = 120
				break;
			case 2:	hue = 240;
				break;
			default: hue = 180;
				break;
		}
		context.fillStyle="hsl("+hue+",50%,50%)";
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
		context.fill();
		context.closePath();
		switch(typeArray.indexOf(this.type)){
			case 0:
				context.fillStyle="hsl(60,50%,50%)";
				context.beginPath();
				context.arc(this.x, this.y, this.radius*0.6, 0, 2*Math.PI);
				context.fill();
				context.closePath();
				break;
			case 1:
				context.strokeStyle="hsl(200,50%,40%)";
				context.lineWidth=3;
				context.beginPath();
				context.moveTo(this.x-this.radius/2, this.y);
				context.lineTo(this.x+this.radius/2, this.y);
				context.stroke();
				context.closePath();
				break;
			case 2:
				context.fillStyle="hsl(240,50%,80%)";
				context.beginPath();
				context.moveTo(this.x, this.y-this.radius);
				context.lineTo(this.x+this.radius, this.y);
				context.lineTo(this.x, this.y+this.radius);
				context.lineTo(this.x, this.y-this.radius);
				context.fill();
				context.closePath();
				context.fillStyle="hsl(240,50%,70%)";
				context.beginPath();
				context.moveTo(this.x, this.y-this.radius);
				context.lineTo(this.x-this.radius, this.y);
				context.lineTo(this.x, this.y+this.radius);
				context.lineTo(this.x, this.y-this.radius);
				context.fill();
				context.closePath();
				break;
			default:
				break;
		}
	}

	checkCollisions(el){
		for(let entity of el){
			if(entity !== null && entity !== this.owner){
				if(this.x > entity.x-this.radius &&
				this.x < entity.x+entity.width+this.radius &&
				this.y > entity.y-this.radius &&
				this.y < entity.y+entity.height+this.radius){
					entity.item = this;
					this.deleteSelfFromList();
				}
			}
		}
	}

	effect(owner, el, pl){
		//console.log("activated",owner);
		let x = owner.x+owner.width/2, y=  owner.y+owner.height/2;
		switch(typeArray.indexOf(this.type)){
			case 0:
				for(projectile of pl){
					if(projectile !== null){
						let dx = x-projectile.x, dy = y-projectile.y;
						if(projectile.owner != owner && dx*dx+dy*dy <= this.range*this.range){
							projectile.deleteSelfFromList();
						}
					}
				}
				break;
			case 1:
				for(projectile of pl){
					if(projectile !== null){
					let dx = x-projectile.x, dy = y-projectile.y;
						if(projectile.owner != owner && dx*dx+dy*dy <= this.range*this.range){
							projectile.owner = owner;
							projectile.color = owner.color
						}
					}
				}
				break;
			case 2:
				for(projectile of pl){
					if(projectile !== null){
						let Dx = x-projectile.x, Dy = y-projectile.y;
						if(projectile.owner != owner && Dx*Dx+Dy*Dy <= this.range*this.range){
							let dx = projectile.owner.x-projectile.x, dy = projectile.owner.y-projectile.y;
							////////////////////////////////////////////////////
							let angle = Math.atan(dy/dx);
							if(dx < 0){
								angle += Math.PI;
							} else if(dy < 0 && dx === 0){
								angle = -1*Math.PI/2;
							}
							let xv = owner.shot.speed * Math.cos(angle);
							let yv = owner.shot.speed * Math.sin(angle);
							if(dx === 0 && dy === 0){
								xv = owner.shot.speed;
								yv = 0;
								angle = 0;
							}
							projectile.xvel = xv;
							projectile.yvel = yv;
							////////////////////////////////////////////////////
							projectile.owner = owner;
							projectile.color = owner.color
						}
					}
				}
				break;
			default:
				break;
		}
	}

}
function randomItem(difficulty, initX, initY){
	let range = Math.floor(Math.random()*10*difficulty)+(350-10*difficulty);
	let type = typeArray[Math.floor(Math.random()*3)];
	return new Item(initX, initY, type, range);
}

function spawnRandomItem(canvas, il, player, radius, difficulty){
	let position = [], dx = 0, dy = 0, dSquared = 0;
	do{
	position = [Math.floor(Math.random()*canvas.width), Math.floor(Math.random()*canvas.height)];
	dx = player.x - position[0];
	dy = player.y - position[1];
	dSquared = dx*dx+dy*dy;
	}while(dSquared < radius*radius);
	let item = randomItem(difficulty, position[0], position[1]);
	item.putSelfInList(il);
}
