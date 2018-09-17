var gameConfig = {
  type: Phaser.AUTO, 
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade:{
      gravity: { y: 700},
      debug: false
    } 
  },
  scene: {
    preload: preload,
    create: create, 
    update: update
  }
}

var menuConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: menuPreload,
    create: menuCreate,
    update: menuUpdate
  }
}


var game = new Phaser.Game(menuConfig);

var cursors;
var score = 0;
var scoreText = '';
var canDash = true;
var featherFading = false;
var dashTimer;
var feather;
var featherTrigger;
var breadCrumbs = [];
var breadCrumbIndex = 0;
var spawnTime;
var platforms;
var nextSpawnTime = new Date();
nextSpawnTime.setSeconds(nextSpawnTime.getSeconds() + 5);
var enableCollider;
var foodArray;
var animationSwitched;
var breadCrumbs;
var breadCrumbIndex;
var spawnSpeed = 5;
var bombs = [];
var bombIndex = 0;
var breadCrumbWorth = 10;
var scoreMoved = false;
var drawBreadCrumbScore = false;
var nextUpdateTime = new Date();

        function menuPreload(){
          this.load.image('background','./assets/menu.png');
        }

        function menuCreate(){
          var backgroundImage = this.add.image(0,0,'background').setOrigin(0,0).setScale(0.67);
          var gameStart = this.add.text(600,300,'Start Game',{fontSize: '32px',fill:'#FFF', fontWeight: '700',backgroundColor: '#000'}).setInteractive();
          gameStart.on('pointerover',function(){gameStart.setStyle({fontSize: '32px',fill:'#F00', fontWeight: '700',backgroundColor: '#000'})});
          gameStart.on('pointerout',function(){gameStart.setStyle({fontSize: '32px',fill:'#FFF', fontWeight: '700',backgroundColor: '#000'})});
          gameStart.on('pointerdown',function(){game.destroy(true);game = new Phaser.Game(gameConfig);});
        }

        function menuUpdate(){
        }

        function preload(){
	  this.load.spritesheet('pigeon','./assets/pigeonsheet_new.png',
	  {frameWidth: 290,frameHeight: 300});
	  this.load.image('sky','./assets/sky.png');
	  this.load.spritesheet('food','./assets/food.png',{frameWidth: 50, frameHeight: 50});
	  this.load.image('burger','./assets/burger.png');
	  this.load.image('icecream','./assets/icecream.png');
	  this.load.image('pizza','./assets/pizza.png');
	  this.load.image('ground', './assets/platform.png');
	  this.load.image('feather','./assets/feather.png');
	  this.load.spritesheet('human_hand','./assets/handgive.png',{frameWidth:300,frameHeight:241});
          this.load.spritesheet('bomb','./assets/bomb1.png',{frameWidth: 65, frameHeight: 71});
          this.load.spritesheet('explosion','./assets/exp1.png',{frameWidth: 173, frameHeight: 189});
	}

        function create(){

	  foodArray = [
	    'burger',
	    'icecream',
	    'pizza',
	  ];
       
          this.anims.create({
            key:'human_hand_open',
            frames: this.anims.generateFrameNumbers('human_hand',{start:0, end: 2}),
            frameRate:10,
            yoyo: true
          });
	
	  this.anims.create({
	    key:'dash',
	    frames: [{key:'pigeon',frame:10}],
	    frameRate: 1,
	    repeat: -1,
	    duration: 300,
	  });

	
	  this.anims.create({
	    key: 'left',
	    frames: this.anims.generateFrameNumbers('pigeon', {start:1, end: 8}),
	    frameRate: 10,
	    repeat: -1
	  });

	  this.anims.create({
	    key: 'flap',
	    frames: [{key:'pigeon',frame: 9}],
	    frameRate: 1,
	    repeat: -1,
	    duration: 300
	  });

	  this.anims.create({
	    key: 'floatLeft',
	    frames: [{key: 'pigeon', frame: 9}],
	    frameRate: 10,
	    repeat: -1
	  });
	
	  this.anims.create({
	    key: 'floatRight',
	    frames: [{key: 'pigeon', frame: 9}],
	    frameRate: 10,
	    repeat: -1
	  });
	
	  this.anims.create({
	    key: 'turn',
            frames: [{key: 'pigeon', frame: 0}],
	    frameRate: 20
	  });
	
	  this.anims.create({
	    key: 'right',
	    frames: this.anims.generateFrameNumbers('pigeon',{start: 1, end: 8}),
	    frameRate: 10,
	    repeat: -1
	  });
          
          this.anims.create({
            key: 'bombFlicker',
            frames: this.anims.generateFrameNumbers('bomb',{start: 0, end: 2}),
            frameRate: 10,
            repeat: -1
          });
 
          this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion',{start:0,end:5}),
            frameRate: 20,
            hideOnComplete: true
          });

	  this.add.image(0,0,'sky').setOrigin(0,0).setScale(2);
	  platforms = this.physics.add.staticGroup();
	  platforms.create(400,568,'ground').setScale(2).refreshBody();	
	  platforms.create(400,400,'ground');
	  platforms.create(50,250,'ground');
	  platforms.create(750,220,'ground');
	  scoreText = this.add.text(16,16,'score:0',{fontSize: '32px',fill:'#000', fontWeight: '700'});
	  player = this.physics.add.sprite(200,45,'pigeon').setSize(70,270);
	  player.setScale(0.2);
	  player.setCollideWorldBounds(true);
	  this.physics.add.collider(player,platforms);
	  cursors = this.input.keyboard.createCursorKeys();
	  feather = this.add.image(220,10,'feather').setOrigin(0,0).setScale(0.5);		
	  spawnTime = new Date();
	}

      function update(){

        currentTime = new Date();        

	function collectStar(player,breadCrumb){
          if(!this.tweens.isTweening(player)){
            breadCrumb.disableBody(true,true);
            score += breadCrumbWorth;
            breadCrumbWorth += 10;
            scoreText.setText('Score: ' + score);
            feather.x = scoreText.width + 30;
            var breadCrumbScore =  this.add.text(breadCrumb.x,breadCrumb.y,breadCrumbWorth-10,{fontSize: '16px',fill:'#000'});
            this.tweens.add({
              targets: [breadCrumbScore],
              duration: 200,
              scaleX: 1.5,
              scaleY: 1.5, 
              onComplete: function(){
                breadCrumbScore.destroy();
              },
         });
             
          }
        }
        
        function explode(player,bomb){
          if(!this.tweens.isTweening(player)){
            this.add.sprite(bomb.x,bomb.y,'explosion').setFrame(0)
            .play('explode')
            bomb.disableBody(true,true);
          }
        }

	function collisionCallback(obj1,obj2){
	}

        function spawnBreadCrumbHand(this_game){
        
          var breadCrumbHand;

          var breadCrumbHandX;
          var breadCrumbHandY;

          var breadCrumbHandAngle = Math.random();

          if(breadCrumbHandAngle < 0.3){
            breadCrumbHandX = 950;
            breadCrumbHandY =  500 * ((Math.random() * 0.9)+0.1);
            if(breadCrumbHandY > 310){
              breadCrumbHandY = 310;
            }
            if(breadCrumbHandY < 200 && breadCrumbHandY > 90){
              breadCrumbHandY = 90;
            }
        }
        else if(breadCrumbHandAngle < 0.6){
            breadCrumbHandY = -150;
            breadCrumbHandX = 700 * ((Math.random() * 0.9)+0.1);
        }
        else{
            breadCrumbHandX = -150;
            breadCrumbHandY =  500 * ((Math.random() * 0.9)+0.1);
            if(breadCrumbHandY > 310){
              breadCrumbHandY = 310;
            }
            if(breadCrumbHandY < 220 && breadCrumbHandY > 70){
              breadCrumbHandY = 70
            }
        }

        breadCrumbHand = this_game.add.sprite(breadCrumbHandX,breadCrumbHandY,'human_hand');

        if(breadCrumbHandAngle < 0.3){
            breadCrumbHand.scaleY = 1;
            var curTween = this_game.tweens.add({
              targets: [breadCrumbHand],
              y: breadCrumbHand.y,
              x: breadCrumbHand.x - 150,
              duration: 700,
              onComplete: function(){
                breadCrumbHand.anims.play('human_hand_open');
                spawnBreadcrumbs(breadCrumbHand.x-100,breadCrumbHand.y+60,this)
              },
              callbackScope:this_game
         });
              this_game.tweens.add({
              targets: [breadCrumbHand],
              y: breadCrumbHand.y,
              x: breadCrumbHand.x + 150,
              duration: 900,
              onComplete: function(){
                breadCrumbHand.destroy();
              },
              callbackScope: this_game,
              delay: 1200
            });
        }
        else if(breadCrumbHandAngle < 0.6){
            breadCrumbHand.setRotation(200);
            breadCrumbHand.scaleY = 1;
            var curTween = this_game.tweens.add({
              targets: [breadCrumbHand],
              y: breadCrumbHand.y + 150,
              x: breadCrumbHand.x,
              duration: 700,
              onComplete: function(){
                breadCrumbHand.anims.play('human_hand_open');
                spawnBreadcrumbs(breadCrumbHand.x+50,breadCrumbHand.y+100,this)
              },
              callbackScope:this_game
            });
              this_game.tweens.add({
              targets: [breadCrumbHand],
              y: breadCrumbHand.y - 150,
              x: breadCrumbHand.x,
              duration: 900,
              callbackScope: this_game,
              onComplete: function(){
                breadCrumbHand.destroy();
              },
              delay: 1200
            });

        }
        else{
            breadCrumbHand.setRotation(280);
            breadCrumbHand.scaleY = -1;
            var curTween = this_game.tweens.add({
              targets: [breadCrumbHand],
              y: breadCrumbHand.y,
              x: breadCrumbHand.x + 150,
              duration: 700,
              onComplete: function(){
                breadCrumbHand.anims.play('human_hand_open');
                spawnBreadcrumbs(breadCrumbHand.x+100,breadCrumbHand.y+80,this)
              },
              callbackScope:this_game
            });
              this_game.tweens.add({
              targets: [breadCrumbHand],
              y: breadCrumbHand.y,
              x: breadCrumbHand.x - 150,
              duration: 900,
              callbackScope: this_game,
              onComplete: function(){
                breadCrumbHand.destroy();
              },
              delay: 1200
            });

         }
        }


        
        function spawnBreadcrumbs(x_coord,y_coord,this_game){

          breadCrumbs[breadCrumbIndex] = this_game.physics.add.group({
            key: 'food',
            repeat: 11,
            setXY: {x:x_coord, y: y_coord}
          });


          breadCrumbs[breadCrumbIndex].children.iterate(function (child){
            child.setFrame(Phaser.Math.Between(0,2));
            child.setScale(0.6);
            child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
            child.setVelocityX(Phaser.Math.FloatBetween(-200,200));
          });

          this_game.physics.add.collider(breadCrumbs[breadCrumbIndex],platforms,collisionCallback,processCallback,this_game);
          
          /*
          for(var i=0;i<breadCrumbIndex;i++){
            if(breadCrumbs[i]!= null){
              this_game.physics.add.collider(breadCrumbs[breadCrumbIndex],breadCrumbs[i]);
            }
          }
          */
          this_game.physics.add.overlap(player,breadCrumbs[breadCrumbIndex],collectStar,null,this_game);
          
          if( (Math.random() / spawnSpeed) > 0.3){
            spawnBombs(x_coord,y_coord,this_game,parseInt(Phaser.Math.FloatBetween(1,4)));
          }
        }

        function spawnBombs(x_coord,y_coord,this_game,num_bombs){
           
          bombs[bombIndex] = this_game.physics.add.group({
            key: 'bomb',
            repeat: num_bombs,
            setXY: {x: x_coord, y: y_coord} 
          }); 
          
          bombs[bombIndex].children.iterate(function (child){
            child.setFrame(0);
            child.setScale(0.4);
            child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
            child.setVelocityX(Phaser.Math.FloatBetween(-200,200));            
            child.play('bombFlicker');
          }); 
          
          this_game.physics.add.collider(bombs[bombIndex],platforms,collisionCallback,processCallback,this_game);  
          
          this_game.physics.add.overlap(player,bombs[bombIndex],explode,null,this_game);  

          bombIndex++;

        }

       
	
	function processCallback(obj1,obj2){
	  if(obj1.collisionCount){
            if(obj1.collisionCount > 1){
              return false;
            }
            else{
              obj1.collisionCount += 1;
            } 
          }
          else{
	    obj1.collisionCount = 1;
	    return true;
          }
	}

	if(!canDash){
	  if(currentTime - dashTimer > 1000){
	  canDash = true;	
          featherFading = false;
	  }
	}
	
	if(currentTime > nextSpawnTime){
        
          spawnBreadCrumbHand(this);
          breadCrumbIndex++;
          nextSpawnTime = new Date();
          nextSpawnTime.setSeconds(nextSpawnTime.getSeconds() + spawnSpeed);
          
          if(spawnSpeed > 1.5){
            spawnSpeed -= 0.5;        
          }
	}

	for(var i = 0; i< breadCrumbIndex; i++){
	  if(breadCrumbs[i]!=null){
	    breadCrumbs[i].children.iterate(function(breadCrumb){
	      if(breadCrumb.x > 800 || breadCrumb.x < 0 || breadCrumb.y > 600){
	        breadCrumb.removeAllListeners();
	        breadCrumb.destroy();
	      }
	    });
          }
	}


        if(!this.tweens.isTweening(player)){ 
	  if(cursors.left.isDown){
            player.setVelocityX(-160);
            player.scaleX = -0.2;
            if(player.body.touching.down){
	      player.anims.play('right',true);
            }
	    else{
	      player.anims.play('floatRight',true);
	    }	 
	 }
	 else if(cursors.right.isDown){
           player.setVelocityX(160);
	   player.scaleX = 0.2;
           if(player.body.touching.down){
	     player.anims.play('right',true);
           }
	   else{
	     player.anims.play('floatRight',true);
	   }	 
	 }
	 else{
           player.setVelocityX(0); 
	   if(!player.body.touching.down){
	     player.anims.play('flap');
	   }
	   else{
	     player.anims.play('turn');
	   }
	 }
	}
	else{
	  //player is tweening
          var tweens = this.tweens.getAllTweens();
	  for(var i = 0;i<tweens.length;i++){
	  if(tweens[i]!=null && tweens[i].duration === 4000 && !animationSwitched){
	    if(tweens[i].elapsed>50){
              player.anims.play('dash');
              animationSwitched = true;
	      }
	    }
          }
	}

	if(cursors.up.isDown && player.body.touching.down){
          player.anims.play('flap',true);
	  player.setVelocityY(-530);
	}

	if(canDash && cursors.space.isDown && !this.tweens.isTweening(player)){
	  animationSwitched = false;
	  if(canDash && cursors.right.isDown){
	    if(game.config.width - player.body.x > 300){
	      this.tweens.add({
	        targets: [player],
		y: player.body.y,
		x: player.body.x + 250,
		duration: 400,
		callbackScope:this
	      });
	      anim = player.anims.play('flap');
	      canDash = false;
	    }
	  }
	  else if(canDash && cursors.left.isDown){
	    if(game.config.width - player.body.x < 500){
	      this.tweens.add({
	        targets: [player],
	        y: player.body.y,
		x: player.body.x - 250,
		duration: 400,
		callbackScope: this
	      });
	      anim = player.anims.play('flap');
	        canDash = false;
	      }
	  }
	  else if(canDash && cursors.up.isDown){
	    this.tweens.add({
	      targets: [player],
	      x: player.body.x,
	      y: player.body.y -250,
	      duration: 400,
	      callbackScope: this
	    });
	    canDash = false;
	    anim = player.anims.play('flap');
	  }
	  else if(canDash && cursors.down.isDown){
	    if(game.config.height - player.body.y > 350){
	      this.tweens.add({
	        targets: [player],
		x: player.body.x,
		y: player.body.y + 250,
		duration: 400,
		callbackScope: this
	      });
	      canDash = false;
	      anim = player.anims.play('flap');
	    }
	  }	
	  if(!canDash){
	    dashTimer = new Date();
	  }
	  if(!featherFading&&!canDash && !this.tweens.isTweening(feather)){
            feather.alpha = 0;
	    featherFading = true;
            var featherFade = this.tweens.add({
              targets: [feather],
              alpha: 1,
              duration: 4000,
              callbackScope: this,
              onComplete: function(){
                var featherWobble = this.tweens.add({
                targets: [feather],
                x: feather.x + 3,
                yoyo: true,
                repeat:1,
                duration: 100
                });
              }
            });
	  }
        }
      }

