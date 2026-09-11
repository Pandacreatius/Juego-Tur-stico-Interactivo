const stage=document.getElementById('stage');
const game=document.getElementById('game');
const progress=document.getElementById('progress');
const gameLabel=document.getElementById('gameLabel');
const journal=document.getElementById('journal');
const mapModal=document.getElementById('mapModal');
let current=0, completed=new Set(), introSeen=false, tutorialSeen=false, mapInstance=null;
const SAVE_KEY='promesa_chinchilla_v55_mobile_first';

function roman(n){return ['I','II','III','IV','V','VI','VII','VIII','IX'][n-1]}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({current,completed:[...completed],introSeen,tutorialSeen}))}
function load(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch{return null}}
function updateBar(){const n=Math.min(current+1,9);gameLabel.textContent=current<9?`CAPÍTULO ${roman(n)}`:'CASO CERRADO';progress.style.width=`${Math.min((completed.size/9)*100,100)}%`}
function scrollTop(){stage.scrollTop=0}

function chapterCard(ch){
  return `<article class="chapter-card">
    <div class="chapter-thumb">
      <img src="${ch.image}" alt="${ch.title}">
      <div class="chapter-overlay"></div>
      <div class="chapter-number">${roman(ch.n)}</div>
      <div class="chapter-chip"><i class="${ch.icon}"></i> ${ch.kind}</div>
    </div>
    <div class="chapter-body">
      <small>${ch.difficulty} · ${ch.placeShort}</small>
      <h3>${ch.title}</h3>
      <p>${ch.question}</p>
      <div class="chapter-spot"><i class="fa-solid fa-landmark"></i><div><b>Qué aporta la visita</b><span>${ch.heritage}</span></div></div>
      <div class="chapter-meta-line">
        <span><i class="fa-regular fa-clock"></i> ≈ ${ch.minutes} min</span>
        <span><i class="fa-solid fa-location-dot"></i> ${ch.placeShort}</span>
      </div>
    </div>
  </article>`
}

function tourismCard(ch){
  return `<article class="tour-card">
    <img src="${ch.image}" alt="${ch.placeShort}">
    <div class="tour-card-body">
      <div class="tour-topline">
        <div class="tour-index">${roman(ch.n)}</div>
        <div class="tour-meta">
          <span><i class="${ch.icon}"></i> ${ch.kind}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${ch.placeShort}</span>
        </div>
      </div>
      <h3>${ch.title}</h3>
      <p>${ch.heritage}</p>
      <div class="chapter-spot"><i class="fa-regular fa-eye"></i><div><b>Qué mirar</b><span>${ch.lookfor}</span></div></div>
      <div class="tour-history-v55"><i class="fa-solid fa-landmark"></i><div><b>Historia real</b><span>${ch.realHistory}</span></div></div>
      <div class="tour-note">${ch.visitTip}</div>
      <a class="official-link-v55" href="${ch.officialUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Fuente turística oficial</a>
    </div>
  </article>`
}

function bootLanding(){
  document.getElementById('characterGrid').innerHTML=CHARACTERS.map(c=>`<article class="character-card"><img src="${c.image}" alt="${c.name}"><div><small>${c.time} · ${c.role}</small><h3>${c.name}</h3><p>${c.desc}</p><blockquote>${c.quote}</blockquote></div></article>`).join('');
  document.getElementById('chapterGrid').innerHTML=CHAPTERS.map(chapterCard).join('');
  document.getElementById('tourismGrid').innerHTML=CHAPTERS.map(tourismCard).join('');
}

