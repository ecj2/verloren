function main() {

  if (!Momo.initialize() || !Momo.setCanvas("game", screen_width, screen_height)) {

    displayError("A critical error has occurred!");
  }

  context = Momo.getCanvasContext();

  let i = sector_lower_limit;

  for (i; i < sector_upper_limit; ++i) {

    sector[i] = [];

    let j = sector_lower_limit;

    for (j; j < sector_upper_limit; ++j) {

      sector[i][j] = false;
    }
  }

  Momo.setFrameRate(60);

  Momo.installKeyboard();

  loadResources();

  Momo.resourcesLoaded(

    () => {

      createEventListeners();

      Momo.createLoop(

        () => {

          update();

          render();
        }
      );
    }
  );
}

function update() {

  switch (state) {

    case INTRO:

      if (Momo.isKeyPressed("enter")) {

        state = GAME;
      }
    break;

    case GAME:

      if (ftl_engine_main === 100) {

        ready_to_use_ftl = true;
      }

      if (ready_to_use_ftl && Momo.isKeyPressed("enter")) {

        engage_ftl = true;

        bigger_shake = true;

        let a = 0.0;

        while (a < Math.PI * 2) {

          a += Math.PI / 4;

          bullets[bullet_identifier] = new Bullet(Ship.getX(), Ship.getY(), a, bullet_identifier, 2);

          ++bullet_identifier;
        }
      }

      if (engage_ftl) {

        fade_ticks += 1;

        if (fade_ticks >= 254) {

          state = WIN;

          fade_ticks = 0;
        }

        Ship.applyThrust();
      }

      if (ftl_engine_main < 100) {

        ++ftl_engine_sub;

        if (ftl_engine_sub > 49) {

          ftl_engine_sub = 0;

          ++ftl_engine_main;
        }
      }

      if (!engage_ftl) {

        if (Momo.isKeyDown("a")) {

          Ship.rotateLeft();
        }
        else if (Momo.isKeyDown("d")) {

          Ship.rotateRight();
        }

        if (Momo.isKeyDown("w")) {

          Ship.applyThrust();
        }

        if (Momo.isKeyPressed("space")) {

          Ship.ejectFuel();
        }
      }

      Ship.update();

      updateEnemies();

      updateBullets();

      Camera.follow(Ship.getX(), Ship.getY());

      if (Ship.isAccelerating()) {

        shake_angle += 0.5;

        shake_x += Math.sin(shake_angle) * shake_length;
        shake_y += -Math.cos(shake_angle) * shake_length;
      }

      if (bigger_shake) {

        shake_angle += 0.5;

        bigger_shake_x += Math.sin(shake_angle) * bigger_shake_length;
        bigger_shake_y += -Math.cos(shake_angle) * bigger_shake_length;

        if (shake_ticks > 30) {

          shake_ticks = 0;

          bigger_shake = false;

          bigger_shake_x = 0.0;
          bigger_shake_y = 0.0;
        }

        ++shake_ticks;
      }

      let sector_x = 0;
      let sector_y = 0;

      if (Ship.getX() < 0) {

        sector_x = (Camera.getX() - Momo.getCanvasWidth()) / Momo.getCanvasWidth() | 0;
      }
      else {

        sector_x = (Camera.getX() + Momo.getCanvasWidth()) / Momo.getCanvasWidth() | 0;
      }

      if (Ship.getY() < 0) {

        sector_y = (Camera.getY() - Momo.getCanvasHeight()) / Momo.getCanvasHeight() | 0;
      }
      else {

        sector_y = (Camera.getY() + Momo.getCanvasHeight()) / Momo.getCanvasHeight() | 0;
      }

      // Add stars to nearby sectors (if applicable).
      checkSector(sector_x, sector_y);
      checkSector(sector_x + 1, sector_y);
      checkSector(sector_x - 1, sector_y);
      checkSector(sector_x, sector_y + 1);
      checkSector(sector_x, sector_y - 1);
      checkSector(sector_x + 1, sector_y + 1);
      checkSector(sector_x + 1, sector_y - 1);
      checkSector(sector_x - 1, sector_y + 1);
      checkSector(sector_x - 1, sector_y - 1);
    break;

    case WIN:

      if (fade_ticks < 255) {

        fade_ticks += 3;
      }

      if (Momo.isKeyPressed("enter")) {

        reset();
      }
    break;

    case LOSE:

      if (Momo.isKeyPressed("enter")) {

        reset();
      }
    break;
  }
}

