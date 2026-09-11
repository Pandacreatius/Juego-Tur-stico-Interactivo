const PuzzleUI={
  hintIndex:0,
  currentCh:null,
  misses:{},
  hint(ch){
    this.hintIndex=Math.min(this.hintIndex+1,3);
    const box=document.getElementById('hintText');
    const level=document.getElementById('hintLevel');
    if(box){box.hidden=false;box.textContent=ch.hints[this.hintIndex-1]}
    if(level)level.textContent=`PISTA ${this.hintIndex}/3`;
    const btn=document.getElementById('hintBtn');
    if(btn)btn.innerHTML=this.hintIndex>=3?'<i class="fa-solid fa-circle-check"></i> Solución guiada mostrada':'<i class="fa-regular fa-lightbulb"></i> Ver siguiente pista';
    aldaraSay(this.hintIndex===1?'Vale. Una pista, pero seguimos pensando nosotros.':this.hintIndex===2?'Miremos solo lo que puede cambiar la explicación.':'Aquí ya casi os lo estoy señalando con el dedo.');
  },
  resetHints(){this.hintIndex=0},
  shell(ch,body){
    return `<section class="puzzle-wrap v49-puzzle">
      <div class="chapter-head"><small>CAPÍTULO ${roman(ch.n)} · ${ch.kind} · ${ch.difficulty}</small><h2>${ch.title}</h2>
        <div class="case-strip-v53"><div><span>PREGUNTA DEL CASO</span><b>${ch.question}</b></div><div><span>PARA AVANZAR</span><b>${ch.success}</b></div></div>
      </div>
      <aside class="aldara-companion" id="aldaraCompanion"><img src="assets/aldara_think.webp" alt="Aldara"><div><small>ALDARA · INVESTIGACIÓN</small><p id="aldaraLine">${aldaraIntro(ch.n)}</p></div></aside>
      ${body}
      <div class="hint-panel"><div class="hint-head-v53"><span id="hintLevel">PISTAS OPCIONALES · 0/3</span><small id="hintNudge">No penalizan.</small></div><button class="btn ghost compact" id="hintBtn"><i class="fa-regular fa-lightbulb"></i> Necesito una pista</button><p id="hintText" hidden></p></div>
    </section>`
  }
};

function aldaraIntro(n){return [
  'No quiero decidir qué versión me gusta. Quiero saber cuál aguanta las pruebas.',
  'Una escena no habla, pero deja rastros. Vamos a leerlos en orden.',
  'Si Amina hizo esto varias noches, tuvo que tener un plan bastante bueno.',
  'Aquí el truco no es ir rápido. Es conseguir que nadie te vea.',
  'Si inventaron un código, cada símbolo debería funcionar siempre igual.',
  'No busquemos un culpable todavía. Primero demostremos desde dónde miraba.',
  'Ferran no podía correr a ciegas. Tuvo que esperar el instante exacto.',
  'Los documentos no mienten solos. A veces alguien los hace mentir juntos.',
  'Todo lo que necesitamos ya lo hemos visto. Ahora toca conectar el caso.'
][n-1]||'Vamos a mirar bien antes de decidir.'}
function aldaraSay(text){const el=document.getElementById('aldaraLine');if(el)el.textContent=text}
function bindHints(ch){document.getElementById('hintBtn')?.addEventListener('click',()=>PuzzleUI.hint(ch))}
function feedback(msg,type='info'){
  const el=document.getElementById('feedback');
  if(el){el.textContent=msg;el.className=`feedback ${type}`}
  if(type==='bad'&&PuzzleUI.currentCh){
    const n=PuzzleUI.currentCh.n;
    PuzzleUI.misses[n]=(PuzzleUI.misses[n]||0)+1;
    const btn=document.getElementById('hintBtn'),nudge=document.getElementById('hintNudge');
    if(PuzzleUI.misses[n]===2&&btn){btn.classList.add('hint-ready-v53');btn.innerHTML='<i class="fa-regular fa-lightbulb"></i> Aldara tiene una idea';if(nudge)nudge.textContent='Dos intentos fallidos. Una pista puede ayudar sin resolverlo.'}
    if(PuzzleUI.misses[n]>=4&&btn){btn.classList.add('hint-ready-v53');btn.innerHTML='<i class="fa-solid fa-route"></i> Ver pista guiada';if(nudge)nudge.textContent='Podéis pedir ayuda completa. No hay penalización.'}
  }
}
function solve(ch){aldaraSay('Lo tenemos. Guardad esto: más adelante puede volver a importar.');setTimeout(()=>completeChapter(ch),650)}
function renderPuzzle(ch){
  PuzzleUI.resetHints();
  PuzzleUI.currentCh=ch;
  PuzzleUI.misses[ch.n]=0;
  return [puzzle1,puzzle2,puzzle3,puzzle4,puzzle5,puzzle6,puzzle7,puzzle8,puzzle9][ch.n-1](ch)
}

function assignableBoard({cards,bins,onReady}){
  let selected=null;const assigned={};
  const deck=document.getElementById('assignDeck');
  const paint=()=>{
    deck.querySelectorAll('[data-card]').forEach(card=>{
      const id=card.dataset.card;card.classList.toggle('selected',selected===id);card.classList.toggle('assigned',!!assigned[id]);
    });
    document.querySelectorAll('[data-bin]').forEach(bin=>{
      const ids=Object.keys(assigned).filter(id=>assigned[id]===bin.dataset.bin);
      const out=bin.querySelector('.bin-items');out.innerHTML=ids.map(id=>`<span>${cards.find(c=>c.id===id).short}</span>`).join('')||'<em>Vacío</em>';
    });
    onReady?.(assigned);
  };
  deck.querySelectorAll('[data-card]').forEach(card=>card.onclick=()=>{selected=card.dataset.card;paint()});
  document.querySelectorAll('[data-bin]').forEach(bin=>bin.onclick=()=>{if(!selected)return;assigned[selected]=bin.dataset.bin;selected=null;paint()});
  paint();return assigned;
}

