

var game;

$(document).ready(function(){

var gameConfig = {
	width: 480,
	height: 640,
	backgroundColor: 0xff0000
}

game = new Phaser.Game(gameConfig);
window.focus();
resizeGame();
window.addEventListener("resize", resizeGame);

});


function resizeGame(){
	var canvas = document.querySelector("canvas");
	var windowRatio = window.innerWidth / window.innerHeight;
	var gameRatio = game.config.width / game.config.height;
	if(windowRatio < gameRatio){
		canvas.style.width = window.innerWidth + "px";
		canvas.style.height = (window.innerWidth / gameRatio) + "px";
	}
	else{
		canvas.style.width = (window.innerWidth * gameRatio) + "px";
		canvas.style.height = window.innerHeight + "px";
	} 
}

