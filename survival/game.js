c = document.getElementById("canvas");
let canvasElementStyle = window.getComputedStyle(c);
c.width = parseInt(canvasElementStyle.width);
c.height = parseInt(canvasElementStyle.height);
let f = c.getContext("2d");
var fontSize;
//console.log(c.width);
if(c.width > 900){
	fontSize = 30;
} else if(c.width > 600){
	fontSize = 20;
} else {
	fontSize = 15;
}

var keyList = [];
for(let i=0;i<128;i++){
	keyList.push(false);
}
//keyList is for monitoring button combos for character controls
//Toggleable UI stuff goes in the keydown event
	//(and stuff in the action menu)
window.onkeydown = (event) => {
  let key = event.which || event.charCode || event.keyCode;
  keyList[key] = true;
  if(key === 32){
  	if(gameState === 0 || gameState === 4){
  		difficulty = 5;
		spawnTimer = spawnCountdown = 500;
		minSpawnTimer = 100;
		itemSpawnTimer = itemSpawnCountdown = 250;
		maxItemSpawnTimer = 1000;
		itemSpawnTimerRange = 100;
		getDifficulty = (t) => Math.floor(5 + 20*t/15000);
		spectator = 0;
		entityList = []
		projectileList = [];
		itemList = [];
		nearestCharacters = [];
		controlledCharacter = 0;
		time = 0;
		score = 0;
  		startGame();
  	}
  }
  if(key === 69){ //E
  	if(gameState == 2 && nearestCharacters.length > 0){
			let item = entityList[controlledCharacter].item;
			entityList[controlledCharacter].item = null;
  		entityList[controlledCharacter].playable = false;
  		controlledCharacter = nearestCharacters[0].index;
  		entityList[controlledCharacter].playable = true;
			entityList[controlledCharacter].item = item;
  		gameState = 1;
  	}
  }
  if(key === 83){ //S
  	if(gameState == 2 && nearestCharacters.length > 1){
			let item = entityList[controlledCharacter].item;
			entityList[controlledCharacter].item = null;
  		entityList[controlledCharacter].playable = false;
  		controlledCharacter = nearestCharacters[1].index;
  		entityList[controlledCharacter].playable = true;
			entityList[controlledCharacter].item = item;
  		gameState = 1;
  	}
  }
  if(key === 68){ //D
  	if(gameState == 2 && nearestCharacters.length > 2){
			let item = entityList[controlledCharacter].item;
			entityList[controlledCharacter].item = null;
  		entityList[controlledCharacter].playable = false;
  		controlledCharacter = nearestCharacters[2].index;
  		entityList[controlledCharacter].playable = true;
			entityList[controlledCharacter].item = item;
  		gameState = 1;
  	}
  }
  if(key === 70){ //F
  	if(gameState == 2 && nearestCharacters.length > 3){
			let item = entityList[controlledCharacter].item;
			entityList[controlledCharacter].item = null;
  		entityList[controlledCharacter].playable = false;
  		controlledCharacter = nearestCharacters[3].index;
  		entityList[controlledCharacter].playable = true;
			entityList[controlledCharacter].item = item;
  		gameState = 1;
  	}
  }
  if(key === 67){ //C = use item
  	if(gameState == 2 && entityList[controlledCharacter].item !== null){
  		let e = entityList[controlledCharacter]
  		e.item.effect(e, entityList, projectileList);
  		e.item = null;
  		gameState = 1;

  	}
  }
  if(key === 66){ //B = spectator mode
  	if(gameState == 2){
  		let e = entityList[controlledCharacter]
  		if(spectator === 0){
  			spectator = 1;
  			e.x = NaN;
  		} else {
  			spectator = 0;
  			e.x = 0;
  		}
  		gameState = 1;

  	}
  }
  if(key === 87 && gameState > 0 && gameState < 4){	//W = pause
    gameState = gameState != 3 ? 3 : 1;
  }
  if(key === 90 && gameState > 0  && gameState < 4){ //Z = switch control
    gameState = gameState != 2 ? 2 : 1;
    nearestCharacters = getNearestCharacters();
  }
}

window.onkeyup = (event) => {
  let key = event.which || event.charCode || event.keyCode;
  keyList[key] = false;
}


var difficulty = 5;
const maxDifficulty = 35;
var spawnTimer = spawnCountdown = 500;
var minSpawnTimer = 100;
var itemSpawnTimer = itemSpawnCountdown = 250;
var maxItemSpawnTimer = 1000;
var itemSpawnTimerRange = 100;
var getDifficulty = (t) => Math.floor(5 + 30*t/15000);

