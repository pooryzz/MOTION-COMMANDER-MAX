import {HandLandmarker,FilesetResolver,DrawingUtils}
from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/+esm";

export class HandTracker{
  constructor(video,canvas){
    this.video=video;this.canvas=canvas;this.ctx=canvas.getContext("2d");
    this.landmarker=null;this.lastVideoTime=-1;this.result=null;
  }
  async start(){
    const vision=await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
    );
    this.landmarker=await HandLandmarker.createFromOptions(vision,{
      baseOptions:{
        modelAssetPath:"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate:"GPU"
      },
      runningMode:"VIDEO",numHands:1,
      minHandDetectionConfidence:.55,
      minHandPresenceConfidence:.55,
      minTrackingConfidence:.55
    });
  }
  update(){
    if(!this.landmarker||this.video.readyState<2)return null;
    if(this.video.currentTime!==this.lastVideoTime){
      this.lastVideoTime=this.video.currentTime;
      this.result=this.landmarker.detectForVideo(this.video,performance.now());
      this.draw();
    }
    return this.result?.landmarks?.[0]??null;
  }
  draw(){
    const c=this.ctx;c.clearRect(0,0,this.canvas.width,this.canvas.height);
    if(!this.result?.landmarks?.length)return;
    const utils=new DrawingUtils(c);
    // IMPORTANT: do NOT mirror the drawing here. The canvas is already mirrored
    // by CSS together with the video, so both layers use the same coordinate space.
    for(const lm of this.result.landmarks){
      utils.drawConnectors(lm,HandLandmarker.HAND_CONNECTIONS,{color:"#45dcff",lineWidth:3});
      utils.drawLandmarks(lm,{color:"#ffffff",fillColor:"#45dcff",lineWidth:1,radius:3});
    }
  }
}