const stage=document.getElementById('stage');
const game=document.getElementById('game');
const progress=document.getElementById('progress');
const gameLabel=document.getElementById('gameLabel');
const journal=document.getElementById('journal');
const mapModal=document.getElementById('mapModal');
let current=0, completed=new Set(), introSeen=false, tutorialSeen=false, mapInstance=null, landingScrollY=0;
const SAVE_KEY='promesa_chinchilla_v57_field_game';

function roman(n){return ['I','II','III','IV','V','VI','VII','VIII','IX'][n-1]}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({current,completed:[...completed],introSeen,tutorialSeen}))}
function load(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch{return null}}
function updateBar(){const n=Math.min(current+1,9);gameLabel.textContent=current<9?`CAPÍTULO ${roman(n)}`:'CASO CERRADO';progress.style.width=`${Math.min((completed.size/9)*100,100)}%`}
function scrollTop(){
  stage.scrollTop=0;
  game.scrollTop=0;
  if(typeof game.scrollTo==='function') game.scrollTo({top:0,left:0,behavior:'auto'});
}

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
  landingScrollY=window.scrollY||document.documentElement.scrollTop||0;
  document.body.classList.add('game-active');
  game.classList.add('open');
  game.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  document.documentElement.style.overflow='hidden';
  game.scrollTop=0;
  const s=load();
  if(s&&s.introSeen){current=Math.min(+s.current||0,8);completed=new Set(s.completed||[]);introSeen=true;tutorialSeen=!!s.tutorialSeen;showResume()}else startFresh();
}
function closeGame(){
  window.currentPuzzleCleanup?.();window.currentPuzzleCleanup=null;save();
  game.classList.remove('open');game.classList.remove('cinematic-mode');game.setAttribute('aria-hidden','true');
  document.body.classList.remove('game-active');
  document.body.style.overflow='';document.documentElement.style.overflow='';game.scrollTop=0;
  requestAnimationFrame(()=>window.scrollTo({top:landingScrollY,left:0,behavior:'auto'}));
}
function startFresh(){current=0;completed=new Set();introSeen=false;tutorialSeen=false;localStorage.removeItem(SAVE_KEY);updateBar();renderCinematic(0,()=>{introSeen=true;save();showTutorial()})}

function showTutorial(){
  tutorialSeen=true;save();scrollTop();liveMap.classList.add('hidden');
  stage.innerHTML=`<section class="investigation-tutorial-v53 field-tutorial-v57">
    <small>ANTES DE EMPEZAR · EXPERIENCIA DE CAMPO</small>
    <h2>El pueblo ya no es el fondo.<br><em>Es el tablero.</em></h2>
    <p>Esta versión está pensada para jugar caminando con el móvil. La ubicación desbloquea cada parada y algunas pruebas usan cámara, brújula o movimiento real.</p>
    <div class="tutorial-steps-v53">
      <article><span>01</span><b>LLEGA</b><p>El GPS confirma que estás en la zona de la misión. No hace falta clavar un punto exacto.</p></article>
      <article><span>02</span><b>OBSERVA</b><p>Busca arquitectura, texturas, vistas y recorridos. Varias pruebas usan lo que tienes delante.</p></article>
      <article><span>03</span><b>JUEGA</b><p>Desliza, fotografía, orienta, camina y espera patrones. Se acabó responder cuestionarios.</p></article>
    </div>
    <div class="privacy-note-v57"><i class="fa-solid fa-location-dot"></i><div><b>Ubicación y cámara</b><span>El navegador pedirá permiso cuando haga falta. La partida no guarda tus coordenadas ni las fotos en el progreso. Juega siempre parado cuando mires la pantalla.</span></div></div>
    <button class="btn primary" id="tutorialGoV53"><i class="fa-solid fa-location-crosshairs"></i> Activar primera parada</button>
  </section>`;
  document.getElementById('tutorialGoV53').onclick=()=>showLocationCheck(CHAPTERS[current]);
}

function showResume(){
  updateBar();liveMap.classList.add('hidden');
  stage.innerHTML=`<section class="resume"><small>PARTIDA ENCONTRADA</small><h2>El caso sigue abierto.</h2><p>${completed.size} de 9 capítulos resueltos.</p><button class="btn primary" id="resumeBtn"><i class="fa-solid fa-location-crosshairs"></i> Volver a la ruta</button><button class="btn ghost" id="restartBtn"><i class="fa-solid fa-rotate-left"></i> Empezar de nuevo</button></section>`;
  document.getElementById('resumeBtn').onclick=()=>tutorialSeen?showLocationCheck(CHAPTERS[current]):showTutorial();
  document.getElementById('restartBtn').onclick=startFresh;
}

