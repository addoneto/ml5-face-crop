let video, poseNet, currentPose;
let poses;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  
  fill(color(255, 0, 100, 150));
  noStroke();
  
  poseNet = ml5.poseNet(video, (modelLoaded => {
    console.log('poseNet model loaded');
  }));
  
  poseNet.on('pose', runPoses);
}

function runPoses(_poses){
  if(_poses.length > 0) poses = _poses;
}

function draw() {
    image(video, 0, 0);

    if(!poses) return;

    for(let i = 0; i < poses.length; i++){
        let cPose = poses[i].pose;
        circle(cPose.nose.x, cPose.nose.y, 20);
        circle(cPose.leftEye.x, cPose.leftEye.y, 20);
        circle(cPose.rightEye.x, cPose.rightEye.y, 20);
    }
}