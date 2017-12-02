// Constructor
function BlackEnemy(game) {
    this.game = game;
    this.group = null;
    this.bulletPool = null;
    this.defaultyVelocity = 200;
    this.yVelocity = this.defaultyVelocity;
    this.timer = 10000;
    this.defaultSpacing = 10000;
    this.spacing = this.defaultSpacing;
    this.defaultHealth = 2;
    this.health = this.defaultHealth;
    this.defaultLifetime = 250;
    this.lifetime = this.defaultLifetime;
    this.defaultNumBullets = 1;
    this.numBullets = this.defaultNumBullets;
    this.missileExplosions = null;
    this.tutorialText = null;
    this.enable = true;
};

// Create method
BlackEnemy.prototype.create = function() {

    // Add missiles
    this.bulletPool = this.game.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(30, 'enemy-missile');
    this.bulletPool.setAll('alpha', 0.9);
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('angle', 90);

    // Add enemies
    this.group = this.game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;
    this.group.createMultiple(10, 'enemy-black');
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);
    this.group.setAll('scale.x', 0.5);
    this.group.setAll('scale.y', 0.5);
    this.group.forEach( function(enemy) {
        enemy.damageAmount = 10;
    }, this);

    // Add missile explosions
    this.missileExplosions = this.game.add.group();
    this.missileExplosions.enableBody = true;
    this.missileExplosions.physicsBodyType = Phaser.Physics.ARCADE;
    this.missileExplosions.createMultiple(30, 'explosion');
    this.missileExplosions.setAll('anchor.x', 0.5);
    this.missileExplosions.setAll('anchor.y', 0.5);
    this.missileExplosions.setAll('scale.x', 2);
    this.missileExplosions.setAll('scale.y', 2);
    this.missileExplosions.forEach( function(explosion) {
        explosion.animations.add('explode');
    }, this);

    // Set tutorial text
    this.tutorialText = this.game.add.text(140, 340, 
                        "CARRIER: Ordnance flier that launches homing missiles.");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;
};

// Update method
BlackEnemy.prototype.update = function(context) {
    
    // Display tutorial
    if (context['start']) {
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            this.tutorialText.alpha = 1;
            enemy.reset(100, 340);
        }
    }
    else {
        this.tutorialText.alpha = 0;
        if (this.game.time.now > this.timer && this.enable) {
            this.launch(context);
            this.timer = this.game.time.now + this.spacing;
        }

        if (!context['player'].sprite.alive)  {
            this.bulletPool.callAll('kill');
        }

        // Scale difficulty
        var playerLevel = context['player'].level - 1;
        this.yVelocity = this.defaultyVelocity + playerLevel * 15;
        this.numBullets = this.defaultNumBullets + playerLevel / 3;
        this.health = this.defaultHealth + playerLevel / 5;
        this.lifetime = this.defaultLifetime + playerLevel * 25;
        this.spacing = this.defaultSpacing - playerLevel * 75;

        this.enable = playerLevel > 3;
    }
};

// Explode a missile
BlackEnemy.prototype.explode = function(bullet) {
    var explosion = this.missileExplosions.getFirstExists(false);
    if (explosion) {
        explosion.reset(bullet.body.x, bullet.body.y);
        explosion.body.velocity.y = bullet.body.velocity.y;
        explosion.play('explode', 30, false, true);
    }
};