function openGame(){
  game.classList.add('open');game.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  const s=load();
  if(s&&s.introSeen){current=Math.min(+s.current||0,8);completed=new Set(s.completed||[]);introSeen=true;tutorialSeen=!!s.tutorialSeen;showResume()}else startFresh();
}
function closeGame(){save();game.classList.remove('open');game.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function startFresh(){current=0;completed=new Set();introSeen=false;tutorialSeen=false;localStorage.removeItem(SAVE_KEY);updateBar();renderCinematic(0,()=>{introSeen=true;save();showTutorial()})}

function showTutorial(){
  tutorialSeen=true;save();scrollTop();liveMap.classList.add('hidden');
  stage.innerHTML=`<section class="investigation-tutorial-v53">
    <small>ANTES DE EMPEZAR · 30 SEGUNDOS</small>
    <h2>No busquéis la respuesta.<br><em>Buscad la prueba.</em></h2>
    <p>Cada capítulo os dará información. Primero la examináis; después la utilizáis para demostrar algo. Y mientras avanzáis, también vais conociendo lugares de Chinchilla y el papel que pueden tener en la historia.</p>
    <div class="tutorial-steps-v53">
      <article><span>01</span><b>OBSERVA</b><p>Toca documentos, rastros, mapas y objetos. No todo será útil.</p></article>
      <article><span>02</span><b>CONECTA</b><p>Una pista aislada rara vez resuelve el caso. Relacionadla con otra.</p></article>
      <article><span>03</span><b>DEMUESTRA</b><p>Cuando vuestra explicación aguante las pruebas, el capítulo avanzará.</p></article>
    </div>
    <div class="tutorial-hint-v53"><b>Ruta + juego</b><span>La app no solo os hace jugar: en cada parada os cuenta qué mirar, por qué ese lugar importa y cómo encaja en el misterio.</span></div>
    <button class="btn primary" id="tutorialGoV53"><i class="fa-solid fa-play"></i> Abrir el caso</button>
  </section>`;
  document.getElementById('tutorialGoV53').onclick=showBriefing;
}
function showResume(){updateBar();liveMap.classList.add('hidden');stage.innerHTML=`<section class="resume"><small>PARTIDA ENCONTRADA</small><h2>El caso sigue abierto.</h2><p>${completed.size} de 9 capítulos resueltos.</p><button class="btn primary" id="resumeBtn"><i class="fa-solid fa-arrow-right"></i> Continuar</button><button class="btn ghost" id="restartBtn"><i class="fa-solid fa-rotate-left"></i> Empezar de nuevo</button></section>`;document.getElementById('resumeBtn').onclick=()=>tutorialSeen?showBriefing():showTutorial();document.getElementById('restartBtn').onclick=startFresh}

function showBriefing(){
  const ch=CHAPTERS[current];updateBar();scrollTop();updateLiveMap();
  stage.innerHTML=`<section class="briefing"><img src="${ch.image}" alt="" class="brief-img"><div class="brief-shade"></div><div class="brief-copy"><small>CAPÍTULO ${roman(ch.n)} · ${ch.place}</small><h2>${ch.title}</h2><p>${ch.story}</p><div class="brief-meta-v53"><span><i class="${ch.icon}"></i> ${ch.kind}</span><span><i class="fa-solid fa-signal"></i> ${ch.difficulty}</span><span><i class="fa-regular fa-clock"></i> ≈ ${ch.minutes} min de juego</span></div><div class="mission-objective"><span>PREGUNTA DEL CASO</span><b>${ch.question}</b><small>${ch.success}</small></div><div class="place-panel-v54"><article><small>LUGAR QUE VISITÁIS</small><h4>${ch.placeShort}</h4><p>${ch.heritage}</p></article><article><small>QUÉ MIRAR AQUÍ</small><ul class="place-points"><li><i class="fa-regular fa-eye"></i><span>${ch.lookfor}</span></li><li><i class="fa-regular fa-lightbulb"></i><span>${ch.visitTip}</span></li></ul></article><article class="real-history-v55"><small>HISTORIA REAL</small><p>${ch.realHistory}</p><a href="${ch.officialUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Fuente oficial</a></article></div><button class="btn primary" id="briefStart"><i class="fa-solid fa-magnifying-glass"></i> Entrar en la investigación</button></div></section>`;
  document.getElementById('briefStart').onclick=()=>{const beats=CINEMATICS[ch.n];if(beats)renderCinematic(ch.n,()=>renderPuzzle(ch));else renderPuzzle(ch)};
}

function completeChapter(ch){
  completed.add(ch.n-1);save();updateBar();scrollTop();
  stage.innerHTML=`<section class="reward"><small>EVIDENCIA ${roman(ch.n)}</small><div class="evidence-stamp">${ch.evidence}</div><h2>Esto cambia el caso.</h2><p>${rewardText(ch.n)}</p><div class="memory-card-v53"><span>DATO GUARDADO</span><b>${ch.memory}</b></div><button class="btn primary" id="nextBtn">${ch.n===9?'<i class="fa-solid fa-envelope-open"></i> Ver desenlace':'<i class="fa-solid fa-book-open"></i> Guardar en el cuaderno'}</button></section>`;
  document.getElementById('nextBtn').onclick=()=>{if(ch.n===9)return showEnding();current++;save();showTravel()};
}

function rewardText(n){return [
  'La versión popular ya no basta. Si hubo una carta, alguien pudo impedir que Amina conociera la verdad.',
  'Ferran no llegó como espía triunfante. Llegó herido, solo y sin caballo. Amina tomó una decisión que nadie esperaba.',
  'Amina regresó. No fue un impulso de una noche: convirtió el cuidado en una rutina secreta.',
  'El recorrido no pertenecía a Ferran. Era Amina quien conocía la ciudad y podía mantenerlo oculto.',
  'El símbolo de “volver” aparece por primera vez antes de que exista una despedida. Ya estaban pensando en después.',
  'Rajid no oyó un rumor. Los vio. A partir de aquí sabe exactamente qué está ocurriendo.',
  'Ferran no desapareció sin más: dejó una carta en el punto acordado antes de escapar.',
  'La carta existió y pasó por las manos de Rajid. Amina esperó una respuesta que ya había sido escrita.',
  'El caso queda resuelto: no hubo abandono. Hubo un mensaje interceptado y dos muertes construidas sobre la misma mentira.'
][n-1]}

function showTravel(){
  const ch=CHAPTERS[current];scrollTop();updateLiveMap();
  stage.innerHTML=`<section class="travel"><small>SIGUIENTE DESTINO</small><h2>${ch.place}</h2><p>Dejad que la historia repose mientras camináis. Aldara ha marcado una pregunta en el cuaderno:</p><blockquote>${travelQuestion(current)}</blockquote><div class="travel-tip"><i class="fa-solid fa-person-walking"></i><span>Mientras vais hacia la siguiente parada, levantad la vista: la aventura funciona mejor cuando el lugar también os habla.</span></div><div class="travel-place-v54"><article><small>EN ESTA PARADA</small><h4>${ch.placeShort}</h4><p>${ch.heritage}</p></article><article><small>NO OS PERDÁIS</small><p>${ch.lookfor}</p></article><article><small>HISTORIA REAL</small><p>${ch.realHistory}</p></article></div><div class="travel-actions"><button class="btn ghost" id="travelMap"><i class="fa-solid fa-route"></i> Abrir mapa</button><button class="btn primary" id="arrived"><i class="fa-solid fa-circle-check"></i> Ya estamos aquí</button></div></section>`;
  document.getElementById('travelMap').onclick=openMap;document.getElementById('arrived').onclick=()=>showLocationCheck(ch);
}

function showLocationCheck(ch){
  scrollTop();liveMap.classList.add('hidden');
  const near=lastPos?haversine(lastPos,ch.coord)<60:false;
  stage.innerHTML=`<section class="location-check-v56">
    <small>CONFIRMA EL LUGAR</small>
    <h2>${ch.placeShort}</h2>
    <div class="env-photo-v56"><img src="${ch.envPhoto}" alt="Detalle del entorno en ${ch.placeShort}">${near?'<span class="env-badge-v56 ok"><i class="fa-solid fa-check"></i> Estás cerca</span>':''}</div>
    <p class="env-lookfor-v56"><i class="fa-regular fa-eye"></i> ${ch.lookfor}</p>
    <button class="btn primary" id="envConfirm"><i class="fa-solid fa-magnifying-glass"></i> Lo he encontrado, seguir</button>
    <button class="btn ghost" id="envSkip">No lo encuentro, continuar igualmente</button>
  </section>`;
  document.getElementById('envConfirm').onclick=()=>showBriefing();
  document.getElementById('envSkip').onclick=()=>showBriefing();
}

function travelQuestion(i){return [
  'Si Ferran quedó separado de su caballo, ¿quién pudo llegar hasta él primero?',
  'Ayudar una vez puede ser compasión. ¿Qué significa volver una segunda noche?',
  '¿Cuántas veces recorrió Amina estas calles antes de poder hacerlo sin pensar?',
  '¿Cuándo deja de ser un escondite y empieza a ser un lugar compartido?',
  'Si alguien los descubrió, ¿desde dónde pudo verlos sin ser visto?',
  '¿Qué haces cuando marcharte es la única manera de proteger a alguien?',
  'Si la carta existió, la pregunta ya no es si Ferran escribió. Es quién la tuvo.',
  '¿Qué parte de una leyenda sobrevive cuando desaparece el documento que la contradice?'
][i-1]||''}

function showEnding(){
  current=9;save();updateBar();scrollTop();liveMap.classList.add('hidden');
  renderFinale(()=>{stage.innerHTML=`<section class="ending"><small>CASO CERRADO</small><h1>No fue la guerra<br><em>la que los separó.</em></h1><p>Fue una carta que nunca llegó.</p><div class="ending-story"><p>La carta demuestra que Ferran sí se despidió y prometió regresar. Rajid la interceptó porque creyó que alejándolo protegía a Amina, a su familia y a la fortaleza.</p><p>Amina murió pensando que Ferran la había olvidado. Ferran murió convencido de que ella había sido castigada por haberlo ayudado. Ninguno conoció la verdad completa.</p><p><strong>Amina, Ferran y Rajid son personajes ficticios.</strong> Los lugares y el patrimonio de Chinchilla que habéis recorrido son reales. La aventura utiliza la ficción para invitar a mirar ese patrimonio con otros ojos.</p></div><blockquote>«Las historias no siempre cambian porque alguien mienta. A veces cambian porque falta una página.» <cite>— Aldara</cite></blockquote><button class="btn primary" id="restartEnd"><i class="fa-solid fa-rotate-left"></i> Volver a investigar</button></section>`;document.getElementById('restartEnd').onclick=startFresh});
}

function openJournal(){
  const done=[...completed].sort((a,b)=>a-b);
  document.getElementById('journalBody').innerHTML=`<div class="journal-summary"><b>${done.length}/9</b><span>evidencias confirmadas</span></div>${CHAPTERS.map((ch,i)=>`<article class="journal-row ${completed.has(i)?'done':''}"><span>${completed.has(i)?'✓':roman(ch.n)}</span><div><small>${ch.place}</small><h4>${ch.title}</h4><p>${completed.has(i)?ch.evidence:'Evidencia aún no confirmada'}</p>${completed.has(i)?`<em class="journal-memory-v53">${ch.memory}</em>`:''}</div></article>`).join('')}`;
  journal.classList.add('open');
}
function openMap(){
  mapModal.classList.add('open');document.getElementById('mapList').innerHTML=CHAPTERS.map((c,i)=>`<div class="map-row"><span>${roman(c.n)}</span><div><b>${c.title}</b><small><i class="fa-solid fa-location-dot"></i> ${c.place}</small><em>${c.heritage}</em></div></div>`).join('');
  if(!mapInstance&&window.L){mapInstance=L.map('map').setView([38.921,-1.726],15);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(mapInstance);const pts=CHAPTERS.map(c=>c.coord);CHAPTERS.forEach(c=>L.marker(c.coord).addTo(mapInstance).bindPopup(`<b>${roman(c.n)} · ${c.title}</b><br>${c.place}<br><small>${c.heritage}</small>`));L.polyline(pts,{color:'#b9794b',weight:3,dashArray:'8 8'}).addTo(mapInstance);mapInstance.fitBounds(L.latLngBounds(pts).pad(.14))}setTimeout(()=>mapInstance?.invalidateSize(),120)
}
function closeModals(){document.querySelectorAll('.modal').forEach(m=>m.classList.remove('open'))}

document.querySelectorAll('[data-play]').forEach(b=>b.onclick=openGame);document.querySelectorAll('[data-map]').forEach(b=>b.onclick=openMap);document.getElementById('closeGame').onclick=closeGame;document.getElementById('journalBtn').onclick=openJournal;document.getElementById('mapBtn').onclick=openMap;document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModals);
bootLanding();updateBar();


