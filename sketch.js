/*
 * POSE NET POINTS
 */

let poseNet;
let atualPose = {
  desiredNose: { x: 0, y: 0 },
  desiredLeftEye: { x: 0, y: 0 },
  desiredRightEye: { x: 0, y: 0 }
};

let currentPose = { nose: null, leftEye: null, rightEye: null };

/*
 * CAPTURE
 */
let capture;

const config = {
  video: { mandatory: { maxWidth: 1280, maxHeight: 720 } }, audio: false
};

/*
 * INTERFACE
 */

let invertCheckbox, inverted = false;
let lerpCheckbox, blerp = true;
let pointsCheckbox, drawPoints = true;
let cropCheckbox, crop = false;
let confidenceSlider, lerpStepSlider, distanceMultiplier, squareWmult, squareHmult, cropOffset;
const pointColor = { r: 255, g: 0, b: 100, a: 200 };

function setup() {
  createCanvas(600, 600);

  capture = createCapture(config, stream => resizeCanvas(capture.width, capture.height));
  capture.hide();

  invertCheckbox = createCheckbox('Invert Image', inverted);
  invertCheckbox.changed(() => inverted = !inverted);

  lerpCheckbox = createCheckbox('Interpolation', blerp);
  lerpCheckbox.changed(() => blerp = !blerp);

  pointsCheckbox = createCheckbox('Draw Reference Points', drawPoints);
  pointsCheckbox.changed(() => drawPoints = !drawPoints);

  cropCheckbox = createCheckbox('Crop Face', crop);
  cropCheckbox.changed(() => crop = !crop);

  confidenceSlider = createSlider(0, 1, 0.7, 0.01);
  lerpStepSlider = createSlider(0, 1, 0.5, 0.01);

  distanceMultiplier = createSlider(2500, 3500, 3000, 100);

  squareWmult = createSlider(0, 2, 1.5, 0.1);
  squareHmult = createSlider(0, 2, 1.5, 0.1);

  cropOffset = createSlider(0, 150, 50, 1);

  fill(color(pointColor.r, pointColor.g, pointColor.b, pointColor.a)); noStroke();

  for (let point in currentPose) {
    currentPose[point] = createVector();
  }

  poseNet = ml5.poseNet(capture, (modelLoaded => console.log('poseNet model loaded')));

  poseNet.on('pose', updatePoses);
}

function updatePoses(poses) {
  if (poses.length === 0) return;
  let atual = poses[0].pose;

  if (atual.nose.confidence > confidenceSlider.value())
    atualPose.desiredNose = atual.nose;

  if (atual.leftEye.confidence > confidenceSlider.value())
    atualPose.desiredLeftEye = atual.leftEye;

  if (atual.rightEye.confidence > confidenceSlider.value())
    atualPose.desiredRightEye = atual.rightEye;
}

function draw() {
  background(220);

  if (inverted === true) { translate(width, 0); scale(-1, 1); }
  else { translate(0, 0); scale(1, 1); }

  if (!blerp) {
    currentPose.nose.x = atualPose.desiredNose.x;
    currentPose.nose.y = atualPose.desiredNose.y;

    currentPose.leftEye.x = atualPose.desiredLeftEye.x;
    currentPose.leftEye.y = atualPose.desiredLeftEye.y;

    currentPose.rightEye.x = atualPose.desiredRightEye.x;
    currentPose.rightEye.y = atualPose.desiredRightEye.y;
  } else {
    currentPose.nose.x = lerp(currentPose.nose.x, atualPose.desiredNose.x, lerpStepSlider.value());
    currentPose.nose.y = lerp(currentPose.nose.y, atualPose.desiredNose.y, lerpStepSlider.value());

    currentPose.leftEye.x = lerp(currentPose.leftEye.x, atualPose.desiredLeftEye.x, lerpStepSlider.value());
    currentPose.leftEye.y = lerp(currentPose.leftEye.y, atualPose.desiredLeftEye.y, lerpStepSlider.value());

    currentPose.rightEye.x = lerp(currentPose.rightEye.x, atualPose.desiredRightEye.x, lerpStepSlider.value());
    currentPose.rightEye.y = lerp(currentPose.rightEye.y, atualPose.desiredRightEye.y, lerpStepSlider.value());
  }

  // CALCULATE DISTANCES
  let invertedfaceDist = floor(dist(currentPose.leftEye.x, currentPose.leftEye.y, currentPose.rightEye.x, currentPose.rightEye.y));
  let actualDist = floor(1 / invertedfaceDist * distanceMultiplier.value());

  let faceSquare = {
    begin: createVector(currentPose.leftEye.x + invertedfaceDist * squareWmult.value(), currentPose.leftEye.y - invertedfaceDist * squareHmult.value()),
    end: createVector(currentPose.rightEye.x - invertedfaceDist * squareWmult.value(), currentPose.nose.y + invertedfaceDist * squareHmult.value())
  }

  let xSize = faceSquare.end.x - faceSquare.begin.x,
    ySize = faceSquare.end.y - faceSquare.begin.y;

  // CALCULATE CROP (with camera aspect ratio)

  // if(ySize > xSize)

  let middleX = faceSquare.begin.x + xSize / 2;
  let cheight = ySize + 2 * cropOffset.value();
  let cwidth = capture.width * cheight / capture.height;

  let cropSquare = {
    begin: createVector(middleX - cwidth / 2, faceSquare.begin.y - cropOffset.value())
  }

  if (!crop) {
    image(capture, 0, 0);

    if (drawPoints) {
      fill(color(pointColor.r, pointColor.g, pointColor.b, pointColor.a));

      circle(currentPose.nose.x, currentPose.nose.y, 10);
      circle(currentPose.leftEye.x, currentPose.leftEye.y, 10);
      circle(currentPose.rightEye.x, currentPose.rightEye.y, 10);

      fill(color(180, 180, 50, 200));

      circle(faceSquare.begin.x, faceSquare.begin.y, 10);
      circle(faceSquare.end.x, faceSquare.end.y, 10);

      fill(color(255, 255, 255, 100));
      rect(faceSquare.begin.x, faceSquare.begin.y, xSize, ySize);

      fill(color(0, 0, 255, 200));

      stroke(color(0, 0, 255, 200));
      strokeWeight(2);
      noFill();

      rect(cropSquare.begin.x, cropSquare.begin.y, cwidth, cheight);

      noStroke();
    }
  } else {
    image(capture, 0, 0, width, height,
      cropSquare.begin.x,
      cropSquare.begin.y,
      cwidth,
      cheight);
  }
}