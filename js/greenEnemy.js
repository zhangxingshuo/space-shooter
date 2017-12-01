// Constructor
function GreenEnemy(game) {
    this.game = game;
    this.group = null;
    this.defaultYVelocity = 300;
    this.yVelocity = this.defaultYVelocity;
    this.timer = 2000;
    this.defaultSpacing = 4000;
    this.spacing = this.defaultSpacing;
    this.tutorialText = null;
    this.enable = true;
};

// Create method
GreenEnemy.prototype.create = function() {

    // Add enemies
    this.group = this.game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;
    this.group.createMultiple(10, 'enemy-green');
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);
    this.group.setAll('scale.x', 0.5);
    this.group.setAll('scale.y', 0.5);
    this.group.forEach( function(enemy) {
        enemy.damageAmount = 10;
    }, this);

    // Set tutorial text
    this.tutorialText = this.game.add.text(140, 100, 
                        "SCOUT: Fast and unpredictable reconnaisance flier.");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;
};

// Update method
GreenEnemy.prototype.update = function(context) {

    // Display tutorial
    if (context['start']) {
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            this.tutorialText.alpha = 1;
            enemy.reset(100, 100);
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
        this.spacing = this.defaultSpacing - playerLevel * 300;
        this.yVelocity = this.defaultYVelocity + playerLevel * 20;
    }
};

// Launch an enemy
GreenEnemy.prototype.launch = function(context) {
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

        var parent = this;
        enemy.update = function() {
            enemy.angle = -this.game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));

            //  Kill enemies once they go off screen
            if (enemy.y > this.game.height + enemy.height) {
                enemy.kill();
            }
        }
    }
};

// Restart
GreenEnemy.prototype.restart = function() {
    this.group.callAll('kill');
    this.spacing = this.defaultSpacing;
    this.yVelocity = this.defaultYVelocity;
    this.timer = this.game.time.now + this.spacing;
};
