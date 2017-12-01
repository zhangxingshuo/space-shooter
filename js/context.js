// Constructor
function Context(game, physics, player, asteroids, greenEnemies, blueEnemies, redEnemies, 
                 blackEnemies, yellowEnemies, powerUps, shields) {
    this.game = game;
    this.background = null;
    this.bgm = null;
    this.cursors = null;
    this.fireButton = null;
    this.score = 0;
    this.scoreText = null;
    this.healthText = null;
    this.explosions = null;
    this.gameOver = null;
    this.player = player;
    this.asteroids = asteroids;
    this.greenEnemies = greenEnemies;
    this.blueEnemies = blueEnemies;
    this.redEnemies = redEnemies;
    this.blackEnemies = blackEnemies;
    this.yellowEnemies = yellowEnemies;
    this.powerUps = powerUps;
    this.shields = shields;
    this.font = 'Oxygen';

    this.titleMusic = null;
    this.bgm = null;
    this.deathMusic = null;

    this.explsionSound = null;
    this.powerupSound = null;

    this.start = false;
    this.tutorialEnd = false;
};

// Create method
Context.prototype.create = function() {

    // Background music and effects
    this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
    this.bgm = this.game.add.audio("bgm");
    this.deathMusic = this.game.add.audio("death-music");
    this.titleMusic = this.game.add.audio("title-music");
    this.titleMusic.loopFull();
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Display
    this.scoreText = this.game.add.text(this.game.width / 16, 10, 'Score : ' + '0'.repeat(8));
    this.scoreText.font = this.font;
    this.scoreText.fill = '#ffffff';
    this.healthText = this.game.add.text(this.game.width * 15 / 16, 10, 'Health : ' + 100);
    this.healthText.font = this.font;
    this.healthText.fill = '#ffffff';
    this.healthText.x -= this.healthText.width;
    this.gameOver = this.game.add.text(this.game.width / 2, this.game.height / 2, 'GAME OVER');
    this.gameOver.font = this.font;
    this.gameOver.fill = '#ffffff';
    this.gameOver.y -= this.gameOver.height / 2;
    this.gameOver.x -= this.gameOver.width / 2;
    this.gameOver.visible = false;

    //  An explosion pool
    this.explosions = this.game.add.group();
    this.explosions.enableBody = true;
    this.explosions.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosions.createMultiple(30, 'explosion');
    this.explosions.setAll('anchor.x', 0.5);
    this.explosions.setAll('anchor.y', 0.5);
    this.explosions.setAll('scale.x', 2);
    this.explosions.setAll('scale.y', 2);
    this.explosions.forEach( function(explosion) {
        explosion.animations.add('explode');
    }, this);

    this.explosionSound = this.game.add.audio("explosion-sound");
    this.powerupSound = this.game.add.audio("powerup-sound");
    this.powerupSound.volume *= 1.5;

    // Begin tutorial
    this.start = true;
};

Context.prototype.update = function() {
    if (this.start) {
        this.player['canFire'] = false;
        if (this.fireButton.isDown) {
            this.start = false;
            this.tutorialEnd = true;
            this.titleMusic.stop();
            this.bgm.loopFull();
        }
    }
    else {
        if (this.tutorialEnd) {
            this.restart();
            this.tutorialEnd = false;
        }

        this.player['canFire'] = true;
        this.background.tilePosition.y += 2;
        this.bringToTop();

        this.scoreText.setText('Score : ' + '0'.repeat(8 - this.score.toString().length) + this.score);
        this.healthText.setText('Health : ' + this.player['sprite'].health);

        // Game over
        if (!this.player['sprite'].alive && this.gameOver.visible == false) {
            this.bgm.stop();
            this.deathMusic.play();
            this.gameOver.visible = true;
            this.gameOver.alpha = 0;
            var fadeInGameOver = this.game.add.tween(this.gameOver);
            fadeInGameOver.to({alpha: 1}, 1, Phaser.Easing.Quintic.Out);
            fadeInGameOver.onComplete.add(this.setResetHandlers, this);
            fadeInGameOver.start();
        }
    }
};

// Reset button
Context.prototype.setResetHandlers = function() {
    var spaceRestart = this.fireButton.onDown.addOnce(_restart, this);
    function _restart() {
      spaceRestart.detach();
      this.restart();
    }
};

// Call reset on all objects
Context.prototype.restart = function() {
    this.gameOver.visible = false;
    this.score = 0;
    this.deathMusic.stop();
    this.bgm.loopFull();
    this.greenEnemies.restart();
    this.blueEnemies.restart();
    this.redEnemies.restart();
    this.blackEnemies.restart();
    this.yellowEnemies.restart();
    this.asteroids.restart();
    this.powerUps.restart();
    this.shields.restart();
    this.player.restart();
};

// Display groups on top
Context.prototype.bringToTop = function() {
    this.game.world.bringToTop(this.yellowEnemies['group']);
    this.game.world.bringToTop(this.explosions);
    this.game.world.bringToTop(this.scoreText);
    this.game.world.bringToTop(this.gameOver);
    this.game.world.bringToTop(this.healthText);
};
