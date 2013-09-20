var chem = require("chem");
var v = chem.vec2d;
var ani = chem.resources.animations;
var canvas = document.getElementById("game");
var engine = new chem.Engine(canvas);
engine.showLoadProgressBar();
engine.start();
canvas.focus();

chem.resources.on('ready', function () {
  var batch = new chem.Batch();
  var fpsLabel = engine.createFpsLabel();

  var bgImg = chem.resources.images['background_floor.png'];
  var bgHud = chem.resources.images['hud_background.png'];
  var roomCenter = engine.size.scaled(0.5);
  var playerSprite = new chem.Sprite(ani.player, {
    batch: batch,
    zOrder: 3,
    pos: roomCenter.clone(),
  });
  var innerPlatform = new chem.Sprite(ani.inner_platform, {
    batch: batch,
    zOrder: 1,
    pos: roomCenter.clone(),
  });
  var outerPlatform = new chem.Sprite(ani.outer_platform, {
    batch: batch,
    zOrder: 0,
    pos: roomCenter.clone(),
  });
  var speed = 2.4;
  var doorSpeed = Math.PI / 240; // radians
  var doorPosRadius = 242;
  var doorAngle = Math.random() * 2 * Math.PI;
  var doorSprite = new chem.Sprite(ani.door, {
    batch: batch,
    zOrder: 2,
  });
  var innerRadius = 207;
  var playerRadius = 14.5;
  engine.on('update', function (dt, dx) {
    var left = engine.buttonState(chem.button.KeyLeft) || engine.buttonState(chem.button.KeyA);
    var right = engine.buttonState(chem.button.KeyRight) || engine.buttonState(chem.button.KeyD);
    var up = engine.buttonState(chem.button.KeyUp) || engine.buttonState(chem.button.KeyW);
    var down = engine.buttonState(chem.button.KeyDown) || engine.buttonState(chem.button.KeyS);

    var desiredVector = v();
    if (left) {
      playerSprite.pos.x -= speed * dx;
      desiredVector.add(v.unit(Math.PI));
    }
    if (right) {
      playerSprite.pos.x += speed * dx;
      desiredVector.add(v.unit(0));
    }
    if (up) {
      playerSprite.pos.y -= speed * dx;
      desiredVector.add(v.unit(3 * Math.PI / 2));
    }
    if (down) {
      playerSprite.pos.y += speed * dx;
      desiredVector.add(v.unit(Math.PI / 2));
    }

    if (desiredVector.lengthSqrd() !== 0) {
      playerSprite.rotation = desiredVector.angle() + Math.PI / 2;
    }

    var posRelCenter = playerSprite.pos.minus(roomCenter);
    var outVector = posRelCenter.normalized();
    var outerPlayerPos = posRelCenter.plus(outVector.scaled(playerRadius));
    if (outerPlayerPos.length() > innerRadius) {
      var innerCirclePoint = outVector.scaled(innerRadius);
      var correction = innerCirclePoint.minus(outerPlayerPos);
      playerSprite.pos.add(correction);
    }

    doorAngle = (doorAngle + doorSpeed) % (Math.PI * 2);
    var doorUnit = v.unit(doorAngle);
    doorSprite.pos = roomCenter.plus(doorUnit.scaled(doorPosRadius)),
    doorSprite.rotation = doorUnit.angle() + Math.PI / 2;
  });
  engine.on('draw', function (context) {
    context.drawImage(bgImg, 100, 0);
    context.drawImage(bgHud, 0, 0);

    // draw all sprites in batch
    batch.draw(context);

    // draw a little fps counter in the corner
    fpsLabel.draw(context);
  });
});
