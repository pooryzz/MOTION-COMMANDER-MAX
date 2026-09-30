export class Player{
  constructor(x,y){this.x=x;this.y=y;this.radius=20;this.hp=100;this.shield=0;this.attackTimer=0;this.specialTimer=0;this.invuln=0;this.energy=100}
  update(dt,g,bounds){
    this.attackTimer=Math.max(0,this.attackTimer-dt);
    this.specialTimer=Math.max(0,this.specialTimer-dt);
    this.shield=Math.max(0,this.shield-dt);
    this.invuln=Math.max(0,this.invuln-dt);
    this.energy=Math.min(100,this.energy+dt*5);
    if(g?.handX!==null&&g?.handX!==undefined){
      const margin=40,targetX=margin+g.handX*(bounds.w-margin*2),targetY=margin+g.handY*(bounds.h-margin*2);
      const follow=Math.min(1,dt*7.5);
      this.x+=(targetX-this.x)*follow;this.y+=(targetY-this.y)*follow;
    }
    this.x=Math.max(this.radius,Math.min(bounds.w-this.radius,this.x));
    this.y=Math.max(this.radius,Math.min(bounds.h-this.radius,this.y));
  }
  attack(){if(this.attackTimer<=0){this.attackTimer=.28;return true}return false}
  special(){if(this.specialTimer<=0&&this.energy>=35){this.specialTimer=5;this.energy-=35;return true}return false}
  activateShield(){this.shield=.22}
  takeDamage(d){if(this.invuln>0||this.shield>0)return false;this.hp-=d;this.invuln=.35;return true}
}