function puzzle1(ch){
  const sources={
    chronicle:{name:'Crónica de campaña',meta:'COPIA TARDÍA · RELATO MILITAR',lines:[
      ['c1','Tras la escaramuza, un caballero cristiano fue visto abandonar la zona antes del amanecer.'],
      ['c2','Días después, la hija del alcaide dejó de aparecer en público.']
    ]},
    legend:{name:'La leyenda de Amina',meta:'TRADICIÓN ORAL · VERSIÓN POPULAR',lines:[
      ['l1','El caballero huyó sin despedirse cuando recuperó las fuerzas.'],
      ['l2','Amina esperó en vano una señal que nunca llegó.']
    ]},
    notebook:{name:'Cuaderno del abuelo',meta:'NOTA PERSONAL · ORIGEN SIN CATALOGAR',lines:[
      ['n1','Ferran dejó una carta antes de huir.'],
      ['n2','La carta no aparece mencionada en las versiones posteriores de la leyenda.']
    ]}
  };
  let open='chronicle',selected=[];
  const body=`<div class="case-question"><span>01 · ABRIR EL CASO</span><h3>¿Hay algo en la leyenda que no pueda encajar?</h3><p>Leed las tres fuentes. Después conectad <b>dos frases</b> que obliguen a replantear la historia.</p></div>
  <div class="source-workbench">
    <div class="source-tabs">${Object.entries(sources).map(([id,o])=>`<button data-source="${id}" class="${id===open?'active':''}"><small>${o.meta.split(' · ')[0]}</small>${o.name}</button>`).join('')}</div>
    <article class="source-paper" id="sourcePaper"></article>
  </div>
  <div class="pinboard-v50">
    <div class="pinboard-head"><small>CONEXIÓN ACTIVA</small><span id="pinHelp">Seleccionad una frase de una fuente.</span></div>
    <div class="pin-pair" id="pinPair"><button class="empty-pin">1</button><i></i><button class="empty-pin">2</button></div>
    <button class="btn primary full" id="connectEvidence"><i class="fa-solid fa-link"></i> Conectar evidencias</button>
  </div>
  <div id="caseReveal" class="case-reveal" hidden></div><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const allLines=Object.values(sources).flatMap(s=>s.lines);
  const getLine=id=>allLines.find(x=>x[0]===id)?.[1]||'';
  const paintSource=()=>{
    const src=sources[open];
    document.getElementById('sourcePaper').innerHTML=`<small>${src.meta}</small><h3>${src.name}</h3><div class="source-lines">${src.lines.map(([id,text])=>`<button data-line="${id}" class="${selected.includes(id)?'selected':''}"><span class="pin-dot"></span><p>${text}</p></button>`).join('')}</div><em>Selecciona únicamente lo que quieras llevar al tablero.</em>`;
    stage.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.line;
      if(selected.includes(id)) selected=selected.filter(x=>x!==id);
      else { if(selected.length===2) selected.shift(); selected.push(id); }
      paintSource();paintPins();
    });
  };
  const paintPins=()=>{
    const box=document.getElementById('pinPair');
    box.innerHTML=`<button class="${selected[0]?'filled-pin':'empty-pin'}" data-unpin="0">${selected[0]?getLine(selected[0]):'1'}</button><i class="${selected.length===2?'linked':''}"></i><button class="${selected[1]?'filled-pin':'empty-pin'}" data-unpin="1">${selected[1]?getLine(selected[1]):'2'}</button>`;
    box.querySelectorAll('[data-unpin]').forEach(b=>b.onclick=()=>{if(selected[+b.dataset.unpin]){selected.splice(+b.dataset.unpin,1);paintSource();paintPins()}});
    document.getElementById('pinHelp').textContent=selected.length===0?'Seleccionad una frase de una fuente.':selected.length===1?'Ahora buscad otra frase que choque con la primera.':'Dos frases preparadas. ¿Realmente se contradicen?';
  };
  stage.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{open=b.dataset.source;stage.querySelectorAll('[data-source]').forEach(x=>x.classList.toggle('active',x===b));paintSource()});
  paintSource();paintPins();
  document.getElementById('connectEvidence').onclick=()=>{
    if(selected.length<2){feedback('Necesitáis dos frases para construir una contradicción.','bad');aldaraSay('Una fuente sola puede estar equivocada. Necesitamos hacer que dos versiones se enfrenten.');return}
    const pair=[...selected].sort().join('|');
    if(pair==='l1|n1'){
      const reveal=document.getElementById('caseReveal');reveal.hidden=false;
      reveal.innerHTML=`<small>NUEVA PREGUNTA DEL CASO</small><h3>Si Ferran sí se despidió…</h3><p>¿por qué Amina murió creyendo que la había abandonado?</p><button class="btn primary full" id="acceptCase">Guardar contradicción</button>`;
      feedback('Conexión válida. “Huyó sin despedirse” y “dejó una carta” no pueden explicar la misma historia sin que falte algo.','ok');
      aldaraSay('Eso es lo que buscaba. Ya no investigamos si Ferran huyó. Investigamos qué ocurrió con esa carta.');
      document.getElementById('acceptCase').onclick=()=>solve(ch);
    } else {
      feedback('Esas dos frases pueden convivir. Buscad una pareja en la que una afirmación vuelva imposible la otra.','bad');
      aldaraSay('No busquéis dos frases diferentes. Buscad dos frases que cambien el significado de la despedida.');
    }
  };
}

function puzzle2(ch){
  const ev={
    stirrup:{name:'Estribo roto',desc:'La correa está partida y tiene tierra fresca. Algo hizo caer al jinete.',role:'caída'},
    hoof:{name:'Huellas de caballo',desc:'Las marcas se alejan de la muralla y vuelven hacia el campo sin jinete.',role:'separación'},
    blood:{name:'Rastro de sangre',desc:'Empieza donde terminan las pisadas profundas y continúa hacia la subida.',role:'a pie'},
    cloth:{name:'Tela enganchada',desc:'Un trozo de tejido está atrapado en un paso estrecho junto al muro.',role:'acceso'},
    sword:{name:'Espada caída',desc:'Es cristiana, pero pudo quedar en el terreno durante el combate.',role:'distractor'},
    coin:{name:'Moneda',desc:'No hay forma de saber cuándo cayó aquí.',role:'distractor'},
    ash:{name:'Ceniza vieja',desc:'Está fría y cubierta de polvo. Es anterior a la escaramuza.',role:'distractor'}
  };
  const correct=['stirrup','hoof','blood','cloth'];
  let inspected=new Set(),selected=null,chain=[null,null,null,null],scan=false;
  const sceneObjects={stirrup:['fa-solid fa-horse-head',18,66],hoof:['fa-solid fa-horse',31,47],blood:['fa-solid fa-droplet',51,60],cloth:['fa-solid fa-scroll',76,33],sword:['fa-solid fa-khanda',61,75],coin:['fa-solid fa-coins',42,27],ash:['fa-solid fa-fire-flame-curved',83,67]};
  const body=`<div class="case-question"><span>02 · LEER UNA ESCENA</span><h3>¿Cómo llegó Ferran hasta donde Amina lo encontró?</h3><p>Primero inspeccionad el terreno. Después usad solo los rastros que explican <b>movimiento</b>.</p></div>
  <div class="forensic-board-v50 ${scan?'scan-on':''}" id="forensicBoard">
    <div class="terrain-path p1"></div><div class="terrain-path p2"></div><div class="terrain-wall"></div><div class="narrow-gap">PASO</div>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path class="ghost-trail" id="ghostTrail" d="M18 66 C30 53,39 50,51 60 S68 45,76 33"/></svg>
    ${Object.entries(sceneObjects).map(([id,v])=>`<button class="scene-object" data-hot="${id}" style="left:${v[1]}%;top:${v[2]}%" aria-label="Inspeccionar indicio"><span><i class="${v[0]}"></i></span></button>`).join('')}
    <button class="scan-toggle" id="scanToggle"><i class="fa-solid fa-magnifying-glass"></i><span>Modo inspección</span></button>
  </div>
  <div class="inspect-drawer-v50" id="inspectDrawer"><small>CUADERNO DE CAMPO</small><p id="inspectText">Tocad un indicio para que Aldara lo examine.</p></div>
  <div id="rebuildPhase" class="rebuild-phase-v50" hidden>
    <div class="phase-title"><span>SEGUNDA FASE</span><h3>Reconstruid el recorrido</h3><p>Elegid una evidencia y colocadla en la etapa que explica.</p></div>
    <div class="evidence-strip-v50" id="foundEvidence"></div>
    <div class="cause-slots-v50">
      ${[['PÉRDIDA DE CONTROL','¿Qué muestra la caída?'],['SEPARACIÓN','¿Qué demuestra que quedó solo?'],['AVANZA A PIE','¿Qué marca su recorrido?'],['LLEGA AL PASO','¿Qué confirma el acceso final?']].map((x,i)=>`<button data-slot="${i}"><small>${i+1} · ${x[0]}</small><b>?</b><em>${x[1]}</em></button>`).join('')}
    </div>
    <button class="btn primary full" id="checkScene"><i class="fa-solid fa-play"></i> Reproducir reconstrucción</button>
  </div><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const board=document.getElementById('forensicBoard');
  const paintEvidence=()=>{
    const box=document.getElementById('foundEvidence');
    const ids=[...inspected];
    box.innerHTML=ids.map(id=>`<button data-found="${id}" class="${selected===id?'selected':''}"><b>${ev[id].name}</b><small>${ev[id].role==='distractor'?'sin clasificar':'rastro físico'}</small></button>`).join('');
    box.querySelectorAll('[data-found]').forEach(b=>b.onclick=()=>{selected=b.dataset.found;paintEvidence()});
  };
  const paintChain=()=>stage.querySelectorAll('[data-slot]').forEach((b,i)=>{const id=chain[i];b.querySelector('b').textContent=id?ev[id].name:'?';b.classList.toggle('filled',!!id)});
  document.getElementById('scanToggle').onclick=()=>{scan=!scan;board.classList.toggle('scan-on',scan);document.getElementById('scanToggle').classList.toggle('active',scan);aldaraSay(scan?'Ahora sí: buscad marcas que cuenten una dirección, no objetos que solo parezcan importantes.':'Podéis volver a activar la inspección cuando queráis.')};
  stage.querySelectorAll('[data-hot]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.hot;inspected.add(id);b.classList.add('seen');
    document.getElementById('inspectText').innerHTML=`<b>${ev[id].name}</b><br>${ev[id].desc}`;
    aldaraSay(ev[id].role==='distractor'?'Puede ser auténtico, pero no necesariamente explica cómo se movió Ferran.':'Esto sí tiene dirección. Guardémoslo.');
    if(inspected.size>=4){document.getElementById('rebuildPhase').hidden=false;paintEvidence()}
  });
  stage.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.slot;
    if(chain[i]){chain[i]=null;paintChain();return}
    if(!selected){feedback('Seleccionad primero una evidencia del cuaderno de campo.');return}
    const prev=chain.indexOf(selected);if(prev>=0)chain[prev]=null;
    chain[i]=selected;selected=null;paintEvidence();paintChain();
  });
  document.getElementById('checkScene').onclick=()=>{
    if(chain.some(x=>!x)){feedback('La reconstrucción necesita cuatro evidencias, una por etapa.','bad');return}
    if(chain.every((x,i)=>x===correct[i])){
      board.classList.add('route-solved');document.getElementById('ghostTrail').classList.add('on');
      feedback('La escena cobra sentido: caída → caballo de regreso → Ferran continúa herido → alcanza el paso lateral.','ok');
      aldaraSay('Ahora lo veo. Amina no encontró a un caballero en una batalla. Encontró a un hombre que ya no podía seguir solo.');
      setTimeout(()=>solve(ch),900);
    }else{
      feedback('La historia física no encaja todavía. Cada etapa pregunta algo distinto: caída, separación, movimiento a pie y acceso.','bad');
      aldaraSay('No ordenéis por lo llamativo. Ordenad por lo que tuvo que ocurrir primero para que existiera la pista siguiente.');
    }
  };
  paintChain();
}

