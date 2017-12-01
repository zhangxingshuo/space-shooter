// Initialize the game instance

window.myGame = window.myGame || {};

(function(Phaser, myGame) {
    var game = new Phaser.Game("100%", "100%", Phaser.AUTO, '', { preload: preload, create: create, update: update });

    //  The Google WebFont Loader will look for this object, so create it before loading the script.
    WebFontConfig = {
        //  'active' means all requested fonts have finished loading
        //  We set a 1 second delay before calling 'createText'.
        //  For some reason if we don't the browser cannot render the text the first time it's created.
        // active: function() { game.time.events.add(Phaser.Timer.SECOND, create, this); },
        active: function() { create },

        //  The Google Fonts we want to load (specify as many as you like in the array)
        google: {
          families: ['Oxygen']
        }
    };

    // Entities
    var player = new Player(game);
    var asteroids = new Asteroid(game);
    var greenEnemies = new GreenEnemy(game);
    var blueEnemies = new BlueEnemy(game);
    var redEnemies = new RedEnemy(game);
    var blackEnemies = new BlackEnemy(game);
    var yellowEnemies = new YellowEnemy(game);
    var powerUps = new PowerUp(game);
    var shields = new Shield(game);

    var physics = new Physics(game, player, asteroids, greenEnemies, blueEnemies, redEnemies, 
                              blackEnemies, yellowEnemies, powerUps, shields);
    var context = new Context(game, physics, player, asteroids, greenEnemies, blueEnemies, 
                              redEnemies, blackEnemies, yellowEnemies, powerUps, shields);

    // Load images from assets
    function preload() {
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

        game.load.image("background", "/assets/background/darkPurple.png");
        game.load.image("player", "/assets/png/playerShip2_blue.png");
        game.load.image("blue-bullet", "/assets/png/lasers/laserBlue02.png");
        game.load.image("green-bullet", "/assets/png/lasers/laserGreen02.png");
        game.load.image("player-damage", "/assets/png/damage/playerShip2_damage2.png");
        game.load.image("enemy-green", "/assets/png/enemies/enemyGreen5.png");
        game.load.image("enemy-blue", "/assets/png/enemies/enemyBlue3.png");
        game.load.image("enemy-red", "/assets/png/enemies/enemyRed1.png");
        game.load.image("enemy-black", "/assets/png/enemies/enemyBlack4.png");
        game.load.image("enemy-yellow", "/assets/png/enemies/ufoYellow.png");
        game.load.image("enemy-bullet", "/assets/png/lasers/laserRed02.png");
        game.load.image("enemy-star", "/assets/png/lasers/laserRed08.png");
        game.load.image("enemy-bullet-alt", "/assets/png/lasers/laserRed16.png");
        game.load.image("enemy-missile", "/assets/png/missiles/missile3.png");
        game.load.image("asteroid", "/assets/png/meteors/meteorBrown_big4.png");
        game.load.image("asteroid-chunk", "/assets/png/meteors/meteorBrown_med1.png");
        game.load.image("power-up", "/assets/png/powerups/bolt_gold.png");
        game.load.image("shield", "/assets/png/powerups/shield_silver.png");
        game.load.spritesheet("explosion", "/assets/png/effects/explosion.png", 16, 16);
        game.load.audio("title-music", "/assets/audio/bgm/Brave Pilots.ogg");
        game.load.audio("bgm", "/assets/audio/bgm/Space Heroes.ogg");
        game.load.audio("death-music", "/assets/audio/bgm/Defeated.ogg");
        game.load.audio("player-laser", "/assets/audio/lasers/player.wav");
        game.load.audio("blue-laser", "/assets/audio/lasers/enemy.wav");
        game.load.audio("explosion-sound", "/assets/audio/explosions/explosion.wav");
        game.load.audio("powerup-sound", "/assets/audio/powerup/powerUp1.mp3");
    };

    // Create entities
    function create() {
        context.create();
        player.create();
        asteroids.create();
        greenEnemies.create();
        blueEnemies.create();
        redEnemies.create();
        blackEnemies.create();
        yellowEnemies.create();
        powerUps.create();
        shields.create();
    };

    // Update entities
    function update() {
        context.update();
        player.update(context);
        asteroids.update(context);
        greenEnemies.update(context);
        blueEnemies.update(context);
        redEnemies.update(context);
        blackEnemies.update(context);
        yellowEnemies.update(context);
        powerUps.update(context);
        shields.update(context);
        physics.update(context);
    };

})(window.Phaser, window.myGame);
