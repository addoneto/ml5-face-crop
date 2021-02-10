let video, poseNet, currentPose;
let desiredNose = {x:0, y:0}, desiredLEye = {x:0, y:0},desiredREye= {x:0, y:0};
let curentNose, curentLEye,currentREye;
const lerpVel = 0.5 , offsetFace = 2;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  
  fill(color(255, 0, 100, 150));
  noStroke();
  
  curentNose = createVector();
  curentLEye = createVector();
  currentREye = createVector();
  
  poseNet = ml5.poseNet(video, (modelLoaded => {
    console.log('poseNet model loaded');
  }));
  
  poseNet.on('pose', runPoses);
}

function runPoses(poses){
  if(poses.length > 0){
    currentPose = poses[0].pose;
    
    if(currentPose.nose.confidence > 0.7){
      desiredNose = currentPose.nose;
    }
    
    if(currentPose.leftEye.confidence > 0.7){
      desiredLEye = currentPose.leftEye;
    }
    
    if(currentPose.rightEye.confidence > 0.7){
      desiredREye = currentPose.rightEye;
    }
  }
  
  //confidence
}

function draw() {
    background(51);

    // translate(width,0);
    // scale(-1, 1);
  
    curentNose.x = lerp(curentNose.x, desiredNose.x, lerpVel);
    curentNose.y = lerp(curentNose.y, desiredNose.y, lerpVel);
  
    curentLEye.x = lerp(curentLEye.x, desiredLEye.x, lerpVel);
    curentLEye.y = lerp(curentLEye.y, desiredLEye.y, lerpVel);
  
    currentREye.x = lerp(currentREye.x, desiredREye.x, lerpVel);
    currentREye.y = lerp(currentREye.y, desiredREye.y, lerpVel);
    
    let invertedfaceDist = dist(curentLEye.x, curentLEye.y, currentREye.x, currentREye.y);
    let actualDist = floor(1 / invertedfaceDist * 3000);

    let beginPoint = createVector(curentLEye.x + invertedfaceDist / 1.5, curentLEye.y - invertedfaceDist * 1.5);
    let endPoint = createVector(currentREye.x - invertedfaceDist / 1.5, curentNose.y + invertedfaceDist * 1.5);
  
    // circle(beginPoint.x , beginPoint.y, 20);
    // circle(endPoint.x , endPoint.y, 20);

    let xSize = endPoint.x - beginPoint.x;
    let ySize = endPoint.y - beginPoint.y;

    // img, x, y, width, height, dx, dy, dw, dh, sx, sy, sw, sh
    image(video, 0, 0, video.width, video.height,
            beginPoint.x + xSize - invertedfaceDist * offsetFace,
            beginPoint.y - invertedfaceDist * offsetFace,
            Math.abs(xSize) + invertedfaceDist * offsetFace,
            Math.abs(ySize) + invertedfaceDist * offsetFace);
  
    // rect(beginPoint.x, beginPoint.y, xSize, ySize);  
}