function puzzle3(ch){
  const items={
    water:{name:'Agua',w:1,need:'agua'},bandage:{name:'Vendas',w:1,need:'herida'},figs:{name:'Higos secos',w:1,need:'alimento'},
    lamp:{name:'Lámpara',w:2},blanket:{name:'Manta',w:3},bowl:{name:'Cuenco',w:1},oil:{name:'Aceite perfumado',w:1}
  };
  const notes={
    round:{title:'Ronda de la puerta',text:'La patrulla vuelve a la plaza poco antes de la última hora. Durante el relevo, la puerta queda cubierta pero las calles laterales pierden vigilancia.'},
    baths:{title:'Cierre de los baños',text:'Tras el cierre se apagan las lámparas del lateral. Los trabajadores ya no usan ese paso cuando comienza el último relevo.'},
    wound:{title:'Estado de Ferran',text:'Tiene sed, la herida vuelve a abrirse y necesita algo que pueda comer sin cocinar. Amina no puede llevar una carga que parezca preparada para una estancia larga.'}
  };
  let read=new Set(),time='',route='',bag=new Set(),simulating=false;
  const body=`<div class="case-question"><span>03 · PENSAR COMO AMINA</span><h3>Una visita no basta. ¿Cómo pudo volver sin levantar sospechas?</h3><p>Leed las notas, preparad un plan y <b>simuladlo</b>. El juego no os dirá el riesgo hasta que Amina intente recorrerlo.</p></div>
  <div class="dossier-v50">${Object.entries(notes).map(([id,n])=>`<button data-note="${id}"><small>DOCUMENTO</small><b>${n.title}</b><span>Abrir</span></button>`).join('')}</div>
  <div class="note-reader-v50" id="noteReader"><small>NOTAS DE ALDARA</small><p>Elegid uno de los documentos.</p></div>
  <div class="plan-table-v50">
    <section><small>1 · HORA DE SALIDA</small><div class="choice-tiles-v50">${[['21','21:00','Calles aún activas'],['22','22:00','Comienza el relevo'],['23','23:00','Último relevo']].map(x=>`<button data-time="${x[0]}"><b>${x[1]}</b><span>${x[2]}</span></button>`).join('')}</div></section>
    <section><small>2 · RUTA</small><div class="route-map-v50"><div class="route-branch main"><i></i><button data-route="gate">Puerta principal</button></div><div class="route-branch market"><i></i><button data-route="market">Mercado</button></div><div class="route-branch baths"><i></i><button data-route="baths">Lateral de los baños</button></div><span class="start-dot">AMINA</span><span class="end-dot">REFUGIO</span></div></section>
    <section><small>3 · QUÉ LLEVAR · MÁX. 3 UNIDADES</small><div class="bag-status-v50"><b id="bagWeight">0 / 3</b><span id="bagText">La bolsa está vacía.</span></div><div class="inventory-grid-v50">${Object.entries(items).map(([id,o])=>`<button data-item="${id}"><b>${o.name}</b><small>${o.w} u.</small></button>`).join('')}</div></section>
  </div>
  <button class="btn primary full" id="simulatePlan"><i class="fa-solid fa-person-walking"></i> Simular visita</button>
  <div class="simulation-v50" id="simulation" hidden><div class="sim-track"><span data-sim="1">SALE</span><i></i><span data-sim="2">CRUZA</span><i></i><span data-sim="3">LLEGA</span></div><p id="simText"></p></div>
  <div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const paintPlan=()=>{
    stage.querySelectorAll('[data-time]').forEach(b=>b.classList.toggle('selected',b.dataset.time===time));
    stage.querySelectorAll('[data-route]').forEach(b=>b.classList.toggle('selected',b.dataset.route===route));
    stage.querySelectorAll('[data-item]').forEach(b=>b.classList.toggle('selected',bag.has(b.dataset.item)));
    const w=[...bag].reduce((s,id)=>s+items[id].w,0);document.getElementById('bagWeight').textContent=`${w} / 3`;
    document.getElementById('bagText').textContent=bag.size?[...bag].map(id=>items[id].name).join(' · '):'La bolsa está vacía.';
  };
  stage.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.note;read.add(id);b.classList.add('read');
    document.getElementById('noteReader').innerHTML=`<small>${notes[id].title.toUpperCase()}</small><p>${notes[id].text}</p>`;
    if(read.size===3)aldaraSay('Ya tenemos las tres restricciones. Ahora no busquemos “la respuesta”; construyamos una visita que sobreviva a las tres.');
  });
  stage.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{time=b.dataset.time;paintPlan()});
  stage.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{route=b.dataset.route;paintPlan()});
  stage.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{const id=b.dataset.item;bag.has(id)?bag.delete(id):bag.add(id);paintPlan()});
  document.getElementById('simulatePlan').onclick=()=>{
    if(simulating)return;
    if(read.size<3){feedback('Antes de simular, revisad los tres documentos. Cada uno contiene una restricción distinta.','bad');aldaraSay('Si vamos a arriesgar a Amina, al menos usemos toda la información que tenemos.');return}
    if(!time||!route||bag.size===0){feedback('El plan está incompleto: elegid hora, ruta y contenido de la bolsa.','bad');return}
    simulating=true;const sim=document.getElementById('simulation');sim.hidden=false;
    sim.querySelectorAll('[data-sim]').forEach(x=>x.className='');document.getElementById('simText').textContent='Amina cierra la puerta y comienza a caminar…';
    const w=[...bag].reduce((s,id)=>s+items[id].w,0);
    setTimeout(()=>{
      const s1=sim.querySelector('[data-sim="1"]');
      if(time!=='23'){s1.classList.add('fail');document.getElementById('simText').textContent=time==='21'?'Demasiado pronto: todavía hay movimiento y una patrulla la reconoce al salir.':'El relevo aún no ha terminado. Amina queda detenida esperando y llama la atención.';feedback('El plan falla en la hora de salida. Volved a las notas de ronda.','bad');aldaraSay('Bien, esto nos sirve. Sabemos dónde falla. Ajustemos solo la hora, no todo el plan.');simulating=false;return}
      s1.classList.add('ok');document.getElementById('simText').textContent='Sale durante el último relevo. Nadie repara en ella.';
      setTimeout(()=>{
        const s2=sim.querySelector('[data-sim="2"]');
        if(route!=='baths'){s2.classList.add('fail');document.getElementById('simText').textContent=route==='gate'?'La puerta principal tiene vigilancia fija. No puede pasar con una bolsa sin dar explicaciones.':'El mercado parece más corto, pero una ronda irregular la obliga a detenerse bajo la luz.';feedback('La ruta expone demasiado a Amina. Buscad un paso que quede vacío después del cierre.','bad');aldaraSay('La ruta más directa no es la más segura. ¿Qué lugar deja de tener actividad a esa hora?');simulating=false;return}
        s2.classList.add('ok');document.getElementById('simText').textContent='El lateral de los baños está oscuro y vacío. Amina cruza sin ser vista.';
        setTimeout(()=>{
          const s3=sim.querySelector('[data-sim="3"]');
          const needs=['water','bandage','figs'];
          if(w>3){s3.classList.add('fail');document.getElementById('simText').textContent='La bolsa es demasiado voluminosa. Parece preparada para una estancia y no para un recado.';feedback('La carga delata el plan. Máximo 3 unidades.','bad');aldaraSay('Que algo sea útil no significa que pueda llevarlo sin levantar sospechas.');simulating=false;return}
          const missing=needs.filter(x=>!bag.has(x));
          if(missing.length){s3.classList.add('fail');document.getElementById('simText').textContent=`Amina llega, pero el plan no resuelve todo: falta ${missing.map(x=>items[x].name.toLowerCase()).join(' y ')}.`;feedback('Llegar no basta. Ferran necesita agua, cuidado de la herida y alimento que no requiera cocinar.','bad');aldaraSay('La ruta funciona. Ahora el fallo está en lo que llevamos. Eso ya es mucho más fácil de corregir.');simulating=false;return}
          s3.classList.add('ok');document.getElementById('simText').textContent='Amina llega con una bolsa pequeña: agua, vendas e higos. Ferran puede pasar otra noche oculto.';
          feedback('Plan viable. No fue una visita improvisada: Amina aprendió a convertir el riesgo en una rutina.','ok');aldaraSay('Ahora entiendo por qué esto importa. Volver una vez más fue una decisión. Volver noche tras noche ya era elegirlo.');simulating=false;setTimeout(()=>solve(ch),1000);
        },800);
      },800);
    },700);
  };
  paintPlan();
}

function puzzle4(ch){
  let angle=180,shiftX=6,shiftY=-6,route=[],simulating=false;
  const currentAnchors={tower:[20,20],fountain:[70,68],arch:[48,38]};
  const oldAnchors={tower:[20,80],fountain:[68,30],arch:[38,52]};
  const nodes={1:[10,78],2:[27,58],3:[33,82],4:[50,50],5:[59,78],6:[73,52],7:[90,72]};
  const edges={1:[2,3],2:[1,4],3:[1,4,5],4:[2,3,5,6],5:[3,4,7],6:[4,7],7:[5,6]};
  const unsafe=new Set([2,4,6]);
  const correct=[1,3,5,7];
  const body=`<div class="case-question"><span>04 · LEER DOS CIUDADES A LA VEZ</span><h3>¿Por dónde podía pasar Amina sin cruzarse con las rondas?</h3><p>Primero haced coincidir el croquis antiguo con la ciudad actual. Después utilizad esa orientación para planear y <b>simular</b> su recorrido.</p></div>
  <section class="map-align-v51" id="mapAlignPhase">
    <div class="phase-title"><span>FASE 1 · SUPERPONER</span><h3>Alinead tres hitos</h3><p>Torre, fuente y arco aparecen en ambos planos. El papel antiguo está girado y desplazado.</p></div>
    <div class="dual-map-v51">
      <div class="modern-map-v51"><span class="street s1"></span><span class="street s2"></span><span class="street s3"></span>${Object.entries(currentAnchors).map(([id,p])=>`<i class="anchor modern ${id}" style="left:${p[0]}%;top:${p[1]}%"><b>${id==='tower'?'TORRE':id==='fountain'?'FUENTE':'ARCO'}</b></i>`).join('')}</div>
      <div class="old-map-v51" id="oldMapV51">${Object.entries(oldAnchors).map(([id,p])=>`<i class="anchor old ${id}" style="left:${p[0]}%;top:${p[1]}%"><b><i class="fa-solid ${id==='tower'?'fa-tower-observation':id==='fountain'?'fa-water':'fa-archway'}"></i></b></i>`).join('')}<span class="old-road r1"></span><span class="old-road r2"></span><span class="old-road r3"></span></div>
      <div class="align-score-v51"><small>COINCIDENCIA</small><strong id="mapMatch">—</strong></div>
    </div>
    <div class="map-nudges-v51"><button data-nudge="left" aria-label="Mover izquierda"><i class="fa-solid fa-arrow-left"></i></button><button data-nudge="up" aria-label="Mover arriba"><i class="fa-solid fa-arrow-up"></i></button><button id="rotateOld"><i class="fa-solid fa-rotate-right"></i> 90°</button><button data-nudge="down" aria-label="Mover abajo"><i class="fa-solid fa-arrow-down"></i></button><button data-nudge="right" aria-label="Mover derecha"><i class="fa-solid fa-arrow-right"></i></button></div>
    <button class="btn primary full" id="lockMap"><i class="fa-solid fa-layer-group"></i> Bloquear superposición</button>
  </section>
  <section class="route-phase-v51" id="routePhaseV51" hidden>
    <div class="phase-title"><span>FASE 2 · PLANEAR LA NOCHE</span><h3>Trazad una ruta y probadla</h3><p>Las manchas rojizas representan puntos cubiertos por las rondas. Tocad nodos conectados desde SALIDA hasta REFUGIO.</p></div>
    <div class="stealth-map-v51"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path class="network" d="M10 78 L27 58 L50 50 L73 52 L90 72 M10 78 L33 82 L59 78 L90 72 M33 82 L50 50 M50 50 L59 78"/><circle class="watch-pulse" cx="27" cy="58" r="10"/><circle class="watch-pulse" cx="50" cy="50" r="12"/><circle class="watch-pulse" cx="73" cy="52" r="10"/><polyline id="aminaRouteV51" class="amina-route-v51" points=""/></svg>${Object.entries(nodes).map(([id,p])=>`<button data-route-node="${id}" class="route-node-v51 ${id==='1'?'start':''} ${id==='7'?'goal':''}" style="left:${p[0]}%;top:${p[1]}%"><span>${id}</span></button>`).join('')}<span class="route-caption start">SALIDA</span><span class="route-caption goal">REFUGIO</span><div class="amina-marker-v51" id="aminaMarkerV51"><img src="assets/amina_master_v48.webp" alt="Amina"></div></div>
    <div class="route-console-v51"><div><small>RUTA PREPARADA</small><b id="routeTextV51">1</b></div><button class="btn ghost compact" id="resetRouteV51"><i class="fa-solid fa-rotate-left"></i> Rehacer</button></div>
    <button class="btn primary full" id="simulateRouteV51"><i class="fa-solid fa-route"></i> Simular recorrido</button>
  </section>
  <div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const old=document.getElementById('oldMapV51');
  const normalizedAngle=()=>((angle%360)+360)%360;
  const matchScore=()=>{
    let score=100;
    if(normalizedAngle()!==90) score-=45;
    score-=Math.min(25,Math.abs(shiftX)*2.2);
    score-=Math.min(25,Math.abs(shiftY)*2.2);
    return Math.max(0,Math.round(score));
  };
  const paintAlign=()=>{
    old.style.transform=`translate(${shiftX}px,${shiftY}px) rotate(${angle}deg)`;
    const score=matchScore();
    document.getElementById('mapMatch').textContent=`${score}%`;
    document.querySelector('.dual-map-v51').classList.toggle('near-match',score>=90);
  };
  stage.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{const d=b.dataset.nudge;if(d==='left')shiftX-=2;if(d==='right')shiftX+=2;if(d==='up')shiftY-=2;if(d==='down')shiftY+=2;paintAlign()});
  document.getElementById('rotateOld').onclick=()=>{angle=(angle+90)%360;paintAlign()};
  document.getElementById('lockMap').onclick=()=>{
    if(normalizedAngle()===90&&Math.abs(shiftX)<=1&&Math.abs(shiftY)<=1){
      feedback('Los tres hitos coinciden. Ahora el croquis antiguo y la ciudad actual cuentan la misma historia.','ok');
      aldaraSay('Perfecto. Ya sabemos cómo estaba orientado el dibujo. Ahora falta pensar como Amina: no el camino más corto, sino el que nadie vigila.');
      document.getElementById('mapAlignPhase').classList.add('phase-complete');
      document.getElementById('routePhaseV51').hidden=false;
      route=[1];paintRoute();document.getElementById('routePhaseV51').scrollIntoView({behavior:'smooth',block:'start'});
    }else{
      feedback(normalizedAngle()!==90?'La orientación todavía no coincide. Fijaos en qué lado deberían quedar torre, fuente y arco.':'La orientación es correcta, pero el papel aún está desplazado. Acercad los tres hitos.','bad');
      aldaraSay('No hace falta adivinar. Si los tres hitos no caen unos sobre otros, aún no tenemos el mismo mapa.');
    }
  };
  const paintRoute=()=>{
    const pts=route.map(n=>nodes[n].join(',')).join(' ');
    document.getElementById('aminaRouteV51').setAttribute('points',pts);
    document.getElementById('routeTextV51').textContent=route.join(' → ');
    stage.querySelectorAll('[data-route-node]').forEach(b=>b.classList.toggle('selected',route.includes(+b.dataset.routeNode)));
    const last=nodes[route.at(-1)];const marker=document.getElementById('aminaMarkerV51');marker.style.left=`${last[0]}%`;marker.style.top=`${last[1]}%`;
  };
  stage.querySelectorAll('[data-route-node]').forEach(b=>b.onclick=()=>{
    const n=+b.dataset.routeNode;if(simulating)return;
    if(route.includes(n)){route=route.slice(0,route.indexOf(n)+1);paintRoute();return}
    const last=route.at(-1);if(!edges[last]?.includes(n)){feedback('Ese punto no conecta con el último tramo de vuestra ruta.','bad');return}
    route.push(n);paintRoute();
  });
  document.getElementById('resetRouteV51').onclick=()=>{if(simulating)return;route=[1];paintRoute();feedback('Ruta borrada. Empezamos otra vez desde la salida.','info')};
  document.getElementById('simulateRouteV51').onclick=()=>{
    if(simulating)return;if(route.at(-1)!==7){feedback('La ruta todavía no llega al refugio.','bad');return}
    simulating=true;stage.querySelectorAll('.route-node-v51.caught').forEach(x=>x.classList.remove('caught'));let i=0;const marker=document.getElementById('aminaMarkerV51');marker.classList.add('walking');
    const step=()=>{
      const n=route[i],p=nodes[n];marker.style.left=`${p[0]}%`;marker.style.top=`${p[1]}%`;
      stage.querySelectorAll('[data-route-node]').forEach(b=>b.classList.toggle('current',+b.dataset.routeNode===n));
      if(unsafe.has(n)){
        setTimeout(()=>{marker.classList.remove('walking');stage.querySelector(`[data-route-node="${n}"]`)?.classList.add('caught');feedback(`En el punto ${n} una ronda tiene visión directa. Amina tendría que retroceder.`,'bad');aldaraSay('Eso es justo lo que buscábamos evitar. Mantened el inicio y probad una rama que se aleje de las zonas rojas.');simulating=false},350);return
      }
      i++;if(i<route.length){setTimeout(step,520);return}
      setTimeout(()=>{marker.classList.remove('walking');feedback('Ruta limpia. Amina puede recorrerla sin entrar en ninguno de los tres sectores vigilados.','ok');aldaraSay('Ahora sí: no estamos resolviendo un mapa. Estamos recorriendo la decisión que Amina repetía cada noche.');setTimeout(()=>solve(ch),900);simulating=false},450);
    };step();
  };
  paintAlign();
}

