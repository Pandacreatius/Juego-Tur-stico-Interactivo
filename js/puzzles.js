/* V57 · pruebas de campo: mobile-first, ubicación, cámara, brújula y movimiento. */
const PuzzleUI={
  hintIndex:0,currentCh:null,misses:{},
  hint(ch){
    this.hintIndex=Math.min(this.hintIndex+1,3);
    const box=document.getElementById('hintText'),level=document.getElementById('hintLevel');
    if(box){box.hidden=false;box.textContent=(ch.hints||[])[this.hintIndex-1]||'Observa qué cambia en pantalla cuando interactúas con el entorno.'}
    if(level)level.textContent=`PISTA ${this.hintIndex}/3`;
    aldaraSay(this.hintIndex===1?'Vale. Una pista de campo, no una respuesta.':this.hintIndex===2?'Mira el comportamiento de la prueba, no el texto.':'Última ayuda: céntrate en la única acción que hace avanzar el indicador.');
  },
  resetHints(){this.hintIndex=0},
  shell(ch,body){
    return `<section class="puzzle-wrap field-puzzle-v57">
      <div class="chapter-head field-head-v57"><small>CAPÍTULO ${roman(ch.n)} · ${ch.kind}</small><h2>${ch.title}</h2>
        <div class="case-strip-v53"><div><span>MISIÓN DE CAMPO</span><b>${ch.question}</b></div><div><span>SEÑAL DE ÉXITO</span><b>${ch.success}</b></div></div>
      </div>
      <aside class="aldara-companion" id="aldaraCompanion"><img src="assets/aldara_think.webp" alt="Aldara"><div><small>ALDARA · EN CAMPO</small><p id="aldaraLine">${aldaraIntro(ch.n)}</p></div></aside>
      ${body}
      <div class="hint-panel"><div class="hint-head-v53"><span id="hintLevel">PISTAS OPCIONALES · 0/3</span><small>Sin penalización</small></div><button class="btn ghost compact" id="hintBtn"><i class="fa-regular fa-lightbulb"></i> Necesito una pista</button><p id="hintText" hidden></p></div>
    </section>`;
  }
};

function aldaraIntro(n){return [
  'Primero activa el lugar. Después deja que el tablero responda a lo que haces.',
  'No vamos a contestar nada: vamos a dejar un rastro y reconstruir otro.',
  'Esto es sigilo. Mira el ritmo, espera y cruza cuando el hueco sea tuyo.',
  'Camina un poco. Necesito saber cómo responde el mapa antes de trazar una ruta.',
  'Haz tuya la escena: una foto del entorno será el papel donde aparece el código.',
  'Aquí no sirve elegir una opción. Gira el móvil y encuentra la línea real.',
  'Los guardias tienen patrón. Si lo lees bien, no necesitas correr.',
  'Convierte el castillo en una mesa de luz. El documento tiene que encajar encima.',
  'El archivo final solo abre si el lugar, la ruta y las pruebas cuentan la misma historia.'
][n-1]||'Observa el entorno y deja que la prueba reaccione.'}
function aldaraSay(text){const el=document.getElementById('aldaraLine');if(el)el.textContent=text}
function bindHints(ch){document.getElementById('hintBtn')?.addEventListener('click',()=>PuzzleUI.hint(ch))}
function feedback(msg,type='info'){
  const el=document.getElementById('feedback');
  if(el){el.textContent=msg;el.className=`feedback ${type}`}
  if(type==='bad'&&PuzzleUI.currentCh){const n=PuzzleUI.currentCh.n;PuzzleUI.misses[n]=(PuzzleUI.misses[n]||0)+1}
}
function solve(ch){aldaraSay('Lo tenemos. Esta prueba ya forma parte del recorrido.');window.currentPuzzleCleanup?.();window.currentPuzzleCleanup=null;setTimeout(()=>completeChapter(ch),650)}
function renderPuzzle(ch){
  window.currentPuzzleCleanup?.();window.currentPuzzleCleanup=null;
  PuzzleUI.resetHints();PuzzleUI.currentCh=ch;PuzzleUI.misses[ch.n]=0;
  return [puzzle1,puzzle2,puzzle3,puzzle4,puzzle5,puzzle6,puzzle7,puzzle8,puzzle9][ch.n-1](ch);
}
function buzz(ms=35){try{navigator.vibrate?.(ms)}catch{}}
function safePhotoUrl(file){try{return URL.createObjectURL(file)}catch{return ''}}
function photoCaptureHTML(id,title,guide){return `<section class="camera-mission-v57" id="${id}Panel"><div class="camera-frame-v57" id="${id}Frame"><i class="fa-solid fa-camera"></i><b>${title}</b><span>${guide}</span></div><label class="btn primary full camera-button-v57" for="${id}"><i class="fa-solid fa-camera-retro"></i> Abrir cámara</label><input id="${id}" class="camera-input-v57" type="file" accept="image/*" capture="environment">${window.GeoMission?.demo?`<button type="button" class="btn ghost full" data-demo-photo="${id}"><i class="fa-solid fa-flask"></i> Usar escena de prueba</button>`:''}<small><i class="fa-solid fa-shield-halved"></i> La imagen se usa en esta prueba y no se guarda en la partida.</small></section>`}
function bindPhotoCapture(id,onPhoto){
  const input=document.getElementById(id),frame=document.getElementById(`${id}Frame`);
  input?.addEventListener('change',()=>{const file=input.files?.[0];if(!file)return;const url=safePhotoUrl(file);frame.innerHTML=`<img src="${url}" alt="Foto tomada para la prueba"><span class="camera-proof-v57"><i class="fa-solid fa-check"></i> Escena registrada</span>`;frame.classList.add('captured');buzz();onPhoto?.(url,file)});document.querySelector(`[data-demo-photo="${id}"]`)?.addEventListener('click',()=>{const url=CHAPTERS[current]?.image||'assets/castillo.webp';frame.innerHTML=`<img src="${url}" alt="Escena de demostración"><span class="camera-proof-v57"><i class="fa-solid fa-flask"></i> Escena demo</span>`;frame.classList.add('captured');onPhoto?.(url,null)});
}
function fieldStatusChip(){
  const s=window.GeoMission?.status?.(CHAPTERS[current]);
  if(!s)return '<span><i class="fa-solid fa-location-dot"></i> Zona activada</span>';
  return `<span><i class="fa-solid fa-location-crosshairs"></i> ${s.demo?'Modo demo':`${Math.round(s.distance||0)} m del punto`}</span>`;
}