var entityList = []
var projectileList = [];
var itemList = [];
var nearestCharacters = [];
var controlledCharacter = 0;

var gameState = 0;
var spectator = 0;
//0 = not started, 1 = normal. 2 = switch control, 3 = pause, 4 = loss

var time = 0;
var score = 0;
var gameLoop = setInterval(gameTick, 20);
//var gameLoop = setInterval(console.log, 20, keyList[32]);
var renderLoop = setInterval(render, 16.7);

function gameTick(){
	switch(gameState){
		case 1:
			itemList = cleanList(itemList);
			for(item of itemList){
				item.list = itemList;
			}
			projectileList = cleanList(projectileList);
			for(projectile of projectileList){
				projectile.list = projectileList;
			}
			entityList = cleanList(entityList);
			for(entity of entityList){
				entity.list = entityList;
			}
			for(let i=0;i<entityList.length;i++){
				if(entityList[i] !== null){
					if(entityList[i].playable === true){
						controlledCharacter = i;
					}
				}
			}
			//console.log(projectileList);

			for(character of entityList){
				if(character !== null){
					if(character.playable === true){
					  controlledCharacter = character.index;
					  character.processControls(projectileList, keyList);
					  //console.log(character.shot);
					} else {
					  character.doCPUAction(c, entityList, projectileList, itemList);
					}
					character.doKinematics(c, keyList);
					character.shot.cooldown();
					if(character.damageTickTimer > 0){
						character.damageTickTimer--;
					}
				} else if(character.index === controlledCharacter){
					gameState = 4;
				}
			}

			for(projectile of projectileList){
				if(projectile != null){
					projectile.doKinematics(c);
					projectile.checkCollisions(entityList);
				}
			}
			for(item of itemList){
				if(item != null){
					item.checkCollisions(entityList);
				}
			}
			//console.log(entityList[0].item);

			time++;
			score = Math.floor(time/50);
			spawnCountdown--;
			itemSpawnCountdown--;
			//console.log(spawnCountdown)
			if(spawnCountdown === 0){
				spawnRandomCharacter(c, entityList, entityList[0], 200-2*difficulty, difficulty);
				if(spawnTimer > minSpawnTimer){
					spawnTimer -= 20;
				}
				spawnCountdown = spawnTimer;
			}
			if(itemSpawnCountdown === 0){
				spawnRandomItem(c, itemList, entityList[0], 200-2*difficulty, difficulty);
				itemSpawnTimer += 50;
				itemSpawnCountdown = itemSpawnTimer-itemSpawnTimerRange/2+Math.floor(Math.random()*itemSpawnTimerRange);
			}
			if(difficulty <= maxDifficulty){
				difficulty = getDifficulty(time);
			}
			if(entityList[controlledCharacter] === null){
				gameState = 4;
			}
			break;
		default:
			break;

	}
}