function reset() {

  state = 0;

  bullets = [];
  enemies = [];

  Ship.setup();

  ftl_engine_sub = 0;
  ftl_engine_main = 0;

  ready_to_use_ftl = false;

  bigger_shake = false;

  engage_ftl = false;

  fade_ticks = 0;

  enemies_defeated = 0;

  enemies_suicided = 0;
}

function addStars(offset_x, offset_y) {

  let i = 0;

  for (i; i < 100; ++i) {

    // Create 100 stars per sector.

    let x = (10 * getRandomNumber()) % Momo.getCanvasWidth();
    let y = (10 * getRandomNumber()) % Momo.getCanvasHeight();

    x += offset_x;
    y += offset_y;

    stars[stars.length] = new Star(x, y);
  }
}

function checkSector(x, y) {

  if (x < sector_lower_limit || y < sector_lower_limit) {

    return;
  }

  if (x > sector_upper_limit - 1 || y > sector_upper_limit - 1) {

    return;
  }

  if (sector[x][y] === false) {

    sector[x][y] = true;

    addStars(Momo.getCanvasWidth() * x, Momo.getCanvasHeight() * y);
  }
}

function updateBullets() {

  bullets.forEach(

    (value, index) => {

      bullets[index].update();
    }
  );
}

function updateEnemies() {

  if (engage_ftl) {

    return;
  }

  let ship_x = Ship.getX();
  let ship_y = Ship.getY();

  let ship_radius = Ship.getRadius();

  let number_of_enemies = 0;

  enemies.forEach(

    (value, index) => {

      if (enemies[index].isActive()) {

        ++number_of_enemies;
      }
    }
  );

  if (number_of_enemies === 0) {

    let enemy_x = 0.0;
    let enemy_y = 0.0;

    if (getRandomNumber() % 2) {

      enemy_x = ship_x - Momo.getCanvasWidth();
    }
    else {

      enemy_x = ship_x + Momo.getCanvasWidth();
    }

    if (getRandomNumber() % 2) {

      enemy_y = ship_y - Momo.getCanvasHeight();
    }
    else {

      enemy_y = ship_y + Momo.getCanvasHeight();
    }

    // Spawn a new enemy near the player.
    enemies[enemy_identifier] = new Enemy(enemy_x, enemy_y, enemy_identifier);

    ++enemy_identifier;
  }

  enemies.forEach(

    (value, index) => {

      enemies[index].update(ship_x, ship_y, ship_radius);

      let distance = 999;

      bullets.forEach(

        (value, index_2) => {

          if (bullets[index_2].getType() === 0) {

            let distance = Math.sqrt(

              Math.pow(bullets[index_2].getX() - enemies[index].getX(), 2) + Math.pow(bullets[index_2].getY() - enemies[index].getY(), 2)
            );

            if (distance < bullets[index_2].getRadius() * 4) {

              bullets[index_2].setTicks(0);

              enemies[index].destroy();

              ++enemies_defeated;
            }
          }
        }
      );

      distance = Math.sqrt(Math.pow(enemies[index].getX() - ship_x, 2) + Math.pow(enemies[index].getY() - ship_y, 2));

      if (distance < Ship.getRadius() / 1.5) {

        Ship.inflictDamage(5);

        enemies[index].destroy();

        ++enemies_suicided;
      }
    }
  );
}

