export class CameraController{
  constructor(video){this.video=video;this.stream=null}
  async start(){
    if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera API unavailable");
    this.stream=await navigator.mediaDevices.getUserMedia({
      video:{width:{ideal:640},height:{ideal:480},facingMode:"user"},audio:false
    });
    this.video.srcObject=this.stream;
    await this.video.play();
  }
  stop(){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null}
}