function puzzle5(ch){
  const defs=[
    {id:'night',s:'☾',word:'NOCHE',contexts:['Aparece junto al dibujo de las murallas cuando el cielo ya está oscuro.','La misma marca está anotada después de que se apague la última lámpara.']},
    {id:'water',s:'◒',word:'AGUA',contexts:['Ferran la dibuja junto a una jarra vacía.','Amina repite el signo en el paño que envuelve el odre.']},
    {id:'wait',s:'⌛',word:'ESPERAR',contexts:['Está escrita antes de un esquema con un guardia todavía en la puerta.','Vuelve a aparecer antes de una flecha que indica “no avanzar aún”.']},
    {id:'here',s:'⌂',word:'AQUÍ',contexts:['La marca está colocada exactamente sobre un hueco de la pared en dos croquis.','Una cesta dibujada termina justo encima del mismo signo.']},
    {id:'return',s:'↶',word:'VOLVER',contexts:['Amina lo repite debajo de la palabra “mañana” escrita por Ferran.','Es la única marca que ambos vuelven a dibujar en sus despedidas.']}
  ];
  const options=[['night','NOCHE'],['water','AGUA'],['wait','ESPERAR'],['here','AQUÍ'],['return','VOLVER'],['fire','FUEGO'],['leave','SALIR']];
  let selectedSymbol='night',mapping={},selectedMeaning=null;
  const body=`<div class="case-question"><span>05 · CONSTRUIR UN DICCIONARIO</span><h3>¿Podemos leer una conversación que nadie más debía entender?</h3><p>Cada símbolo aparece en <b>dos contextos distintos</b>. No lo traduzcáis por intuición: buscad un significado que funcione en ambos.</p></div>
  <section class="cipher-lab-v51">
    <div class="symbol-rail-v51">${defs.map(d=>`<button data-cipher-symbol="${d.id}" class="${d.id===selectedSymbol?'active':''}"><span>${d.s}</span><b id="mapped-${d.id}">?</b></button>`).join('')}</div>
    <div class="context-view-v51" id="contextViewV51"></div>
    <div class="meaning-bank-v51">${options.map(([id,w])=>`<button data-meaning="${id}">${w}</button>`).join('')}</div>
    <button class="btn primary full" id="assignMeaningV51"><i class="fa-solid fa-language"></i> Probar traducción</button>
  </section>
  <section class="decoded-note-v51" id="decodedNoteV51" hidden></section>
  <div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const getDef=id=>defs.find(d=>d.id===id);
  const paint=()=>{
    stage.querySelectorAll('[data-cipher-symbol]').forEach(b=>b.classList.toggle('active',b.dataset.cipherSymbol===selectedSymbol));
    stage.querySelectorAll('[data-meaning]').forEach(b=>{b.classList.toggle('selected',b.dataset.meaning===selectedMeaning);b.classList.toggle('used',Object.values(mapping).includes(b.dataset.meaning)&&b.dataset.meaning!==mapping[selectedSymbol])});
    defs.forEach(d=>{const el=document.getElementById(`mapped-${d.id}`);if(el)el.textContent=mapping[d.id]?options.find(o=>o[0]===mapping[d.id])?.[1]:'?'});
    const d=getDef(selectedSymbol);document.getElementById('contextViewV51').innerHTML=`<small>DOS APARICIONES DEL MISMO SIGNO</small><div class="symbol-focus-v51">${d.s}</div>${d.contexts.map((t,i)=>`<article><span>PISTA ${i+1}</span><p>${t}</p></article>`).join('')}<em>El significado correcto debe explicar las dos escenas.</em>`;
  };
  stage.querySelectorAll('[data-cipher-symbol]').forEach(b=>b.onclick=()=>{selectedSymbol=b.dataset.cipherSymbol;selectedMeaning=mapping[selectedSymbol]||null;paint()});
  stage.querySelectorAll('[data-meaning]').forEach(b=>b.onclick=()=>{selectedMeaning=b.dataset.meaning;paint()});
  document.getElementById('assignMeaningV51').onclick=()=>{
    if(!selectedMeaning){feedback('Seleccionad primero un significado para el símbolo activo.','bad');return}
    const d=getDef(selectedSymbol);
    if(selectedMeaning===d.id){
      Object.keys(mapping).forEach(k=>{if(mapping[k]===selectedMeaning&&k!==selectedSymbol)delete mapping[k]});mapping[selectedSymbol]=selectedMeaning;
      feedback(`${d.s} encaja en ambos contextos como ${d.word}. Traducción confirmada.`,'ok');
      const next=defs.find(x=>!mapping[x.id]);if(next){selectedSymbol=next.id;selectedMeaning=null;paint();aldaraSay('Bien. Una palabra confirmada. Ahora no extrapolemos: cada símbolo tiene que aguantar sus dos pruebas.')}else unlockNote();
    }else{
      feedback('Esa palabra explica una de las pistas, pero contradice la otra. Probad con un significado que funcione dos veces.','bad');aldaraSay('Una coincidencia puede engañarnos. Necesitamos que la traducción funcione en los dos contextos.');
    }
  };
  function unlockNote(){
    paint();feedback('Diccionario completo. Ahora aparece una nota que antes era ilegible.','ok');aldaraSay('Ya no estamos mirando símbolos. Estamos leyendo algo que Amina escribió para Ferran.');
    const p=document.getElementById('decodedNoteV51');p.hidden=false;
    p.innerHTML=`<div class="phase-title"><span>FASE 2 · USAR LO APRENDIDO</span><h3>Reconstruid la nota</h3><p>Los cuatro bloques están en el orden original. Elegid la traducción precisa de cada uno.</p></div><div class="encoded-sentence-v51"><button data-code-slot="0">⌛<b>?</b></button><button data-code-slot="1">⌂<b>?</b></button><i></i><button data-code-slot="2">↶<b>?</b></button><button data-code-slot="3">☾<b>?</b></button></div><div class="note-word-bank-v51">${[['wait','ESPERA'],['here','AQUÍ'],['return','VOLVERÉ'],['night','DE NOCHE'],['water','CON AGUA'],['leave','SALDRÉ']].map(([id,w])=>`<button data-note-word="${id}">${w}</button>`).join('')}</div><button class="btn primary full" id="readSecretV51"><i class="fa-solid fa-comment-dots"></i> Leer el mensaje</button>`;
    let active=0,answer=[null,null,null,null];const expected=['wait','here','return','night'];
    const notePaint=()=>{p.querySelectorAll('[data-code-slot]').forEach((b,i)=>{b.classList.toggle('active',i===active);const id=answer[i];b.querySelector('b').textContent=id?({wait:'ESPERA',here:'AQUÍ',return:'VOLVERÉ',night:'DE NOCHE',water:'CON AGUA',leave:'SALDRÉ'}[id]):'?'});p.querySelectorAll('[data-note-word]').forEach(b=>b.classList.toggle('used',answer.includes(b.dataset.noteWord)))};
    p.querySelectorAll('[data-code-slot]').forEach(b=>b.onclick=()=>{active=+b.dataset.codeSlot;notePaint()});
    p.querySelectorAll('[data-note-word]').forEach(b=>b.onclick=()=>{const id=b.dataset.noteWord;if(answer.includes(id)){answer=answer.map(v=>v===id?null:v)}answer[active]=id;active=Math.min(3,active+1);notePaint()});
    notePaint();
    document.getElementById('readSecretV51').onclick=()=>{
      if(answer.every((v,i)=>v===expected[i])){
        feedback('«ESPERA AQUÍ. VOLVERÉ DE NOCHE.» La frase no habla de supervivencia: habla de una promesa de regreso.','ok');aldaraSay('Ahí está el cambio. El código empezó para esconder a Ferran y acabó guardando algo mucho más personal.');setTimeout(()=>solve(ch),900);
      }else{feedback('La estructura tiene dos partes: primero una orden de lugar; después una promesa y el momento del regreso.','bad');aldaraSay('Ya conocemos el diccionario. Ahora el reto es leer la frase como una frase, no como cuatro palabras sueltas.')}
    };
    p.scrollIntoView({behavior:'smooth',block:'start'});
  }
  paint();
}

function puzzle6(ch){
  let lamp=null,observer=null,visionConfirmed=false;
  const lampPos={a:[27,24],b:[82,31],c:[46,87]};
  const observerPos={north:[51,10],west:[10,58],east:[92,55]};
  const body=`<div class="case-question"><span>06 · RECONSTRUIR UNA MIRADA</span><h3>¿Desde dónde podían haber visto a Amina y Ferran juntos?</h3><p>La reconstrucción conserva dos cosas: la dirección de una sombra y un muro que cortaba el patio. Primero localizad la luz. Después probad líneas de visión.</p></div>
  <section class="reconstruction-v51">
    <div class="phase-title"><span>FASE 1 · LA SOMBRA</span><h3>¿Dónde estaba la lámpara?</h3><p>La sombra de Amina cae hacia el sudeste. La fuente de luz debe estar en el lado contrario.</p></div>
    <div class="scene-plan-v51" id="scenePlanV51"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect class="court-wall-v51" x="34" y="39" width="37" height="9" transform="rotate(-8 52 43)"/><circle class="person amina" cx="60" cy="62" r="3"/><circle class="person ferran" cx="70" cy="58" r="3"/><path class="shadow-v51" d="M60 62 L78 78"/><line id="lampRayV51" class="lamp-ray-v51"/><line id="visionA51" class="vision-ray-v51"/><line id="visionF51" class="vision-ray-v51"/></svg><span class="person-label-v51 a">AMINA</span><span class="person-label-v51 f">FERRAN</span>${Object.entries(lampPos).map(([id,p])=>`<button data-lamp-pos="${id}" class="lamp-choice-v51" style="left:${p[0]}%;top:${p[1]}%"><i class="fa-solid fa-fire-flame-curved"></i></button>`).join('')}${Object.entries(observerPos).map(([id,p])=>`<button data-observer-pos="${id}" class="observer-choice-v51" style="left:${p[0]}%;top:${p[1]}%" hidden>${id==='north'?'N':id==='west'?'O':'E'}</button>`).join('')}<div class="scene-legend-v51"><span>▬ muro</span><span>↘ sombra</span></div></div>
    <button class="btn primary full" id="confirmLampV51"><i class="fa-solid fa-location-crosshairs"></i> Confirmar posición</button>
  </section>
  <section class="vision-phase-v51" id="visionPhaseV51" hidden>
    <div class="phase-title"><span>FASE 2 · LÍNEA DE VISIÓN</span><h3>Buscad un punto que vea a los dos</h3><p>Seleccionad una posición y trazad sus dos líneas. Si el muro corta una de ellas, ese observador no pudo descubrir el secreto.</p></div>
    <button class="btn ghost full" id="traceVisionV51"><i class="fa-solid fa-eye"></i> Trazar línea de visión</button><p class="vision-status-v51" id="visionStatusV51">Elegid N, O o E en el plano.</p>
  </section>
  <section class="roster-v51" id="rosterV51" hidden>
    <div class="phase-title"><span>FASE 3 · CRUZAR EL REGISTRO</span><h3>¿Quién estaba en ese lugar?</h3><p>La posición ya está demostrada. Ahora comparadla con el registro de presencia.</p></div>
    <div class="roster-cards-v51"><button data-roster="yusuf"><b>YUSUF</b><span>Guardia</span><small>Puerta sur</small></button><button data-roster="salim"><b>SALIM</b><span>Sirviente</span><small>Almacén</small></button><button data-roster="rajid"><b>RAJID</b><span>Noble</span><small>Galería norte</small></button></div>
  </section>
  <div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const lampRay=document.getElementById('lampRayV51');
  stage.querySelectorAll('[data-lamp-pos]').forEach(b=>b.onclick=()=>{lamp=b.dataset.lampPos;stage.querySelectorAll('[data-lamp-pos]').forEach(x=>x.classList.toggle('selected',x===b));const [x,y]=lampPos[lamp];lampRay.setAttribute('x1',x);lampRay.setAttribute('y1',y);lampRay.setAttribute('x2',60);lampRay.setAttribute('y2',62);lampRay.classList.add('on')});
  document.getElementById('confirmLampV51').onclick=()=>{
    if(!lamp){feedback('Elegid una de las tres posiciones posibles de la lámpara.','bad');return}
    if(lamp!=='a'){feedback('Si la luz estuviera ahí, la sombra caería en otra dirección. Recordad: una sombra se proyecta alejándose de la fuente.','bad');aldaraSay('Mirad la flecha de la sombra y prolongadla hacia atrás. La lámpara tiene que estar en el lado opuesto.');return}
    feedback('La lámpara estaba al noroeste. Ya podemos orientar correctamente toda la escena.','ok');aldaraSay('Bien. Ahora tenemos una reconstrucción orientada. Probemos quién podía mirar sin que el muro le tapara a uno de los dos.');document.getElementById('visionPhaseV51').hidden=false;stage.querySelectorAll('[data-observer-pos]').forEach(b=>b.hidden=false);document.getElementById('visionPhaseV51').scrollIntoView({behavior:'smooth',block:'start'});
  };
  stage.querySelectorAll('[data-observer-pos]').forEach(b=>b.onclick=()=>{observer=b.dataset.observerPos;visionConfirmed=false;stage.querySelectorAll('[data-observer-pos]').forEach(x=>x.classList.toggle('selected',x===b));document.getElementById('visionStatusV51').textContent=`Posición ${observer==='north'?'N · galería norte':observer==='west'?'O · corredor oeste':'E · paso este'} seleccionada.`;['visionA51','visionF51'].forEach(id=>document.getElementById(id).classList.remove('on','blocked'))});
  document.getElementById('traceVisionV51').onclick=()=>{
    if(!observer){feedback('Seleccionad primero una posición de observación.','bad');return}
    const [x,y]=observerPos[observer];[['visionA51',60,62],['visionF51',70,58]].forEach(([id,x2,y2])=>{const l=document.getElementById(id);l.setAttribute('x1',x);l.setAttribute('y1',y);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.classList.add('on');l.classList.toggle('blocked',observer!=='north')});
    if(observer==='north'){
      visionConfirmed=true;document.getElementById('visionStatusV51').textContent='Las dos líneas quedan libres desde la galería norte.';feedback('Posición demostrada. El observador estaba en la galería norte.','ok');aldaraSay('Eso ya no es una sospecha. Tenemos el lugar exacto desde el que alguien podía verlos a los dos.');document.getElementById('rosterV51').hidden=false;document.getElementById('rosterV51').scrollIntoView({behavior:'smooth',block:'start'});
    }else{
      visionConfirmed=false;document.getElementById('visionStatusV51').textContent='El muro corta al menos una de las dos líneas.';feedback('Desde esa posición no podían verse Amina y Ferran simultáneamente.','bad');aldaraSay('Uno de los dos queda oculto. Probemos otro punto antes de mirar nombres.');document.getElementById('rosterV51').hidden=true;
    }
  };
  stage.querySelectorAll('[data-roster]').forEach(b=>b.onclick=()=>{
    if(!visionConfirmed){feedback('Primero necesitamos demostrar la posición del observador.','bad');return}
    if(b.dataset.roster==='rajid'){
      feedback('Galería norte · Rajid. Los registros y la geometría cuentan lo mismo: él los vio juntos.','ok');aldaraSay('Rajid no oyó un rumor. No recibió una denuncia. Los vio. Lo que ocurra a partir de aquí será una decisión suya.');setTimeout(()=>solve(ch),900);
    }else feedback('Ese registro coloca a la persona en otra parte de la fortaleza.','bad');
  });
}

