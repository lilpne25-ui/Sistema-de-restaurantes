(() => {
  'use strict';
  const scenes = window.REFIL_SCENES;
  const root = document.createElement('div');
  root.id = 'experience'; root.hidden = true;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Experiencia guiada de El Refil');
  root.innerHTML = `
    <header class="exp-header"><div class="exp-brand"><img src="assets/refil-logo.svg" alt="El Refil"><span>×</span><img class="vlux-official" src="assets/vlux-official.png" alt="VLUX — AI Transformation Partner"></div><div class="exp-header-actions"><button id="expExplore">Tomar el control ↗</button><button id="expExit" aria-label="Cerrar experiencia">×</button></div></header>
    <section class="exp-main"><div class="exp-scene-head"><p id="expLabel"></p><h2 id="expTitle"></h2><p id="expTakeaway"></p></div><div id="expStage"></div></section>
    <div class="exp-caption" id="expCaptionBox"><span class="exp-sound" aria-hidden="true"><i></i><i></i><i></i><i></i></span><p id="expCaption"></p></div>
    <footer class="exp-player"><button id="expChapterToggle" aria-expanded="false" aria-controls="expChapters"><span id="expCounter"></span><span id="expChapterName">Bienvenida</span><span>⌃</span></button><div class="exp-transport"><button id="expPrev" aria-label="Escena anterior">‹</button><button id="expPause" aria-label="Pausar narración">Ⅱ</button><button id="expNext" aria-label="Escena siguiente">›</button></div><div class="exp-options"><button id="expVoice" aria-pressed="true" aria-label="Desactivar voz">Voz</button><button id="expVoiceSelect" aria-label="Cambiar voz">Enrique</button><button id="expRate" aria-label="Cambiar velocidad de narración">1×</button><button id="expCC" aria-pressed="true" aria-label="Ocultar subtítulos">CC</button></div><div class="exp-track"><i id="expProgress"></i></div></footer>
    <nav class="exp-chapters" id="expChapters" aria-label="Capítulos" hidden>${scenes.map((s,i)=>`<button data-scene="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.chapter}</button>`).join('')}</nav>
    <span id="expVoiceStatus" class="sr-only" role="status"></span><span class="exp-demo-note">Experiencia demostrativa · sin pagos reales</span>`;
  document.body.append(root);
  const $ = s => root.querySelector(s);
  const stage = $('#expStage');
  const pos = qs('#posWindow'); const roi = qs('.roi-shell');
  const homes = new Map([pos,roi].map(el=>{const marker=document.createComment('presentation-home'); el.before(marker); return [el,marker];}));
  let active=false,index=0,paused=false,muted=false,rate=1,audio=null,utterance=null,epoch=0,elapsed=0,last=0,frame=0,voiceDone=false,snapshot=null,opener=null,actions=[];
  let selectedVoice=localStorage.getItem('refilVoice')==='camila'?'camila':'enrique';
  const voiceNames={camila:'Camila',enrique:'Enrique'};
  const synth=window.speechSynthesis;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let background=[];
  function restoreNodes(){for(const [el,marker] of homes){marker.after(el);el.classList.remove('exp-mounted');if(el===pos)el.inert=false;} }
  function stateSnapshot(){return {selectedTable,cart:structuredClone(cart),orders:structuredClone(orders),owner:{...owner},tables:tables.map(t=>t.status),cat,view:qs('.pos-tab.active').dataset.view,metrics:qsa('.owner-dashboard [id]').map(el=>[el.id,el.innerHTML,el.className,el.getAttribute('style')]),tableLabel:qs('#selectedTableLabel').textContent,orderLabel:qs('#orderTable').textContent};}
  function paint(){renderTables();renderProducts();renderCart();renderKitchen();updateOwner();}
  function restoreState(){if(!snapshot)return;selectedTable=snapshot.selectedTable;cart=snapshot.cart;orders=snapshot.orders;owner=snapshot.owner;cat=snapshot.cat;tables.forEach((t,i)=>t.status=snapshot.tables[i]);paint();for(const [id,html,cls,style] of snapshot.metrics){const el=qs('#'+id);el.innerHTML=html;el.className=cls;if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);}qs('#selectedTableLabel').textContent=snapshot.tableLabel;qs('#orderTable').textContent=snapshot.orderLabel;showView(snapshot.view);updateOwner();snapshot=null;}
  // Each chapter reconstructs its starting state. Seeking never repeats a sale.
  function prepare(n){
    selectedTable=n>=2?12:null;cat='all';cart=n>=3&&n<=5?['agua','cesar','chila'].map(id=>({...products.find(p=>p.id===id),qty:1})):[];
    owner={sales:n>=6?18930:18420,tickets:n>=6?88:87};
    orders=n>=4?[{id:12001,table:12,lines:['agua','cesar','chila'].map(id=>({...products.find(p=>p.id===id),qty:1})),total:510,state:n>=6?'paid':n>=5?'ready':'pending',created:new Date()}]:[];
    tables.forEach(t=>t.status=t.n===12?(n===4||n===5?'kitchen':'free'):[2,7].includes(t.n)?'busy':[4,10].includes(t.n)?'kitchen':'free');
    paint();qsa('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat==='all'));
    qs('#selectedTableLabel').textContent=selectedTable?'MESA 12':'MESA —';qs('#orderTable').textContent=selectedTable?'Mesa 12':'Sin mesa';
    qs('#metricSales').textContent=MXN.format(owner.sales);qs('#metricTickets').textContent=owner.tickets;qs('#metricAvg').textContent=MXN.format(Math.round(owner.sales/owner.tickets));
    qs('#metricTable').textContent=n>=6?'Mesa 12':'—';qs('#metricLast').textContent=n>=6?'$510':'Sin cobro';qs('#metricSalesNote').textContent=n>=6?'Actualizado por venta':'Base demo';qs('#metricTicketsNote').textContent=n>=6?'+1 ticket':'Base demo';
    ['evKitchen','evReady','evPaid'].forEach((id,i)=>qs('#'+id).classList.toggle('done',n>=4+i));qs('#liveBar').style.height=n>=6?'72%':'56%';
  }
  function stopVoice(){epoch++; if(audio){audio.onended=null;audio.onerror=null;audio.pause();audio=null;} if(utterance){utterance.onend=null;utterance.onerror=null;utterance=null;} synth?.cancel();root.classList.remove('is-speaking');}
  function fallback(token){
    if(!active||token!==epoch||muted)return;
    const voices=synth?.getVoices()||[];
    const voice=voices.find(v=>/Dalia/i.test(v.name))||voices.find(v=>v.lang==='es-MX')||voices.find(v=>v.lang.startsWith('es'));
    if(!synth||!voice){voiceDone=true;$('#expVoiceStatus').textContent='Sin voz disponible · lectura automática';return;}
    const u=new SpeechSynthesisUtterance(scenes[index].text);utterance=u;u.voice=voice;u.lang=voice.lang;u.rate=1.05*rate;
    $('#expVoiceStatus').textContent=voice.name+' · voz de respaldo';
    u.onend=()=>{if(token===epoch){voiceDone=true;root.classList.remove('is-speaking');}};
    u.onerror=()=>{if(token===epoch){voiceDone=true;$('#expVoiceStatus').textContent='Audio no disponible · subtítulos';root.classList.remove('is-speaking');}};
    if(!paused){synth.speak(u);root.classList.add('is-speaking');}
  }
  function narrate(){stopVoice();voiceDone=muted;if(muted){$('#expVoiceStatus').textContent='Modo lectura · voz desactivada';return;}
    const token=epoch; const audioFile='assets/narration/'+scenes[index].id+'-'+selectedVoice+'.mp3'; const a=new Audio(audioFile);audio=a;a.playbackRate=rate;
    $('#expVoiceStatus').textContent=voiceNames[selectedVoice]+' · Eleven v4 · Español mexicano';
    a.onended=()=>{if(token===epoch){voiceDone=true;root.classList.remove('is-speaking');}};
    let failed=false;const fail=()=>{if(failed||token!==epoch)return;failed=true;a.pause();audio=null;fallback(token);};a.onerror=fail;
    if(!paused)a.play().then(()=>{if(token===epoch&&!paused)root.classList.add('is-speaking');}).catch(fail);
  }
  function focus(selector){root.querySelectorAll('.exp-focus').forEach(el=>el.classList.remove('exp-focus'));const el=stage.querySelector(selector);if(el){el.classList.add('exp-focus');el.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});}}
  function cue(at,run){actions.push({at,run,done:false});}
  function editorial(s){
    if(index===7){stage.innerHTML=`<div class="exp-pillars"><article><span>LA BASE</span><h3>Odoo.</h3><p>La operación que necesitas.</p><small>Mesas, pedidos y preparación.</small></article><article><span>LA CONEXIÓN</span><h3>VLUX.</h3><p>Tu forma de trabajar.</p><small>Configuración, control y lectura del negocio.</small></article><article><span>LA ESENCIA</span><h3>El Refil.</h3><p>Lo que te hace especial.</p><small>Tu menú. Tu equipo. Tu restaurante.</small></article></div>`;}
    else {stage.innerHTML=`<div class="exp-cover"><img src="assets/breakfast-editorial.png" alt="Desayuno mexicano, imagen editorial ilustrativa"><div class="exp-cover-copy"><p>${index===9?'EL SIGUIENTE CAPÍTULO':'UN DESAYUNO EN EL REFIL'}</p><h3>${index===9?'Tu esencia.<br>Con más posibilidades.':'La calidez de siempre.<br>Todo lo demás, conectado.'}</h3>${index===9?'<button id="expReplay">Volver a comenzar ↺</button>':'<span>El servicio está por comenzar.</span>'}</div></div>`;}
    $('#expReplay')?.addEventListener('click',()=>go(0));
  }
  function go(n){
    stopVoice();qsa('.exp-focus').forEach(el=>el.classList.remove('exp-focus'));restoreNodes();root.scrollTop=0;index=n;elapsed=0;actions=[];voiceDone=false;const s=scenes[n];prepare(n);root.dataset.scene=s.id;if(!$('#expChapters').hidden)$('#expChapterToggle').focus();$('#expChapters').hidden=true;$('#expChapterToggle').setAttribute('aria-expanded','false');$('#expChapterName').textContent=s.chapter;
    $('#expLabel').textContent=s.label;$('#expTitle').textContent=({welcome:'Un desayuno en El Refil.',tables:'Cada gran servicio empieza aquí.',order:'Un antojo. Tres toques.',send:'La misma orden. En buenas manos.',ready:'Listo para llegar a la mesa.',payment:'La cuenta cierra. Todo conecta.',owner:'Así lo vive tu equipo. Así lo ves tú.',value:'La tecnología se adapta a ti.',roi:'Y el valor, con números claros.',close:'Sigamos con tu restaurante.'})[s.id]||s.title;$('#expCaption').textContent=s.text.match(/[^.!?]+[.!?]*/g)?.[0]||s.text;$('#expTakeaway').textContent=s.takeaway;$('#expCounter').textContent=String(n+1).padStart(2,'0')+' / '+String(scenes.length);
    root.querySelectorAll('[data-scene]').forEach((b,i)=>{b.setAttribute('aria-current',i===n?'step':'false');b.classList.toggle('complete',i<n);});
    $('#expPrev').disabled=n===0;$('#expNext').textContent=n===scenes.length-1?'✓':'›';$('#expNext').setAttribute('aria-label',n===scenes.length-1?'Finalizar recorrido':'Escena siguiente');
    stage.innerHTML='';stage.scrollTop=0;stage.classList.remove('scene-enter');void stage.offsetWidth;stage.classList.add('scene-enter');
    if(s.view){stage.append(pos);pos.inert=true;pos.classList.add('exp-mounted','visible');showView(s.view);}
    else if(n===8){stage.append(roi);roi.classList.add('exp-mounted','visible');}
    else editorial(s);
    if(s.target)cue(500,()=>focus(s.target));
    if(n===1)cue(6000,()=>{selectTable(12);focus('#selectedTableLabel');});
    if(n===2){cue(1800,()=>{addProduct('agua');focus('[data-product="agua"]');});cue(4000,()=>{addProduct('cesar');focus('[data-product="cesar"]');});cue(6500,()=>{addProduct('chila');focus('.order-totals');});}
    if(n===3)cue(3000,()=>{sendToKitchen();focus('#pendingOrders');});
    if(n===4)cue(4200,()=>{markReady(12001);focus('#readyOrders');});
    if(n===5)cue(5500,()=>{payOrder();focus('.owner-cards');});
    narrate();syncPause();
  }
  function tick(now){if(!active)return;const dt=Math.min(now-last,100);last=now;if(!paused){elapsed+=dt*rate;for(const a of actions){if(!a.done&&elapsed>=a.at){a.done=true;a.run();}}const reading=Math.max(12000,scenes[index].text.split(/\s+/).length*420);const duration=audio?.duration?audio.duration*1000:reading;const progress=audio&&!muted&&audio.duration?audio.currentTime/audio.duration:Math.min(1,elapsed/duration);$('#expProgress').style.width=((index+progress)/scenes.length*100)+'%';const sentences=scenes[index].text.match(/[^.!?]+[.!?]*/g)||[scenes[index].text];const words=scenes[index].text.split(/\s+/).length;let count=0;const sentence=sentences.find(t=>{count+=t.trim().split(/\s+/).length;return count/words>progress;})||sentences.at(-1);if($('#expCaption').textContent!==sentence)$('#expCaption').textContent=sentence;if(voiceDone&&elapsed>=((muted||!audio)?reading:9000)&&actions.every(a=>a.done)){if(index<scenes.length-1)go(index+1);else{paused=true;syncPause();$('#expVoiceStatus').textContent='Recorrido completo · puedes explorar';}}}frame=requestAnimationFrame(tick);}
  function syncPause(){$('#expPause').textContent=paused?'▶':'Ⅱ';$('#expPause').setAttribute('aria-label',paused?'Reanudar narración':'Pausar narración');root.classList.toggle('is-paused',paused);}
  function syncVoice(){const name=voiceNames[selectedVoice];$('#expVoiceSelect').textContent=name;$('#expVoiceSelect').setAttribute('aria-label','Cambiar voz · voz actual: '+name);}
  function togglePause(){paused=!paused;if(paused){audio?.pause();synth?.pause();}else if(audio){audio.play().catch(()=>fallback(epoch));}else if(utterance){if(synth?.paused)synth.resume();else narrate();}syncPause();}
  function start(){if(active){go(0);return;}opener=document.activeElement;snapshot=stateSnapshot();active=true;paused=false;root.hidden=false;background=[...document.body.children].filter(el=>el!==root&&el.tagName!=='SCRIPT').map(el=>[el,el.inert]);background.forEach(([el])=>el.inert=true);document.body.classList.add('experience-open');go(0);$('#expPause').focus();last=performance.now();frame=requestAnimationFrame(tick);}
  function close({takeover=false}={}){if(!active)return;active=false;cancelAnimationFrame(frame);stopVoice();restoreNodes();if(takeover){snapshot=null;}else{restoreState();}qsa('.exp-focus').forEach(el=>el.classList.remove('exp-focus'));qsa('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));root.hidden=true;document.body.classList.remove('experience-open');background.forEach(([el,inert])=>el.inert=inert);opener?.focus();}
  $('#expExit').onclick=close;$('#expExplore').onclick=()=>{close({takeover:true});qs('#producto').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});};$('#expPause').onclick=togglePause;$('#expPrev').onclick=()=>{if(index>0)go(index-1);};$('#expNext').onclick=()=>index===scenes.length-1?close():go(index+1);
  $('#expVoice').onclick=()=>{muted=!muted;$('#expVoice').textContent=muted?'Sin voz':'Voz';$('#expVoice').setAttribute('aria-label',muted?'Activar voz':'Desactivar voz');$('#expVoice').setAttribute('aria-pressed',String(!muted));narrate();};
  $('#expVoiceSelect').onclick=()=>{selectedVoice=selectedVoice==='enrique'?'camila':'enrique';localStorage.setItem('refilVoice',selectedVoice);syncVoice();if(active)narrate();};
  $('#expRate').onclick=()=>{rate=rate===1?1.25:rate===1.25?.85:1;$('#expRate').textContent=rate+'×';if(audio)audio.playbackRate=rate;else if(!muted)narrate();};
  $('#expChapterToggle').onclick=()=>{const open=$('#expChapters').hidden;$('#expChapters').hidden=!open;$('#expChapterToggle').setAttribute('aria-expanded',String(open));};
  $('#expCC').onclick=()=>{const hide=!$('#expCaptionBox').hidden;$('#expCaptionBox').hidden=hide;$('#expCC').setAttribute('aria-pressed',String(!hide));$('#expCC').setAttribute('aria-label',hide?'Mostrar subtítulos':'Ocultar subtítulos');};
  root.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>go(Number(b.dataset.scene)));
  syncVoice();
  ['startGuideTop','startGuideHero','restartGuide'].forEach(id=>qs('#'+id).onclick=start);
  // Demo actions own the POS while playing; manual exploration remains separate.
  stage.addEventListener('click',e=>{if(e.target.closest('.pos-window')){e.preventDefault();e.stopPropagation();}},true);
  document.addEventListener('visibilitychange',()=>{if(active&&document.hidden&&!paused)togglePause();});
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){const els=[...root.querySelectorAll('button:not(:disabled),input,a[href]')].filter(el=>el.getClientRects().length&&!el.closest('[inert]'));const first=els[0],end=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}}if(e.target.matches('input,select,textarea'))return;if(e.code==='Space'&&e.target===root){e.preventDefault();togglePause();}});
})();
