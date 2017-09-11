// This is a gutted version of my 2D game-making library, Momo.
// Find it on GitHub: https://github.com/ecj2/momo

let Momo = new class {

  constructor() {

    // Everything is drawn on this canvas.
    this.canvas = undefined;

    // Resources are queued here.
    this.resources = [];

    // This dictates how often the canvas should be updated.
    this.frame_rate = undefined;

    // These store which keys are pressed and released.
    this.key = [];
    this.key_pressed = [];
    this.key_released = [];

    // Define key codes.
    this.key_codes = {};

    this.keyboard_method = undefined;
  }

  initialize() {

    let canvas = document.createElement("canvas");

    if (!!!(canvas && canvas.getContext("2d"))) {

      // The browser does not support the canvas element.
      return false;
    }

    return true;
  }

  manageKeyboardEvents(event) {

    switch (event.type) {

      case "keyup":

        this.key[event.which] = false;
        this.key_released[event.which] = true;
      break;

      case "keydown":

        if (!this.key[event.which]) {

          this.key_pressed[event.which] = true;
        }

        this.key[event.which] = true;
      break;
    }

    event.preventDefault();
  }

  installKeyboard() {

    // Define key codes.
    this.key_codes = {

      "enter": 13,

      "space": 32,

      "left": 37,

      "up": 38,

      "right": 39,

      "down": 40,

      "a": 65,

      "d": 68,

      "s": 83,

      "w": 87
    };

    this.keyboard_method = this.manageKeyboardEvents.bind(this);

    // Listen for keyboard events.
    document.addEventListener("keyup", this.keyboard_method);
    document.addEventListener("keydown", this.keyboard_method);
  }

  isKeyUp(key_code) {

    return !this.key[this.key_codes["" + key_code]];
  }

  isKeyDown(key_code) {

    return this.key[this.key_codes["" + key_code]];
  }

  isKeyPressed(key_code) {

    return this.key_pressed[this.key_codes["" + key_code]];
  }

  isKeyReleased(key_code) {

    return this.key_released[this.key_codes["" + key_code]];
  }

  setCanvas(canvas_id, canvas_width, canvas_height) {

    // Get the specified canvas element.
    let canvas = document.getElementById(canvas_id);

    if (!!!canvas) {

      // The specified canvas element does not exist.
      return false;
    }

    // Set the dimensions of the canvas.
    canvas.width = canvas_width;
    canvas.height = canvas_height;

    // Set the dimensions, elements, and contexts of the member canvas.
    this.canvas = {

      width: canvas_width,

      height: canvas_height,

      canvas: canvas,

      context: canvas.getContext("2d"),

      ready: true
    };

    return true;
  }

  getCanvas() {

    return this.canvas.canvas;
  }

  getCanvasContext() {

    return this.canvas.context;
  }

  clearCanvas(color) {

    this.setStrokeAndFillStyle(color);

    this.canvas.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getCanvasWidth() {

    return this.canvas.width;
  }

  getCanvasHeight() {

    return this.canvas.height;
  }

  setFrameRate(frame_rate) {

    this.frame_rate = frame_rate;
  }

  resourcesLoaded(procedure) {

    let number_of_resources = 0;
    let number_of_resources_loaded = 0;

    let i = 0;

    for (i; i < this.resources.length; ++i) {

      ++number_of_resources;

      if (this.resources[i].ready) {

        ++number_of_resources_loaded;
      }
    }

    if (number_of_resources_loaded < number_of_resources) {

      // Some resources have not completed downloading yet.
      window.setTimeout(this.resourcesLoaded.bind(this), 100, procedure);
    }
    else {

      // All of the resources have completed downloading.
      procedure();
    }
  }

  createLoop(procedure) {

    window.setInterval(

      function() {

        procedure();

        let i = 0;

        for (i; i < this.key.length; ++i) {

          // Clear key arrays so each keyboard event fires only once.
          this.key_pressed[i] = false;
          this.key_released[i] = false;
        }
      }.bind(this),

      1000 / this.frame_rate
    );
  }

  makeColor(r, g, b, a = 255) {

    return {r: r, g: g, b: b, a: a};
  }

  setStrokeAndFillStyle(color, line_width = 0) {

    let r = color.r;
    let g = color.g;
    let b = color.b;
    let a = color.a / 255.0;

    this.canvas.context.lineWidth = line_width;
    this.canvas.context.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    this.canvas.context.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
  }

  setEntryPoint(function_name) {

    // Call the specified function when the window loads.
    window.addEventListener("load", function_name);
  }

  loadFont(file_name) {

    let element = document.createElement("style");

    let font_name = "font_" + Math.random().toString(16).slice(2);

    element.textContent = `

      @font-face {

        font-family: ` + font_name + `;
        src: url("` + file_name + `");
      }
    `;

    document.head.appendChild(element);

    let font = {

      element: element,

      file: file_name,

      name: font_name,

      type: "font"
    };

    // Pre-load the font.
    this.drawText(font, this.makeColor(0, 0, 0, 0), 0, 0, 0, "left", "");

    return font;
  }

  drawText(font, fill_color, size, x, y, alignment, text, outline_color = undefined, outline_width = 0) {

    this.canvas.context.textAlign = alignment;

    this.canvas.context.font = size + "px " + font.name;

    this.setStrokeAndFillStyle(fill_color);

    this.canvas.context.fillText(text, x, y + size);

    if (outline_color != undefined && outline_width > 0) {

      this.setStrokeAndFillStyle(outline_color, outline_width);

      this.canvas.context.strokeText(text, x, y + size);
    }
  }

  drawPolygon(points, color, thickness) {

    this.setStrokeAndFillStyle(color, thickness);

    let x = [];
    let y = [];

    let i = 0;

    for (i; i < points.length; ++i) {

      if (i % 2) {

        y.push(points[i]);
      }
      else {

        x.push(points[i]);
      }
    }

    this.canvas.context.beginPath();

    i = 0;

    for (i; i < x.length; ++i) {

      if (i === 0) {

        this.canvas.context.moveTo(x[i], y[i]);

        continue;
      }

      this.canvas.context.lineTo(x[i], y[i]);
    }

    this.canvas.context.closePath();

    this.canvas.context.stroke();
  }

  drawFilledPolygon(points, color) {

    this.setStrokeAndFillStyle(color);

    let x = [];
    let y = [];

    let i = 0;

    for (i; i < points.length; ++i) {

      if (i % 2) {

        y.push(points[i]);
      }
      else {

        x.push(points[i]);
      }
    }

    this.canvas.context.beginPath();

    i = 0;

    for (i; i < x.length; ++i) {

      if (i === 0) {

        this.canvas.context.moveTo(x[i], y[i]);

        continue;
      }

      this.canvas.context.lineTo(x[i], y[i]);
    }

    this.canvas.context.closePath();

    this.canvas.context.fill();
  }

  drawArc(center_x, center_y, radius, start_angle, end_angle, color, thickness) {

    this.setStrokeAndFillStyle(color, thickness);

    this.canvas.context.beginPath();
    this.canvas.context.arc(center_x, center_y, radius, start_angle, end_angle);
    this.canvas.context.closePath();
    this.canvas.context.stroke();
  }

  drawFilledArc(center_x, center_y, radius, start_angle, end_angle, color) {

    this.setStrokeAndFillStyle(color);

    this.canvas.context.beginPath();
    this.canvas.context.arc(center_x, center_y, radius, start_angle, end_angle);
    this.canvas.context.closePath();
    this.canvas.context.fill();
  }

  drawCircle(center_x, center_y, radius, color, thickness) {

    this.drawArc(center_x, center_y, radius, 0, 2 * Math.PI, color, thickness);
  }

  drawFilledCircle(center_x, center_y, radius, color) {

    this.drawFilledArc(center_x, center_y, radius, 0, 2 * Math.PI, color);
  }

  drawRectangle(begin_x, begin_y, end_x, end_y, color, thickness) {

    this.setStrokeAndFillStyle(color, thickness);

    this.canvas.context.beginPath();
    this.canvas.context.rect(begin_x, begin_y, end_x - begin_x, end_y - begin_y);
    this.canvas.context.closePath();
    this.canvas.context.stroke();
  }

  drawFilledRectangle(begin_x, begin_y, end_x, end_y, color) {

    this.setStrokeAndFillStyle(color);

    this.canvas.context.beginPath();
    this.canvas.context.rect(begin_x, begin_y, end_x - begin_x, end_y - begin_y);
    this.canvas.context.closePath();
    this.canvas.context.fill();
  }
};
