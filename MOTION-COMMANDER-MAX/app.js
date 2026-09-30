import { CameraController } from "./js/camera.js";
import { HandTracker } from "./js/handTracking.js";
import { GestureEngine } from "./js/gestures.js";
import { Game } from "./js/game.js";

const video = document.querySelector("#camera");
const handCanvas = document.querySelector("#handCanvas");
const miniCanvas = document.querySelector("#miniCanvas");
const startScreen = document.querySelector("#startScreen");
const resultScreen = document.querySelector("#resultScreen");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");
const muteBtn = document.querySelector("#muteBtn");

const ui = {
  score: document.querySelector("#score"),
  combo: document.querySelector("#combo"),
  kills: document.querySelector("#kills"),
  hpText: document.querySelector("#hpText"),
  hpBar: document.querySelector("#hpBar"),
  missionLabel: document.querySelector("#missionLabel"),
  missionProgress: document.querySelector("#missionProgress"),
  gesture: document.querySelector("#gestureName"),
  confidence: document.querySelector("#confidence"),
  track: document.querySelector("#trackState"),
  feedback: document.querySelector("#feedback"),
  visionPill: document.querySelector("#visionPill"),
  cameraMessage: document.querySelector("#cameraMessage"),
  liveCommand: document.querySelector("#liveCommand"),
  zoneText: document.querySelector("#zoneText"),
  coachTitle: document.querySelector("#coachTitle"),
  coachText: document.querySelector("#coachText"),
  eventLog: document.querySelector("#eventLog"),
  damageFlash: document.querySelector("#damageFlash"),
  toast: document.querySelector("#gameToast"),
  toastTitle: document.querySelector("#toastTitle"),
  toastText: document.querySelector("#toastText"),
  resultTitle: document.querySelector("#resultTitle"),
  resultKicker: document.querySelector("#resultKicker"),
  finalScore: document.querySelector("#finalScore"),
  finalKills: document.querySelector("#finalKills"),
  finalAccuracy: document.querySelector("#finalAccuracy"),
  finalCombo: document.querySelector("#finalCombo")
};

const camera = new CameraController(video);
const tracker = new HandTracker(video, handCanvas);
const gestures = new GestureEngine();
const game = new Game(document.querySelector("#gameCanvas"), miniCanvas);

let running = false;
let last = performance.now();
let muted = false;
let audioCtx = null;

function sound(freq=440,duration=.06,type="sine"){
  if(muted)return;
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type=type;o.frequency.value=freq;g.gain.value=.035;
    o.connect(g);g.connect(audioCtx.destination);o.start();
    g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);
    o.stop(audioCtx.currentTime+duration);
  }catch{}
}
function log(text){
  const time=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
  ui.eventLog.insertAdjacentHTML("afterbegin",`<div><span>${time}</span>${text}</div>`);
}
function feedback(type,text){
  ui.feedback.className=`feedback ${type}`;
  ui.feedback.textContent=text;
}
function coach(title,text){
  ui.coachTitle.textContent=title;
  ui.coachText.textContent=text;
}
function toast(title,text,ms=1000){
  ui.toastTitle.textContent=title;ui.toastText.textContent=text;
  ui.toast.classList.remove("hidden");
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>ui.toast.classList.add("hidden"),ms);
}
function updateUI(g){
  ui.gesture.textContent=g.name;
  ui.confidence.textContent=`${Math.round(g.confidence*100)}%`;
  ui.track.textContent=g.name==="NO HAND"?"NO HAND":"LOCKED";
  ui.liveCommand.textContent=g.commandLabel||"MOVE READY";

  if(g.error){
    feedback("warn",`⚠ ${g.error}`);
    coach("CORRECTION REQUIRED",g.error);
  }else if(g.name!=="NO HAND"){
    feedback("good",`✓ ${g.description}`);
    coach("GOOD INPUT",g.description);
  }else{
    feedback("neutral","Show one hand clearly inside the camera frame.");
    coach("HAND NOT FOUND","Move your hand into the camera area and keep it visible.");
  }
}
function syncStats(){
  ui.score.textContent=game.score;
  ui.combo.textContent=`x${game.combo}`;
  ui.kills.textContent=game.defeated;
  ui.hpText.textContent=Math.max(0,Math.ceil(game.player.hp));
  ui.hpBar.style.width=`${Math.max(0,game.player.hp)}%`;
  const target=8;
  ui.missionProgress.style.width=`${Math.min(100,game.defeated/target*100)}%`;
  ui.missionLabel.textContent=game.defeated>=target?"REACH THE EXTRACTION":"EXTERMINATE 8";
  ui.zoneText.textContent=game.zone;
}
async function start(){
  startBtn.disabled=true;
  try{
    await camera.start();
    await tracker.start();
    ui.cameraMessage.style.display="none";
    ui.visionPill.textContent="LIVE";
    ui.visionPill.classList.remove("offline");
    ui.visionPill.classList.add("live");
    game.reset();
    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    running=true;last=performance.now();
    log("Camera connected");
    toast("SYSTEM ONLINE","Hand tracking initialized",1100);
    sound(520,.08);
    requestAnimationFrame(loop);
  }catch(e){
    console.error(e);
    startBtn.disabled=false;
    feedback("bad","Camera initialization failed. Check permission and the browser console.");
    coach("CAMERA ERROR","Allow camera access and make sure the app is running on localhost or HTTPS.");
  }
}
function loop(now){
  if(!running)return;
  const dt=Math.min((now-last)/1000,.05);last=now;
  const landmarks=tracker.update();
  const g=gestures.detect(landmarks);
  updateUI(g);
  const beforeKills=game.defeated;
  const beforeDamage=game.player.hp;
  game.update(dt,g);
  game.draw();
  syncStats();

  if(game.defeated>beforeKills){sound(760,.08,"square");log("Target eliminated");toast("TARGET DOWN",`+${game.lastScoreGain} SCORE`,600);}
  if(game.player.hp<beforeDamage){
    ui.damageFlash.style.opacity=".65";
    setTimeout(()=>ui.damageFlash.style.opacity="0",100);
  }
  if(game.finished){running=false;showResult();return}
  requestAnimationFrame(loop);
}
function showResult(){
  resultScreen.classList.remove("hidden");
  const accuracy=game.actionAttempts?Math.round(game.actionSuccess/game.actionAttempts*100):0;
  ui.resultTitle.textContent=game.won?"VICTORY":"MISSION FAILED";
  ui.resultKicker.textContent=game.won?"MISSION COMPLETE":"SYSTEM OVERRUN";
  ui.finalScore.textContent=game.score;
  ui.finalKills.textContent=game.defeated;
  ui.finalAccuracy.textContent=`${accuracy}%`;
  ui.finalCombo.textContent=`x${game.maxCombo}`;
  sound(game.won?880:160,.2,"sawtooth");
  log(game.won?"Mission complete":"Mission failed");
}
startBtn.addEventListener("click",start);
restartBtn.addEventListener("click",start);
muteBtn.addEventListener("click",()=>{
  muted=!muted;muteBtn.textContent=muted?"🔇":"🔊";
});
