var ACCEL = 1000;
var DRAG = 800;
var MAX_VELOCITY = 400;

// Constructor
function Player(game) {
    this.game = game;
    this.sprite = null;
    this.damageSprite = null;
    this.damageActive = false;
    this.trail = null;
    this.blueBulletPool = null;
    this.greenBulletPool = null;
    this.bulletTimer = 0;
    this.laserSound = null;
    this.fireButton = null;
    this.invincible = false;
    this.invincibleTimer = 50;
    this.level = 1;
    this.maxLevel = 11;
    this.tutorialText = null;
    this.canFire = true;

    this.laserSound = null;
};

// Create method
Player.prototype.create = function() {

    // Add player
    this.sprite = this.game.add.sprite(this.game.width / 2, this.game.height - 100, "player");
    this.sprite.scale.setTo(0.5, 0.5);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.maxVelocity.setTo(MAX_VELOCITY, MAX_VELOCITY);
    this.sprite.body.drag.setTo(DRAG, DRAG);
    this.sprite.health = 100;
    this.sprite.events.onKilled.add(function() {
        this.trail.kill();
    }, this);
    this.sprite.events.onRevived.add(function(){
        this.trail.start(false, 5000, 10);
    }, this);

    // Add damage overlay
    this.damageSprite = this.game.add.sprite(this.game.width / 2, this.game.height - 100, "player-damage");
    this.damageSprite.scale.setTo(0.5, 0.5);
    this.damageSprite.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.damageSprite, Phaser.Physics.ARCADE);
    this.damageSprite.body.collideWorldBounds = true;
    this.damageSprite.body.maxVelocity.setTo(MAX_VELOCITY, MAX_VELOCITY);
    this.damageSprite.body.drag.setTo(DRAG, DRAG);
    this.damageSprite.alpha = 0;

    // Add an emitter for the ship trail
    this.trail = this.game.add.emitter(this.sprite.x, this.sprite.y + this.sprite.height / 2, 400);
    this.trail.width = 10;
    this.trail.makeParticles('blue-bullet');
    this.trail.setXSpeed(30, -30);
    this.trail.setYSpeed(200, 180);
    this.trail.setRotation(50,-50);
    this.trail.setAlpha(1, 0.01, 800);
    this.trail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    this.trail.start(false, 5000, 10);

    // Add normal bullets
    this.blueBulletPool = this.game.add.group();
    this.blueBulletPool.enableBody = true;
    this.blueBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.blueBulletPool.createMultiple(50, 'blue-bullet');
    this.blueBulletPool.setAll('scale.x', 0.5);
    this.blueBulletPool.setAll('scale.y', 0.5);
    this.blueBulletPool.setAll('anchor.x', 0.5);
    this.blueBulletPool.setAll('anchor.y', 1);
    this.blueBulletPool.setAll('outOfBoundsKill', true);
    this.blueBulletPool.setAll('checkWorldBounds', true);

    // Add special penetrating bullets
    this.greenBulletPool = this.game.add.group();
    this.greenBulletPool.enableBody = true;
    this.greenBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.greenBulletPool.createMultiple(50, 'green-bullet');
    this.greenBulletPool.setAll('scale.x', 0.5);
    this.greenBulletPool.setAll('scale.y', 0.5);
    this.greenBulletPool.setAll('anchor.x', 0.5);
    this.greenBulletPool.setAll('anchor.y', 1);
    this.greenBulletPool.setAll('outOfBoundsKill', true);
    this.greenBulletPool.setAll('checkWorldBounds', true);

    // Set tutorial text
    this.tutorialText = this.game.add.text(this.game.width / 2 + this.sprite.width, this.game.height - 100 - this.sprite.height / 2, 
                        "Use the arrow keys to move and SPACE to fire. \nPress SPACE to begin!");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;
    this.laserSound = this.game.add.audio("player-laser");
    this.laserSound.volume *= 0.5;
};

// Update method
Player.prototype.update = function(context) {

    // Display tutorial
    if (context['start']) {
        this.tutorialText.alpha = 1;
        this.trail.on = false;
    }
    else {
        this.tutorialText.alpha = 0;
        this.trail.on = this.sprite.body.velocity.y <= 0;

        // Reset acceleration
        this.sprite.body.acceleration.x = 0;
        this.sprite.body.acceleration.y = 0;

        // Movement keys
        if (context['cursors'].left.isDown) {
            this.sprite.body.acceleration.x = -ACCEL;
        }
        else if (context['cursors'].right.isDown) {
            this.sprite.body.acceleration.x = ACCEL;
        }

        if (context['cursors'].up.isDown) {
            this.sprite.body.acceleration.y = -ACCEL;
        }
        else if (context['cursors'].down.isDown) {
            this.sprite.body.acceleration.y = ACCEL;
        }

        if (context['fireButton'].isDown && this.canFire) {
            this.fireBullet();
        }

        // Squish and rotate ship for illusion of banking
        bank = this.sprite.body.velocity.x / MAX_VELOCITY;
        this.sprite.scale.x = 0.5 - Math.abs(bank) / 15;
        this.sprite.angle = bank * 20;

        this.damageSprite.body.acceleration.x = this.sprite.body.acceleration.x;
        this.damageSprite.body.acceleration.y = this.sprite.body.acceleration.y;

        this.damageSprite.scale.x = 0.5 - Math.abs(bank) / 15;
        this.damageSprite.angle = bank * 20;
        this.damageSprite.alpha = this.damageActive;

        // Display damage if health is below 50
        this.damageActive = this.sprite.health <= 50 && this.sprite.alive;

        // Align ship trail
        this.trail.x = this.sprite.x;
        this.trail.y = this.sprite.y + this.sprite.height / 2;

        if (this.invincible) {
            this.invincibleTimer -= 1;
            if (this.invincibleTimer % 6 == 0) {
                this.sprite.alpha = 1;
                if (this.damageActive) {
                    this.damageSprite.alpha = 1;
                }
            } else {
                this.sprite.alpha = 0;
                if (this.damageActive) {
                    this.damageSprite.alpha = 0;
                }
            }
            if (this.invincibleTimer < 0) {
                this.invincible = false;
                this.invincibleTimer = 50;
                this.sprite.alpha = 1;
            }
        }
    }
};

