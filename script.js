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
      error.textContent='Bitte füllen Sie alle Pflichtfelder aus.';
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

  const hero=$('.hero');
  const canvas=$('[data-signal-canvas]');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(hero&&canvas){
    let fieldPointer=[.55,.5];
    const setDepth=(x=0,y=0)=>{
      hero.style.setProperty('--sculpture-tilt-x',`${(-y*3).toFixed(2)}deg`);
      hero.style.setProperty('--sculpture-tilt-y',`${(x*5).toFixed(2)}deg`);
      hero.style.setProperty('--sculpture-shift-x',`${(x*8).toFixed(2)}px`);
      hero.style.setProperty('--sculpture-shift-y',`${(y*7).toFixed(2)}px`);
      hero.style.setProperty('--board-tilt-y',`${(-x).toFixed(2)}deg`);
      hero.style.setProperty('--board-tilt-x',`${y.toFixed(2)}deg`);
    };
    hero.addEventListener('pointermove',event=>{
      const bounds=hero.getBoundingClientRect();
      setDepth((event.clientX-bounds.left)/bounds.width*2-1,(event.clientY-bounds.top)/bounds.height*2-1);
      fieldPointer=[(event.clientX-bounds.left)/bounds.width,1-(event.clientY-bounds.top)/bounds.height];
    },{passive:true});
    hero.addEventListener('pointerleave',()=>setDepth());

    const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true});
    if(gl){
      const vertex=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
      const fragment=`
        precision mediump float;
        uniform vec2 r;
        uniform vec2 m;
        uniform float t;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){
          vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
        }
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+17.1;a*=.5;}return v;}
        void main(){
          vec2 uv=gl_FragCoord.xy/r;
          vec2 p=uv-.5;
          p.x*=r.x/r.y;
          float time=t*.055;
          float field=fbm(p*2.15+vec2(time,-time*.54));
          float path=p.y+.105*sin(p.x*3.1+field*2.4+time*1.8)+field*.12;
          float stripe=abs(fract(path*13.)-.5);
          float contour=1.-smoothstep(.035,.085,stripe);
          contour*=smoothstep(.72,.05,length(p-vec2(.08,.02)));
          vec2 pointer=m-.5;
          pointer.x*=r.x/r.y;
          float d=length(p-pointer);
          float ringPhase=abs(fract((d-time*.22)*10.)-.5);
          float rings=(1.-smoothstep(.035,.07,ringPhase))*smoothstep(.62,.04,d);
          float core=smoothstep(.22,0.,length(p-vec2(.09,-.02)));
          vec3 cyan=vec3(.39,.84,.9);
          vec3 orange=vec3(1.,.31,.08);
          vec3 color=mix(cyan,orange,core*.72+rings*.18);
          float alpha=contour*.105+rings*.055+core*.025;
          gl_FragColor=vec4(color,alpha);
        }`;
      const compile=(type,source)=>{
        const shader=gl.createShader(type);
        gl.shaderSource(shader,source);
        gl.compileShader(shader);
        return gl.getShaderParameter(shader,gl.COMPILE_STATUS)?shader:null;
      };
      const vs=compile(gl.VERTEX_SHADER,vertex);
      const fs=compile(gl.FRAGMENT_SHADER,fragment);
      if(vs&&fs){
        const program=gl.createProgram();
        gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.useProgram(program);
        const buffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const position=gl.getAttribLocation(program,'p');
        gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        const resolution=gl.getUniformLocation(program,'r');
        const mouse=gl.getUniformLocation(program,'m');
        const time=gl.getUniformLocation(program,'t');
        let running=true;
        const resize=()=>{
          const dpr=Math.min(devicePixelRatio||1,1.6);
          const width=Math.round(canvas.clientWidth*dpr);
          const height=Math.round(canvas.clientHeight*dpr);
          if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
        };
        const draw=now=>{
          resize();
          gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform2f(resolution,canvas.width,canvas.height);
          gl.uniform2f(mouse,fieldPointer[0],fieldPointer[1]);
          gl.uniform1f(time,reducedMotion?0:now*.001);
          gl.drawArrays(gl.TRIANGLES,0,6);
          if(running&&!reducedMotion) requestAnimationFrame(draw);
        };
        if('IntersectionObserver' in window&&!reducedMotion){
          new IntersectionObserver(([entry])=>{
            const next=entry.isIntersecting;
            if(next&&!running){running=true;requestAnimationFrame(draw)}
            running=next;
          }).observe(hero);
        }
        requestAnimationFrame(draw);
      }
    }else{
      const context=canvas.getContext('2d');
      if(context){
        let running=true;
        const draw=now=>{
          const dpr=Math.min(devicePixelRatio||1,1.6);
          const width=Math.max(1,Math.round(canvas.clientWidth));
          const height=Math.max(1,Math.round(canvas.clientHeight));
          if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){
            canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
          }
          context.setTransform(dpr,0,0,dpr,0,0);
          context.clearRect(0,0,width,height);
          const phase=(reducedMotion?0:now*.00022);
          context.lineWidth=1;
          for(let line=0;line<20;line++){
            context.beginPath();
            for(let x=-24;x<=width+24;x+=18){
              const base=height*(.09+line*.045);
              const y=base+Math.sin(x*.008+line*.46+phase*8)*20+Math.sin(x*.0028-line*.2-phase*4)*28;
              if(x===-24) context.moveTo(x,y); else context.lineTo(x,y);
            }
            context.strokeStyle=`rgba(134,220,232,${(.025+line*.0015).toFixed(3)})`;
            context.stroke();
          }
          const px=fieldPointer[0]*width;
          const py=(1-fieldPointer[1])*height;
          const glow=context.createRadialGradient(px,py,0,px,py,Math.min(width,height)*.28);
          glow.addColorStop(0,'rgba(255,113,48,.075)');
          glow.addColorStop(.4,'rgba(89,203,216,.035)');
          glow.addColorStop(1,'rgba(89,203,216,0)');
          context.fillStyle=glow;context.fillRect(0,0,width,height);
          if(running&&!reducedMotion) requestAnimationFrame(draw);
        };
        if('IntersectionObserver' in window&&!reducedMotion){
          new IntersectionObserver(([entry])=>{
            const next=entry.isIntersecting;
            if(next&&!running){running=true;requestAnimationFrame(draw)}
            running=next;
          }).observe(hero);
        }
        requestAnimationFrame(draw);
      }
    }
  }

  const processItems=$$('.processSteps article');
  if(processItems.length&&'IntersectionObserver' in window&&!reducedMotion){
    const processObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          processItems.forEach(item=>item.classList.toggle('active',item===entry.target));
        }
      });
    },{rootMargin:'-36% 0px -48%',threshold:0});
    processItems.forEach(item=>processObserver.observe(item));
  }
})();