/* 1 · Escáner físico + hueco narrativo */
function puzzle1(ch){
  let found=new Set();
  const fragments=[
    {id:'legend',at:18,label:'LEYENDA',text:'«Ferran huyó sin despedirse.»'},
    {id:'note',at:52,label:'CUADERNO',text:'«Ferran dejó una carta antes de huir.»'},
    {id:'wait',at:84,label:'RASTRO',text:'«Amina esperó una señal que nunca llegó.»'}
  ];
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-wave-square"></i> Escáner de plaza</span></div>
  <section class="scanner-v57"><div class="scanner-window-v57"><div class="scan-line-v57" id="scanLine57"></div>${fragments.map(f=>`<article data-frag="${f.id}" style="--x:${f.at}%"><small>${f.label}</small><p>${f.text}</p></article>`).join('')}</div><label><span>Desliza el escáner por la escena</span><input id="scanner57" type="range" min="0" max="100" value="0"></label><div class="scan-progress-v57"><b id="scanCount57">0/3</b><span>rastros recuperados</span></div></section>
  <section class="timeline-gap-v57" id="timelineGap57" hidden><small>RECONSTRUCCIÓN</small><h3>Arrastra la carta al hueco que deja la leyenda.</h3><div class="timeline-track-v57"><span>Ferran se recupera</span><button id="gap57" aria-label="Hueco de la cronología">?</button><span>Ferran huye</span><span>Amina espera</span></div><button class="evidence-token-v57" id="letterToken57" draggable="true"><i class="fa-solid fa-envelope"></i><b>Ferran escribe una carta</b><small>tócala y luego toca el hueco</small></button></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const slider=document.getElementById('scanner57'),line=document.getElementById('scanLine57');
  const paint=()=>{const v=+slider.value;line.style.left=`${v}%`;fragments.forEach(f=>{if(Math.abs(v-f.at)<8&&!found.has(f.id)){found.add(f.id);stage.querySelector(`[data-frag="${f.id}"]`).classList.add('found');buzz();feedback(`Rastro recuperado: ${f.label}.`,'ok')}});document.getElementById('scanCount57').textContent=`${found.size}/3`;if(found.size===3){document.getElementById('timelineGap57').hidden=false;aldaraSay('Ya están los tres rastros. Ahora mira la cronología: la carta no es una respuesta, es una pieza física que falta.')}};
  slider.oninput=paint;paint();
  let armed=false;const token=document.getElementById('letterToken57'),gap=document.getElementById('gap57');
  token.onclick=()=>{armed=!armed;token.classList.toggle('selected',armed)};
  gap.onclick=()=>{if(!armed&&found.size<3){feedback('Antes hay que recuperar los tres rastros.','bad');return}if(!armed){feedback('Toca primero la carta para moverla.','bad');return}gap.innerHTML='<i class="fa-solid fa-envelope"></i>';gap.classList.add('solved');token.hidden=true;feedback('La carta encaja antes de la huida. La leyenda tiene un hueco real.','ok');aldaraSay('Caso abierto: no necesitamos elegir qué versión nos gusta. Ya encontramos la pieza que la versión popular pierde.');setTimeout(()=>solve(ch),800)};
  token.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain','letter'));gap.addEventListener('dragover',e=>e.preventDefault());gap.addEventListener('drop',e=>{e.preventDefault();armed=true;gap.click()});
}

