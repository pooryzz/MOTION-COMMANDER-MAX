const TYPES=[
  {name:"SCOUT",hp:1,speed:58,radius:15,color:"#ff6680",damage:8,value:100},
  {name:"BRUTE",hp:3,speed:34,radius:23,color:"#ff9f68",damage:14,value:220},
  {name:"WRAITH",hp:2,speed:45,radius:18,color:"#b58cff",damage:10,value:160}
];
export class Enemy{
  constructor(x,y,typeIndex=0){
    const t=TYPES[typeIndex%TYPES.length];
    Object.assign(this,t);this.x=x;this.y=y;this.maxHp=t.hp;this.dead=false;this.hit=0;this.phase=Math.random()*10;
  }
  update(dt,target){
    if(this.dead)return;
    this.phase+=dt;this.hit=Math.max(0,this.hit-dt);
    const dx=target.x-this.x,dy=target.y-this.y,d=Math.hypot(dx,dy)||1;
    if(d>45){this.x+=dx/d*this.speed*dt;this.y+=dy/d*this.speed*dt;}
  }
  hurt(dmg){this.hp-=dmg;this.hit=.12;if(this.hp<=0)this.dead=true}
}