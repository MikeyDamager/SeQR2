/*
 _______  _______  _______  ______   
|       ||       ||       ||    _ |  
|  _____||    ___||   _   ||   | ||  
| |_____ |   |___ |  | |  ||   |_||_ 
|_____  ||    ___||  |_|  ||    __  |
 _____| ||   |___ |      | |   |  | |
|_______||_______||____||_||___|  |_|
SeQR - A step sequencer that reads QR codes

created in p5.js and tone.js. 
it reads png files from the assets folder and creates a 31 x 31 grid of checkboxes mapped to the size of the canvas, and switches on the checkboxes based on how dark the pixels are. 

Then it uses Tone.JS to turn those checkboxes into steps on a 31 step sequencer. 

Currently, on refresh it chooses a qr code, selects notes from one of four possible 4 scales, C major, minor, lydian, mixolydian, across various octaves, applies random rolls to some filter, delay, tempo and not duration values. 

qr codes have to be exactly 31 units wide with no padding around the outside of the code otherwise it cant read them.
*/

let startButton;
let stopButton;

let index = 0;
const rowLength = 31;
const numRows = 31;
const grid1 = [];
const grid2 = [];

let synthRoll = Math.random()
let keyRoll = Math.random()

let boxHeight
let boxWidth
let bg;
let bpm = Tone.Transport.bpm.value;

let notes = []

let ntimes = ["8n","16n","12n","32n"]

let attackRoll

let delayRoll = Math.random()/4
let scaleMod = Math.random()
let releaseRoll = Math.random()/4
let timeRoll = Math.random()*4
let timeRollTwo = Math.random()*4
let timeOne = ntimes[timeRoll]
let timeTwo = ntimes[timeRollTwo]

let decayRoll = Math.random()/2
let wetRoll = Math.random()/2

let filterSpeed = (Math.random() * (1000 - 4)) + 4;
let filterFreq = (Math.random() * (2000 - 100)) + 100;


function preload() {
let qrRoll = Math.random()

if(qrRoll <= 0.5){
  bg = loadImage("assets/qr6.png");
}else if(qrRoll > 0.5 && qrRoll <=1){
  bg = loadImage("assets/qr6.png");
} 

}


const amSynth = new Tone.AMSynth({
  portamento : 0,
  oscillator: {
    type: "triangle" 
  },
  
});
const polSynth = new Tone.PolySynth(Tone.FMSynth, {
  maxPolyphony: 2,
  harmonicity : 2 ,
  portamento : 0,

modulationIndex : 5 ,
detune : 0 ,
  oscillator: {
    type: "sine" 
  },
  envelope: {
    attack: 0, 
    decay: 0.2, 
    sustain: 0.5, 
    release: 0
  },
  modulation: {
    type: "sine" 
  }
})
const delay = new Tone.Delay(delayRoll);
const reverb = new Tone.Reverb({
  decay: decayRoll,
  wet: wetRoll
});

let filterone = (Math.random() * (20000 - 1000)) + 1000;
let filtertwo = (Math.random() * (20000 - 1000)) + 1000;

const pol2Gain = new Tone.Gain(0.3); 
const outputGain = new Tone.Gain(0.7);
const delayGain = new Tone.Gain(0.7);
const filt = new Tone.Filter(filterone,"lowpass")
const filterTwo = new Tone.Filter(filtertwo,"lowpass")
const masterfilter = new Tone.Filter(10000, "allpass")



const autoFilter = new Tone.AutoFilter(filterSpeed,filterFreq)

polSynth.connect(pol2Gain)
pol2Gain.connect(reverb)
reverb.connect(delay)
delay.connect(delayGain)
delayGain.connect(filterTwo)
amSynth.connect(filt)

filt.connect(filterTwo)
filterTwo.connect(autoFilter)
autoFilter.connect(masterfilter)
masterfilter.connect(Tone.Master)