/* 2 · Cámara + secuencia de huellas */
function puzzle2(ch){
  let photo=false,step=0;const order=['stirrup','horse','blood','cloth'];
  const clues={stirrup:['fa-link','Estribo roto'],horse:['fa-horse','Huellas de caballo'],blood:['fa-droplet','Rastro de sangre'],cloth:['fa-ribbon','Tela enganchada']};
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-shoe-prints"></i> Rastro activo</span></div>${photoCaptureHTML('fieldPhoto2','Registra un paso real','Busca un acceso, desnivel, arco o estrechamiento. Evita fotografiar caras.')}
  <section class="trail-board-v57" id="trailBoard57" hidden><small>FASE 2 · SIGUE EL RASTRO</small><h3>Toca las huellas en el orden en que Ferran pudo dejar evidencia.</h3><div class="trail-map-v57"><i class="trail-path-v57"></i>${Object.entries(clues).map(([id,[icon,label]],i)=>`<button data-trail="${id}" style="--i:${i}"><i class="fa-solid ${icon}"></i><b>${label}</b></button>`).join('')}<span class="trail-runner-v57" id="trailRunner57"><img src="assets/ferran_master_v48.webp" alt="Ferran"></span></div><div class="trail-meter-v57"><i id="trailFill57"></i></div></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  bindPhotoCapture('fieldPhoto2',()=>{photo=true;document.getElementById('trailBoard57').hidden=false;aldaraSay('Bien. Ya tenemos una referencia del terreno real. Ahora reconstruye el rastro, no una respuesta.')});
  stage.querySelectorAll('[data-trail]').forEach((b,i)=>b.onclick=()=>{
    if(!photo){feedback('Primero registra una referencia del entorno con la cámara.','bad');return}
    const id=b.dataset.trail;if(id!==order[step]){b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),350);feedback('Ese rastro todavía no puede aparecer. Sigue la física del recorrido.','bad');buzz([25,40,25]);return}
    b.classList.add('done');step++;document.getElementById('trailFill57').style.width=`${step/order.length*100}%`;document.getElementById('trailRunner57').style.setProperty('--step',step-1);buzz();
    if(step===order.length){feedback('Caída, caballo separado, avance herido y entrada estrecha: el rastro está completo.','ok');aldaraSay('Eso sí cuenta una llegada. Ferran no apareció de la nada: el terreno conserva una secuencia.');setTimeout(()=>solve(ch),850)}else feedback(`${step}/4 huellas encadenadas.`,'ok');
  });
}

/* 3 · Sigilo en tiempo real */
function puzzle3(ch){
  let crossings=0,guard=0,raf=null,last=performance.now();const speeds=[0.00042,0.00053,0.00061];
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-person-running"></i> Simulación nocturna</span></div>
  <section class="stealth-field-v57"><small>ENTREGA NOCTURNA</small><h3>Cruza cuando el guardia esté lejos del paso central.</h3><div class="stealth-lane-v57"><span class="safe-edge-v57 left"></span><span class="cross-line-v57"></span><span class="safe-edge-v57 right"></span><i class="guard-v57" id="guard57"><i class="fa-solid fa-person-military-pointing"></i></i><span class="amina-v57"><img src="assets/amina_master_v48.webp" alt="Amina"></span></div><div class="supply-row-v57">${['fa-droplet','fa-bandage','fa-wheat-awn'].map((i,n)=>`<span data-supply="${n}"><i class="fa-solid ${i}"></i></span>`).join('')}</div><button class="btn primary full" id="cross57"><i class="fa-solid fa-person-running"></i> Cruzar ahora</button><p class="stealth-rule-v57">No pulses por velocidad: observa el patrón. El centro es la zona de riesgo.</p></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const guardEl=document.getElementById('guard57');
  const tick=t=>{const dt=t-last;last=t;guard+=dt*speeds[crossings];const x=(Math.sin(guard)+1)/2;guardEl.style.left=`${8+x*84}%`;raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);window.currentPuzzleCleanup=()=>cancelAnimationFrame(raf);
  document.getElementById('cross57').onclick=()=>{const x=parseFloat(guardEl.style.left||'50')/100;const safe=x<.26||x>.74;if(!safe){feedback('Demasiado cerca. Amina queda dentro de la línea de vigilancia.','bad');buzz([40,40,40]);return}stage.querySelector(`[data-supply="${crossings}"]`)?.classList.add('delivered');crossings++;buzz();if(crossings>=3){cancelAnimationFrame(raf);feedback('Tres entregas limpias. Amina pudo volver varias noches sin convertir el camino en una rutina visible.','ok');aldaraSay('Eso cambia la escena: volver exigía observar, esperar y repetir un plan.');setTimeout(()=>solve(ch),850)}else{guard=0;feedback(`Entrega ${crossings}/3 completada. El siguiente relevo se mueve a otro ritmo.`,'ok')}};
}