function showBriefing(){
  const ch=CHAPTERS[current];updateBar();scrollTop();updateLiveMap();
  stage.innerHTML=`<section class="briefing"><img src="${ch.image}" alt="" class="brief-img"><div class="brief-shade"></div><div class="brief-copy"><small>CAPÍTULO ${roman(ch.n)} · ${ch.place}</small><h2>${ch.title}</h2><p>${ch.story}</p><div class="brief-meta-v53"><span><i class="${ch.icon}"></i> ${ch.kind}</span><span><i class="fa-solid fa-location-dot"></i> Zona validada</span><span><i class="fa-regular fa-clock"></i> ≈ ${ch.minutes} min</span></div><div class="mission-objective"><span>MISIÓN</span><b>${ch.question}</b><small>${ch.success}</small></div><div class="place-panel-v54"><article><small>ESTÁS EN</small><h4>${ch.placeShort}</h4><p>${ch.heritage}</p></article><article><small>LEVANTA LA VISTA</small><ul class="place-points"><li><i class="fa-regular fa-eye"></i><span>${ch.lookfor}</span></li><li><i class="fa-regular fa-lightbulb"></i><span>${ch.visitTip}</span></li></ul></article><article class="real-history-v55"><small>HISTORIA REAL</small><p>${ch.realHistory}</p><a href="${ch.officialUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Fuente oficial</a></article></div><button class="btn primary" id="briefStart"><i class="fa-solid fa-gamepad"></i> Empezar prueba</button></div></section>`;
  document.getElementById('briefStart').onclick=()=>renderPuzzle(ch);
}

function enterChapterScene(ch){
  scrollTop();
  liveMap.classList.add('hidden');
  const beats=CINEMATICS[ch.n];
  if(beats?.length)renderCinematic(ch.n,()=>showBriefing());
  else showBriefing();
}

function completeChapter(ch){
  window.currentPuzzleCleanup?.();window.currentPuzzleCleanup=null;
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
  const status=locationStatus(ch);
  stage.innerHTML=`<section class="travel field-travel-v57"><small>SIGUIENTE DESTINO · CAPÍTULO ${roman(ch.n)}</small><h2>${ch.place}</h2><p>${ch.fieldPrompt||'Acércate al siguiente punto de la ruta.'}</p><div class="travel-distance-v57"><i class="fa-solid fa-location-arrow"></i><div><small>DISTANCIA AHORA</small><b id="travelDistance57">${status.distance==null?'Activa ubicación':fmtDist(status.distance)}</b></div><span>${ch.radius||90} m zona</span></div><div class="travel-tip"><i class="fa-solid fa-person-walking"></i><span>${ch.fieldAction||ch.lookfor}</span></div><div class="travel-place-v54"><article><small>QUÉ MIRAR</small><p>${ch.lookfor}</p></article><article><small>HISTORIA REAL</small><p>${ch.realHistory}</p></article></div><div class="travel-actions"><button class="btn ghost" id="travelMap"><i class="fa-solid fa-route"></i> Mapa</button><button class="btn primary" id="arrived"><i class="fa-solid fa-location-crosshairs"></i> Comprobar llegada</button></div></section>`;
  document.getElementById('travelMap').onclick=openMap;
  document.getElementById('arrived').onclick=()=>showLocationCheck(ch);
}