// Launch an enemy
BlackEnemy.prototype.launch = function(context) {
    var enemy = this.group.getFirstExists(false);
    if (enemy) {
        
        // Randomize position and velocity
        var xPos = this.game.rnd.integerInRange(this.game.width / 8, this.game.width * 7 / 8);
        enemy.reset(xPos, -enemy.height);
        var minVelX = (xPos > this.game.width / 4) ? -300 : 0;
        var maxVelX = (xPos < this.game.width * 3 / 4) ? 300 : 0;
        enemy.body.velocity.x = this.game.rnd.integerInRange(minVelX, maxVelX);
        enemy.body.velocity.y = this.yVelocity;
        enemy.body.drag.x = 100;

        var firingDelay = 150;
        enemy.numBullets = this.numBullets;
        enemy.lastShot = 0;
        enemy.health = this.health;

        var parent = this;
        var parentContext = context;
        enemy.update = function() {
            enemy.angle = -this.game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));

            // Fire missile
            this.fireBullet();

            //  Kill enemies once they go off screen
            if (enemy.y > this.game.height + enemy.height) {
                enemy.kill();
            }
        }

        enemy.fireBullet = function() {
            if (this.alive &&
                parentContext['player'].sprite.alive && 
                this.y > parent['game'].height / 16 &&
                this.y < parent['game'].height * 5 / 8 &&
                this.numBullets > 0 &&
                parent['game'].time.now > firingDelay + this.lastShot) {
                
                this.lastShot = parent['game'].time.now;
                this.numBullets--;

                var bullet = parent['bulletPool'].getFirstExists(false);
                if (bullet) {
                    
                    // Set missile parameters
                    bullet.damageAmount = this.damageAmount;
                    bullet.SPEED = 250;
                    bullet.TURN_RATE = 5;
                    bullet.WOBBLE_LIMIT = 0; 
                    bullet.WOBBLE_SPEED = 250; 
                    bullet.AVOID_DISTANCE = 30;
                    bullet.HOMING_DELAY = 50;
                    bullet.LIFETIME = parent['lifetime'];
                    bullet.angle = 90;

                    bullet.reset(this.x, this.y);
                    var launchVelocity = parent['game'].rnd.realInRange(100, 200);
                    bullet.body.velocity.x = Phaser.Utils.chanceRoll(50) > 0.5 ? launchVelocity : -launchVelocity;
                    var waitTimer = 0; // Wait before homing

                    bullet.wobble = bullet.WOBBLE_LIMIT;
                    parent['game'].add.tween(bullet)
                        .to(
                            { wobble: -bullet.WOBBLE_LIMIT },
                            bullet.WOBBLE_SPEED, Phaser.Easing.Sinusoidal.InOut, true, 0,
                            Number.POSITIVE_INFINITY, true
                        );

                    bullet.update = function() {

                        waitTimer++;
                        if (waitTimer > this.HOMING_DELAY) {

                            // Explode after lifetime expires
                            if (waitTimer > this.LIFETIME && this.alive) {
                                this.kill();
                                parent['explode'](this);
                            }

                            // Calculate angle to turn to
                            var targetAngle = this.game.math.angleBetween(
                                this.x, this.y,
                                parentContext['player'].sprite.x, parentContext['player'].sprite.y
                            );

                            targetAngle += this.game.math.degToRad(this.wobble);

                            var avoidAngle = 0;
                            this.parent.forEachAlive( function(m) {
                                // Don't calculate anything if the other missile is me
                                if (this == m) return;

                                // Already found an avoidAngle so skip the rest
                                if (avoidAngle !== 0) return;

                                // Calculate the distance between me and the other missile
                                var distance = parent['game'].math.distance(this.x, this.y, m.x, m.y);

                                // If the missile is too close...
                                if (distance < this.AVOID_DISTANCE) {
                                    // Chose an avoidance angle of 90 or -90 (in radians)
                                    avoidAngle = Math.PI/2; // zig
                                    if (Phaser.Utils.chanceRoll(50)) avoidAngle *= -1; // zag
                                }
                            }, this);

                            targetAngle += avoidAngle;

                            // Gradually (this.TURN_RATE) aim the missile towards the target angle
                            if (this.rotation + Math.PI/2 !== targetAngle) {
                                // Calculate difference between the current angle and targetAngle
                                var delta = targetAngle - this.rotation;

                                // Keep it in range from -180 to 180 to make the most efficient turns.
                                if (delta > Math.PI) delta -= Math.PI * 2;
                                if (delta < -Math.PI) delta += Math.PI * 2;

                                if (delta > 0) {
                                    // Turn clockwise
                                    this.angle += this.TURN_RATE;
                                } 
                                else {
                                    // Turn counter-clockwise
                                    this.angle -= this.TURN_RATE;
                                }

                                // Just set angle to target angle if they are close
                                if (Math.abs(delta) < this.game.math.degToRad(this.TURN_RATE)) {
                                    this.rotation = targetAngle;
                                }
                            }

                            // Calculate velocity vector based on this.rotation and this.SPEED
                            this.body.velocity.x = Math.cos(this.rotation) * this.SPEED;
                            this.body.velocity.y = Math.sin(this.rotation) * this.SPEED;
                        }
                    }
                }
            }
        }
    }
};

// Restart
BlackEnemy.prototype.restart = function() {
    this.group.callAll('kill');
    this.bulletPool.callAll('kill');
    this.spacing = this.defaultSpacing;
    this.yVelocity = this.defaultyVelocity;
    this.numBullets = this.defaultNumBullets;
    this.health = this.defaultHealth;
    this.lifetime = this.defaultLifetime;
    this.timer = this.game.time.now + this.spacing;
};