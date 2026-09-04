(()=>{
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

  const header=$('[data-header]');
  const progress=$('.progress i');
  let ticking=false;
  const updateScroll=()=>{
    const y=window.scrollY;
    const distance=document.documentElement.scrollHeight-window.innerHeight;
    header?.classList.toggle('scrolled',y>8);
    if(progress) progress.style.transform=`scaleX(${distance>0?Math.min(y/distance,1):0})`;
    ticking=false;
  };
  const onScroll=()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true}};
  updateScroll();
  addEventListener('scroll',onScroll,{passive:true});

  const menu=$('.menu');
  const nav=$('.nav');
  const menuLabel=$('.menu .sr');
  const closeMenu=()=>{
    menu?.setAttribute('aria-expanded','false');
    nav?.classList.remove('open');
    document.body.classList.remove('menuOpen');
    if(menuLabel) menuLabel.textContent='Navigation öffnen';
  };
  menu?.addEventListener('click',()=>{
    const open=menu.getAttribute('aria-expanded')!=='true';
    menu.setAttribute('aria-expanded',String(open));
    nav?.classList.toggle('open',open);
    document.body.classList.toggle('menuOpen',open);
    if(menuLabel) menuLabel.textContent=open?'Navigation schließen':'Navigation öffnen';
  });
  $$('.nav a').forEach(link=>link.addEventListener('click',closeMenu));
  addEventListener('resize',()=>{if(innerWidth>880) closeMenu()});
  addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu()});

  const cases={
    urgent:{
      time:'22:47',wait:false,
      quote:'„Die Kühlung ist ausgefallen. Der Betrieb startet um sechs.“',
      fields:'Standort, Rückrufnummer, betroffene Anlage und Auswirkung.',
      rule:'Kritische Anlage plus Ausfall vor Betriebsstart: sofort weitergeben.',total:'02:02',
      decision:'Bereitschaft jetzt informieren.',
      copy:'Mit Situation, Rückrufnummer und allen vereinbarten Angaben.',handoff:'22:49 übergeben'
    },
    wait:{
      time:'18:12',wait:true,
      quote:'„Ich möchte den Termin morgen verschieben und brauche einen Rückruf.“',
      fields:'Name, Rückrufnummer, Auftragsbezug und gewünschte Rückrufzeit.',
      rule:'Kein akuter Handlungsbedarf: für den nächsten Arbeitstag vormerken.',total:'01:32',
      decision:'Für morgen 08:00 vormerken.',
      copy:'Mit Rückrufwunsch, Kontaktdaten und Auftragsbezug.',handoff:'18:13 vorgemerkt'
    }
  };

  const caseTabs=$$('[data-case]');
  const setCase=tab=>{
    const data=cases[tab.dataset.case];
    if(!data) return;
    caseTabs.forEach(item=>{
      const active=item===tab;
      item.classList.toggle('active',active);
      item.setAttribute('aria-selected',String(active));
      item.tabIndex=active?0:-1;
    });
    $('[data-case-time]').textContent=data.time;
    $('[data-case-quote]').textContent=data.quote;
    $('[data-case-fields-inline]').textContent=data.fields;
    $('[data-case-rule]').textContent=data.rule;
    $('[data-case-total]').textContent=data.total;
    $('[data-case-decision]').textContent=data.decision;
    $('[data-case-copy]').textContent=data.copy;
    $('[data-case-handoff]').textContent=data.handoff;
    $('.incident').classList.toggle('wait',data.wait);
  };
  caseTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>setCase(tab));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next=event.key==='ArrowRight'?(index+1)%caseTabs.length:(index-1+caseTabs.length)%caseTabs.length;
      setCase(caseTabs[next]);
      caseTabs[next].focus();
    });
  });

  $$('details').forEach(detail=>detail.addEventListener('toggle',()=>{
    if(detail.open) $$('details[open]').forEach(other=>{if(other!==detail) other.open=false});
  }));

  const form=$('#form');
  const success=$('.success');
  const error=$('.error');
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    let valid=true;
    $$('[required]',form).forEach(field=>{
      const fieldValid=field.checkValidity()&&String(field.value).trim().length>0;
      field.classList.toggle('invalid',!fieldValid);
      field.setAttribute('aria-invalid',String(!fieldValid));
      if(!fieldValid) valid=false;
    });
    if(!valid){error.textContent='Bitte füllen Sie alle Pflichtfelder aus.';$('.invalid',form)?.focus();return}
    error.textContent='';
    form.hidden=true;
    success.hidden=false;
  });
  if(form) $$('input,select,textarea',form).forEach(field=>{
    ['input','change'].forEach(eventName=>field.addEventListener(eventName,()=>{field.classList.remove('invalid');field.removeAttribute('aria-invalid')}));
  });
  $('.reset')?.addEventListener('click',()=>{form.reset();form.hidden=false;success.hidden=true;$('input',form)?.focus()});

  const year=$('[data-year]');
  if(year) year.textContent=new Date().getFullYear();
})();
