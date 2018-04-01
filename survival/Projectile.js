class Projectile{

	constructor(owner, initX, initY, radius, color, xvel, yvel, damage){
		this.owner = owner;

		this.x = initX;
		this.y = initY;

		this.radius = radius;
		this.color = color;

		this.xvel = xvel;
		this.yvel = yvel;
		this.damage = damage;

		this.list = null;
		this.index = -1;
	}

	putSelfInList(list){
		this.list = list;
		this.index = list.length;
		this.list.push(this);
	}

	deleteSelfFromList(){
		//console.log(this.list === projectileList, "deleteSelf");
		this.list.splice(this.index, 1, null);
	}

	draw(context, gameState){
    	context.fillStyle=this.color;
    	context.beginPath();
    	context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    	context.fill();
    	context.closePath();
  	}

  	doKinematics(canvas){
  		//console.log(this.list === projectileList, "kinematics");
		this.x += this.xvel;
		this.y += this.yvel;

		if(this.x < 0 || this.x > canvas.width ||
		this.y < 0 || this.y > canvas.height){
			this.deleteSelfFromList();
		}
	}

	checkCollisions(el){
		//console.log(this.list === projectileList, "collisions");
		for(let entity of el){
			if(entity !== null && entity !== this.owner){
				if(this.x > entity.x-this.radius &&
				this.x < entity.x+entity.width+this.radius &&
				this.y > entity.y-this.radius &&
				this.y < entity.y+entity.height+this.radius){
					entity.hp -= this.damage;
					entity.damageTickTimer = entity.damageTickDuration;
					entity.behavior.lastShooter = this.owner;
					if(entity.hp <= 0){
						entity.deleteSelfFromList();
					}
					this.deleteSelfFromList();
				}
			}
		}
	}

}
