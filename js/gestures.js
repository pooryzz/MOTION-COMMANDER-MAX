export class GestureEngine{
  constructor(){this.lastTime=performance.now()}
  dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  ext(lm,tip,pip){return this.dist(lm[tip],lm[0])>this.dist(lm[pip],lm[0])*1.12}
  detect(lm){
    if(!lm)return {name:"NO HAND",confidence:0,commandLabel:"WAITING",description:"Hand not visible.",error:"Show your hand clearly inside the camera frame.",handX:null,handY:null};
    const index=this.ext(lm,8,6),middle=this.ext(lm,12,10),ring=this.ext(lm,16,14),pinky=this.ext(lm,20,18);
    const n=[index,middle,ring,pinky].filter(Boolean).length;
    const pc={x:(lm[5].x+lm[9].x+lm[13].x+lm[17].x)/4,y:(lm[5].y+lm[9].y+lm[13].y+lm[17].y)/4};
    const handX=1-pc.x,handY=pc.y;
    const open=n>=4,fist=n<=1,indexOnly=index&&!middle&&!ring&&!pinky;
    if(indexOnly&&handY<.32)return {name:"INDEX UP",confidence:.95,commandLabel:"NOVA READY",description:"Nova special armed.",action:"special",handX,handY};
    if(fist)return {name:"FIST",confidence:.95,commandLabel:"ATTACK",description:"Pulse attack armed.",action:"attack",handX,handY};
    if(open)return {name:"OPEN PALM",confidence:.97,commandLabel:"SHIELD",description:"Energy shield active.",action:"shield",handX,handY};
    if(n===2||n===3)return {name:"UNCLEAR",confidence:.58,commandLabel:"CORRECT GESTURE",description:"Partial hand shape detected.",error:"For ATTACK close all fingers; for SHIELD open all fingers.",handX,handY};
    return {name:"MOVE",confidence:.84,commandLabel:"MOVE",description:"Hand position controls the commander.",action:"move",handX,handY};
  }
}