function puzzle7(ch){
  const nodes={S:[10,78],A:[26,72],B:[42,58],C:[43,82],D:[60,55],E:[77,35],X:[91,18]};
  const labels={S:'REFUGIO',A:'ARCO',B:'PATIO',C:'CALLE BAJA',D:'MURO',E:'PASO NORTE',X:'SALIDA'};
  const edges={S:['A'],A:['S','B','C'],B:['A','D'],C:['A','D'],D:['B','C','E'],E:['D','X'],X:[]};
  const danger={1:['B','D','E'],2:['A','C','E'],3:['C','D','E'],4:['A','C','E'],5:['B','C','E'],6:['A','C','D']};
  let turn=1,pos='S',moves=0,locked=false;
  const body=`<div class="stealth-case-v52">
    <div class="stealth-head-v52"><div><small>FASE 1 · LEER LA RONDA</small><h3>No busquéis el camino más corto. Buscad el momento en que existe.</h3></div><span id="stealthTurnV52">RONDA 1</span></div>
    <div class="stealth-map-v52" id="stealthMapV52">
      <div class="stealth-grid-v52"></div>
      <svg class="stealth-links-v52" viewBox="0 0 100 100" preserveAspectRatio="none">${[['S','A'],['A','B'],['A','C'],['B','D'],['C','D'],['D','E'],['E','X']].map(([a,b])=>`<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}"/>`).join('')}</svg>
      ${Object.entries(nodes).map(([id,[x,y]])=>`<button class="stealth-node-v52 ${id==='S'?'current':''}" style="left:${x}%;top:${y}%" data-stealth-node="${id}"><i></i><b>${labels[id]}</b></button>`).join('')}
      <div class="guard-cone-v52 cone-a" id="coneA52"></div><div class="guard-cone-v52 cone-b" id="coneB52"></div><div class="guard-cone-v52 cone-c" id="coneC52"></div>
      <div class="ferran-marker-v52" id="ferranMarker52"><img src="assets/ferran_master_v48.webp" alt="Ferran"></div>
    </div>
    <div class="patrol-intel-v52"><div><small>PATRÓN OBSERVADO</small><div class="patrol-cycle-v52">${[1,2,3,4,5,6].map(t=>`<span data-cycle="${t}"><b>${t}</b><em>${danger[t].map(n=>labels[n]).join(' · ')}</em></span>`).join('')}</div></div><p>Cada movimiento —o esperar— hace avanzar una ronda. Una zona roja en la siguiente ronda significa que Ferran sería visto.</p></div>
    <div class="stealth-actions-v52"><button class="btn ghost" id="waitTurn52"><i class="fa-regular fa-clock"></i> Esperar una ronda</button><button class="btn ghost" id="resetEscape52"><i class="fa-solid fa-rotate-left"></i> Reiniciar recorrido</button></div>
    <p id="escapeStatus52" class="micro-status-v52">Ferran está en el refugio. Elegid un nodo conectado o esperad.</p>
  </div><div id="letterPhase52" hidden></div><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const marker=document.getElementById('ferranMarker52');
  function nextTurn(){return turn===6?1:turn+1}
  function paint(){
    document.getElementById('stealthTurnV52').textContent=`RONDA ${turn}`;
    stage.querySelectorAll('[data-cycle]').forEach(x=>x.classList.toggle('active',+x.dataset.cycle===turn));
    stage.querySelectorAll('[data-stealth-node]').forEach(b=>{const id=b.dataset.stealthNode;b.classList.toggle('current',id===pos);b.classList.toggle('danger',danger[turn].includes(id));b.classList.toggle('reachable',edges[pos]?.includes(id)&&id!==pos)});
    const [x,y]=nodes[pos];marker.style.left=`${x}%`;marker.style.top=`${y}%`;
    const cones=[['coneA52',danger[turn][0]],['coneB52',danger[turn][1]],['coneC52',danger[turn][2]]];
    cones.forEach(([id,n],i)=>{const el=document.getElementById(id);const [cx,cy]=nodes[n]||[50,50];el.style.left=`${cx}%`;el.style.top=`${cy}%`;el.style.transform=`translate(-50%,-50%) rotate(${35+i*95+turn*8}deg)`});
  }
  function failAt(target){locked=true;const name=labels[target];feedback(`La patrulla entra en ${name.toLowerCase()} justo cuando Ferran llega. Esa ventana no sirve.`,'bad');aldaraSay('Eso es útil: el camino puede ser correcto y el momento equivocado. Reiniciemos y pensemos una ronda por delante.');document.getElementById('escapeStatus52').textContent=`VISTO EN ${name} · recorrido reiniciado`;setTimeout(()=>{turn=1;pos='S';moves=0;locked=false;paint();document.getElementById('escapeStatus52').textContent='Ferran vuelve al refugio. Probad otro ritmo.'},900)}
  function act(target){
    if(locked||pos==='X')return;
    const nt=nextTurn();turn=nt;moves++;
    if(target!==pos && !edges[pos].includes(target)){feedback('Desde aquí Ferran no puede alcanzar ese punto directamente. Seguid las conexiones del plano.','bad');turn=turn===1?6:turn-1;moves--;return}
    if(danger[turn].includes(target)){pos=target;paint();failAt(target);return}
    pos=target;paint();document.getElementById('escapeStatus52').textContent=target===pos?`Ronda ${turn}. Ferran alcanza ${labels[pos].toLowerCase()} sin ser visto.`:'Ronda avanzada.';
    if(pos==='X'){feedback('Ferran alcanza la salida. No ganó por correr: ganó porque leyó el ritmo de la vigilancia.','ok');aldaraSay('Ahora sabemos que tuvo tiempo para una última cosa antes de desaparecer: dejar la carta.');setTimeout(showLetter,500)}
  }
  stage.querySelectorAll('[data-stealth-node]').forEach(b=>b.onclick=()=>{const id=b.dataset.stealthNode;if(edges[pos]?.includes(id))act(id);else if(id!==pos)feedback('Ese punto no está conectado con la posición actual de Ferran.','bad')});
  document.getElementById('waitTurn52').onclick=()=>act(pos);
  document.getElementById('resetEscape52').onclick=()=>{turn=1;pos='S';moves=0;locked=false;paint();feedback('Recorrido reiniciado. El patrón de seis rondas vuelve al inicio.','info')};
  function showLetter(){
    const p=document.getElementById('letterPhase52');p.hidden=false;p.innerHTML=`<div class="letter-hide-v52"><small>FASE 2 · DEJAR UN MENSAJE QUE AMINA PUEDA ENCONTRAR</small><h3>Ferran no puede verla. Solo puede confiar en el código que construyeron juntos.</h3><div class="hide-scene-v52"><button data-hide52="market"><span>01</span><b>Banco del mercado</b><em>Visible · transitado</em></button><button data-hide52="niche"><span>⌂</span><b>Nicho de piedra</b><em>Marca compartida</em></button><button data-hide52="gate"><span>03</span><b>Puerta principal</b><em>Guardia permanente</em></button></div><p id="hideStatus52">Recordad qué significaba ⌂ en sus notas.</p></div>`;
    p.querySelectorAll('[data-hide52]').forEach(b=>b.onclick=()=>{if(b.dataset.hide52==='niche'){b.classList.add('correct');document.getElementById('hideStatus52').textContent='La carta queda donde Amina sabría mirar: “aquí”.';feedback('Ferran deja la carta en el nicho marcado. La despedida existió.','ok');aldaraSay('Ya no tenemos una leyenda diciendo que escribió. Tenemos una reconstrucción completa de cómo pudo dejar el mensaje.');setTimeout(()=>solve(ch),850)}else{b.classList.add('wrong');document.getElementById('hideStatus52').textContent='Ese lugar no usa ninguna señal compartida entre ellos.';feedback('Ferran necesitaba un lugar reconocible para Amina y discreto para cualquiera más.','bad')}})
    p.scrollIntoView({behavior:'smooth',block:'start'});
  }
  paint();
}

