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

var old_game;
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
var breadCrumbs;
var breadCrumbIndex;
var spawnSpeed = 5;
var bombs = [];
var bombIndex = 0;
var breadCrumbWorth = 10;
var scoreMoved = false;
var drawBreadCrumbScore = false;
var nextUpdateTime = new Date();
var menuMusic;
var black_box;
var mad_world_music;
var mad_world_music_finished = false;
var gameOverMockingMessage;
var finalScore;
var handCollectionObject;
var backToMenu;
var replay;
var sadMusic;
var dashTween;
var animChanged = true;
var breadcrumbGiblets = [];
var gameEnd;
var gameStart;
var bombBounce;
var foodBounce;
var biteOne;
var biteTwo;

        function explosionSound(){
          var explosion = new Audio('./assets/explosion.ogg');
          explosion.play();
        }

        function stopSadMusic(){
          jQuery('#mad_world_audio')[0].volume = 0.002;
        }
         
        function getRandomInt(min, max) {
         return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function playSadMusic(){
          var sadMusic = jQuery('#mad_world_audio')[0];
          mad_world_music_finished = false;
          sadMusic.currentTime = 0.3;
          sadMusic.volume = 1;
          jQuery("audio").on("ended", function(){mad_world_music_finished = true;});
          setTimeout(function(sadMusic){
            sadMusic.play();
            recurseControl(sadMusic); 
          },200,sadMusic);
        }
        
        function recurseControl(music){
          if(!mad_world_music_finished){
              if(music.volume >= 0.002){
                fadeout(music,0.002);
              }
          }
        }

        function fadeout(music,volumeDecrement) {
          setTimeout(function(music, volumeDecrement){
            music.volume -= volumeDecrement;
            recurseControl(music); 
          },50,music, volumeDecrement ) 
        }

        function menuPreload(){
          this.load.image('background','./assets/menu.png');
          this.load.audio('menuTheme','./assets/dies_irae_short.ogg');  
          this.load.image('start_button','./assets/start.png');
        }

        function menuCreate(){
          var backgroundImage = this.add.image(0,0,'background').setOrigin(0,0).setScale(0.67);
          menuMusic = this.sound.add('menuTheme');
          menuMusic.play();
          gameStart = this.add.image(675,400,'start_button').setInteractive().setScale(0.3);
          gameStart.on('pointerdown',function(){game.destroy(true);game = new Phaser.Game(gameConfig);});
          gameStart.on('pointerover',function(){gameStart.setScale(0.35)});
          gameStart.on('pointerout',function(){gameStart.setScale(0.3)});

        }

        function menuUpdate(){
          if(menuMusic.seek > 14 && menuMusic.volume > 0){
            var newVolume = menuMusic.volume -= 0.001;
            menuMusic.setVolume(newVolume);
          }
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
          this.load.image('black_box','./assets/black_box.png');
          this.load.spritesheet('tentacle_hand','./assets/tentaclegive1.png',{frameWidth:300,frameHeight:218});
          this.load.spritesheet('hoof_hand','./assets/hoofgive1.png',{frameWidth:300,frameHeight:168});
          this.load.spritesheet('santa_hand','./assets/santagive1.png',{frameWidth:300,frameHeight:201});
          this.load.spritesheet('robot_hand','./assets/robotgive1.png',{frameWidth:300,frameHeight:263});
          this.load.spritesheet('breadcrumbs','./assets/breadcrumbs.png',{frameWidth:50,frameHeight:35});
          this.load.audio('bite_one','./assets/bite1.ogg');
          this.load.audio('bite_two','./assets/bite2.ogg');
          this.load.audio('bomb_bounce','./assets/bombbounce.ogg');
          this.load.audio('food_bounce','./assets/foodbounce.ogg');
          this.load.spritesheet('pigeon_hand','./assets/pigeongive1.png',{frameWidth: 300, frameHeight: 156});
	}

        function create(){

	  foodArray = [
	    'burger',
	    'icecream',
	    'pizza',
	  ];
          
          handCollectionObject = {
            'human_hand': 'human_hand_open',
            'pigeon_hand': 'pigeon_hand_open',
            'hoof_hand': 'hoof_hand_open',
            'santa_hand': 'santa_hand_open',
            'robot_hand': 'robot_hand_open',
          } 
          
          this.anims.create({
            key: 'pigeon_hand_open',
            frames: this.anims.generateFrameNumbers('pigeon_hand',{start: 0, end: 2}),
            frameRate: 10,
            yoyo: true,
          });

          this.anims.create({
            key: 'hoof_hand_open',
            frames: this.anims.generateFrameNumbers('hoof_hand',{start: 0, end: 2}),
            frameRate: 10,
            yoyo: true,
          });
          this.anims.create({
            key: 'santa_hand_open',
            frames: this.anims.generateFrameNumbers('santa_hand',{start: 0, end: 2}),
            frameRate: 10,
            yoyo: true,
          });

          this.anims.create({
            key: 'robot_hand_open',
            frames: this.anims.generateFrameNumbers('robot_hand',{start: 0, end: 2}),
            frameRate: 10,
            yoyo: true,
          });
          
          this.anims.create({
            key: 'tentacle_hand_open',
            frames: this.anims.generateFrameNumbers('tentacle_hand',{start: 0, end: 2}),
            frameRate: 10,
            yoyo: true,
          });
       
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
	  feather = this.add.image((scoreText.width+50),10,'feather').setOrigin(0,0).setScale(0.2);		
	  spawnTime = new Date();
          black_box = this.add.image(0,0,'black_box').setOrigin(0,0).setAlpha(0).setDepth(100);
          survivalTime = this.add.text(250,250,'',{fontSize: '24px',fill:'#FFF', fontWeight: '700'}).setAlpha(0).setDepth(101); 
          gameOverMockingMessage = this.add.text(250,300,'Verdict: git gud',{fontSize: '24px',fill:'#FFF', fontWeight: '700'}).setAlpha(0).setDepth(101);
          finalScore = this.add.text(250,200,'',{fontSize: '24px',fill:'#FFF', fontWeight: '700'}).setAlpha(0).setDepth(102);  
          backToMenu = this.add.text(300,400,'Menu',{fontSize: '32px',fill:'#FFF', fontWeight: '700'}).setAlpha(0).setDepth(102).setInteractive();
          replay = this.add.text(300,450,'Replay',{fontSize: '32px',fill:'#FFF', fontWeight: '700'}).setAlpha(0).setDepth(102).setInteractive();
          gameStart = new Date();
          biteOne = this.sound.add('bite_one');
          biteTwo = this.sound.add('bite_two');
          foodBounce = this.sound.add('food_bounce');
          bombBounce = this.sound.add('bomb_bounce');
          score = 0;
          breadCrumbWorth = 10;
          spawnSpeed = 5;
	}

      function update(){
        
        if(player.isDead){
          if(black_box.alpha < 1){
            black_box.alpha += 0.001
            game.events.emit('blur');
          }
          else if(gameOverMockingMessage.alpha < 1){
            if(finalScore.text === ''){
              finalScore.setText("Your Score: " + score);
              var timeDiff = Math.abs(gameEnd.getTime() - gameStart.getTime());
              var diffSeconds = Math.ceil(timeDiff / (1000)); 
              survivalTime.setText("You survived for " + diffSeconds.toString() + " seconds");
              game.events.emit('focus');           
              replay.on('pointerover',function(){replay.setStyle({fontSize: '32px', fill:'#F00', fontWeight: '700'})});
              replay.on('pointerout',function(){replay.setStyle({fontSize: '32px',fill:'#FFF', fontWeight: '700'})});
              replay.on('pointerdown',function(){stopSadMusic(); game.destroy(true);game = new Phaser.Game(gameConfig);});

              backToMenu.on('pointerover',function(){backToMenu.setStyle({fontSize: '32px', fill:'#F00', fontWeight: '700'})});
              backToMenu.on('pointerout',function(){backToMenu.setStyle({fontSize: '32px',fill:'#FFF', fontWeight: '700'})});
              backToMenu.on('pointerdown',function(){stopSadMusic(); game.destroy(true);game = new Phaser.Game(menuConfig);});

            }
            gameOverMockingMessage.alpha += 0.01;
            finalScore.alpha += 0.01;
            replay.alpha += 0.01;
            backToMenu.alpha += 0.01;
            survivalTime.alpha += 0.01;
          }
          
        }       
 
        currentTime = new Date();        
        
	function collectStar(player,breadCrumb){
         //if(!this.tweens.isTweening(player) && !player.isDead){ 
          if(!player.isDead){
            breadCrumb.disableBody(true,true);
            score += breadCrumbWorth;
            breadCrumbWorth += 10;
            scoreText.setText('Score: ' + score);
            feather.x = scoreText.width + 50;
            gobbleBreadcrumbs(player.x,player.y-10,this);
            playGobbleSound();
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

        function playGobbleSound(){
          var chance = getRandomInt(0,1);
          if(chance){ 
            biteOne.play();
          }
          else{
            biteTwo.play();
          }
        }
        
        function explode(player,bomb){
          if(!this.tweens.isTweening(player)){
            this.add.sprite(bomb.x,bomb.y,'explosion').setFrame(0)
            .play('explode')
            var hitDirection = bomb.body.touching;
            bomb.disableBody(true,true);
            blowPlayerAway(hitDirection);
            explosionSound();
            if(!player.isDead){
              player.isDead = true;
              game.loop._target = 3;
              player.anims.stop();
              game.events.emit('blur');
              game.events.emit('game_finished');
              game.events.removeAllListeners('keyup');
              game.events.removeAllListeners('keypress');
              player.setBounceY(1);
              player.setBounceX(1);
              playSadMusic();
              gameEnd = new Date();
            }
          }
        }

        function blowPlayerAway(hitDirection){
          if(hitDirection.down){
            player.setVelocityY(-900);
          }
          else if(hitDirection.up){
            player.setVelocityY(900);
          }

          if(hitDirection.left){
            player.setVelocityX(-900);
          }
          else if(hitDirection.right){
            player.setVelocityX(900);
          }
          player.setAngularVelocity(1200); 
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
        
        var keys = Object.keys(handCollectionObject);

        var randInt = getRandomInt(0,keys.length -1 ); 
       
        var randHand = keys[randInt]; 

        breadCrumbHand = this_game.add.sprite(breadCrumbHandX,breadCrumbHandY,randHand);

        if(breadCrumbHandAngle < 0.3){
            breadCrumbHand.scaleY = 1;
            var curTween = this_game.tweens.add({
              targets: [breadCrumbHand],
              y: breadCrumbHand.y,
              x: breadCrumbHand.x - 150,
              duration: 700,
              onComplete: function(){
                breadCrumbHand.anims.play(handCollectionObject[randHand]);
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
                breadCrumbHand.anims.play(handCollectionObject[randHand]);
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
                breadCrumbHand.anims.play(handCollectionObject[randHand]);
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

        function gobbleBreadcrumbs(x_coord,y_coord,this_game){
          breadcrumbGiblets.push(this_game.physics.add.group({
            key:'breadcrumbs',
            repeat: getRandomInt(1,3),
            setXY: {x:x_coord, y:y_coord},
          }));

          breadcrumbGiblets[breadcrumbGiblets.length-1].children.iterate(function(child){
            child.setFrame(Phaser.Math.Between(0,2));
            child.setScale(0.3);
            child.setVelocityX(Phaser.Math.FloatBetween(-100,100));
            child.setVelocityY(Phaser.Math.FloatBetween(-200,0));
            child.setAngularVelocity(Phaser.Math.FloatBetween(-50,50));
          });
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
          if(!player.isDead){
	    if(obj1.collisionCount){
              if(obj1.collisionCount > 1){
                return false;
              }
              else{
                if(obj1.texture.key === "food"){
                  foodBounce.play();
                }
                else{
                  bombBounce.play();
                }
                obj1.collisionCount += 1;
              } 
            }
            else{
              if(obj1.texture.key === "food"){
                foodBounce.play();
              }
              else{
                bombBounce.play();
              }
	      obj1.collisionCount = 1;
	      return true;
            }
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
          
          if(spawnSpeed > 1.5 && !player.isDead){
            spawnSpeed -= 0.5;        
          }
          else if(player.isDead){
            spawnSpeed = 10;
          }
	}
/*
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
*/
      if(!player.isDead){

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
        if(cursors.up.isDown && player.body.touching.down){
          player.anims.play('flap',true);
          player.setVelocityY(-530);
        }
      
        if(!animChanged && this.tweens.isTweening(player)){
          if(dashTween.progress > 0.1){
            player.anims.play('dash',true);
            animChanged = true;
          }
        }

	if(canDash && cursors.space.isDown && !this.tweens.isTweening(player)){
	  if(canDash && cursors.right.isDown){
	    if((game.config.width - player.getTopRight().x) >= 250){
	      dashTween = this.tweens.add({
	        targets: [player],
		y: player.body.y,
		x: player.body.x + 250,
		duration: 250,
		callbackScope:this
	      });
	      anim = player.anims.play('flap');
	      canDash = false;
              animChanged = false;
	    }
            else{
              var diffDist = game.config.width - player.body.x;
              dashTween = this.tweens.add({
                targets: [player],
                y: player.body.y,
                x: player.body.x + diffDist,
                duration: diffDist,
                callbackScope:this,
              }); 
            }
              anim = player.anims.play('flap');
              canDash = false;
              animChanged = false;

	  }
	  else if(canDash && cursors.left.isDown){
	    if((player.getTopLeft().x) >= 250){
	      dashTween = this.tweens.add({
	        targets: [player],
	        y: player.body.y,
		x: player.body.x - 250,
		duration: 250,
		callbackScope: this
	      });
	      anim = player.anims.play('flap');
	      canDash = false;
              animChanged = false;
	    }
            else{
              var diffDist = player.body.x;
              dashTween = this.tweens.add({
                targets: [player],
                y: player.body.y,
                x: player.body.x - diffDist,
                duration: diffDist,
                callbackScope:this,
              });
            }
              anim = player.anims.play('flap');
              canDash = false;
              animChanged = false;            
	  }
	  else if(canDash && cursors.up.isDown){
	    dashTween = this.tweens.add({
	      targets: [player],
	      x: player.body.x,
	      y: player.body.y -250,
	      duration: 250,
	      callbackScope: this
	    });
	    canDash = false;
	    anim = player.anims.play('flap');
            animChanged = false;
	  }
	  else if(canDash && cursors.down.isDown){
	    if((game.config.height - player.getBottomLeft().y) >= 350){
	       dashTween = this.tweens.add({
	        targets: [player],
		x: player.body.x,
		y: player.body.y + 250,
		duration: 250,
		callbackScope: this
	      });
	      canDash = false;
	      anim = player.anims.play('flap');
              animChanged = false;
	    }
            else{
              var diffDist = (game.config.height) - (player.body.y + 100);
              dashTween = this.tweens.add({
                targets: [player],
                y: player.body.y + diffDist,
                x: player.body.x,
                duration: diffDist,
                callbackScope:this,
              });
            }
              anim = player.anims.play('flap');
              canDash = false;
              animChanged = false;
	  }	
	  if(!canDash){
	    dashTimer = new Date();
	  }
        }
      
	  if(!featherFading&&!canDash && !this.tweens.isTweening(feather)){
            feather.alpha = 0;
	    featherFading = true;
            var featherFade = this.tweens.add({
              targets: [feather],
              alpha: 1,
              duration: 1000,
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