/* 4 · Movimiento GPS + laberinto */
function puzzle4(ch){
  let origin=window.GeoMission?.position? [...GeoMission.position]:null,travelled=0,last=origin,unlocked=false,route=[1];
  const nodes={1:[12,82],2:[32,65],3:[32,89],4:[52,54],5:[54,82],6:[72,61],7:[86,82]};const edges={1:[2,3],2:[4],3:[5],4:[6],5:[7],6:[7]};const danger=new Set([2,4,6]);
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-person-walking"></i> Calibración andando</span></div>
  <section class="walk-calibration-v57"><small>FASE 1 · MUEVE EL MAPA</small><h3>Camina al menos 18 m por una zona segura.</h3><p>Da unos pasos por el casco. No mires la pantalla mientras caminas; detente para comprobar el progreso.</p><div class="walk-ring-v57"><b id="walkMeters57">0 m</b><span>de 18 m</span><i id="walkFill57"></i></div>${window.GeoMission?.demo?'<button class="btn ghost full" id="demoWalk57">Simular recorrido en modo demo</button>':''}</section>
  <section class="route-field-v57" id="routeField57" hidden><small>FASE 2 · TRAZA LA RUTA</small><h3>Ahora usa el mapa calibrado: toca nodos conectados evitando las zonas rojas.</h3><div class="route-canvas-v57"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline id="routeLine57" points="12,82"></polyline></svg>${Object.entries(nodes).map(([id,[x,y]])=>`<button data-route57="${id}" class="${danger.has(+id)?'danger':''}" style="left:${x}%;top:${y}%">${id}</button>`).join('')}<span class="route-amina-v57" id="routeAmina57"><img src="assets/amina_master_v48.webp" alt="Amina"></span></div><button class="btn ghost full" id="resetRoute57"><i class="fa-solid fa-rotate-left"></i> Borrar ruta</button></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const onPos=e=>{if(unlocked)return;const p=e.detail?.position||window.GeoMission?.position;if(!p)return;if(!last){last=[...p];origin=[...p];return}const d=window.GeoMission?.distance(last,p)||0;if(d>1&&d<30){travelled+=d;last=[...p];paintWalk()}};
  window.addEventListener('field:location',onPos);
  const cleanup=()=>window.removeEventListener('field:location',onPos);window.currentPuzzleCleanup=cleanup;
  const paintWalk=()=>{const m=Math.min(18,travelled);document.getElementById('walkMeters57').textContent=`${Math.round(m)} m`;document.getElementById('walkFill57').style.setProperty('--p',`${m/18*360}deg`);if(travelled>=18&&!unlocked){unlocked=true;document.getElementById('routeField57').hidden=false;feedback('Mapa calibrado. Ya puedes reconstruir el camino de Amina.','ok');aldaraSay('Perfecto. Ahora el plano ya sabe cómo se mueve una persona real por estas calles.')}};
  document.getElementById('demoWalk57')?.addEventListener('click',()=>{travelled=18;paintWalk()});paintWalk();
  const paintRoute=()=>{const pts=route.map(n=>nodes[n].join(',')).join(' ');document.getElementById('routeLine57').setAttribute('points',pts);const [x,y]=nodes[route.at(-1)];const a=document.getElementById('routeAmina57');a.style.left=`${x}%`;a.style.top=`${y}%`;stage.querySelectorAll('[data-route57]').forEach(b=>b.classList.toggle('active',route.includes(+b.dataset.route57)))};
  stage.querySelectorAll('[data-route57]').forEach(b=>b.onclick=()=>{if(!unlocked){feedback('Primero calibra el mapa caminando.','bad');return}const n=+b.dataset.route57,lastNode=route.at(-1);if(n===lastNode)return;if(!edges[lastNode]?.includes(n)){feedback('Ese tramo no conecta con el punto actual.','bad');return}route.push(n);paintRoute();if(danger.has(n)){feedback('Entraste en un sector vigilado. Retrocede y busca otra calle.','bad');route.pop();paintRoute();return}if(n===7){cleanup();feedback('Ruta limpia: 1 → 3 → 5 → 7. El recorrido evita los tres sectores de ronda.','ok');aldaraSay('Ahora sí: el mapa no es decorado. Lo calibraste caminando y después encontraste un patrón seguro.');setTimeout(()=>solve(ch),850)}});
  document.getElementById('resetRoute57').onclick=()=>{route=[1];paintRoute()};paintRoute();
}

