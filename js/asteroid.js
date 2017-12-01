// Constructor
function Asteroid(game) {
    this.game = game;
    this.group = null;
    this.chunks = null;
    this.defaultyVelocity = 100;
    this.yVelocity = this.defaultyVelocity;
    this.timer = 2500;
    this.defaultSpacing = 5000;
    this.spacing = this.defaultSpacing;
    this.defaultMinChunks = 4;
    this.minChunks = this.defaultMinChunks;
    this.defaultMaxChunks = 6;
    this.maxChunks = this.defaultMaxChunks;
    this.tutorialText = null;
    this.enable = true;
};

// Create method
Asteroid.prototype.create = function() {

    // Create asteroids
    this.group = this.game.add.group();
    this.group.enableBody = true;
    this.group.physicsBodyType = Phaser.Physics.ARCADE;
    this.group.createMultiple(10, 'asteroid');
    this.group.setAll('anchor.x', 0.5);
    this.group.setAll('anchor.y', 0.5);
    this.group.forEach( function(asteroid) {
        asteroid.damageAmount = 10;
        asteroid.events.onKilled.add( function() {
            this.explode(asteroid);
        }, this);
    }, this);

    // Create asteroid chunks for explosion
    this.chunks = this.game.add.group();
    this.chunks.enableBody = true;
    this.chunks.physicsBodyType = Phaser.Physics.ARCADE;
    this.chunks.createMultiple(30, 'asteroid-chunk');
    this.chunks.setAll('anchor.x', 0.5);
    this.chunks.setAll('anchor.y', 0.5);
    this.chunks.setAll('outOfBoundsKill', true);
    this.chunks.setAll('checkWorldBounds', true);

    // Set tutorial text
    this.tutorialText = this.game.add.text(840, 100, 
                        "ASTEROID: Explodes into chunks on impact.");
    this.tutorialText.font = 'Oxygen';
    this.tutorialText.fill = '#ffffff';
    this.tutorialText.fontSize = 18;
    this.tutorialText.alpha = 0;
};

// Update method
Asteroid.prototype.update = function(context) {

    // Display tutorial
    if (context['start']) {
        var enemy = this.group.getFirstExists(false);
        if (enemy) {
            enemy.scale.x = 0.5;
            enemy.scale.y = 0.5;
            this.tutorialText.alpha = 1;
            enemy.reset(800, 100);
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
        this.spacing = this.defaultSpacing - playerLevel * 125;
        this.minChunks = this.defaultMinChunks + playerLevel / 2;
        this.maxChunks = this.defaultMaxChunks + playerLevel / 2;
    }
};

// Launch an asteroid
Asteroid.prototype.launch = function(context) {
    var asteroid = this.group.getFirstExists(false);
    if (asteroid) {

        // Randomize scale and velocity
        var scaleX = this.game.rnd.realInRange(0.8, 1.2);
        var scaleY = this.game.rnd.realInRange(0.8, 1.2);
        asteroid.scale.x = scaleX;
        asteroid.scale.y = scaleY;
        var xPos = this.game.rnd.integerInRange(this.game.width / 8, this.game.width * 7 / 8);
        asteroid.reset(xPos, -asteroid.height);
        var minVelX = (xPos > this.game.width / 4) ? -this.yVelocity : 0;
        var maxVelX = (xPos < this.game.width * 3 / 4) ? this.yVelocity : 0;
        asteroid.body.velocity.x = this.game.rnd.integerInRange(minVelX, maxVelX);
        asteroid.body.velocity.y = this.yVelocity;

        // Randomize direction of rotation
        var rotation = Phaser.Utils.chanceRoll(0.5) ? this.game.rnd.integerInRange(2, 5) : this.game.rnd.integerInRange(-5, -2);
        var parent = this;
        asteroid.update = function() {
            this.angle += rotation;

            //  Kill asteroid once it goes off screen
            if (this.y > parent['game'].height + this.height) {
                this.kill();
            }
        }
    }
};

// Explode into asteroid chunks
Asteroid.prototype.explode = function(asteroid) {

    // Variable number of chunks
    var numChunks = this.game.rnd.integerInRange(this.minChunks, this.maxChunks);
    for (var i = 0; i < numChunks; i++) {
        var chunk = this.chunks.getFirstExists(false);
        if (chunk) {
            var offset = 20 * Math.sin(this.game.math.degToRad(asteroid.angle));
            chunk.reset(asteroid.x + offset, asteroid.y);
            var scale = this.game.rnd.realInRange(0.4, 0.9);
            chunk.scale.x = scale;
            chunk.scale.y = scale;

            // Spread out in all directions
            var spreadAngle = (-180 + 360 * i / numChunks) + this.game.rnd.realInRange(-180/numChunks, 180/numChunks);
            chunk.angle = spreadAngle;
            var velocity = 1.5 * this.yVelocity / scale;
            this.game.physics.arcade.velocityFromAngle(spreadAngle - 90, velocity, chunk.body.velocity);
            
            chunk.damageAmount = asteroid.damageAmount;
            var rotation = this.game.rnd.integerInRange(-5, 5);
            chunk.update = function () {
                this.angle += rotation;
            }
        }
    }
};

// Restart
Asteroid.prototype.restart = function() {
    this.group.callAll('kill');
    this.chunks.callAll('kill');
    this.yVelocity = this.defaultyVelocity;
    this.minChunks = this.defaultMinChunks;
    this.maxChunks = this.defaultMaxChunks;
    this.spacing = this.defaultSpacing;
    this.timer = this.game.time.now + this.spacing;
};
