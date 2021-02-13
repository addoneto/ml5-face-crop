let poseNet;
let canvas, video, ctx;
let invertImage, drawPoints, confidenceTreshold, faceWidth, faceHeight,
faceCropOffset, blerp, lerpStep, distanceMult;

let face;

const config = {
    video: true,
    audio: false,
}

window.onload = async function () {
    setupUI();

    canvas = document.getElementsByTagName('canvas')[0];
    ctx = canvas.getContext('2d');
    video = document.getElementsByTagName('video')[0];

    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // https://www.webdevdrops.com/en/how-to-access-device-cameras-with-javascript/
    // navigator.mediaDevices.getUserMedia({}).then().catch();

    if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
        let videoStream;

        try {
            videoStream = await navigator.mediaDevices.getUserMedia(config);
        } catch (err) {
            return console.error('Could not acess camera!', err);
        }

        video.srcObject = videoStream;
        let { width, height } = videoStream.getTracks()[0].getSettings();
        canvas.width = width; canvas.height = height;

        // * For some reason, not setting the video width and height
        //   results in the model responding just 0,0 position
        video.width = width;  video.height = height;

        face = new Face();

        update();

        poseNet = ml5.poseNet(video, modelLoaded => console.log('poseNet model loaded') );
        poseNet.on('pose', updatePoses);

        return;
    }

    document.write('No media founded!');
}

function updatePoses(poses){
    if(poses.length > 0)
        face.filterAndUpdatePose(Number(confidenceTreshold.value), poses[0].pose);
}

function setupUI() {
    invertImage = document.querySelector('#invert-checkbox');
    invertImage.addEventListener('change', function () {
        ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    });

    crop                = document.querySelector('#crop-checkbox');
    drawPoints          = document.querySelector('#drawp-checkbox');
    confidenceTreshold  = document.querySelector('#confidence-slider');
    faceWidth           = document.querySelector('#face-width-slider');
    faceHeight          = document.querySelector('#face-height-slider');
    faceCropOffset      = document.querySelector('#face-crop-slider');
    blerp               = document.querySelector('#lerp-checkbox');
    lerpStep            = document.querySelector('#lerp-step-slider');
    // distanceMult        = document.querySelector('#distance-mult-slider');
}

function update() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    face.updateCurrentPoints(blerp.checked, Number(lerpStep.value));
    face.updateDistance(); //Number(distanceMult.value)
    face.calculateAreas(Number(faceWidth.value), Number(faceHeight.value), video.width, video.height, Number(faceCropOffset.value));

    if (!crop.checked) {
        ctx.drawImage(video, 0, 0);
        if (drawPoints.checked) face.drawGizmos();

    } else {
        ctx.drawImage(video, face.cropSquare.begin.x, face.cropSquare.begin.y,
            face.cropSquare.width, face.cropSquare.height, 0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(update);
}