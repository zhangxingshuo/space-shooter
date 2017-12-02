// Constructor
function PowerUp(game) {
    this.game =  game;
    this.group = null;
    this.yVelocity = 150;
    this.timer = 2000;
    this.spacing = 2000;
    this.tutorialText = null;
    this.enable = true;
};

// Create method
PowerUp.prototype.create = function() {

    // Add powerups
    this.group = this.game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;
    this.group.createMultiple(10, 'power-up');
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);

    // Set tutorial text
    this.tutorialText = this.game.add.text(840, 180, 
                        "UPGRADE: Collect to enhance player weapons.");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;
};

// Update method
PowerUp.prototype.update = function(context) {

    // Display tutorial
    if (context['start']){
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            this.tutorialText.alpha = 1;
            enemy.reset(800, 180);
        }
    }
    else {
        this.tutorialText.alpha = 0;
        if (this.game.time.now > this.timer && this.enable) {
            this.launch(context);
            this.timer = this.game.time.now + this.spacing;
        }
    }
};

// Launch single power up
PowerUp.prototype.launch = function(context) {
    var powerup = this.group.getFirstExists(false);
    if (powerup) {

        // Randomize position
        var xPos = this.game.rnd.integerInRange(this.game.width / 8, this.game.width * 7 / 8);
        powerup.reset(xPos, -powerup.height);
        powerup.body.velocity.y = this.yVelocity;

        parent = this;
        powerup.update = function() {

            // Kill if offscreen
            if (this.y > parent['game'].height + this.height) {
                this.kill();
            }
        }
    }
};

// Restart
PowerUp.prototype.restart = function() {
    this.group.callAll('kill');
    this.spacing = 10000;
    this.timer = this.game.time.now + this.spacing;
};