function showLocationCheck(ch){
  scrollTop();liveMap.classList.add('hidden');
  const render=()=>{
    const s=locationStatus(ch),radius=ch.radius||90,near=s.near||s.demo;
    stage.innerHTML=`<section class="location-gate-v57">
      <div class="location-orbit-v57 ${near?'ready':''}"><i class="fa-solid ${near?'fa-check':'fa-location-crosshairs'}"></i><span></span></div>
      <small>${s.demo?'MODO DEMO':'CONTROL DE ZONA'}</small>
      <h2>${ch.placeShort}</h2>
      <p>${ch.fieldPrompt||ch.lookfor}</p>
      <div class="location-readout-v57">
        <article><small>DISTANCIA</small><b id="gateDistance57">${s.distance==null?'—':fmtDist(s.distance)}</b></article>
        <article><small>PRECISIÓN GPS</small><b>${s.accuracy?`±${Math.round(s.accuracy)} m`:'—'}</b></article>
        <article><small>ZONA DE JUEGO</small><b>${radius} m</b></article>
      </div>
      <div class="location-state-v57 ${near?'ok':''}"><i class="fa-solid ${near?'fa-circle-check':'fa-satellite-dish'}"></i><span>${s.demo?'Prototipo desbloqueado fuera de Chinchilla.':near?'Estás dentro de la zona. La escena puede comenzar.':s.distance==null?'Necesito una posición para saber si has llegado.':`Acércate ${fmtDist(Math.max(0,s.distance-s.threshold))} aproximadamente.`}</span></div>
      <button class="btn ${near?'primary':'ghost'} full" id="locate57"><i class="fa-solid fa-location-crosshairs"></i> ${near?'Actualizar posición':'Activar / actualizar ubicación'}</button>
      <button class="btn primary full" id="enterField57" ${near?'':'disabled'}><i class="fa-solid fa-gamepad"></i> Entrar en la escena</button>
      ${!s.demo&&canFieldDemo()?'<button class="location-demo-v57" id="demoField57">Modo demo para revisión técnica</button>':''}
      <p class="location-privacy-v57"><i class="fa-solid fa-shield-halved"></i> El progreso no guarda coordenadas. La geolocalización depende del permiso y precisión del navegador.</p>
    </section>`;
    document.getElementById('locate57').onclick=async()=>{const btn=document.getElementById('locate57');btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Buscando señal';await requestLocationFix();render()};
    document.getElementById('enterField57').onclick=()=>enterChapterScene(ch);
    document.getElementById('demoField57')?.addEventListener('click',()=>{sessionStorage.setItem('promesa_field_demo','1');render()});
  };
  render();
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
let liveMapInstance=null, liveMeMarker=null, liveTargetMarker=null, liveLine=null, geoWatchId=null, lastPos=null, lastAccuracy=null, lastHeading=null;

function haversine(a,b){
  const R=6371000,toRad=d=>d*Math.PI/180;
  const dLat=toRad(b[0]-a[0]),dLon=toRad(b[1]-a[1]);
  const s=Math.sin(dLat/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}
function fmtDist(m){return m<1000?`${Math.max(0,Math.round(m/10)*10)} m`:`${(m/1000).toFixed(1)} km`}
function canFieldDemo(){return location.protocol==='file:'||['localhost','127.0.0.1'].includes(location.hostname)||new URLSearchParams(location.search).get('dev')==='1'}
function locationStatus(ch){
  const demo=sessionStorage.getItem('promesa_field_demo')==='1'||new URLSearchParams(location.search).get('demo')==='1';
  const distance=lastPos?haversine(lastPos,ch.coord):null;
  const radius=ch.radius||90;
  const accuracy=Number.isFinite(lastAccuracy)?lastAccuracy:null;
  const threshold=Math.max(radius,Math.min((accuracy||0)+25,145));
  return {demo,distance,accuracy,threshold,near:distance!=null&&distance<=threshold};
}
function requestLocationFix(){
  return new Promise(resolve=>{
    if(!navigator.geolocation){resolve(false);return}
    navigator.geolocation.getCurrentPosition(pos=>{
      lastPos=[pos.coords.latitude,pos.coords.longitude];lastAccuracy=pos.coords.accuracy||null;
      window.dispatchEvent(new CustomEvent('field:location',{detail:{position:lastPos,accuracy:lastAccuracy}}));
      updateLiveMap();resolve(true);
    },()=>resolve(false),{enableHighAccuracy:true,maximumAge:2000,timeout:12000});
  });
}

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
    if(!window.L||!liveMapInstance)return;
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
    pos=>{lastPos=[pos.coords.latitude,pos.coords.longitude];lastAccuracy=pos.coords.accuracy||null;window.dispatchEvent(new CustomEvent('field:location',{detail:{position:lastPos,accuracy:lastAccuracy}}));if(!game.classList.contains('open'))return;updateLiveMap()},
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
  lastHeading=heading;window.dispatchEvent(new CustomEvent('field:heading',{detail:{heading}}));
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
  if(compassHandler)return Promise.resolve(true);
  const supported=typeof window.DeviceOrientationEvent!=='undefined';
  if(!supported){compassMsg.textContent='Este dispositivo no ofrece brújula.';compassMsg.classList.add('err');return Promise.resolve(false)}
  const attach=()=>{const evt='ondeviceorientationabsolute' in window?'deviceorientationabsolute':'deviceorientation';compassHandler=onOrientation;window.addEventListener(evt,compassHandler,true);return true};
  if(typeof DeviceOrientationEvent.requestPermission==='function'){
    const ask=()=>{try{const p=DeviceOrientationEvent.requestPermission(true);return Promise.resolve(p).catch(()=>DeviceOrientationEvent.requestPermission())}catch{return DeviceOrientationEvent.requestPermission()}};
    return ask().then(state=>{if(state==='granted')return attach();compassMsg.textContent='Sin permiso de sensores no se puede orientar la flecha.';compassMsg.classList.add('err');return false}).catch(()=>false);
  }
  return Promise.resolve(attach());
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
window.GeoMission={
  get position(){return lastPos},get accuracy(){return lastAccuracy},get heading(){return lastHeading},
  get demo(){return locationStatus(CHAPTERS[Math.min(current,CHAPTERS.length-1)]).demo},
  status:locationStatus,distance:(a,b)=>haversine(a,b),bearing:(a,b)=>bearing(a,b),
  requestLocation:requestLocationFix,enableHeading:startCompass
};

document.getElementById('liveMapCompassBtn').addEventListener('click',e=>{e.stopPropagation();openCompass()});
document.getElementById('compassClose').addEventListener('click',stopCompass);