function puzzle8(ch){
  let x=54,y=-34,rot=7,opacity=62,drag=null,revealed=false,sealOk=false,timeline=[],selectedEvent=null;
  const correct=['write','intercept','search','silence'];
  const body=`<div class="document-case-v52">
    <div class="document-head-v52"><div><small>FASE 1 · MESA DOCUMENTAL</small><h3>Dos documentos pasaron por la misma oficina. Haced que vuelvan a ocupar la misma posición.</h3></div><span>ARRASTRA · GIRA · TRANSPARENTA</span></div>
    <div class="doc-stage-v52" id="docStage52">
      <article class="paper-v52 base-doc-v52"><small>REGISTRO DE CORRESPONDENCIA</small><h4>Entrada 47 · sello militar</h4><p>Entrega pendiente · turno nocturno</p><i class="regmark m1">⊕</i><i class="regmark m2">⊕</i><i class="regmark m3">⊕</i></article>
      <article class="paper-v52 moving-doc-v52" id="movingDoc52"><small>INVENTARIO PERSONAL</small><h4>Dependencia de Rajid</h4><p>Llave · pergamino · sello · paño</p><i class="regmark m1">⊕</i><i class="regmark m2">⊕</i><i class="regmark m3">⊕</i><strong class="hidden-note-v52">CARTA DEL CRISTIANO<br>NO ENTREGAR · R.</strong></article>
      <div class="align-reticle-v52"></div>
    </div>
    <div class="doc-tools-v52"><button data-rot52="-1">↶ GIRAR</button><button data-rot52="1">GIRAR ↷</button><label>LUZ A TRAVÉS DEL PAPEL <input id="opacity52" type="range" min="38" max="88" value="62"></label></div>
    <div class="alignment-meter-v52"><span id="alignMeter52"></span><p id="alignStatus52">Buscad las tres marcas ⊕. Cuando coincidan, el documento se ajustará solo.</p></div>
    <button class="btn primary full" id="reveal52" disabled>Examinar a contraluz</button>
  </div><div id="sealPhase52" hidden></div><div id="timelinePhase52" hidden></div><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const doc=document.getElementById('movingDoc52'),box=document.getElementById('docStage52'),meter=document.getElementById('alignMeter52');
  const quality=()=>Math.max(0,100-Math.abs(x)*1.2-Math.abs(y)*1.2-Math.abs(rot)*7);
  function paint(){doc.style.transform=`translate(${x}px,${y}px) rotate(${rot}deg)`;doc.style.opacity=opacity/100;const q=Math.round(quality());meter.style.width=`${q}%`;const close=q>=86&&opacity>=48&&opacity<=80;document.getElementById('reveal52').disabled=!close;if(close){x=0;y=0;rot=0;doc.style.transform='translate(0,0) rotate(0deg)';meter.style.width='100%';document.getElementById('alignStatus52').textContent='Las tres marcas coinciden. La tinta oculta está justo entre ambas hojas.';document.getElementById('reveal52').disabled=false}else document.getElementById('alignStatus52').textContent=q>60?'Casi. Dos marcas ya están cerca; corregid posición o giro.':'Las marcas todavía no pertenecen al mismo registro.'}
  doc.addEventListener('pointerdown',e=>{drag={sx:e.clientX,sy:e.clientY,ox:x,oy:y};doc.setPointerCapture(e.pointerId);doc.classList.add('dragging')});
  doc.addEventListener('pointermove',e=>{if(!drag)return;x=drag.ox+(e.clientX-drag.sx);y=drag.oy+(e.clientY-drag.sy);paint()});
  doc.addEventListener('pointerup',()=>{drag=null;doc.classList.remove('dragging');paint()});
  stage.querySelectorAll('[data-rot52]').forEach(b=>b.onclick=()=>{rot+=+b.dataset.rot52;paint()});
  document.getElementById('opacity52').oninput=e=>{opacity=+e.target.value;paint()};
  document.getElementById('reveal52').onclick=()=>{revealed=true;doc.classList.add('revealed');feedback('La luz revela una anotación que no forma parte del inventario: “CARTA DEL CRISTIANO · NO ENTREGAR · R.”','ok');aldaraSay('La R es una pista, no una condena. Ahora hay que demostrar de quién es esa marca.');showSeal()};
  function showSeal(){const p=document.getElementById('sealPhase52');p.hidden=false;p.innerHTML=`<div class="seal-proof-v52"><small>FASE 2 · ¿QUIÉN ES “R”?</small><h3>Comparad la marca con las firmas registradas en la galería norte.</h3><div class="seal-options-v52"><button data-seal52="guard"><i>✦</i><b>Jefe de guardia</b><em>Marca estrellada</em></button><button data-seal52="rajid"><i>R</i><b>Rajid</b><em>Sello personal</em></button><button data-seal52="scribe"><i>◒</i><b>Escribano</b><em>Media luna</em></button></div><p id="sealStatus52">El capítulo anterior situó a Rajid en la galería norte.</p></div>`;p.querySelectorAll('[data-seal52]').forEach(b=>b.onclick=()=>{if(b.dataset.seal52==='rajid'){sealOk=true;b.classList.add('correct');feedback('La inicial y el registro de presencia apuntan a la misma persona: Rajid.','ok');aldaraSay('Ahora sí. No es solo una R: es Rajid, en el lugar correcto y con el documento en sus manos.');setTimeout(showTimeline,450)}else{b.classList.add('wrong');feedback('Esa marca pertenece a otra persona del registro.','bad')}});p.scrollIntoView({behavior:'smooth',block:'start'})}
  function showTimeline(){const p=document.getElementById('timelinePhase52');p.hidden=false;p.innerHTML=`<div class="timeline-v52"><small>FASE 3 · ¿QUÉ PASÓ DESPUÉS?</small><h3>Ordenad la cadena que convierte una carta en una tragedia.</h3><div class="event-bank-v52">${[['write','Ferran escribe'],['intercept','Rajid intercepta'],['search','Amina busca el mensaje'],['silence','Amina no recibe respuesta'],['receive','Amina recibe la carta']].map(([id,n])=>`<button data-event52="${id}">${n}</button>`).join('')}</div><div class="timeline-slots-v52">${[0,1,2,3].map(i=>`<button data-slot52="${i}"><span>${i+1}</span><b>?</b></button>`).join('')}</div><button class="btn primary full" id="checkTimeline52"><i class="fa-solid fa-timeline"></i> Cerrar cronología</button></div>`;
    const names={write:'Ferran escribe',intercept:'Rajid intercepta',search:'Amina busca',silence:'No hay respuesta',receive:'Amina la recibe'};
    p.querySelectorAll('[data-event52]').forEach(b=>b.onclick=()=>{selectedEvent=b.dataset.event52;p.querySelectorAll('[data-event52]').forEach(x=>x.classList.toggle('selected',x===b))});
    p.querySelectorAll('[data-slot52]').forEach(b=>b.onclick=()=>{const i=+b.dataset.slot52;if(!selectedEvent){timeline[i]=null;b.querySelector('b').textContent='?';return}timeline=timeline.map(v=>v===selectedEvent?null:v);timeline[i]=selectedEvent;selectedEvent=null;p.querySelectorAll('[data-event52]').forEach(x=>x.classList.remove('selected'));p.querySelectorAll('[data-slot52]').forEach((s,j)=>s.querySelector('b').textContent=timeline[j]?names[timeline[j]]:'?')});
    document.getElementById('checkTimeline52').onclick=()=>{if(correct.every((v,i)=>timeline[i]===v)){feedback('Cadena demostrada: Ferran escribió → Rajid interceptó → Amina buscó → nunca recibió respuesta.','ok');aldaraSay('Aquí se rompe la leyenda. Amina no esperaba a alguien que la había olvidado. Esperaba una carta que alguien decidió esconder.');setTimeout(()=>solve(ch),850)}else{feedback('Hay un acontecimiento imposible: Amina no puede recibir una carta que acabamos de demostrar que fue interceptada.','bad');aldaraSay('Usad la prueba física primero. Lo demostrado manda sobre la leyenda.')}};
    p.scrollIntoView({behavior:'smooth',block:'start'});
  }
  paint();
}

function puzzle9(ch){
  const evidence=[
    ['wound','II','Ferran llegó herido','Amina lo encontró antes que los soldados.'],
    ['return','V','↶ = VOLVER','La promesa existía antes de la huida.'],
    ['seen','VI','Rajid los vio','Conocía la relación de primera mano.'],
    ['left','VII','Ferran dejó la carta','No desapareció sin despedirse.'],
    ['hidden','VIII','NO ENTREGAR · R.','Rajid interceptó el mensaje.'],
    ['wait','VIII','Amina esperó','Buscó una respuesta que ya había sido escrita.']
  ];
  const correctOrder=['wound','return','seen','left','hidden','wait'];let selected=null,chain=[];
  const body=`<div class="final-investigation-v52"><small>FASE 1 · EL MURO DEL CASO</small><h3>Antes de buscar la carta, reconstruid la cadena completa sin añadir nada que la leyenda no pueda demostrar.</h3><div class="evidence-wall-v52"><div class="evidence-bank-v52">${evidence.map(([id,cap,title,sub])=>`<button data-evidence52="${id}"><span>${cap}</span><b>${title}</b><em>${sub}</em></button>`).join('')}</div><div class="causal-chain-v52" id="causalChain52">${[0,1,2,3,4,5].map(i=>`<button data-chain52="${i}"><span>${i+1}</span><b>?</b></button>`).join('')}</div></div><button class="btn primary full" id="checkChain52"><i class="fa-solid fa-link"></i> Comprobar reconstrucción</button></div><div id="archivePhase52" hidden></div><div id="letterPhaseFinal52" hidden></div><div id="feedback" class="feedback"></div>`;
  stage.innerHTML=PuzzleUI.shell(ch,body);bindHints(ch);
  const names=Object.fromEntries(evidence.map(([id,,t])=>[id,t]));
  function paintChain(){stage.querySelectorAll('[data-evidence52]').forEach(b=>b.classList.toggle('selected',selected===b.dataset.evidence52));stage.querySelectorAll('[data-chain52]').forEach(b=>{const i=+b.dataset.chain52;b.querySelector('b').textContent=chain[i]?names[chain[i]]:'?'})}
  stage.querySelectorAll('[data-evidence52]').forEach(b=>b.onclick=()=>{selected=b.dataset.evidence52;paintChain()});
  stage.querySelectorAll('[data-chain52]').forEach(b=>b.onclick=()=>{const i=+b.dataset.chain52;if(!selected){chain[i]=null;paintChain();return}chain=chain.map(v=>v===selected?null:v);chain[i]=selected;selected=null;paintChain()});
  document.getElementById('checkChain52').onclick=()=>{if(correctOrder.every((v,i)=>chain[i]===v)){feedback('La cadena no deja huecos: encuentro → promesa → descubrimiento → carta → interceptación → espera.','ok');aldaraSay('Ahora sí podemos buscar el documento sin adivinar. Sabemos qué buscamos y qué marcas tiene que conservar.');showArchive()}else{feedback('La cronología todavía rompe una relación causa-efecto. La promesa debe existir antes de la carta y la interceptación antes de la espera.','bad');aldaraSay('No ordenéis por capítulos. Ordenad por causa: ¿qué tuvo que ocurrir para que lo siguiente fuera posible?')}};
  function showArchive(){document.querySelector('.final-investigation-v52').hidden=true;const p=document.getElementById('archivePhase52');p.hidden=false;let dials={route:'ARCO',symbol:'☾',seal:'A'};const vals={route:['ARCO','PATIO','MURO','NORTE'],symbol:['☾','⌂','↶','◒'],seal:['A','F','R','?']};p.innerHTML=`<div class="archive-box-v52"><small>FASE 2 · CAJA DOCUMENTAL</small><h3>El abuelo dejó tres marcas para identificar el legajo correcto.</h3><div class="physical-lock-v52"><button data-dial52="route"><small>ÚLTIMO PASO SEGURO</small><b id="dial-route">ARCO</b><em>tocar para girar</em></button><button data-dial52="symbol"><small>PROMESA</small><b id="dial-symbol">☾</b><em>tocar para girar</em></button><button data-dial52="seal"><small>INTERCEPTOR</small><b id="dial-seal">A</b><em>tocar para girar</em></button></div><div class="archive-lid-v52" id="archiveLid52"><span>ARCHIVO · 1242</span><i></i></div><button class="btn primary full" id="unlock52"><i class="fa-solid fa-lock-open"></i> Probar combinación</button></div>`;
    p.querySelectorAll('[data-dial52]').forEach(b=>b.onclick=()=>{const k=b.dataset.dial52,a=vals[k],i=(a.indexOf(dials[k])+1)%a.length;dials[k]=a[i];document.getElementById(`dial-${k}`).textContent=dials[k]});
    document.getElementById('unlock52').onclick=()=>{if(dials.route==='NORTE'&&dials.symbol==='↶'&&dials.seal==='R'){document.getElementById('archiveLid52').classList.add('open');feedback('La cerradura cede: PASO NORTE · VOLVER · Rajid. Dentro hay un pergamino con el sello de Ferran.','ok');aldaraSay('Todo vuelve aquí: el último paso de la huida, la promesa y la persona que ocultó el mensaje.');setTimeout(showLetter,700)}else{document.getElementById('archiveLid52').classList.add('shake');setTimeout(()=>document.getElementById('archiveLid52').classList.remove('shake'),450);feedback('La caja no abre. Las tres marcas proceden de capítulos distintos; no hay que adivinarlas.','bad')}};p.scrollIntoView({behavior:'smooth',block:'start'})}
  function showLetter(){document.getElementById('archivePhase52').hidden=true;const p=document.getElementById('letterPhaseFinal52');p.hidden=false;const strips=[['s3','Si alguien te dice que no lo hice, no le creas.'],['s1','Amina, me marcho porque quedarme sería condenarte conmigo.'],['s4','Te debo la vida. Y ahora también aquello que pensaba conservar para mí. — Ferran'],['s2','No huyo de ti. Cuando esto termine, volveré.']];let order=[];const text=Object.fromEntries(strips);p.innerHTML=`<div class="final-letter-v52"><small>FASE 3 · LA CARTA QUE NUNCA LLEGÓ</small><h3>Cuatro tiras. Una sola lectura posible.</h3><p>Reconstruid la carta. Podéis tocar una tira colocada para devolverla a la mesa.</p><div class="letter-table-v52">${strips.map(([id,t])=>`<button data-strip52="${id}">${t}</button>`).join('')}</div><div class="letter-assembly-v52" id="letterAssembly52">${[0,1,2,3].map(i=>`<button data-letter-slot52="${i}"><span>${i+1}</span><b>?</b></button>`).join('')}</div><button class="btn primary full" id="readLetter52"><i class="fa-solid fa-envelope-open-text"></i> Abrir y leer</button></div>`;
    p.querySelectorAll('[data-strip52]').forEach(b=>b.onclick=()=>{const id=b.dataset.strip52;if(order.includes(id))return;const empty=[0,1,2,3].find(i=>!order[i]);if(empty===undefined)return;order[empty]=id;b.classList.add('used');paintLetter()});
    p.querySelectorAll('[data-letter-slot52]').forEach(b=>b.onclick=()=>{const i=+b.dataset.letterSlot52;if(!order[i])return;const id=order[i];order[i]=null;p.querySelector(`[data-strip52="${id}"]`)?.classList.remove('used');paintLetter()});
    function paintLetter(){p.querySelectorAll('[data-letter-slot52]').forEach(b=>{const i=+b.dataset.letterSlot52;b.querySelector('b').textContent=order[i]?text[order[i]]:'?'})}
    document.getElementById('readLetter52').onclick=()=>{if(order.filter(Boolean).join('|')==='s1|s2|s3|s4'){p.querySelector('.final-letter-v52').classList.add('solved');feedback('La carta está completa. Ferran no huyó de Amina: huyó para no condenarla y prometió volver.','ok');aldaraSay('Ya sabemos la verdad. Lo más cruel es que las palabras estuvieron aquí todo el tiempo… y Amina nunca pudo leerlas.');setTimeout(()=>solve(ch),1100)}else{feedback('La carta tiene lógica propia: saludo → motivo de la huida → promesa → advertencia → firma.','bad');aldaraSay('Leedla como una persona, no como un código. ¿Qué dirías primero si tuvieras que marcharte sin despedirte?')}};p.scrollIntoView({behavior:'smooth',block:'start'})}
  paintChain();
}