function render(){
	f.clearRect(0, 0, c.width, c.height);
	if(gameState > 0 && gameState < 4){

		if(gameState === 2){
			f.fillStyle="#CECECE";
			f.fillRect(0, 0, c.width, c.height);
		}
		if(gameState === 3){
			f.globalAlpha = 0.5;
			f.fillStyle="#ABABCD";
			f.fillRect(0,0,c.width, c.height);
			f.globalAlpha = 1;
		}
		for(item of itemList){
			if(item != null){
				item.draw(f);
			}
		}
		for(projectile of projectileList){
			if(projectile != null){
				projectile.draw(f);
			}
		}
		for(character of entityList){
			if(character !== null){
				character.draw(f);
			}
		}

		if(gameState === 2){
			f.lineWidth=2;
			f.lineCap="round";
			f.strokeStyle="navy"
			let str = "ESDF";
			let p = entityList[controlledCharacter];
			for(let i=0;i<nearestCharacters.length;i++){
				let ch = entityList[nearestCharacters[i].index];
				f.beginPath();
				f.moveTo(p.x+p.width/2, p.y+p.height/2);

				let targetX = 0, targetY = 0;
				let dx = ch.x-p.x, dy = ch.y-p.y;
				let angle = Math.atan(dy/dx);
				if(dx < 0){
					angle += Math.PI;
				} else if(dy < 0 && dx === 0){
					angle = -1*Math.PI/2;
				}
				if(angle >= -1*Math.PI/4 && angle <= Math.PI/4){
					targetX = ch.x;
					targetY = ch.y+ch.height/2;
				} else if(angle >= Math.PI/4 && angle <= 3*Math.PI/4){
					targetX = ch.x+ch.width/2;
					targetY = ch.y;
				} else if(angle >= 3*Math.PI/4 && angle <= 5*Math.PI/4){
					targetX = ch.x+ch.width;
					targetY = ch.y+ch.height/2;
				} else {
					targetX = ch.x+ch.width/2;
					targetY = ch.y+ch.height;
				}
				f.lineTo(targetX, targetY);
				f.stroke();
				f.closePath();
				f.font=fontSize+"px Courier New";
				let hue = 120-30*i;
				f.fillStyle="black";
				f.fillText(str.charAt(i), ch.x+2, ch.y+ch.height-2);
			}
			f.fillStyle="steelblue";
			f.fillText("Action", 10, 80);
			if(p.item !== null){
				f.fillStyle="navy";
				f.fillText("Use "+p.item.type+": C", 10, c.height-10);
				f.fillStyle="white";
				f.beginPath();
				f.globalAlpha=0.5;
				f.arc(p.x+p.width/2, p.y+p.height/2, p.item.range, 0, 2*Math.PI);
				f.fill();
				f.globalAlpha=1.0;
				f.closePath();
			}
		}

		f.font=fontSize+"px Courier";
		f.fillStyle="dimgray";
		if(gameState === 2){
			f.fillStyle="black";
		}
		f.fillText("Score: "+score, 10, 40);
		if(gameState === 3){
			f.fillText("Paused", 10, 80);
		}

		f.globalAlpha=0.5;
		f.fillStyle="hsl("+(120-120*(difficulty-5)/(maxDifficulty-5))+",50%,50%)";
		f.fillRect(0, 0, c.width*(difficulty-5)/(maxDifficulty-5), 10);
		f.globalAlpha=1.0;

	}
	if(gameState === 0){
		f.font=fontSize+"px Courier";
		f.fillStyle="red";
		f.fillText("Survival", 100, 100);
		f.fillStyle="black";
		f.fillText("Arrow keys to move", 100, 150);
		f.fillText("Space or V to shoot", 100, 200);
		f.fillText("W to pause", 100, 250);
		f.fillText("Z to enter Action Mode:", 100, 300);
		f.fillText("  -  ESDF to switch characters", 100, 350);
		f.fillText("  -  C to use disruptor item", 100, 400);
		f.fillText("Press space to begin", 100, 500);
	} else if(gameState === 4){
		f.font=fontSize+"px Courier";
		f.fillStyle="black";
		f.fillText("You lost :(", 100, 100);
		f.fillText("Score: "+score, 100, 150);
		f.fillText("Press space to retry", 100, 200);
	}
}

function cleanList(list){
	list = list.filter( (p) => p !== null );
	list = list.filter( (p) => (spectator===0)?( !isNaN(p.x) && !isNaN(p.y) ):true );
	
	for(let i=0;i<list.length;i++){
		list[i].index = i;
	}
	return list;
}

function getNearestCharacters(){

	let p = entityList[controlledCharacter];
	distances = entityList.map( (e) =>
	({
		"dSquared": Math.pow(e.x-p.x,2)+Math.pow(e.y-p.y,2),
		"index": e.index
	})).sort( (a, b) => a.dSquared-b.dSquared );

	distances.shift();
	if(distances.length < 4){
		return distances;
	} else {
		return distances.slice(0,4);
	}

}

function startGame(){
	var player = new Character(20, 60, c.width/2, c.height/2, 0, 5, 20, true);
	player.shot = new Shot(30, "radial", [Math.PI/6, 10, 5, "hsl(0,60%,60%)", 15, 1]);
	player.behavior = new Behavior("player", "nearestBullet", 0.5, 0.5);
	player.putSelfInList(entityList);
	spawnRandomCharacter(c, entityList, entityList[0], 200-2*difficulty, difficulty);
	spawnRandomItem(c, itemList, entityList[0], 200-2*difficulty, difficulty);


/*	var char2 = new Character(20, 60, 0, 0, 120, 5, 20, false);
	char2.shot = new Shot(20, "basic", [5, "gray", 10, 1]);
	char2.behavior = new Behavior("lastShooter", "nearestBullet", 0.5, 0.5);
	char2.putSelfInList(entityList);
	var char3 = new Character(20, 60, 800, 400, 240, 5, 20, false);
	char3.shot = new Shot(60, "basic", [5, "gray", 5, 1]);
	char3.behavior = new Behavior("random", "centerOfDamage", 1, 1, 200);
	char3.putSelfInList(entityList);*/

	gameState = 1;
}