/* 5 · Foto propia + gesto sobre runas */
function puzzle5(ch){
  let photo=false,traceIndex=0;const checkpoints=[[76,24],[55,18],[35,33],[38,58],[60,67],[72,50]];
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-pen-ruler"></i> Código sobre escena real</span></div>${photoCaptureHTML('fieldPhoto5','Crea el soporte del código','Fotografía piedra, textura, cueva, chimenea o un rincón sin personas.')}
  <section class="rune-trace-v57" id="runeTrace57" hidden><small>FASE 2 · TRAZA LA PROMESA</small><h3>Desliza el dedo atravesando los puntos luminosos sin levantarlo.</h3><div class="trace-surface-v57" id="traceSurface57"><div class="trace-bg-v57" id="traceBg57"></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="76,24 55,18 35,33 38,58 60,67 72,50"/></svg>${checkpoints.map((p,i)=>`<i data-cp57="${i}" style="left:${p[0]}%;top:${p[1]}%"></i>`).join('')}<b>↶</b></div><div class="decoded-message-v57" id="decoded57" hidden><span>MENSAJE RECUPERADO</span><strong>ESPERA AQUÍ · VOLVERÉ DE NOCHE</strong></div></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  bindPhotoCapture('fieldPhoto5',url=>{photo=true;document.getElementById('runeTrace57').hidden=false;document.getElementById('traceBg57').style.backgroundImage=`linear-gradient(rgba(5,12,10,.42),rgba(5,12,10,.42)),url("${url}")`;aldaraSay('Ahora el código está encima de un lugar que tú has elegido. Recorre el símbolo como si fuera una marca escondida.');bindTrace()});
  function bindTrace(){const s=document.getElementById('traceSurface57');let down=false;const move=e=>{if(!down)return;const r=s.getBoundingClientRect(),t=e.touches?.[0]||e,x=(t.clientX-r.left)/r.width*100,y=(t.clientY-r.top)/r.height*100;const p=checkpoints[traceIndex];if(Math.hypot(x-p[0],y-p[1])<11){s.querySelector(`[data-cp57="${traceIndex}"]`)?.classList.add('hit');traceIndex++;buzz(18);if(traceIndex===checkpoints.length){down=false;document.getElementById('decoded57').hidden=false;feedback('El signo ↶ se completa: VOLVER. El mensaje ya puede leerse.','ok');aldaraSay('Aquí está la promesa. No la elegimos de una lista: acabamos de reconstruir su marca.');setTimeout(()=>solve(ch),1000)}}};s.addEventListener('pointerdown',e=>{down=true;traceIndex=0;s.querySelectorAll('[data-cp57]').forEach(x=>x.classList.remove('hit'));move(e)});s.addEventListener('pointermove',move);window.addEventListener('pointerup',()=>down=false)}
}

