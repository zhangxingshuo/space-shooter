// Constructor
function RedEnemy(game) {
    this.game = game;
    this.group = null;
    this.bulletPool = null;
    this.defaultyVelocity = 250;
    this.yVelocity = this.defaultyVelocity;
    this.deceleration = -300;
    this.timer = 4500;
    this.defaultSpacing = 9000;
    this.spacing = this.defaultSpacing;
    this.defaultHealth = 2;
    this.health = this.defaultHealth;
    this.defaultNumBullets = 3;
    this.numBullets = this.defaultNumBullets;
    this.tutorialText = null;
    this.enable = true;
};

// Create method
RedEnemy.prototype.create = function() {

    // Add bullets
    this.bulletPool = this.game.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(30, 'enemy-star');
    this.bulletPool.setAll('alpha', 0.9);
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('scale.x', 0.5);
    this.bulletPool.setAll('scale.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    // Add enemies
    this.group = this.game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;
    this.group.createMultiple(10, 'enemy-red');
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);
    this.group.setAll('scale.x', 0.5);
    this.group.setAll('scale.y', 0.5);
    this.group.forEach( function(enemy) {
        enemy.damageAmount = 10;
    }, this);

    // Set tutorial text
    this.tutorialText = this.game.add.text(140, 260, 
                        "BOMBER: Fires spread of projectiles in bombing runs.");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;
};

// Update method
RedEnemy.prototype.update = function(context) {

    // Display tutorial
    if (context['start']) {
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            this.tutorialText.alpha = 1;
            enemy.reset(100, 260);
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
        this.yVelocity = this.defaultyVelocity + playerLevel * 20;
        this.deceleration = -this.yVelocity * 2 + 200;
        this.health = this.defaultHealth + playerLevel / 4;
        this.spacing = this.defaultSpacing - playerLevel * 100;

        this.enable = playerLevel > 2;
    }
};

// Launch single enemy
RedEnemy.prototype.launch = function(context) {
    var enemy = this.group.getFirstExists(false);
    if (enemy) {

        // Randomize position
        var xPos = this.game.rnd.integerInRange(this.game.width / 8, this.game.width * 7 / 8);
        enemy.reset(xPos, -enemy.height);
        enemy.body.velocity.y = this.yVelocity;
        enemy.body.maxVelocity.y = this.yVelocity;

        var firingDelay = 1000 - (this.numBullets - 3) * 200;
        enemy.lastShot = 0;
        enemy.numBullets = this.numBullets;
        enemy.health = this.health;

        var parent = this;
        var parentContext = context;
        var deceleration = this.deceleration;
        var stoppingDistance = this.game.height * this.game.rnd.realInRange(0.5, 0.8);

        // Reverse after a certain distance
        enemy.update = function() {
            if (this.y > stoppingDistance) {
                this.turn();
            }
            
            this.fireBullet();

            if (this.y < -this.height) {
                this.kill();
            }
        }

        enemy.turn = function() {
            this.body.acceleration.y = deceleration;
        }

        enemy.fireBullet = function() {
            if (this.alive &&
                parentContext['player'].sprite.alive && 
                this.y > parent['game'].height / 8 &&
                this.y < parent['game'].height * 7 / 8 &&
                parent['game'].time.now > firingDelay + this.lastShot) {
                
                this.lastShot = parent['game'].time.now;

                var BULLET_SPEED = 100 + parent['yVelocity'];

                // Fire bullets in spread pattern
                for (var i = 0; i < this.numBullets; i++) {
                    var bullet = parent['bulletPool'].getFirstExists(false);
                    if (bullet) {
                        bullet.reset(this.x, this.y);
                        var spreadAngle = -20 + 40 * i / (this.numBullets - 1);
                        bullet.angle = spreadAngle;
                        parent['game'].physics.arcade.velocityFromAngle(spreadAngle - 90, -BULLET_SPEED, bullet.body.velocity);
                        bullet.damageAmount = this.damageAmount;
                    }
                }
            }
        }
    }
};

// Restart
RedEnemy.prototype.restart = function() {
    this.group.callAll('kill');
    this.bulletPool.callAll('kill');
    this.yVelocity = this.defaultyVelocity;
    this.health = this.defaultHealth;
    this.numBullets = this.defaultNumBullets;
    this.spacing = this.defaultSpacing;
    this.timer = this.game.time.now + this.spacing;
};