if(keyRoll > 0 && keyRoll <= 0.5 ){
  notes = [
    "C2", "E3", "F2", "G3", "A2", "B3", "C3", "C4", "E3", "F4", "G3", "A4", "B4",
    "C1", "E1", "G1", "A1", "B1", "C1", "C2", "E2", "F2", "G2", "A2", "B2",
    "C3", "E3", "F3", "G3", "A3", "B3", "C4"
  ];
}else if (keyRoll > 0 && keyRoll <= 0.33){
 notes = [
    "C2", "E3", "F2", "G3", "A2", "Bb3", "C3", "C4", "E3", "F4", "G3", "A4", "Bb4",
    "C1", "E1", "G1", "A1", "B1", "C1", "C2", "E2", "F2", "G2", "A2", "Bb2",
    "C3", "E3", "F3", "G3", "A3", "Bb3", "C4"
  ];
}else if (keyRoll > 0.33 && keyRoll <= 0.66){
  notes = [
     "C2", "Eb3", "F2", "G3", "Ab2", "Bb3", "C3", "C4", "Eb3", "F4", "G3", "Ab4", "Bb4",
     "C1", "Eb1", "G1", "Ab1", "Bb1", "C1", "C2", "Eb2", "F2", "G2", "Ab2", "Bb2",
     "C3", "Eb3", "F3", "G3", "Ab3", "Bb3", "C4"
   ];
 }else if (keyRoll > 0.66 && keyRoll <= 1){
  notes = [
     "C2", "E3", "F#2", "G3", "A2", "B3", "C3", "C4", "E3", "F#4", "G3", "A4", "B4",
     "C1", "E1", "G1", "A1", "B1", "C1", "C2", "E2", "F#2", "G2", "A2", "B2",
     "C3", "E3", "F#3", "G3", "A3", "B3", "C4"
   ];
 }

const loop1 = new Tone.Loop((time) => {
 
  for (let i = 0; i < numRows; i++) {
    const currentRow = grid1[i];
    const currentBox = currentRow[index];
    const note = notes[i];
    
    if (currentBox.checked()) {
    polSynth.triggerAttackRelease(note, timeOne, time, 0.5);
    amSynth.triggerAttackRelease(note, timeTwo, time,0.5);
    }
  }

  index++;
  if (index > rowLength-1) {
    index = 0;
  }
}, "8n").start(0);

/////////////////////////////////////////

//LOOP

function setup() {
  Tone.Transport.bpm.value = Math.random() * (150 - 80) + 80;
  
 createCanvas(620, 620);
 //image(bg, 0, 0,620, 620);
 boxHeight = height/31
 boxWidth = width/31
  startButton = createButton("start");
  
  stopButton = createButton("stop");
 
  startButton.mousePressed(startTransport);
  stopButton.mousePressed(stopTransport);
  
readImg()

for (let j = 0; j < numRows; j++) {
  const row = [];
  for (let i = 0; i < rowLength; i++) {
    const cb = createCheckbox();
    cb.position(i * boxWidth, j * boxHeight);
    cb.checked(grid2[j][i] === 1);
    row.push(cb);
  }
  grid1.push(row);
}
  

}

function draw() {
  background(210)
  stroke(255)
  fill(255)
  rect(map(index,0,31,0,width),0,20,height)
}

function readImg() {
  for (let y = 0; y < numRows; y++) {
    grid2[y] = [];

  for (let x = 0; x < rowLength; x++) {

    let posX = floor(map(x, 0, rowLength-1, 1, bg.width));
    let posY = floor(map(y, 0, numRows-1, 1, bg.height));

let count = 0;
for (let i = -1; i <= 1; i++) {
 for (let j = -1; j <= 1; j++) {
  let px = posX + i;
  let py = posY + j;
  if (px >= 0 && px < bg.width && py >= 0 && py < bg.height) {
    let pixelColor = brightness(bg.get(px, py));
    if (pixelColor <1) {
      count++;
      }
    }
  }
}
  let isBlack = count > 1;
  grid2[y][x] = isBlack ? 1 : 0;
    }
  }
}

////////////////////////////////////////////

//TONE BITS
function startTransport() {
  Tone.start();
  Tone.Transport.start();
}
function stopTransport() {
  Tone.Transport.stop();
  index = 0
}