/* 6 · Brújula real */
function puzzle6(ch){
  let lockedMs=0,lastT=performance.now(),done=false,heading=null;const targetCoord=CHAPTERS[6].coord;
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-compass"></i> Sensor de orientación</span></div>
  <section class="sight-compass-v57"><small>LÍNEA DE VISIÓN</small><h3>Gira el móvil hacia la fortaleza.</h3><p>Mantén la flecha dentro del visor durante 2 segundos. Hazlo parado, nunca caminando.</p><div class="sight-dial-v57"><i class="fa-solid fa-location-arrow" id="sightArrow57"></i><span class="sight-target-v57"><i></i><b>OBJETIVO</b></span><em id="sightDegrees57">—</em></div><div class="hold-meter-v57"><i id="holdFill57"></i></div><button class="btn primary full" id="enableCompass57"><i class="fa-solid fa-compass"></i> Activar brújula</button>${window.GeoMission?.demo?'<label class="demo-heading-v57">Simulación escritorio <input id="demoHeading57" type="range" min="0" max="359" value="0"></label>':''}</section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const update=h=>{heading=h;const arrow=document.getElementById('sightArrow57');if(!arrow)return;const pos=window.GeoMission?.position||(window.GeoMission?.demo?ch.coord:null);if(!pos)return;const target=window.GeoMission.bearing(pos,targetCoord),delta=((target-h+540)%360)-180;arrow.style.transform=`rotate(${delta}deg)`;document.getElementById('sightDegrees57').textContent=`${Math.round(Math.abs(delta))}°`;const now=performance.now(),dt=now-lastT;lastT=now;if(Math.abs(delta)<=14){lockedMs+=dt;document.getElementById('holdFill57').style.width=`${Math.min(100,lockedMs/20)}%`;if(lockedMs>=2000&&!done){done=true;window.removeEventListener('field:heading',handler);feedback('Línea fijada. Desde este punto la fortaleza cae dentro del campo de observación.','ok');aldaraSay('Eso demuestra por qué este lugar importa: aquí la geometría del pueblo cuenta parte de la historia.');buzz(100);setTimeout(()=>solve(ch),850)}}else{lockedMs=Math.max(0,lockedMs-dt*1.8);document.getElementById('holdFill57').style.width=`${Math.min(100,lockedMs/20)}%`}};
  const handler=e=>update(e.detail.heading);window.addEventListener('field:heading',handler,{once:false});window.currentPuzzleCleanup=()=>window.removeEventListener('field:heading',handler);
  document.getElementById('enableCompass57').onclick=async()=>{const ok=await window.GeoMission?.enableHeading?.();feedback(ok===false?'No hay brújula disponible. Usa modo demo o prueba en un móvil compatible.':'Brújula activa. Gira despacio hasta centrar la flecha.',ok===false?'bad':'info')};
  document.getElementById('demoHeading57')?.addEventListener('input',e=>update(+e.target.value));
}

/* 7 · Patrullas con ventanas distintas */
function puzzle7(ch){
  let sector=0,raf,last=performance.now(),clock=0;const speeds=[0.0031,0.0043,0.0037],guards=[.2,.7];
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-stopwatch"></i> Ventana de fuga</span></div>
  <section class="patrol-game-v57"><small>SECTOR <b id="sector57">1</b>/3</small><h3>Espera a que el corredor central quede libre.</h3><div class="patrol-arena-v57" id="arena57"><span class="escape-corridor-v57"></span><i class="patrol-dot-v57 g1" id="g1v57"><i class="fa-solid fa-shield"></i></i><i class="patrol-dot-v57 g2" id="g2v57"><i class="fa-solid fa-shield"></i></i><span class="ferran-run-v57"><img src="assets/ferran_master_v48.webp" alt="Ferran"></span></div><button class="btn primary full" id="dash57"><i class="fa-solid fa-bolt"></i> Cruzar el sector</button><div class="sector-pips-v57">${[0,1,2].map(i=>`<i data-sectorpip="${i}"></i>`).join('')}</div></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const tick=t=>{clock+=(t-last)*speeds[sector];last=t;const x1=(Math.sin(clock)+1)/2,x2=(Math.sin(clock*1.37+1.9)+1)/2;guards=[x1,x2];document.getElementById('g1v57').style.left=`${6+x1*88}%`;document.getElementById('g2v57').style.left=`${6+x2*88}%`;raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);window.currentPuzzleCleanup=()=>cancelAnimationFrame(raf);
  document.getElementById('dash57').onclick=()=>{const clear=guards.every(x=>x<.34||x>.66);if(!clear){feedback('El corredor estaba ocupado. Espera a que ambos guardias salgan de la franja central.','bad');buzz([30,30,30]);return}stage.querySelector(`[data-sectorpip="${sector}"]`).classList.add('done');sector++;buzz();if(sector===3){cancelAnimationFrame(raf);feedback('Tres ventanas leídas. Ferran pudo abandonar la zona sin correr a ciegas.','ok');aldaraSay('La huida ya no es una frase: acabas de jugar el patrón que la hacía posible.');setTimeout(()=>solve(ch),850)}else{document.getElementById('sector57').textContent=sector+1;clock=0;feedback(`Sector ${sector} superado. El siguiente patrón cambia de velocidad.`,'ok')}};
}

