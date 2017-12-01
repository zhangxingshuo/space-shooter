// Constructor
function BlueEnemy(game) {
    this.game = game;
    this.group = null;
    this.bulletPool = null;
    this.timer = 3000;
    this.defaultSpacing = 6000;
    this.spacing = this.defaultSpacing;
    this.defaultYVelocity = 180;
    this.yVelocity = this.defaultYVelocity;
    this.defaultNumEnemies = 5;
    this.numEnemies = this.defaultNumEnemies;
    this.defaultNumBullets = 1;
    this.numBullets = this.defaultNumBullets;
    this.defaultBulletSpacing = 800;
    this.bulletSpacing = this.defaultBulletSpacing;
    this.tutorialText = null;
    this.enable = true;

    this.laserSound = null;
};

// Create method
BlueEnemy.prototype.create = function() {

    // Add bullets
    this.bulletPool = this.game.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(30, 'enemy-bullet');
    this.bulletPool.setAll('alpha', 0.9);
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('scale.x', 0.75);
    this.bulletPool.setAll('scale,y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    // Add enemies
    this.group = this.game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;
    this.group.createMultiple(10, 'enemy-blue');
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);
    this.group.setAll('scale.x', 0.5);
    this.group.setAll('scale.y', 0.5);
    this.group.forEach( function(enemy) {
        enemy.damageAmount = 10;
    }, this);

    // Set tutorial text
    this.tutorialText = this.game.add.text(140, 180, 
                        "FIGHTER: Formation flier that fires bullets.");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;

    this.laserSound = this.game.add.audio("blue-laser");
    this.laserSound.volume *= 0.25;
};

// Update method
BlueEnemy.prototype.update = function(context) {

    // Display tutorial
    if (context['start']) {
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            this.tutorialText.alpha = 1;
            enemy.reset(100, 180);
        }
    }
    else {
        this.tutorialText.alpha = 0;
        if (this.game.time.now > this.timer && this.enable) {
            this.launch(context);
            this.timer = this.game.time.now + this.spacing;
        }

        // Scale difficulty
        var playerLevel = context['player'].level - 1;
        this.numEnemies = this.defaultNumEnemies + playerLevel;
        this.numBullets = this.defaultNumBullets + playerLevel;
        this.yVelocity = this.defaultYVelocity + playerLevel * 20;
        this.spacing = this.defaultSpacing - playerLevel * 100;
        this.bulletSpacing = this.defaultBulletSpacing - playerLevel * 60;
    }
};

// Launch an enemy wave
BlueEnemy.prototype.launch = function(context) {

    // Wave parameters
    var startingX = this.game.rnd.integerInRange(this.game.width / 8, this.game.width * 7 / 8);
    var verticalSpeed = this.yVelocity;
    var spread = 60;
    var frequency = 70;
    var verticalSpacing = 70;
    var numEnemiesInWave = this.numEnemies;

    for (var i = 0; i < numEnemiesInWave; i++) {
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            enemy.reset(startingX, -enemy.height-verticalSpacing * i);
            enemy.body.velocity.y = verticalSpeed;

            //  Set up firing
            var bulletSpeed = 400;
            var firingDelay = this.bulletSpacing;
            enemy.numBullets = this.numBullets;
            enemy.lastShot = 0;

            var parent = this;
            var parentContext = context;

            // Update individual enemies
            enemy.update = function() {
                this.body.x = startingX + Math.sin(this.y / frequency) * spread;
                bank = Math.cos((this.y + 60) / frequency);
                this.scale.x = 0.5 - Math.abs(bank) / 30;
                this.angle = -bank * 5;

                this.fireBullet();

                if (this.y > parent['game'].height + this.height) {
                    this.kill();
                }
            }

            // Fire bullet in direction of player
            enemy.fireBullet = function() {
                var bullet = parent['bulletPool'].getFirstExists(false);
                if (bullet &&
                    this.alive &&
                    parentContext['player'].sprite.alive && 
                    this.numBullets &&
                    this.y > parent['game'].height / 8 &&
                    this.y < parent['game'].height * 5 / 8 && 
                    parent['game'].time.now > firingDelay + this.lastShot) {
                    
                    parent['laserSound'].play();
                    this.lastShot = parent['game'].time.now;
                    this.numBullets--;
                    bullet.reset(this.x, this.y + this.height / 2);
                    bullet.damageAmount = this.damageAmount;
                    var angle = parent['game'].physics.arcade.moveToObject(bullet, parentContext['player'].sprite, bulletSpeed);
                    bullet.angle = 90 + parent['game'].math.radToDeg(angle);
                }
            }
        }
    }
};

// Restart
BlueEnemy.prototype.restart = function() {
    this.group.callAll('kill');
    this.bulletPool.callAll('kill');
    this.spacing = this.defaultSpacing;
    this.yVelocity = this.defaultYVelocity;
    this.numBullets = this.defaultNumBullets;
    this.numEnemies = this.defaultNumEnemies;
    this.bulletSpacing = this.defaultBulletSpacing;
    this.timer = this.game.time.now + this.spacing;
};
