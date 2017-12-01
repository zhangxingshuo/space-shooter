// Constructor
function YellowEnemy(game) {
    this.game = game;
    this.group = null;
    this.bulletPool = null;
    this.yVelocity = 100;
    this.timer = 5000;
    this.defaultSpacing = 20000;
    this.spacing = this.defaultSpacing;
    this.defaultHealth = 5;
    this.health = this.defaultHealth;
    this.defaultNumBullets = 6;
    this.numBullets = this.defaultNumBullets;
    this.tutorialText = null;
    this.exists = false;
    this.enable = true;
};

// Create method
YellowEnemy.prototype.create = function() {

    // Add enemies
    this.group = this.game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;
    this.group.createMultiple(1, 'enemy-yellow');
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);
    this.group.setAll('scale.x', 0.75);
    this.group.setAll('scale.y', 0.75);
    this.group.forEach( function(enemy) {
        enemy.damageAmount = 10;
        enemy.events.onKilled.add(function() {
            this.exists = false;
        }, this);
    }, this);

    // Add bullets
    this.bulletPool = this.game.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'enemy-bullet-alt');
    this.bulletPool.setAll('alpha', 0.9);
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('scale.x', 0.5);
    this.bulletPool.setAll('scale.y', 0.35);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    // Set tutorial text
    this.tutorialText = this.game.add.text(140, 420, 
                        "UFO: Mysterious flier that can unleash hail of bullets.");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;
};

// Update method
YellowEnemy.prototype.update = function(context) {

    // Display tutorial
    if (context['start']) {
        this.timer = this.game.time.now + this.spacing;
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            enemy.scale.x = 0.5;
            enemy.scale.y = 0.5;
            this.tutorialText.alpha = 1;
            enemy.reset(100, 420);
        }
    }
    else {
        this.tutorialText.alpha = 0;
        if (this.game.time.now > this.timer && this.enable && !this.exists) {
            this.launch(context);
            this.exists = true;
            this.timer = this.game.time.now + this.spacing;
        }

        // Scale difficulty
        this.enable = context['player'].level > 7;
    }
};

// Launch an individual enemy
YellowEnemy.prototype.launch = function(context) {
    var enemy = this.group.getFirstExists(false);
    if (enemy) {

        // Randomize final position
        enemy.scale.x = 0.75;
        enemy.scale.y = 0.75;
        var xPos = this.game.rnd.integerInRange(this.game.width / 8, this.game.width * 7 / 8);
        enemy.reset(xPos, -enemy.height);
        enemy.body.velocity.y = this.yVelocity;
        var finalYPos = this.game.rnd.realInRange(this.game.height / 8, this.game.height * 5 / 8);

        var firingDelay = 400;
        enemy.lastShot = 0;
        enemy.numBullets = this.numBullets;
        enemy.health = this.health;

        var parent = this;
        var parentContext = context;
        enemy.update = function() {
            console.log(enemy.health);
            this.angle += 3;

            if (this.y > finalYPos) {
                this.body.velocity.y = 0;
                this.fireBullet();
            }
        }

        // Fire rotating bullets
        enemy.fireBullet = function() {
            if (this.alive &&
                parentContext['player'].sprite.alive && 
                parent['game'].time.now > firingDelay + this.lastShot) {
                
                this.lastShot = parent['game'].time.now;

                var BULLET_SPEED = 200;

                for (var i = 0; i < this.numBullets; i++) {
                    var bullet = parent['bulletPool'].getFirstExists(false);
                    if (bullet) {
                        bullet.reset(this.x, this.y);
                        var spreadAngle = 360 * i / this.numBullets + this.angle;
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
YellowEnemy.prototype.restart = function(context) {
    this.group.callAll('kill');
    this.bulletPool.callAll('kill');
    this.spacing = this.defaultSpacing;
    this.numBullets = this.defaultNumBullets;
    this.health = this.defaultHealth;
    this.timer = this.game.time.now + this.spacing;
};