function render() {

  let offset_x = Momo.getCanvasWidth() / 2 - screen_width / 2;
  let offset_y = Momo.getCanvasHeight() / 2 - screen_height / 2;

  switch (state) {

    case INTRO:

      Momo.clearCanvas(Momo.makeColor(0, 0, 0));

      let text = [

        "REPORT:",
        "- You are lost in space",
        "- Kamikaze vessels are hot on your tail",
        "- Your ship's weaponry is non-operational",
        "",
        "OBJECTIVE:",
        "- Survive until your FTL drive is repaired",
        "",
        "INSTRUCTIONS:",
        "- Steer with \"A\" and \"D\"",
        "- Engage thruster with \"W\"",
        "- Eject fuel as projectiles with \"SPACE\""
      ];

      let i = 0;

      for (i; i < text.length; ++i) {

        Momo.drawText(

          pixel,

          Momo.makeColor(255, 255, 255),

          16,

          offset_x + 8,

          offset_y + 8 + (24 * i),

          "left",

          text[i]
        );
      }

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 0, 0),

        16,

        offset_x + 182,

        offset_y + 32,

        "left",

        "lost"
      );

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 0, 0),

        16,

        offset_x + 8,

        offset_y + 8 + 24 * 13,

        "left",

        "Press \"ENTER\" to continue."
      );
    break;

    case GAME:

      if (!engage_ftl) {

        Momo.clearCanvas(Momo.makeColor(0, 0, 0));
      }

      if (Ship.isAccelerating()) {

        // Start shaking the screen.

        context.save();

        context.translate(shake_x, shake_y);
      }

      if (bigger_shake) {

        context.save();

        context.translate(bigger_shake_x, bigger_shake_y);
      }

      renderStars();

      renderEnemies();

      renderBullets();

      Ship.render(Camera.getX(), Camera.getY());

      if (Ship.isAccelerating()) {

        // Stop shaking the screen.
        context.restore();
      }

      if (bigger_shake) {

        context.restore();
      }

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 255, 255),

        16,

        8,

        8,

        "left",

        "Energy: " + (Ship.getEnergy() | 0) + "%"
      );

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 255, 255),

        16,

        Momo.getCanvasWidth() - 8,

        8,

        "right",

        "Fuel: " + Ship.getFuel() + "%"
      );

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 255, 255),

        16,

        Momo.getCanvasWidth() / 2,

        8,

        "center",

        "FTL: " + ftl_engine_main + "%"
      );

      if (ready_to_use_ftl && !engage_ftl) {

        Momo.drawText(

          pixel,

          Momo.makeColor(255, 255, 0),

          16,

          Momo.getCanvasWidth() / 2,

          Momo.getCanvasHeight() - 24,

          "center",

          "FTL is ready! press \"ENTER\" to engage!"
        );
      }

      if (engage_ftl) {

        Momo.drawFilledRectangle(

          0,

          0,

          Momo.getCanvasWidth(),

          Momo.getCanvasHeight(),

          Momo.makeColor(255, 255, 255, fade_ticks)
        );
      }
    break;

    case WIN:

      Momo.clearCanvas(Momo.makeColor(0, 0, 0));

      let final_score = 0;

      final_score += Ship.getFuel() * 60;
      final_score += -(enemies_suicided * 20);
      final_score += enemies_defeated * 100;
      final_score += Ship.getEnergy() * 50;

      let win_text = [

        "Your FTL drive repaired itself, and you made",
        "a speedy getaway. God willing, you should",
        "return home safely...",
        "",
        "",
        "",
        "SCORE:",
        "- Fuel remaining: " + Ship.getFuel() + " * 60 = " + Ship.getFuel() * 60,
        "- Enemies suicided: " + enemies_suicided + " * -20 = " + -(enemies_suicided * 20),
        "- Enemies defeated: " + enemies_defeated + " * 100 = " + (enemies_defeated * 100),
        "- Energy remaining: " + Ship.getEnergy() + " * 50 = " + Ship.getEnergy() * 50,
        "",
        "Final score: " + final_score
      ];

      let win_index = 0;

      for (win_index; win_index < win_text.length; ++win_index) {

        Momo.drawText(

          pixel,

          Momo.makeColor(255, 255, 255),

          16,

          offset_x + 8,

          offset_y + 8 + (24 * win_index),

          "left",

          win_text[win_index]
        );
      }

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 0, 0),

        16,

        offset_x + 592,

        offset_y + 32,

        "left",

        "should"
      );

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 0, 0),

        16,

        offset_x + 8,

        offset_y + 8 + (24 * 4),

        "left",

        "You are no longer lost."
      );

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 0, 0),

        16,

        offset_x + 8,

        offset_y + 8 + (24 * 14),

        "left",

        "Press \"ENTER\" to play again."
      );

      Momo.drawFilledRectangle(

        0,

        0,

        Momo.getCanvasWidth(),

        Momo.getCanvasHeight(),

        Momo.makeColor(255, 255, 255, 255 - fade_ticks)
      );
    break;

    case LOSE:

      Momo.clearCanvas(Momo.makeColor(0, 0, 0));

      let lose_text = [

        "",
        "",
        "Your rigid, lifeless corpse shall be carried",
        "atop the currents of the cosmos until time",
        "itself comes to an end..."
      ];

      let index = 0;

      for (index; index < lose_text.length; ++index) {

        Momo.drawText(

          pixel,

          Momo.makeColor(255, 255, 255),

          16,

          offset_x + 8,

          offset_y + 8 + (24 * index),

          "left",

          lose_text[index]
        );
      }

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 0, 0),

        16,

        offset_x + 8,

        offset_y + 8,

        "left",

        "You have died."
      );

      Momo.drawText(

        pixel,

        Momo.makeColor(255, 0, 0),

        16,

        offset_x + 8,

        offset_y + 8 + (24 * 6),

        "left",

        "Press \"ENTER\" to play again."
      );
    break;
  }
}

