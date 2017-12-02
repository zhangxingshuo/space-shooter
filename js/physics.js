// Constructor
function Physics(game, player, asteroids, greenEnemies, blueEnemies, redEnemies, blackEnemies, 
                 yellowEnemies, powerUps, shields) {
    this.game = game;
    this.player = player;
    this.asteroids = asteroids;
    this.greenEnemies = greenEnemies;
    this.blueEnemies = blueEnemies;
    this.redEnemies = redEnemies;
    this.blackEnemies = blackEnemies;
    this.yellowEnemies = yellowEnemies;
    this.powerUps = powerUps;
    this.shields = shields;
};

// Update method
Physics.prototype.update = function(context) {

    // Calculate collision between player bullets and other entities
    this.game.physics.arcade.overlap(this.asteroids['group'], this.player['blueBulletPool'], 
        this.hitEnemy, null, context);
    this.game.physics.arcade.overlap(this.greenEnemies['group'], this.player['blueBulletPool'], 
        this.hitEnemy, null, context);
    this.game.physics.arcade.overlap(this.blueEnemies['group'], this.player['blueBulletPool'], 
        this.hitEnemy, null, context);
    this.game.physics.arcade.overlap(this.redEnemies['group'], this.player['blueBulletPool'], 
        this.hitEnemy, null, context);
    this.game.physics.arcade.overlap(this.blackEnemies['group'], this.player['blueBulletPool'], 
        this.hitEnemy, null, context);
    this.game.physics.arcade.overlap(this.blackEnemies['bulletPool'], this.player['blueBulletPool'], 
        this.hitEnemy, null, context);
    this.game.physics.arcade.overlap(this.yellowEnemies['group'], this.player['blueBulletPool'], 
        this.hitEnemy, null, context);
    this.game.physics.arcade.overlap(this.asteroids['group'], this.player['greenBulletPool'], 
        this.hitEnemyPass, null, context);
    this.game.physics.arcade.overlap(this.greenEnemies['group'], this.player['greenBulletPool'], 
        this.hitEnemyPass, null, context);
    this.game.physics.arcade.overlap(this.blackEnemies['bulletPool'], this.player['greenBulletPool'], 
        this.hitEnemyPass, null, context);
    this.game.physics.arcade.overlap(this.blueEnemies['group'], this.player['greenBulletPool'], 
        this.hitEnemyPass, null, context);
    this.game.physics.arcade.overlap(this.redEnemies['group'], this.player['greenBulletPool'], 
        this.hitEnemyPass, null, context);
    this.game.physics.arcade.overlap(this.blackEnemies['group'], this.player['greenBulletPool'], 
        this.hitEnemyPass, null, context);
    this.game.physics.arcade.overlap(this.yellowEnemies['group'], this.player['greenBulletPool'], 
        this.hitEnemyPass, null, context);

    // Calculate collisions between entities and player
    this.game.physics.arcade.overlap(this.player['sprite'], this.asteroids['group'], 
        this.collidePlayer, this.collidePlayerTest, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.asteroids['chunks'], 
        this.collidePlayer, this.collidePlayerTest, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.greenEnemies['group'], 
        this.collidePlayer, this.collidePlayerTest, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.blueEnemies['group'], 
        this.collidePlayer, this.collidePlayerTest, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.blueEnemies['bulletPool'], 
        this.hitPlayer, null, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.redEnemies['group'], 
        this.collidePlayer, this.collidePlayerTest, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.redEnemies['bulletPool'], 
        this.hitPlayer, null, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.blackEnemies['group'], 
        this.collidePlayer, this.collidePlayerTest, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.blackEnemies['bulletPool'], 
        this.hitPlayer, null, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.yellowEnemies['group'], 
        this.hitPlayer, null, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.yellowEnemies['bulletPool'], 
        this.hitPlayer, null, context);

    // Calculate collisions between player and power ups
    this.game.physics.arcade.overlap(this.player['sprite'], this.powerUps['group'], 
        this.powerUpPlayer, null, context);
    this.game.physics.arcade.overlap(this.player['sprite'], this.shields['group'], 
        this.shieldPlayer, null, context);
};

// Player hit enemy with bullet
Physics.prototype.hitEnemy = function(enemy, bullet) {
    bullet.kill();
    enemy.health--;
    if (enemy.health == 0) {
        enemy.kill();
        this.chain += 1;
        this.score += enemy.damageAmount * this.multiplier;

        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
        explosion.body.velocity.y = enemy.body.velocity.y;
        explosion.play('explode', 30, false, true);
    }
    else {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(bullet.body.x, bullet.body.y);
        explosion.play('explode', 30, false, true);
    }

    this.explosionSound.play();
};

// Player hit enemy with penetrating bullet
Physics.prototype.hitEnemyPass = function(enemy, bullet) {
    if (enemy.health > 1) {
        bullet.kill();
    }
    enemy.kill();
    this.chain += 1;
    this.score += enemy.damageAmount * this.multiplier;

    var explosion = this.explosions.getFirstExists(false);
    explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
    explosion.body.velocity.y = enemy.body.velocity.y;
    explosion.play('explode', 30, false, true);

    this.explosionSound.play();
};

// Entity collidse with player
Physics.prototype.collidePlayer = function(player, enemy) {
    if (!this.player['invincible']) {
        var explosion = this.explosions.getFirstExists(false);
        
        explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
        explosion.play('explode', 30, false, true);

        enemy.kill();
        player.health = Math.max(player.health - enemy.damageAmount, 0);
        if (player.health <= 0) {
            player.kill();
        }
        this.player['invincible'] = true;
        this.chain = 0;

        this.explosionSound.play();
    }
};

// Enemy bullet hits player
Physics.prototype.hitPlayer = function(player, bullet) {
   if (!this.player['invincible']) {
        var explosion = this.explosions.getFirstExists(false);
        
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.play('explode', 30, false, true);

        bullet.kill();
        player.health = Math.max(player.health - bullet.damageAmount, 0);
        if (player.health <= 0) {
            player.kill();
        }
        this.player['invincible'] = true;
        this.chain = 0;

        this.explosionSound.play();
    }
};

// Player powers up
Physics.prototype.powerUpPlayer = function(player, powerUp) {
    powerUp.kill();

    if (this.player['level'] < this.player['maxLevel'] && this.player['sprite'].alive) {
        this.player['level']++;
        this.powerupSound.play();
    }
};

// Player recovers shields
Physics.prototype.shieldPlayer = function(player, shield) {
    shield.kill();

    player.health = Math.min(100, player.health + 10);
};

// Hit detection
Physics.prototype.collidePlayerTest = function(player, enemy) {
    return true;
};