// Fire bullet in pattern proportional to level
Player.prototype.fireBullet = function() {
    if (this.game.time.now > this.bulletTimer && this.sprite.alive && !this.invincible) {
        
        this.laserSound.play();

        switch (this.level) {

            case 1:
                this.fireSingleBullet(350); // default fire
                break;

            case 2:
                this.fireSingleBullet(100); // rapid fire
                break;

            case 3:
                this.fireSingleBullet(250, -10); // double fire
                this.fireSingleBullet(250, 10);
                break;

            case 4:
                this.fireSpreadBullets(3); // 3-way spread shot
                break;

            case 5:
                for (var i = 0; i < 5; i++) { // quintuple fire
                    this.fireSingleBullet(300, 15*i-30, Math.abs(i-2)*5);
                }
                break;

            case 6:
                this.firePenetratingBullet(150, -10); // double special fire
                this.firePenetratingBullet(150, 10);
                break;

            case 7:
                for (var i = 0; i < 3; i++) { // multiple 3-way spread shot
                    this.fireSpreadBullets(3, 20*i-20, Math.abs(i-1)*10);
                }
                break;

            case 8:
                this.fireSpreadBullets(6); // 6-way spread shot
                break;

            case 9:
                this.fireSpreadBullets(2); // combo bullets
                this.firePenetratingBullet(400);
                break;

            case 10:
                this.fireSpreadBullets(4); // combo bullets
                this.firePenetratingBullet(400, -10);
                this.firePenetratingBullet(400, 10);
                break;

            case 11:
                this.fireSpreadBullets(6); // max combo bullets
                this.firePenetratingBullet(250, -20, 20);
                this.firePenetratingBullet(250);
                this.firePenetratingBullet(250, 20, 20);
                break;
        }
    }
};

// Fire a single normal bullet
Player.prototype.fireSingleBullet = function(spacing, xoffset=0, yoffset=0) {
    var BULLET_SPEED = 600;

    //  Grab the first bullet we can from the pool
    var bullet = this.blueBulletPool.getFirstExists(false);

    if (bullet) {

        // Make bullet come out of tip of ship with right angle
        var bulletOffset = 20 * Math.sin(this.game.math.degToRad(this.sprite.angle));
        bullet.reset(this.sprite.x + bulletOffset + xoffset, this.sprite.y - this.sprite.height / 2 + yoffset);
        bullet.angle = this.sprite.angle;
        this.game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
        bullet.body.velocity.x += this.sprite.body.velocity.x;

        this.bulletTimer = this.game.time.now + spacing;
    }
};

// Fire single normal bullet in a spread pattern
Player.prototype.fireSpreadBullets = function(numBullets, xoffset=0, yoffset=0) {
    var BULLET_SPEED = 600;
    var BULLET_SPACING = Math.min(500, 200 + numBullets*25);

    for (var i = 0; i < numBullets; i++) {
        var bullet = this.blueBulletPool.getFirstExists(false);
        if (bullet) {
            //  Make bullet come out of tip of ship with right angle
            var bulletOffset = 20 * Math.sin(this.game.math.degToRad(this.sprite.angle));
            bullet.reset(this.sprite.x + bulletOffset + xoffset, this.sprite.y - this.sprite.height / 2 + yoffset);
            var spreadAngle = -5*numBullets + 10*numBullets * i / (numBullets - 1);
            bullet.angle = this.sprite.angle + spreadAngle;
            this.game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity);
            bullet.body.velocity.x += this.sprite.body.velocity.x;
        }       
    }
    this.bulletTimer = this.game.time.now + BULLET_SPACING;
};

// Fire special bullet
Player.prototype.firePenetratingBullet = function(spacing, xoffset=0, yoffset=0) {
    var BULLET_SPEED = 600;

    //  Grab the first bullet we can from the pool
    var bullet = this.greenBulletPool.getFirstExists(false);

    if (bullet) {

        // Make bullet come out of tip of ship with right angle
        var bulletOffset = 20 * Math.sin(this.game.math.degToRad(this.sprite.angle));
        bullet.reset(this.sprite.x + bulletOffset + xoffset, this.sprite.y - this.sprite.height / 2 + yoffset);
        bullet.angle = this.sprite.angle;
        this.game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity);
        bullet.body.velocity.x += this.sprite.body.velocity.x;

        this.bulletTimer = this.game.time.now + spacing;
    }
};

Player.prototype.restart = function() {
    //  Revive the player
    this.sprite.revive();
    
    this.sprite.x = this.game.width / 2;
    this.damageSprite.x = this.game.width / 2;
    this.sprite.y = this.game.height - 100;
    this.sprite.health = 100;
    this.sprite.body.velocity.x = 0;
    this.sprite.body.acceleration.x = 0;
    this.invincible = true;
    this.level = 1;
};
