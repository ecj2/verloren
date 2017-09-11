class Enemy {

  constructor(x, y, identifier) {

    this.x = x;
    this.y = y;

    this.w = 16;
    this.h = 32;

    this.angle = 0.0;

    this.speed = 7.5;

    this.friction = 0.98;

    this.velocity_x = 0.0;
    this.velocity_y = 0.0;

    // These are used to animate the ship's flame.
    this.flame_offset_y = 0.0;
    this.flame_offset_angle_y = 0.0;

    this.identifier = identifier;

    this.active = true;
  }

  isActive() {

    return this.active;
  }

  getX() {

    return this.x;
  }

  getY() {

    return this.y;
  }

  destroy() {

    this.active = false;

    let a = 0.0;

    while (a < Math.PI * 2) {

      // Generate a bunch of bullets to simulate an explosion.

      a += Math.PI / 8;

      bullets[bullet_identifier] = new Bullet(this.x, this.y, a, bullet_identifier, 1);

      ++bullet_identifier;
    }

    // Move the enemy's corpse out of sight.
    this.x = -9999;
    this.y = -9999;
  }

  update(target_x, target_y, target_radius) {

    if (!this.active) {

      return;
    }

    this.flame_offset_angle_y += 0.75;

    this.flame_offset_y += -Math.cos(this.flame_offset_angle_y);

    let delta_x = this.x - target_x;
    let delta_y = this.y - target_y;

    this.angle = Math.atan2(delta_x, -delta_y) - Math.PI;

    this.velocity_x += Math.sin(this.angle) * this.speed * 0.1;
    this.velocity_y += -Math.cos(this.angle) * this.speed * 0.1;

    this.x += this.velocity_x;
    this.y += this.velocity_y;

    this.velocity_x *= this.friction;
    this.velocity_y *= this.friction;
  }

  render(camera_x, camera_y) {

    if (!this.active) {

      return;
    }

    let translate_x = this.x - camera_x;
    let translate_y = this.y - camera_y;

    context.save();

    context.translate(translate_x, translate_y);

    context.rotate(this.angle);

    context.translate(-translate_x, -translate_y);

    context.translate(-this.w / 2, -this.h / 2);

    context.save();

    // Shake the flame to simulate animation.
    context.translate(0, -this.flame_offset_y);

    // Draw flame core.
    Momo.drawFilledPolygon(

      [
        this.x - camera_x,

        this.y + this.h - camera_y,

        this.x + this.w / 2 - camera_x,

        this.y + this.h * 1.5 - camera_y,

        this.x + this.w - camera_x,

        this.y + this.h - camera_y
      ],

      Momo.makeColor(255, 255, 0)
    );

    // Draw flame outline.
    Momo.drawPolygon(

      [

        this.x + 2 - camera_x,

        this.y + this.h - camera_y,

        this.x + this.w / 2 - camera_x,

        this.y + this.h * 1.5 - camera_y,

        this.x + this.w - 2 - camera_x,

        this.y + this.h - camera_y
      ],

      Momo.makeColor(255, 0, 0),

      3
    );

    context.restore();

    let points = [

      this.x - camera_x,

      this.y + this.h - camera_y,

      this.x + this.w / 2 - camera_x,

      this.y - camera_y,

      this.x + this.w - camera_x,

      this.y + this.h - camera_y
    ];

    // Draw the enemy ship outline and fill.
    Momo.drawFilledPolygon(points, Momo.makeColor(0, 0, 0));
    Momo.drawPolygon(points, Momo.makeColor(255, 0, 0), 3);

    context.restore();
  }
}
