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
  addEventListener('resize',()=>{if(innerWidth>980) closeMenu()});
  addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu()});

  const calls={
    urgent:{
      time:'22:47',
      meta:'Technischer Bereitschaftsdienst',
      title:'„Unsere Kühlung ist ausgefallen. Der Betrieb startet um sechs.“',
      urgency:'dringend',
      wait:false,
      capture:['Standort','Rückrufnummer','betroffene Anlage','Auswirkung & Zugang'],
      decision:'Bereitschaft jetzt informieren',
      copy:'Mit Situation, Rückrufnummer und allen erfassten Angaben.',
      tag:'sofort'
    },
    wait:{
      time:'18:12',
      meta:'Terminänderung',
      title:'„Ich möchte den Termin morgen verschieben.“',
      urgency:'kann warten',
      wait:true,
      capture:['Name','Rückrufnummer','Auftragsbezug','gewünschte Rückrufzeit'],
      decision:'Für morgen an das Büro übergeben',
      copy:'Mit Rückrufwunsch, Kontaktdaten und Auftragsbezug.',
      tag:'später'
    }
  };

  const callTabs=$$('[data-call]');
  const activateCall=tab=>{
    const data=calls[tab.dataset.call];
    if(!data) return;
    callTabs.forEach(item=>{
      const active=item===tab;
      item.classList.toggle('active',active);
      item.setAttribute('aria-selected',String(active));
      item.tabIndex=active?0:-1;
    });
    $('[data-call-meta]').textContent=data.meta;
    $('[data-call-time]').textContent=data.time;
    $('[data-call-title]').textContent=data.title;
    const urgency=$('[data-urgency]');
    urgency.textContent=data.urgency;
    urgency.classList.toggle('wait',data.wait);
    $('[data-capture]').innerHTML=data.capture.map(item=>`<li>${item}</li>`).join('');
    $('[data-decision-title]').textContent=data.decision;
    $('[data-decision-copy]').textContent=data.copy;
    $('[data-decision-tag]').textContent=data.tag;
    const decision=$('[data-decision]');
    decision.classList.toggle('urgent',!data.wait);
    decision.classList.toggle('wait',data.wait);
  };
  callTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activateCall(tab));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next=event.key==='ArrowRight'?(index+1)%callTabs.length:(index-1+callTabs.length)%callTabs.length;
      activateCall(callTabs[next]);
      callTabs[next].focus();
    });
  });

  $$('details').forEach(detail=>detail.addEventListener('toggle',()=>{
    if(detail.open) $$('details[open]').forEach(other=>{if(other!==detail) other.open=false});
  }));

  const processItems=$$('.processSteps article');
  if(processItems.length&&'IntersectionObserver' in window){
    const processObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible) processItems.forEach(item=>item.classList.toggle('active',item===visible.target));
    },{rootMargin:'-30% 0px -45%',threshold:[0,.25,.5,.75]});
    processItems.forEach(item=>processObserver.observe(item));
  }

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
    if(!valid){
      error.textContent='Bitte füllen Sie alle Pflichtfelder aus.';
      $('.invalid',form)?.focus();
      return;
    }
    error.textContent='';
    form.hidden=true;
    success.hidden=false;
  });
  if(form){
    $$('input,select,textarea',form).forEach(field=>{
      ['input','change'].forEach(eventName=>field.addEventListener(eventName,()=>{
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
      }));
    });
  }
  $('.reset')?.addEventListener('click',()=>{
    form.reset();
    form.hidden=false;
    success.hidden=true;
    $('input',form)?.focus();
  });

  const year=$('[data-year]');
  if(year) year.textContent=new Date().getFullYear();
})();
