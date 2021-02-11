class Face {
    constructor() {
        
        this.latestPoints = {
            nose : { x: 0, y: 0 },
            lEye : { x: 0, y: 0 },
            rEye : { x: 0, y: 0 }
        };

        this.currentPoints = {
            nose : { x: 0, y: 0 },
            lEye : { x: 0, y: 0 },
            rEye : { x: 0, y: 0 }
        };

        this.cameraDistance = 0;
        this.invertedDist = 0;

        this.facePosition = {
            begin : {x: 0, y: 0},
            end   : {x: 0, y: 0},

            width  : 0,
            height : 0,
        }

        this.cropSquare = {
            begin : {x: 0, y: 0},
            width : 0, height : 0,
        }
    }

    filterAndUpdatePose(_confidence, pose) {
        if(pose.nose.confidence > _confidence){
            this.latestPoints.nose.x = pose.nose.x;
            this.latestPoints.nose.y = pose.nose.y;
        }

        if(pose.leftEye.confidence > _confidence){
            this.latestPoints.lEye.x = pose.leftEye.x;
            this.latestPoints.lEye.y = pose.leftEye.y;
        }

        if(pose.rightEye.confidence > _confidence){
            this.latestPoints.rEye.x = pose.rightEye.x;
            this.latestPoints.rEye.y = pose.rightEye.y;
        }
    }

    updateDistance(distanceMult) {
        this.invertedDist = floor(dist(this.currentPoints.lEye.x, this.currentPoints.lEye.y, this.currentPoints.rEye.x, this.currentPoints.rEye.y));
        this.cameraDistance = floor(1 / this.invertedDist * distanceMult);
    }

    calculateAreas(_widthMult, _heightMult, captureWidth, captureHeight, cropOffeset){
        // FACE DELIMITATIONS

        this.facePosition.begin.x = this.currentPoints.lEye.x + this.invertedDist * _widthMult;
        this.facePosition.begin.y = this.currentPoints.lEye.y - this.invertedDist * _heightMult;

        this.facePosition.end.x = this.currentPoints.rEye.x - this.invertedDist * _widthMult;
        this.facePosition.end.y = this.currentPoints.nose.y + this.invertedDist * _heightMult;

        this.facePosition.width  = this.facePosition.end.x - this.facePosition.begin.x;
        this.facePosition.height = this.facePosition.end.y - this.facePosition.begin.y;
    
        // FACE INDIVIDUAL CROP (with cameras aspect ratio)

        let middleX    = this.facePosition.begin.x + this.facePosition.width / 2;
        let cropHeight = this.facePosition.height + 2 * cropOffeset;
        let cropWidth  = captureWidth * cropHeight / captureHeight;

        this.cropSquare.begin.x = middleX - cropWidth / 2;
        this.cropSquare.begin.y = this.facePosition.begin.y - cropOffeset;
    
        this.cropSquare.width = cropWidth;
        this.cropSquare.height = cropHeight;
    }

    drawGizmos(){
        noStroke(); fill(color(255, 0, 100, 200));
        circle(this.currentPoints.nose.x , this.currentPoints.nose.y, 10);
        circle(this.currentPoints.lEye.x , this.currentPoints.lEye.y, 10);
        circle(this.currentPoints.rEye.x , this.currentPoints.rEye.y, 10);

        fill(color(180, 180, 50, 200));
        circle(this.facePosition.begin.x , this.facePosition.begin.y , 10);
        circle(this.facePosition.end.x   , this.facePosition.end.y   , 10);

        strokeWeight(2); noFill(); stroke(color(0, 255, 0, 200));
        rect(this.facePosition.begin.x, this.facePosition.begin.y,
            this.facePosition.width, this.facePosition.height);

        stroke(color(0, 0, 255, 200));
        rect(this.cropSquare.begin.x, this.cropSquare.begin.y, this.cropSquare.width, this.cropSquare.height);
    }

    updateCurrentPoints(_lerp = false, lerpStep) {
        if(_lerp){
            for(let k in this.latestPoints){
                this.currentPoints[k].x = lerp(this.currentPoints[k].x, this.latestPoints[k].x, lerpStep);
                this.currentPoints[k].y = lerp(this.currentPoints[k].y, this.latestPoints[k].y, lerpStep);
            }
        }else{
            for(let k in this.latestPoints){
                this.currentPoints[k] = this.latestPoints[k];
            }
        }
    }

}