import {Player} from "./player.js";
import {Enemy} from "./enemies.js";

export class Game{
  constructor(canvas,mini){
    this.canvas=canvas;this.ctx=canvas.getContext("2d");this.mini=mini;this.mctx=mini.getContext("2d");
    this.w=canvas.width;this.h=canvas.height;this.reset();
  }
  reset(){
    this.player=new Player(120,this.h/2);this.enemies=[];this.particles=[];this.projectiles=[];
    this.spawned=0;this.defeated=0;this.score=0;this.combo=0;this.maxCombo=0;this.lastScoreGain=0;
    this.actionAttempts=0;this.actionSuccess=0;this.finished=false;this.won=false;this.time=0;
    this.spawnTimer=.8;this.zone="SECTOR A // OUTER RING";this.shake=0;this.portalPulse=0;
    for(let i=0;i<5;i++)this.spawnEnemy();
  }
  spawnEnemy(){
    if(this.spawned>=18)return;
    const edge=Math.floor(Math.random()*4);let x,y;
    if(edge===0){x=20;y=Math.random()*this.h}
    if(edge===1){x=this.w-20;y=Math.random()*this.h}
    if(edge===2){x=Math.random()*this.w;y=20}
    if(edge===3){x=Math.random()*this.w;y=this.h-20}
    this.enemies.push(new Enemy(x,y,this.spawned%3));this.spawned++;
  }
  nearestEnemy(max=180){
    let best=null,bd=max;
    for(const e of this.enemies){if(e.dead)continue;const d=Math.hypot(e.x-this.player.x,e.y-this.player.y);if(d<bd){bd=d;best=e}}
    return best;
  }
  burst(x,y,color,count=10){
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=30+Math.random()*170;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.4,color})}
  }
  attack(){
    if(!this.player.attack())return;
    this.actionAttempts++;
    const e=this.nearestEnemy(185);
    if(!e){this.combo=0;this.lastScoreGain=0;return}
    e.hurt(1);this.actionSuccess++;this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);
    let gain=60+this.combo*12;this.score+=gain;this.lastScoreGain=gain;
    this.burst(e.x,e.y,e.color,9);this.shake=5;
    if(e.dead){this.defeated++;this.score+=e.value;this.burst(e.x,e.y,"#45dcff",16)}
  }
  special(){
    if(!this.player.special())return;
    this.actionAttempts++;let hits=0;
    for(const e of this.enemies){if(!e.dead&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<270){e.hurt(3);hits++;this.burst(e.x,e.y,"#b18cff",8);if(e.dead)this.defeated++}}
    if(hits){this.actionSuccess++;this.combo+=hits;this.maxCombo=Math.max(this.maxCombo,this.combo);this.score+=hits*250;this.lastScoreGain=hits*250;this.shake=13;this.burst(this.player.x,this.player.y,"#b18cff",35)}
    else this.combo=0;
  }
  update(dt,g){
    if(this.finished)return;
    this.time+=dt;this.portalPulse+=dt;
    this.player.update(dt,g,{w:this.w,h:this.h});
    if(g?.action==="shield")this.player.activateShield();
    if(g?.action==="attack")this.attack();
    if(g?.action==="special")this.special();

    for(const e of this.enemies)e.update(dt,this.player);
    for(const e of this.enemies){
      if(e.dead)continue;
      const d=Math.hypot(e.x-this.player.x,e.y-this.player.y);
      if(d<e.radius+this.player.radius+4)this.player.takeDamage(e.damage*dt);
    }
    this.spawnTimer-=dt;
    if(this.spawnTimer<=0&&this.spawned<18){this.spawnEnemy();this.spawnTimer=1.6+Math.random()*1.4}
    this.enemies=this.enemies.filter(e=>!e.dead);

    for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;p.life-=dt}
    this.particles=this.particles.filter(p=>p.life>0);
    this.shake=Math.max(0,this.shake-dt*22);

    if(this.player.x>this.w-85)this.zone="SECTOR C // EXTRACTION GATE";
    else if(this.player.x>this.w*.55)this.zone="SECTOR B // CORE DISTRICT";
    else this.zone="SECTOR A // OUTER RING";

    if(this.player.hp<=0){this.finished=true;this.won=false}
    if(this.defeated>=8&&this.player.x>this.w-105){this.finished=true;this.won=true;this.score+=1500}
  }
  draw(){
    const c=this.ctx;c.save();
    if(this.shake>0)c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);
    this.drawWorld(c);
    this.drawPortal(c);
    for(const e of this.enemies)this.drawEnemy(c,e);
    for(const p of this.particles)this.drawParticle(c,p);
    this.drawPlayer(c);
    c.restore();
    this.drawMini();
  }
  drawWorld(c){
    c.clearRect(0,0,this.w,this.h);c.fillStyle="#03060a";c.fillRect(0,0,this.w,this.h);
    c.strokeStyle="rgba(69,220,255,.045)";c.lineWidth=1;
    for(let x=0;x<this.w;x+=48){c.beginPath();c.moveTo(x,0);c.lineTo(x,this.h);c.stroke()}
    for(let y=0;y<this.h;y+=48){c.beginPath();c.moveTo(0,y);c.lineTo(this.w,y);c.stroke()}
    const g=c.createRadialGradient(this.w*.5,this.h*.5,30,this.w*.5,this.h*.5,this.w*.6);g.addColorStop(0,"rgba(69,220,255,.035)");g.addColorStop(1,"rgba(69,220,255,0)");
    c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    // arena lanes
    c.strokeStyle="rgba(177,140,255,.09)";c.setLineDash([8,14]);c.strokeRect(28,28,this.w-56,this.h-56);c.setLineDash([]);
    c.fillStyle="#4b607b";c.font="700 9px Inter";c.fillText("A",43,45);c.fillText("B",this.w/2,45);c.fillText("C",this.w-55,45);
  }
  drawPortal(c){
    const x=this.w-58,y=this.h/2,p=1+Math.sin(this.portalPulse*4)*.09;
    c.save();c.translate(x,y);c.scale(p,p);c.shadowBlur=30;c.shadowColor="#b18cff";c.strokeStyle="#b18cff";c.lineWidth=5;c.beginPath();c.arc(0,0,29,0,Math.PI*2);c.stroke();c.strokeStyle="#45dcff";c.lineWidth=2;c.beginPath();c.arc(0,0,19,0,Math.PI*2);c.stroke();c.restore();
    c.fillStyle="#bca8ff";c.font="800 9px Inter";c.textAlign="center";c.fillText(this.defeated>=8?"EXTRACT":"LOCKED",x,y+49);
  }
  drawEnemy(c,e){
    c.save();c.translate(e.x,e.y);c.rotate(e.phase*.15);
    c.shadowBlur=18;c.shadowColor=e.color;c.fillStyle=e.hit>0?"#fff":e.color;
    c.beginPath();c.arc(0,0,e.radius,0,Math.PI*2);c.fill();c.shadowBlur=0;
    c.fillStyle="#160a12";c.beginPath();c.arc(-e.radius*.35,-2,3,0,Math.PI*2);c.arc(e.radius*.35,-2,3,0,Math.PI*2);c.fill();
    c.fillStyle="#1b2432";c.fillRect(-e.radius,-e.radius-8,e.radius*2,3);c.fillStyle="#5be6a0";c.fillRect(-e.radius,-e.radius-8,e.radius*2*(e.hp/e.maxHp),3);
    c.restore();
  }
  drawParticle(c,p){c.globalAlpha=Math.max(0,p.life);c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,2.2,0,Math.PI*2);c.fill();c.globalAlpha=1}
  drawPlayer(c){
    const p=this.player;c.save();c.translate(p.x,p.y);
    if(p.shield>0){c.strokeStyle="#45dcff";c.lineWidth=5;c.shadowBlur=28;c.shadowColor="#45dcff";c.beginPath();c.arc(0,0,37,0,Math.PI*2);c.stroke()}
    if(p.specialTimer>4.6){c.strokeStyle="#b18cff";c.lineWidth=4;c.shadowBlur=30;c.shadowColor="#b18cff";c.beginPath();c.arc(0,0,62,0,Math.PI*2);c.stroke()}
    c.shadowBlur=24;c.shadowColor="#45dcff";c.fillStyle="#45dcff";c.beginPath();c.arc(0,0,p.radius,0,Math.PI*2);c.fill();c.shadowBlur=0;
    c.fillStyle="#061018";c.beginPath();c.arc(-7,-3,3,0,Math.PI*2);c.arc(7,-3,3,0,Math.PI*2);c.fill();
    c.strokeStyle="#d8f9ff";c.lineWidth=2;c.beginPath();c.moveTo(-7,8);c.quadraticCurveTo(0,13,7,8);c.stroke();
    c.restore();
  }
  drawMini(){
    const c=this.mctx,w=this.mini.width,h=this.mini.height;
    c.fillStyle="#060a10";c.fillRect(0,0,w,h);
    c.strokeStyle="#1d2a3d";c.strokeRect(2,2,w-4,h-4);
    for(const e of this.enemies){c.fillStyle=e.color;c.fillRect(e.x/this.w*w-2,e.y/this.h*h-2,4,4)}
    c.fillStyle="#45dcff";c.beginPath();c.arc(this.player.x/this.w*w,this.player.y/this.h*h,4,0,Math.PI*2);c.fill();
    c.fillStyle="#b18cff";c.beginPath();c.arc((this.w-58)/this.w*w,.5*h,4,0,Math.PI*2);c.fill();
  }
}