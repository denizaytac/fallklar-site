(()=>{
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

  const header=$('[data-header]');
  const progress=$('.progress i');
  const updateScroll=()=>{
    const y=window.scrollY;
    const distance=document.documentElement.scrollHeight-window.innerHeight;
    header?.classList.toggle('scrolled',y>10);
    if(progress) progress.style.transform=`scaleX(${distance>0?Math.min(y/distance,1):0})`;
  };
  updateScroll();
  addEventListener('scroll',updateScroll,{passive:true});

  const menu=$('.menu');
  const nav=$('.nav');
  const closeMenu=()=>{
    menu?.setAttribute('aria-expanded','false');
    nav?.classList.remove('open');
    document.body.classList.remove('menuOpen');
  };
  menu?.addEventListener('click',()=>{
    const open=menu.getAttribute('aria-expanded')!=='true';
    menu.setAttribute('aria-expanded',String(open));
    nav?.classList.toggle('open',open);
    document.body.classList.toggle('menuOpen',open);
  });
  $$('.nav a').forEach(link=>link.addEventListener('click',closeMenu));
  addEventListener('resize',()=>{if(innerWidth>900) closeMenu()});
  addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu()});

  const reveal=$$('[data-reveal]');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){
    reveal.forEach(item=>item.classList.add('show'));
  }else{
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.08,rootMargin:'0px 0px -4%'});
    reveal.forEach(item=>observer.observe(item));
  }

  const calls={
    urgent:{
      meta:'Technischer Notdienst',
      title:'„Unsere Kühlung ist ausgefallen. Der Betrieb startet um sechs.“',
      urgency:'sofort',
      wait:false,
      capture:['Standort','Rückrufnummer','betroffene Anlage','Auswirkung & Zugang'],
      decision:'Bereitschaft jetzt informieren',
      copy:'Mit Grund, Kontaktdaten und strukturierter Zusammenfassung.',
      tag:'eskalieren'
    },
    wait:{
      meta:'Terminorganisation',
      title:'„Ich möchte den Termin morgen verschieben.“',
      urgency:'später',
      wait:true,
      capture:['Name','Rückrufnummer','Auftragsbezug','gewünschte Rückrufzeit'],
      decision:'Für das Büro vormerken',
      copy:'Vollständige Übergabe für den nächsten Arbeitstag.',
      tag:'nicht stören'
    }
  };

  $$('[data-call]').forEach(tab=>tab.addEventListener('click',()=>{
    const data=calls[tab.dataset.call];
    if(!data) return;
    $$('[data-call]').forEach(item=>{
      const active=item===tab;
      item.classList.toggle('active',active);
      item.setAttribute('aria-selected',String(active));
    });
    $('[data-call-meta]').textContent=data.meta;
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
  }));

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
    if(!valid){
      error.textContent='Bitte füllen Sie alle Pflichtfelder vollständig aus.';
      $('.invalid',form)?.focus();
      return;
    }
    error.textContent='';
    form.hidden=true;
    success.hidden=false;
  });
  $$('input,select,textarea',form).forEach(field=>{
    ['input','change'].forEach(eventName=>field.addEventListener(eventName,()=>{field.classList.remove('invalid');field.removeAttribute('aria-invalid')}));
  });
  $('.reset')?.addEventListener('click',()=>{
    form.reset();
    form.hidden=false;
    success.hidden=true;
    $('input',form)?.focus();
  });
  const year=$('[data-year]');
  if(year) year.textContent=new Date().getFullYear();
})();
