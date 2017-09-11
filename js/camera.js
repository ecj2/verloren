Camera = new class {

  constructor() {

    this.x = 0.0;
    this.y = 0.0;
  }

  getX() {

    return this.x;
  }

  getY() {

    return this.y;
  }

  follow(target_x, target_y) {

    // Keep the target in the center of the view.
    this.x = target_x - (Momo.getCanvasWidth() / 2);
    this.y = target_y - (Momo.getCanvasHeight() / 2);
  }
};
