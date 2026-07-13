(function(){

  // ── THEME ──
  const root = document.documentElement;
  function applyTheme(t){
    root.setAttribute('data-theme',t);
    document.getElementById('themeIcon').innerHTML = t==='dark'?'&#9789;':'&#9728;';
    document.getElementById('themeLabel').textContent = t==='dark'?'Dark':'Light';
    try{localStorage.setItem('vfTheme',t);}catch(e){}
  }
  let saved; try{saved=localStorage.getItem('vfTheme');}catch(e){}
  const prefersDark = window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved||(prefersDark?'dark':'light'));
  document.getElementById('themeToggle').addEventListener('click',()=>{
    applyTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');
  });

  // ── MODULE SELECTOR ──
  const moduleSelector = document.getElementById('moduleSelector');
  const moduleValue = document.getElementById('moduleValue');
  let activeModule = '';

  moduleSelector.addEventListener('click',e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    [...moduleSelector.children].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeModule = btn.dataset.value;
    moduleValue.value = activeModule;
    toggleSections();
    updateProgress();
    recalcAll();
    updateSummaryPanel();
  });

  function toggleSections(){
    const mta = activeModule==='mta'||activeModule==='both';
    const mto = activeModule==='mto'||activeModule==='both';
    const both = activeModule==='both';
    document.getElementById('mtaSection').classList.toggle('hidden',!mta);
    document.getElementById('mtoSection').classList.toggle('hidden',!mto);
    document.getElementById('grandSection').classList.toggle('hidden',!both);
    document.getElementById('mtoNum').textContent = mta?'04':'03';
    // update data-required for mta/mto fields
    document.querySelectorAll('.mta-required').forEach(i=>{
      i.dataset.required = mta?'true':'';
      if(!mta){i.value='';i.classList.remove('has-error');}
    });
    document.querySelectorAll('.mto-required').forEach(i=>{
      i.dataset.required = mto?'true':'';
      if(!mto){i.value='';i.classList.remove('has-error');}
    });
    syncBomRequired();
  }

  // ── BOM TOGGLE ──
  const bomToggle = document.getElementById('bomToggle');
  const bomValue = document.getElementById('bomValue');
  bomToggle.addEventListener('click',e=>{
    const btn=e.target.closest('button'); if(!btn) return;
    [...bomToggle.children].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    bomValue.value=btn.dataset.value;
    const show=btn.dataset.value==='yes';
    document.getElementById('bomSection').classList.toggle('hidden',!show);
    document.getElementById('mtoSummaryNoBom').classList.toggle('hidden',show);
    syncBomRequired();
    recalcAll();
    updateProgress();
    updateSummaryPanel();
  });

  // ── PROCUREMENT TOGGLE ──
  const procToggle = document.getElementById('procToggle');
  const procValue = document.getElementById('procValue');
  procToggle.addEventListener('click',e=>{
    const btn=e.target.closest('button'); if(!btn) return;
    [...procToggle.children].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    procValue.value=btn.dataset.value;
    document.getElementById('f23Row').classList.toggle('hidden',btn.dataset.value!=='yes');
    recalcAll();
    updateSummaryPanel();
  });

  function syncBomRequired(){
    const mto = activeModule==='mto'||activeModule==='both';
    const bomOn = bomValue.value==='yes' && mto;
    document.querySelectorAll('.bom-required').forEach(i=>{
      i.dataset.required = bomOn?'true':'';
      if(!bomOn){i.value='';i.classList.remove('has-error');}
    });
  }

  // ── HELPERS ──
  const num = id => parseFloat(document.getElementById(id).value)||0;
  const fmt = n => n===0||isNaN(n)?'—':n.toLocaleString('en-IN');
  const fmtM = n => isNaN(n)||n===0?'—':(n/1e6).toFixed(4)+' M';
  function setCalc(id,val){
    const el=document.getElementById(id);
    el.textContent = (val===null||isNaN(val)||val===0)?'—':val.toLocaleString('en-IN');
    return val;
  }
  function setCalcM(id,val){
    const el=document.getElementById(id);
    el.textContent = (val===null||isNaN(val))?'—':fmtM(val);
    return val;
  }

  // ── RAW CALC VALUES (used by Excel generator) ──
  const _calcVals = { f6: 0, f10: 0, f14: 0, f23: 0 };

  // ── RECALC ──
  function recalcAll(){
    const mta = activeModule==='mta'||activeModule==='both';
    const mto = activeModule==='mto'||activeModule==='both';
    const both = activeModule==='both';
    const bomOn = bomValue.value==='yes';
    const procOn = procValue.value==='yes';

    let f6val=0, f10val=0, f14val=0, f23val=0;

    if(mta){
      const f1=num('f1'), f2=num('f2'), f3=num('f3'), f7=num('f7'), f8=num('f8');
      const f4=f1+f2; setCalc('f4',f4);
      const f5=f4*f3; setCalc('f5',f5);
      f6val=f5*90; setCalc('f6',f6val);
      const f9=f7*f8; setCalc('f9',f9);
      f10val=f9*90; setCalc('f10',f10val);
      const sv = (f6val/1e6)+(f10val/1e6);
      document.getElementById('mtaTotal').textContent = (f6val||f10val)?sv.toFixed(4)+' M':'—';
    }

    if(mto){
      const f11=num('f11'), f12=num('f12');
      const f13=f11*f12; setCalc('f13',f13);
      f14val=f13*90; setCalc('f14',f14val);

      if(bomOn){
        const f15=num('f15');
        const f16=f15*3; setCalc('f16',f16);
        setCalc('f17',f11);
        const f18=f16+f11; setCalc('f18',f18);
        const f19=num('f19'), f20=num('f20');
        const f21=f19*f20; setCalc('f21',f21);
        const f22=f18*f21; setCalc('f22',f22);
        if(procOn){ f23val=f22*90; setCalc('f23',f23val); }
        const sv1=(f14val/1e6)+(f23val/1e6);
        document.getElementById('mtoTotal').textContent=(f14val||f23val)?sv1.toFixed(4)+' M':'—';
        document.getElementById('mtoSummary').classList.remove('hidden');
      } else {
        document.getElementById('mtoSummaryNoBom').classList.remove('hidden');
        document.getElementById('mtoTotalNoBom').textContent = f14val?(f14val/1e6).toFixed(4)+' M':'—';
        document.getElementById('mtoSummary').classList.add('hidden');
      }
    }

    if(both){
      const sv2=(f6val/1e6)+(f10val/1e6)+(f14val/1e6)+(f23val/1e6);
      document.getElementById('grandTotal').textContent=(sv2>0)?sv2.toFixed(4)+' M':'—';
      let parts=[];
      if(f6val) parts.push('Daily Records ÷ 1M');
      if(f10val) parts.push('Vendor Volume ÷ 1M');
      if(f14val) parts.push('MTO Trend ÷ 1M');
      if(f23val) parts.push('Full-Kit ÷ 1M');
      document.getElementById('grandFormula').textContent='= '+parts.join(' + ')+' · in Millions';
    }

    // Persist raw values for Excel generator
    _calcVals.f6  = f6val;
    _calcVals.f10 = f10val;
    _calcVals.f14 = f14val;
    _calcVals.f23 = f23val;
  }

  // ── SUMMARY PANEL ──
  function setText(id, val){
    const el = document.getElementById(id);
    if(el) el.textContent = (val && val !== '' && val !== '0') ? val : '—';
  }

  function updateSummaryPanel(){
    const inp = id => { const el=document.getElementById(id); return el?(el.value||'').trim():''; };
    const calc = id => { const el=document.getElementById(id); return el?el.textContent.trim():'—'; };
    const fmt = v => { const n=parseFloat(v); return (!v||isNaN(n))?'—':n.toLocaleString('en-IN'); };

    // Module badge
    const modEl = document.getElementById('sp-module');
    const modLabels = {mta:'MTA', mto:'MTO', both:'MTA & MTO'};
    if(activeModule && modLabels[activeModule]){
      modEl.innerHTML = `<span class="sp-module-badge">${modLabels[activeModule]}</span>`;
    } else {
      modEl.innerHTML = `<span class="sp-empty">Not selected</span>`;
    }

    // MTA
    const mtaOn = activeModule==='mta'||activeModule==='both';
    const mtoOn = activeModule==='mto'||activeModule==='both';
    document.getElementById('sp-mta-block').classList.toggle('hidden', !mtaOn);
    document.getElementById('sp-mto-block').classList.toggle('hidden', !mtoOn);
    document.getElementById('sp-grand-block').classList.toggle('hidden', activeModule!=='both');

    if(mtaOn){
      setText('sp-f1',        fmt(inp('f1')));
      setText('sp-f2',        fmt(inp('f2')));
      setText('sp-f3',        fmt(inp('f3')));
      setText('sp-f5',        calc('f5'));
      setText('sp-f6',        calc('f6'));
      setText('sp-f7',        fmt(inp('f7')));
      setText('sp-f10',       calc('f10'));
      setText('sp-mta-total', calc('mtaTotal'));
    }

    if(mtoOn){
      setText('sp-f11',       fmt(inp('f11')));
      setText('sp-f12',       fmt(inp('f12')));
      setText('sp-f14',       calc('f14'));
      const mtoTotalId = bomValue.value==='yes' ? 'mtoTotal' : 'mtoTotalNoBom';
      setText('sp-mto-total', calc(mtoTotalId));
    }

    if(activeModule==='both'){
      setText('sp-grand', calc('grandTotal'));
    }

    // Infra tier — show as soon as any total is computable
    let totalRaw = 0;
    if(mtaOn)  totalRaw += _calcVals.f6 + _calcVals.f10;
    if(mtoOn){ totalRaw += _calcVals.f14; if(bomValue.value==='yes'&&procValue.value==='yes') totalRaw += _calcVals.f23; }

    const tierBlock = document.getElementById('sp-tier-block');
    if(totalRaw > 0){
      const tier = getInfraTier(totalRaw / 1e6);
      document.getElementById('sp-cpu').textContent  = tier.cpu;
      document.getElementById('sp-vcpu').textContent = tier.vcpu;
      document.getElementById('sp-ram').textContent  = tier.ram;
      tierBlock.classList.remove('hidden');
    } else {
      tierBlock.classList.add('hidden');
    }
  }

  // ── COPY SUMMARY AS TEXT ──
  function generateSummaryText(){
    const inp = id => { const el=document.getElementById(id); return el?(el.value||'').trim():''; };
    const calc = id => { const el=document.getElementById(id); return el?el.textContent.trim():'—'; };
    const fmt = v => { const n=parseFloat(v); return (!v||isNaN(n))?'—':n.toLocaleString('en-IN'); };
    const modLabels = {mta:'MTA', mto:'MTO', both:'MTA & MTO'};

    const mtaOn = activeModule==='mta'||activeModule==='both';
    const mtoOn = activeModule==='mto'||activeModule==='both';
    const bothOn = activeModule==='both';

    const lines = [];
    lines.push('VectorFLOW — Infrastructure Requirements Summary');
    lines.push('='.repeat(48));
    lines.push('');
    lines.push(`Client:        ${inp('clientName') || '—'}`);
    lines.push(`Prepared by:   ${inp('userName') || '—'}`);
    lines.push(`Date:          ${inp('submissionDate') || '—'}`);
    lines.push(`Module:        ${modLabels[activeModule] || 'Not selected'}`);

    if(mtaOn){
      lines.push('');
      lines.push('MTA — Make to Availability');
      lines.push('-'.repeat(48));
      lines.push(`FG SKUs / WIP          ${fmt(inp('f1'))}`);
      lines.push(`RM SKUs                ${fmt(inp('f2'))}`);
      lines.push(`Locations              ${fmt(inp('f3'))}`);
      lines.push(`SKU-Locations          ${calc('f5')}`);
      lines.push(`Daily Records          ${calc('f6')}`);
      lines.push(`Vendors                ${fmt(inp('f7'))}`);
      lines.push(`Vendor Vol (90d)       ${calc('f10')}`);
      lines.push(`MTA Total              ${calc('mtaTotal')}`);
    }

    if(mtoOn){
      lines.push('');
      lines.push('MTO — Make to Order');
      lines.push('-'.repeat(48));
      lines.push(`Orders / day           ${fmt(inp('f11'))}`);
      lines.push(`CCRs                   ${fmt(inp('f12'))}`);
      lines.push(`Trend Data (90d)       ${calc('f14')}`);
      const mtoTotalId = bomValue.value==='yes' ? 'mtoTotal' : 'mtoTotalNoBom';
      lines.push(`MTO Total              ${calc(mtoTotalId)}`);
    }

    if(bothOn){
      lines.push('');
      lines.push(`Grand Total            ${calc('grandTotal')}`);
    }

    const cpu  = document.getElementById('sp-cpu').textContent.trim();
    const vcpu = document.getElementById('sp-vcpu').textContent.trim();
    const ram  = document.getElementById('sp-ram').textContent.trim();
    if(cpu && cpu !== '—'){
      lines.push('');
      lines.push('Infra Requirement');
      lines.push('-'.repeat(48));
      lines.push(`CPU: ${cpu}   vCPU: ${vcpu}   RAM: ${ram}`);
    }

    lines.push('');
    lines.push('-'.repeat(48));
    lines.push('Generated via VectorFLOW Infrastructure Sizing Tool');

    return lines.join('\n');
  }

  const spCopyBtn = document.getElementById('spCopyBtn');
  const spCopyIcon = document.getElementById('spCopyIcon');
  const spCopyLabel = document.getElementById('spCopyLabel');
  const checkIconSVG = '<path d="M20 6L9 17l-5-5"></path>';
  const defaultIconSVG = spCopyIcon.innerHTML;

  spCopyBtn.addEventListener('click', async () => {
    const text = generateSummaryText();
    try {
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      spCopyBtn.classList.add('copied');
      spCopyIcon.innerHTML = checkIconSVG;
      spCopyLabel.textContent = 'Copied';
      spCopyBtn.disabled = true;
      setTimeout(() => {
        spCopyBtn.classList.remove('copied');
        spCopyIcon.innerHTML = defaultIconSVG;
        spCopyLabel.textContent = 'Copy';
        spCopyBtn.disabled = false;
      }, 1800);
    } catch(err){
      spCopyLabel.textContent = 'Failed';
      setTimeout(() => { spCopyLabel.textContent = 'Copy'; }, 1800);
    }
  });

  // ── VALIDATION ──
  function validateField(inp){
    const errEl = inp.parentElement.querySelector('.error-text');
    const val = inp.value.trim();
    let valid = false;
    const type = inp.dataset.type||'number';
    if(type==='text') valid = val.length>0;
    else if(type==='name') valid = val.length>=2 && /^[a-zA-Z\s\-'\.]+$/.test(val);
    else if(type==='camelcase') valid = val.length>=2 && /^[a-zA-Z][a-zA-Z0-9]+$/.test(val);
    else if(type==='email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    else if(type==='date') valid = val.length>0;
    else{
      const n=parseFloat(val);
      const min=parseFloat(inp.min);
      valid = val!==''&&!isNaN(n)&&(isNaN(min)||n>=min);
    }
    inp.classList.toggle('has-error',!valid&&val!=='');
    if(errEl) errEl.classList.toggle('show',!valid&&val!=='');
    return valid;
  }

  // ── PROGRESS ──
  function getRequiredInputs(){
    return Array.from(document.querySelectorAll('input[data-required="true"],input[data-required=""]'))
      .filter(i=>i.dataset.required==='true'||i.hasAttribute('data-required'))
      .filter(i=>i.closest('section:not(.hidden)')!==null||i.id==='userName'||i.id==='userEmail'||i.id==='submissionDate');
  }

  function allRequiredInputs(){
    const base = ['userName','userEmail','clientName','submissionDate'];
    const mta = activeModule==='mta'||activeModule==='both';
    const mto = activeModule==='mto'||activeModule==='both';
    const bomOn = bomValue.value==='yes';
    let ids=[...base];
    if(mta) ids.push('f1','f2','f3','f7','f8');
    if(mto) ids.push('f11','f12');
    if(mto&&bomOn) ids.push('f15','f19','f20');
    return ids.map(id=>document.getElementById(id)).filter(Boolean);
  }

  function updateProgress(){
    const inputs = allRequiredInputs();
    const filled = inputs.filter(i=>{
      const v=i.value.trim();
      if(!v) return false;
      const type=i.dataset.type||'number';
      if(type==='name') return v.length>=2 && /^[a-zA-Z\s\-'\.]+$/.test(v);
      if(type==='camelcase') return v.length>=2 && /^[a-zA-Z][a-zA-Z0-9]+$/.test(v);
      if(type==='text') return v.length>0;
      if(type==='email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if(type==='date') return v.length>0;
      return !isNaN(parseFloat(v));
    });
    const pct=inputs.length?Math.round(filled.length/inputs.length*100):0;
    document.getElementById('progressFill').style.width=pct+'%';
    document.getElementById('progressText').textContent=filled.length+' of '+inputs.length+' fields completed';
    document.getElementById('progressPct').textContent=pct+'%';
    // also require module selected
    const ready = filled.length===inputs.length&&activeModule!=='';
    document.getElementById('submitBtn').disabled=!ready;
  }

  // bind input events
  document.getElementById('infraForm').addEventListener('input',e=>{
    const inp=e.target;
    if(inp.tagName==='INPUT'&&inp.type!=='hidden'){
      if(inp.classList.contains('has-error')) validateField(inp);
      recalcAll();
      updateProgress();
      updateSummaryPanel();
    }
  });
  document.getElementById('infraForm').addEventListener('blur',e=>{
    if(e.target.tagName==='INPUT') validateField(e.target);
  },true);

  // ── RESET ──
  document.getElementById('resetBtn').addEventListener('click',()=>{
    document.getElementById('infraForm').reset();
    activeModule=''; moduleValue.value='';
    [...moduleSelector.children].forEach(b=>b.classList.remove('active'));
    bomValue.value='no';
    [...bomToggle.children].forEach(b=>b.classList.remove('active'));
    bomToggle.children[0].classList.add('active');
    procValue.value='no';
    [...procToggle.children].forEach(b=>b.classList.remove('active'));
    procToggle.children[0].classList.add('active');
    document.getElementById('bomSection').classList.add('hidden');
    document.getElementById('f23Row').classList.add('hidden');
    document.getElementById('mtoSummaryNoBom').classList.add('hidden');
    document.querySelectorAll('.has-error').forEach(i=>i.classList.remove('has-error'));
    document.querySelectorAll('.error-text.show').forEach(e=>e.classList.remove('show'));
    document.querySelectorAll('.calc-field').forEach(el=>el.textContent='—');
    document.querySelectorAll('.summary-total-value').forEach(el=>el.textContent='—');
    toggleSections();
    updateProgress();
    updateSummaryPanel();
  });

  // ── EXCEL GENERATION ──

  // Tier lookup table — single source of truth
  function getInfraTier(totalMillions){
    if(totalMillions<=10)  return {cpu:2,  vcpu:4,  ram:'16 GB'};
    if(totalMillions<=20)  return {cpu:4,  vcpu:8,  ram:'32 GB'};
    if(totalMillions<=40)  return {cpu:8,  vcpu:16, ram:'64 GB'};
    return                        {cpu:16, vcpu:32, ram:'128 GB'}; // >40M (incl. >80M)
  }

  // Safe cell updater — preserves style, clears stale cached text
  function updateCell(ws, addr, value){
    if(!ws[addr]) ws[addr]={t:'s'};
    ws[addr].v = value;
    ws[addr].t = 's';
    delete ws[addr].r; // rich-text cache
    delete ws[addr].h; // HTML cache
    delete ws[addr].w; // formatted-text cache
  }

  async function generateInfraDoc(payload){
    const {clientName, moduleValue} = payload;
    const bomOn  = document.getElementById('bomValue').value==='yes';
    const procOn = document.getElementById('procValue').value==='yes';

    // Total data volume (raw numbers, not millions)
    let totalRaw = 0;
    if(moduleValue==='mta'||moduleValue==='both') totalRaw += _calcVals.f6 + _calcVals.f10;
    if(moduleValue==='mto'||moduleValue==='both'){
      totalRaw += _calcVals.f14;
      if(bomOn && procOn) totalRaw += _calcVals.f23;
    }

    const totalMillions = totalRaw / 1e6;
    const tier = getInfraTier(totalMillions);
    const moduleLabel = moduleValue==='mta'?'MTA':moduleValue==='mto'?'MTO':'MTA+MTO';

    // ── FETCH TEMPLATE ──
    // TODO (server migration): replace the fetch + client-side logic below with:
    //   const res = await fetch('/api/generate-infra-doc', {
    //     method: 'POST',
    //     headers: {'Content-Type':'application/json'},
    //     body: JSON.stringify({...payload, tier, moduleLabel, totalMillions})
    //   });
    //   const blob = await res.blob();
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url; a.download = `Server_infra_${clientName}.xlsx`; a.click();
    //   URL.revokeObjectURL(url);
    //   return;

    let arrayBuffer;
    try{
      const response = await fetch('Server_infra_Template.xlsx');
      if(!response.ok) throw new Error('HTTP '+response.status);
      arrayBuffer = await response.arrayBuffer();
    }catch(err){
      alert('Could not load template file.\n\nEnsure "Server_infra_Template.xlsx" is in the same folder as index.html and you are using Live Server (not opening the file directly).\n\nError: '+err.message);
      return;
    }

    // Load workbook preserving styles
    const wb = XLSX.read(arrayBuffer, {type:'array', cellStyles:true});

    // Rename sheet (Cera → clientname, lowercase)
    const clientNameLower = clientName.toLowerCase();
    const oldSheet = wb.SheetNames[0];
    const ws = wb.Sheets[oldSheet];
    wb.SheetNames[0] = clientNameLower;
    wb.Sheets[clientNameLower] = ws;
    delete wb.Sheets[oldSheet];

    // C2 — Environment label
    updateCell(ws, 'C2', `Server 1\nPROD(${moduleLabel})`);

    // C3 — CPU / vCPU
    updateCell(ws, 'C3',
      `Intel Xeon Gold/Platinum processor \u2013 At least ${tier.cpu} CPU / ${tier.vcpu} vCPU, 2.3+ GHz (Scalable in future)`
    );

    // C4 — RAM
    updateCell(ws, 'C4', `${tier.ram} (Scalable in future)`);

    // C25, C26, C27, C39, C40, C41 — replace ClientName placeholder
    ['C25','C26','C27','C39','C40','C41'].forEach(addr=>{
      if(ws[addr]) updateCell(ws, addr, ws[addr].v.replace(/ClientName/g, clientNameLower));
    });

    // Download
    XLSX.writeFile(wb, `Server_infra_${clientName}.xlsx`, {cellStyles:true, bookSST:false});
  }

  // ── SUBMIT ──
  document.getElementById('infraForm').addEventListener('submit', async e=>{
    e.preventDefault();
    if(!activeModule){alert('Please select a module (MTA, MTO, or MTA & MTO).');return;}
    const inputs=allRequiredInputs();
    let allValid=true;
    inputs.forEach(i=>{if(!validateField(i)) allValid=false;});
    if(!allValid){updateProgress();return;}

    const payload={};
    new FormData(document.getElementById('infraForm')).forEach((v,k)=>payload[k]=v);

    const btn = document.getElementById('submitBtn');
    const original = btn.textContent;
    btn.disabled=true;
    btn.textContent='Generating…';

    try{
      await generateInfraDoc(payload);
    }finally{
      btn.disabled=false;
      btn.textContent=original;
      updateProgress();
    }
  });

  // ── BLOCK e/E/+/- on number inputs ──
  document.getElementById('infraForm').addEventListener('keydown',e=>{
    if(e.target.type==='number' && ['e','E','+','-'].includes(e.key)){
      e.preventDefault();
    }
  });
  const today=new Date().toISOString().split('T')[0];
  document.getElementById('submissionDate').value=today;

  toggleSections();
  updateProgress();
  updateSummaryPanel();
})();
