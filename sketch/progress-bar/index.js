//import '../framed-canvas.css'
import infobox from '../../sketch-common/infobox'
import handleAction from '../../sketch-common/handle-action'
import data from './data'
import { createNoise2D } from 'simplex-noise'

const containerElement = document.getElementById('windowFrame')
const loader = document.getElementById('loading')
const noise = createNoise2D();

document.head.innerHTML += `<style>
@font-face {
  font-family: InterVariable;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("./assets/InterVariable.woff2") format("woff2");
}

.world { position: absolute; display: flex; flex-flow: row nowrap; background: #fefefe; color: #333;}
.column { position: relative; flex-basis: 3.86%; max-width: 3.86%; overflow: hidden; border-left: 1px solid #ccc; height: 100vh;}
.column::after {
  position: absolute; bottom: 3%; content: attr(data-gmtOffset); width: 100%;
  font-family: InterVariable; font-weight: 900; font-size: 2em; color: #ddd; text-align: center; 
}
.chart { position: absolute; bottom: 0; height: 40%; width: 100%; z-index: 0; }
.chart .candles { position: relative; width: 100%; height: 100%; }
.chart .candle { position: absolute; }
.place { position: relative; padding: 6px 4px; border-bottom: 1px solid #ccc; background: #ffffffcc; z-index: 1; }
.place h3 { font-size: 2em; font-family: InterVariable; font-weight: 500; margin: 12px 0; color: #333;}
.place p { margin: 0 0 12px 0; color: #333; font-family: InterVariable; font-weight: 900; }
.place div { display: flex; flex-flow: row nowrap; justify-content: space-between; }
.place span { padding: 2px 4px; border: 1px solid #ccc; font-family: InterVariable; font-weight: 700;}
</style>`;


const worldWidth = 6000, colWidth = worldWidth / 26;
const noiseScale = Math.random() * 2;
const graphRes = 10 + Math.ceil(Math.random() * 10);
const candleWidth = 100 / graphRes;
const world = document.createElement('div')
world.className = 'world'
world.style.width = `${worldWidth}px`;

let firstColMargin = 0, 
    firstCol = 0,
    isAnimated = true, 
    prev = noise(Math.cos(0) * noiseScale, Math.sin(0) * noiseScale);

const htmlPlace = (p) => {
  const c = document.createElement('div')
  const title = p[1] !== false ? p[1] : p[0]  
  const subtitle = p[1] !== false ? p[0] : false;
  c.className = 'place'
  c.innerHTML =  subtitle ? `<h3>${title}</h3><p>${subtitle}</p>` : `<h3>${title}</h3>`;
  c.innerHTML += `<div><span>${p[3]}</span><span>${p[2] > 0 ? '+'+p[2] : p[2]}</span></div>`
  return c;
}

const candle = function(prevVal, nextVal, i) {
  const c = document.createElement('div');
  const dy = nextVal - prevVal;
  c.className = 'candle';
  c.style.background = dy < 0 ? '#16c784cc' : '#ea3943cc';
  c.style.width = `${candleWidth}%`;
  c.style.left = `${i*candleWidth}%`;
  c.style.top = dy > 0 ? `${(prevVal+dy)*100}%` : `${(prevVal)*100}%`;
  c.style.height = `${Math.abs(dy)*100}%`;
  return c;
}

const cols = Array.from(Array(26)).map((_, i) => {
  const column = document.createElement('div')
  column.className = 'column'
  const gmtOffset =  14 - i;
  column.setAttribute('data-gmtOffset', gmtOffset > 0 ? `+${gmtOffset}` : `${gmtOffset}`);
  const chart = document.createElement('div');
  chart.className = 'chart';
  const candles = document.createElement('div')
  candles.className = 'candles';
  for (let j = 0; j < graphRes; j++) {
    const idx = (i*graphRes + j) / (26*graphRes)
    const next = noise(Math.cos(idx * Math.PI * 2) * noiseScale, Math.sin(idx * Math.PI * 2) * noiseScale);
    candles.appendChild(candle(prev, next, j));
    prev = next;
  }
  chart.appendChild(candles)
  column.appendChild(chart)
  return column
})

cols.forEach(c => world.appendChild(c))
data.forEach(p => cols[Math.ceil(26 - (12+p[2]))].appendChild(htmlPlace(p)));
containerElement.removeChild(loader);
containerElement.appendChild(world);

const move = function() {
  if (isAnimated) requestAnimationFrame(move);

  if (firstColMargin < Math.floor(colWidth)) {
    world.style.marginLeft = `-${firstColMargin}px`;
    firstColMargin++;
  } else {
    world.style.marginLeft = '0px'
    world.removeChild(cols[firstCol]);
    world.appendChild(cols[firstCol]);
    firstColMargin = 0;
    firstCol = (firstCol+1) % cols.length;
  }
}

document.onkeydown = () => { 
  isAnimated = !isAnimated 
  if (isAnimated) move();
};

window.infobox = infobox;
handleAction();
move();