// V55 · dock móvil y navegación táctil
function dockHint(){
  const hint=document.getElementById('hintBtn');
  if(hint){hint.click();hint.scrollIntoView({behavior:'smooth',block:'center'});return}
  const target=document.querySelector('.mission-objective,.case-strip-v53,.chapter-head');
  target?.scrollIntoView({behavior:'smooth',block:'center'});
}
function dockObjective(){
  const target=document.querySelector('.case-strip-v53,.mission-objective,.chapter-head,.case-question');
  target?.scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('dockMap')?.addEventListener('click',openMap);
document.getElementById('dockJournal')?.addEventListener('click',openJournal);
document.getElementById('dockHint')?.addEventListener('click',dockHint);
document.getElementById('dockObjective')?.addEventListener('click',dockObjective);

// V56 · Fase 2 — mapa en vivo (posición real + distancia a la parada actual)
const liveMap=document.getElementById('liveMap');
const liveMapThumb=document.getElementById('liveMapThumb');
const liveMapLabel=document.getElementById('liveMapLabel');
const liveMapDist=document.getElementById('liveMapDist');
let liveMapInstance=null, liveMeMarker=null, liveTargetMarker=null, liveLine=null, geoWatchId=null, lastPos=null;

function haversine(a,b){
  const R=6371000,toRad=d=>d*Math.PI/180;
  const dLat=toRad(b[0]-a[0]),dLon=toRad(b[1]-a[1]);
  const s=Math.sin(dLat/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}
function fmtDist(m){return m<1000?`${Math.round(m/10)*10} m`:`${(m/1000).toFixed(1)} km`}

function initLiveMapThumb(target){
  if(!window.L)return;
  if(!liveMapInstance){
    liveMapThumb.innerHTML='';
    liveMapInstance=L.map(liveMapThumb,{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false,tap:false,keyboard:false}).setView(target,16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(liveMapInstance);
    liveTargetMarker=L.circleMarker(target,{radius:6,color:'#d4a968',fillColor:'#d4a968',fillOpacity:1,weight:2}).addTo(liveMapInstance);
  }else{
    liveTargetMarker.setLatLng(target);
  }
  setTimeout(()=>liveMapInstance?.invalidateSize(),80);
}

function updateLiveMap(){
  if(current>=CHAPTERS.length){liveMap.classList.add('hidden');return}
  const ch=CHAPTERS[current];
  liveMap.classList.remove('hidden');
  liveMapLabel.textContent=`Hacia · ${ch.placeShort}`;
  initLiveMapThumb(ch.coord);
  if(lastPos){
    const d=haversine(lastPos,ch.coord);
    liveMapDist.textContent=fmtDist(d);
    liveMap.classList.toggle('near',d<40);
    const bounds=L.latLngBounds([lastPos,ch.coord]).pad(.35);
    liveMapInstance.fitBounds(bounds);
    if(!liveMeMarker)liveMeMarker=L.circleMarker(lastPos,{radius:6,color:'#5aa5ff',fillColor:'#5aa5ff',fillOpacity:1,weight:2}).addTo(liveMapInstance);
    else liveMeMarker.setLatLng(lastPos);
    if(!liveLine)liveLine=L.polyline([lastPos,ch.coord],{color:'#d4a968',weight:2,dashArray:'5 6'}).addTo(liveMapInstance);
    else liveLine.setLatLngs([lastPos,ch.coord]);
  }else{
    liveMapDist.textContent='sin ubicación';
  }
}

function startGeoWatch(){
  if(!navigator.geolocation||geoWatchId!==null)return;
  geoWatchId=navigator.geolocation.watchPosition(
    pos=>{lastPos=[pos.coords.latitude,pos.coords.longitude];if(!game.classList.contains('open'))return;updateLiveMap()},
    ()=>{liveMapDist.textContent='ubicación no disponible'},
    {enableHighAccuracy:true,maximumAge:8000,timeout:15000}
  );
}
function stopGeoWatch(){if(geoWatchId!==null){navigator.geolocation.clearWatch(geoWatchId);geoWatchId=null}}

liveMap.addEventListener('click',openMap);
const _openGame=openGame,_closeGame=closeGame;
openGame=function(){_openGame();startGeoWatch()};
closeGame=function(){_closeGame();stopGeoWatch();stopCompass()};
document.querySelectorAll('[data-play]').forEach(b=>b.onclick=openGame);

// V56 · Fase 4 — brújula hacia la parada actual
const compassOverlay=document.getElementById('compassOverlay');
const compassArrow=document.getElementById('compassArrow');
const compassMsg=document.getElementById('compassMsg');
let compassHandler=null;

function bearing(a,b){
  const toRad=d=>d*Math.PI/180,toDeg=r=>r*180/Math.PI;
  const lat1=toRad(a[0]),lat2=toRad(b[0]),dLon=toRad(b[1]-a[1]);
  const y=Math.sin(dLon)*Math.cos(lat2);
  const x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  return (toDeg(Math.atan2(y,x))+360)%360;
}
function headingFromEvent(e){
  if(typeof e.webkitCompassHeading==='number')return e.webkitCompassHeading;
  if(typeof e.alpha==='number')return (360-e.alpha)%360;
  return null;
}
function paintCompass(){
  if(current>=CHAPTERS.length)return;
  const ch=CHAPTERS[current];
  document.getElementById('compassPlace').textContent=ch.placeShort;
  document.getElementById('compassDist').textContent=lastPos?fmtDist(haversine(lastPos,ch.coord)):'sin ubicación';
}
function onOrientation(e){
  const heading=headingFromEvent(e);
  if(heading===null||current>=CHAPTERS.length)return;
  const ch=CHAPTERS[current];
  if(!lastPos){compassMsg.textContent='Activa la ubicación para calcular la dirección.';return}
  const target=bearing(lastPos,ch.coord);
  const rot=(target-heading+360)%360;
  compassArrow.style.transform=`rotate(${rot}deg)`;
  compassMsg.textContent='Girad hasta que la flecha apunte hacia arriba.';
  compassMsg.classList.remove('err');
  paintCompass();
}
function startCompass(){
  const supported=typeof window.DeviceOrientationEvent!=='undefined';
  if(!supported){compassMsg.textContent='Este dispositivo no ofrece brújula (probadlo en un móvil real).';compassMsg.classList.add('err');return}
  const attach=()=>{
    const evt='ondeviceorientationabsolute' in window?'deviceorientationabsolute':'deviceorientation';
    compassHandler=onOrientation;
    window.addEventListener(evt,compassHandler,true);
  };
  if(typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().then(state=>{
      if(state==='granted')attach();
      else{compassMsg.textContent='Sin permiso de sensores no puede orientar la flecha. Actívalo en Ajustes del navegador.';compassMsg.classList.add('err')}
    }).catch(()=>{compassMsg.textContent='No se pudo pedir permiso de brújula en este navegador.';compassMsg.classList.add('err')});
  }else attach();
}
function stopCompass(){
  if(compassHandler){
    window.removeEventListener('deviceorientationabsolute',compassHandler,true);
    window.removeEventListener('deviceorientation',compassHandler,true);
    compassHandler=null;
  }
  compassOverlay.classList.remove('open');compassOverlay.setAttribute('aria-hidden','true');
}
function openCompass(){
  if(current>=CHAPTERS.length)return;
  paintCompass();
  compassMsg.textContent='Activando sensores…';compassMsg.classList.remove('err');
  compassOverlay.classList.add('open');compassOverlay.setAttribute('aria-hidden','false');
  startCompass();
}
document.getElementById('liveMapCompassBtn').addEventListener('click',e=>{e.stopPropagation();openCompass()});
document.getElementById('compassClose').addEventListener('click',stopCompass);
