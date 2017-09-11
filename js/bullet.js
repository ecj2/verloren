class Bullet {

  constructor(x, y, angle, identifier, type) {

    this.x = x;
    this.y = y;

    this.radius = 2;

    this.angle = angle;

    this.speed = 3.0;

    // This represents full opacity (0 = completely transparent).
    this.ticks = 255.0;

    // This is used to keep track of each bullet in the bullets array.
    this.identifier = identifier;

    this.type = type; // 0 = player; 1 = enemy; 2 = special.

    this.active = true;
  }

  getX() {

    return this.x;
  }

  getY() {

    return this.y;
  }

  getType() {

    return this.type;
  }

  getRadius() {

    return this.radius;
  }

  setTicks(ticks) {

    this.ticks = ticks;
  }

  update() {

    if (!this.active) {

      return;
    }

    if (this.ticks <= 0) {

      // Move the bullet out of sight and deactivate it once it fades away.

      this.active = false;

      this.x = -99999;
      this.y = -99999;
    }

    // Move the bullet. There is no velocity.
    this.x += Math.sin(this.angle) * this.speed;
    this.y += -Math.cos(this.angle) * this.speed;

    this.ticks -= 3;
  }

  render(camera_x, camera_y) {

    if (!this.active) {

      return;
    }

    let color = 0;

    switch (this.type) {

      case 0:

        // The player's bullets will be yellow.
        color = Momo.makeColor(255, 255, 0, this.ticks)
      break;

      case 1:

        // The enemies' bullets will be red.
        color = Momo.makeColor(255, 0, 0, this.ticks)
      break;

      case 2:

        // Special bullets change color over time (this is used for when FTL is engaged).
        color = Momo.makeColor(getRandomNumber() % 255, getRandomNumber() % 255, getRandomNumber() % 255, this.ticks)
      break;
    }

    // Draw each bullet as a circle.
    Momo.drawFilledCircle(

      this.x - camera_x,

      this.y - camera_y,

      this.radius,

      color
    );
  }
}
