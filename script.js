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