/* 8 · Cámara + mesa de luz */
function puzzle8(ch){
  let photo=false;const target={x:48,y:46,r:7};
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-layer-group"></i> Mesa de luz</span></div>${photoCaptureHTML('fieldPhoto8','Convierte el castillo en el fondo','Encuadra piedra, muro o acceso. Evita incluir personas identificables.')}
  <section class="doc-align-v57" id="docAlign57" hidden><small>FASE 2 · SUPERPONER</small><h3>Alinea las tres cruces del documento con las marcas luminosas.</h3><div class="light-table-v57" id="lightTable57"><div class="photo-bg-v57" id="photoBg8"></div><i class="target-mark-v57 t1"></i><i class="target-mark-v57 t2"></i><i class="target-mark-v57 t3"></i><article class="ghost-paper-v57" id="ghostPaper57"><span class="paper-mark-v57 p1">+</span><span class="paper-mark-v57 p2">+</span><span class="paper-mark-v57 p3">+</span><small>ORDEN DEL ARCHIVO</small><h4>NO ENTREGAR</h4><p>Conservar el mensaje fuera de circulación.</p><b class="seal-v57">R</b></article></div><div class="align-controls-v57"><label>Horizontal <input id="alignX57" type="range" min="30" max="66" value="35"></label><label>Vertical <input id="alignY57" type="range" min="32" max="62" value="58"></label><label>Rotación <input id="alignR57" type="range" min="-18" max="18" value="-12"></label></div><div class="align-score-v57"><i id="alignScore57"></i><span id="alignText57">0% alineado</span></div></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  bindPhotoCapture('fieldPhoto8',url=>{photo=true;document.getElementById('docAlign57').hidden=false;document.getElementById('photoBg8').style.backgroundImage=`linear-gradient(rgba(4,10,9,.18),rgba(4,10,9,.18)),url("${url}")`;aldaraSay('Usa tu foto como mesa. El documento no tiene que “parecer bonito”: tiene que hacer coincidir las tres marcas.');paint()});
  const controls=['alignX57','alignY57','alignR57'];controls.forEach(id=>document.getElementById(id)?.addEventListener('input',paint));
  let solved=false;function paint(){if(!photo)return;const x=+document.getElementById('alignX57').value,y=+document.getElementById('alignY57').value,r=+document.getElementById('alignR57').value,p=document.getElementById('ghostPaper57');p.style.left=`${x}%`;p.style.top=`${y}%`;p.style.transform=`translate(-50%,-50%) rotate(${r}deg)`;const err=Math.abs(x-target.x)/18+Math.abs(y-target.y)/15+Math.abs(r-target.r)/25;const score=Math.max(0,Math.round(100*(1-err/3)));document.getElementById('alignScore57').style.width=`${score}%`;document.getElementById('alignText57').textContent=`${score}% alineado`;if(!solved&&Math.abs(x-target.x)<=2&&Math.abs(y-target.y)<=2&&Math.abs(r-target.r)<=2){solved=true;p.classList.add('locked');feedback('Las marcas coinciden. El sello R aparece exactamente sobre la orden “NO ENTREGAR”.','ok');aldaraSay('Ya no tenemos dos documentos separados. Tenemos una intervención: alguien colocó una orden sobre la carta.');buzz(100);setTimeout(()=>solve(ch),950)}}
}