function renderStars() {

  let i = 0;

  for (i; i < stars.length; ++i) {

    stars[i].render(Camera.getX(), Camera.getY());
  }
}

function renderBullets() {

  bullets.forEach(

    (value, index) => {

      bullets[index].render(Camera.getX(), Camera.getY());
    }
  );
}

function renderEnemies() {

  enemies.forEach(

    (value, index) => {

      enemies[index].render(Camera.getX(), Camera.getY());
    }
  );
}

function loadResources() {

  pixel = Momo.loadFont("data/woff/pixel.woff");
}

function displayError(message) {

  alert("Error: " + message + "!");

  throw new Error("Error: " + message + "!");
}

function createEventListeners() {

  let canvas = Momo.getCanvas();

  canvas.addEventListener("click", toggleFullscreen);

  document.addEventListener("fullscreenchange", manageFullscreenChange);
  document.addEventListener("MSFullscreenChange", manageFullscreenChange);
  document.addEventListener("mozfullscreenchange", manageFullscreenChange);
  document.addEventListener("webkitfullscreenchange", manageFullscreenChange);
}

function toggleFullscreen() {

  let fullscreen_element = undefined;

  let standard = !!document.fullscreenElement;
  let webkit = !!document.webkitFullscreenElement;
  let moz = !!document.mozFullScreenElement;
  let ms = !!document.msFullscreenElement;

  fullscreen_element = standard || webkit || moz || ms;

  if (fullscreen_element) {

    // Exit fullscreen.

    if (document.exitFullscreen) {

      document.exitFullscreen();
    }
    else if (document.webkitExitFullscreen) {

      document.webkitExitFullscreen();
    }
    else if (document.mozCancelFullScreen) {

      document.mozCancelFullScreen();
    }
    else if (document.msFullscreenElement) {

      document.msFullscreenElement();
    }
  }
  else {

    // Enter fullscreen.

    let canvas = Momo.getCanvas();

    if (canvas.requestFullscreen) {

      canvas.requestFullscreen();
    }
    else if (canvas.webkitRequestFullScreen) {

      canvas.webkitRequestFullScreen();
    }
    else if (canvas.mozRequestFullScreen) {

      canvas.mozRequestFullScreen();
    }
    else if (canvas.msRequestFullScreen) {

      canvas.msRequestFullScreen();
    }
  }
}

function manageFullscreenChange() {

  let fullscreen_element = undefined;

  let standard = !!document.fullscreenElement;
  let webkit = !!document.webkitFullscreenElement;
  let moz = !!document.mozFullScreenElement;
  let ms = !!document.msFullscreenElement;

  fullscreen_element = standard || webkit || moz || ms;

  if (fullscreen_element) {

    Momo.resizeCanvas(window.innerWidth, window.innerHeight);
  }
  else {

    Momo.resizeCanvas(768, 448);
  }
}

Momo.setEntryPoint(main);
