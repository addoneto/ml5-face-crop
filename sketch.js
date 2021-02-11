let poseNet, capture, face;
const config = { video: { mandatory: { maxWidth: 1280, maxHeight: 720 } }, audio: false };

let invertCheckbox, inverted = false;
let lerpCheckbox, blerp = true;
let pointsCheckbox, drawPoints = true;
let cropCheckbox, crop = false;
let confidenceSlider, lerpStepSlider, distanceMultiplier, squareWmult, squareHmult, cropOffset;

function setup() {
  face = new Face();

  createCanvas(600, 600);
  setupUI();

  capture = createCapture(config, stream => resizeCanvas(capture.width, capture.height));
  capture.hide();

  poseNet = ml5.poseNet(capture, (modelLoaded => console.log('poseNet model loaded')));
  poseNet.on('pose', updatePoses);
}

function setupUI(){
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
}

function updatePoses(poses) {
  if (poses.length === 0) return;
  face.filterAndUpdatePose(confidenceSlider.value(), poses[0].pose);
}

function draw() {
  background(220);

  if (inverted === true) { translate(width, 0); scale(-1, 1); }
  else { translate(0, 0); scale(1, 1); }

  face.updateCurrentPoints(blerp, lerpStepSlider.value());
  face.updateDistance(distanceMultiplier.value());
  face.calculateAreas(squareWmult.value(), squareHmult.value(), capture.width, capture.height, cropOffset.value());

  if (!crop) {
    image(capture, 0, 0);
    if (drawPoints) face.drawGizmos();
  } else {
    image(capture, 0, 0, width, height,
      face.cropSquare.begin.x,
      face.cropSquare.begin.y,
      face.cropSquare.width,
      face.cropSquare.height);
  }

}