/* 9 · Cerraduras de campo + carta final */
function puzzle9(ch){
  let locks={place:false,evidence:completed.size>=8,bearing:false},headingStarted=false;const targetCoord=CHAPTERS[0].coord;let order=[];
  const strips=[['s1','Amina, me marcho porque quedarme sería condenarte conmigo.'],['s2','No huyo de ti. Cuando esto termine, volveré.'],['s3','Si alguien te dice que no lo hice, no le creas.'],['s4','Te debo la vida. Y ahora también aquello que pensaba conservar para mí. — Ferran']];
  const body=`<div class="field-chip-row-v57">${fieldStatusChip()}<span><i class="fa-solid fa-lock"></i> Archivo final</span></div>
  <section class="final-locks-v57"><small>TRES CERRADURAS</small><h3>El archivo solo abre si el recorrido vuelve a encajar.</h3><div class="final-lock-grid-v57"><article id="lockPlace57"><i class="fa-solid fa-location-dot"></i><b>Presencia</b><span>Castillo</span></article><article id="lockEvidence57"><i class="fa-solid fa-book-open"></i><b>Ruta</b><span>8 evidencias</span></article><article id="lockBearing57"><i class="fa-solid fa-compass"></i><b>Regreso</b><span>Apunta al inicio</span></article></div><button class="btn primary full" id="finalCompass57"><i class="fa-solid fa-compass"></i> Orientar hacia la Plaza</button>${window.GeoMission?.demo?'<label class="demo-heading-v57">Simulación escritorio <input id="demoFinalHeading57" type="range" min="0" max="359" value="0"></label>':''}<div class="final-bearing-v57"><i id="finalArrow57" class="fa-solid fa-location-arrow"></i><b id="finalDelta57">—</b></div></section>
  <section class="final-letter-v57" id="finalLetter57" hidden><small>DOCUMENTO RECUPERADO</small><h3>Ordena las cuatro tiras de la carta.</h3><div class="letter-pile-v57">${strips.map(([id,t])=>`<button data-strip57="${id}">${t}</button>`).join('')}</div><div class="letter-slots-v57">${[0,1,2,3].map(i=>`<button data-slot57="${i}"><span>${i+1}</span><b>?</b></button>`).join('')}</div><button class="btn primary full" id="readFinal57"><i class="fa-solid fa-envelope-open-text"></i> Leer la carta</button></section><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const st=window.GeoMission?.status?.(ch);locks.place=!!(st?.near||st?.demo);paintLocks();
  function paintLocks(){document.getElementById('lockPlace57').classList.toggle('open',locks.place);document.getElementById('lockEvidence57').classList.toggle('open',locks.evidence);document.getElementById('lockBearing57').classList.toggle('open',locks.bearing);if(Object.values(locks).every(Boolean)){document.getElementById('finalLetter57').hidden=false;aldaraSay('Las tres cerraduras ceden. Ya no falta ninguna condición de campo: abre la carta.')}}
  const updateHeading=h=>{const arrow=document.getElementById('finalArrow57');if(!arrow)return;const pos=window.GeoMission?.position||(window.GeoMission?.demo?ch.coord:null);if(!pos)return;const target=window.GeoMission.bearing(pos,targetCoord),delta=((target-h+540)%360)-180;arrow.style.transform=`rotate(${delta}deg)`;document.getElementById('finalDelta57').textContent=`${Math.round(Math.abs(delta))}°`;if(Math.abs(delta)<=18&&!locks.bearing){locks.bearing=true;buzz(100);feedback('La brújula mira hacia el inicio de la ruta. Cerradura de regreso abierta.','ok');paintLocks()}};
  const finalHeadingHandler=e=>updateHeading(e.detail.heading);window.addEventListener('field:heading',finalHeadingHandler);window.currentPuzzleCleanup=()=>window.removeEventListener('field:heading',finalHeadingHandler);
  document.getElementById('finalCompass57').onclick=async()=>{headingStarted=true;const ok=await window.GeoMission?.enableHeading?.();feedback(ok===false?'No hay brújula disponible en este dispositivo.':'Gira hacia la Plaza de la Mancha hasta que la flecha quede centrada.',ok===false?'bad':'info')};
  document.getElementById('demoFinalHeading57')?.addEventListener('input',e=>updateHeading(+e.target.value));
  let selected=null;const text=Object.fromEntries(strips);stage.querySelectorAll('[data-strip57]').forEach(b=>b.onclick=()=>{selected=b.dataset.strip57;stage.querySelectorAll('[data-strip57]').forEach(x=>x.classList.toggle('selected',x===b))});stage.querySelectorAll('[data-slot57]').forEach(b=>b.onclick=()=>{const i=+b.dataset.slot57;if(!selected){if(order[i]){stage.querySelector(`[data-strip57="${order[i]}"]`)?.classList.remove('used');order[i]=null;paintLetter()}return}order=order.map(v=>v===selected?null:v);order[i]=selected;stage.querySelectorAll('[data-strip57]').forEach(x=>x.classList.toggle('used',order.includes(x.dataset.strip57)));selected=null;paintLetter()});
  function paintLetter(){stage.querySelectorAll('[data-slot57]').forEach(b=>{const i=+b.dataset.slot57;b.querySelector('b').textContent=order[i]?text[order[i]]:'?'})}
  document.getElementById('readFinal57').onclick=()=>{if(order.join('|')==='s1|s2|s3|s4'){feedback('La carta está completa. Ferran no huyó de Amina: huyó para protegerla y prometió volver.','ok');aldaraSay('El recorrido termina donde empezó, pero ahora el pueblo entero funciona como prueba.');setTimeout(()=>solve(ch),1100)}else{feedback('Todavía no se lee como una carta: motivo → promesa → advertencia → firma.','bad')}};paintLetter();
}
