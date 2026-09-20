---
title: "Self-Healing Software: A Pipeline That Fixes Its Own Bugs"
date: 2026-09-19T00:00:00Z
author: Prashish
tags:
  - ai
  - agents
  - automation
  - mcp
description: "agents that read your errors, write the code, run the tests, and open the pull request"
article_kind: Technical
---

<style>
.shs{
  --shs-ink:var(--text-color); --shs-muted:var(--text-color-muted);
  --shs-rule:var(--border-color-light); --shs-page:var(--bg-color);
  --shs-agent:#1266d6; --shs-agent-soft:#dce9fb; --shs-gate:#b5700e;
  --shs-gate-soft:#f7e7cd; --shs-err:#c0442f; --shs-ok:#2e7d4f; --shs-issue:#7a4fc4;
  margin:40px 0 34px; font-family:inherit;
}
.shs svg{display:block;width:100%;height:auto;overflow:visible}
.shs-sw{display:flex;gap:6px;justify-content:center;margin:0 0 16px;flex-wrap:wrap}
.shs-sw button{font:inherit;font-size:.82rem;color:var(--shs-muted);background:transparent;
  border:1px solid var(--shs-rule);border-radius:99px;padding:5px 15px;cursor:pointer;
  transition:color .18s,border-color .18s,background .18s}
.shs-sw button:hover{color:var(--shs-ink)}
.shs-sw button[aria-pressed="true"]{color:var(--shs-page);background:var(--shs-ink);border-color:var(--shs-ink)}
.shs-sw button:focus-visible{outline:2px solid var(--shs-agent);outline-offset:2px}
.shs-cap{font-size:.86rem;color:var(--shs-muted);margin:14px 0 0;text-align:center;font-style:italic}
.shs-lab{font-size:11.5px;fill:var(--shs-muted);font-family:inherit}
.shs-key{font-size:12.5px;fill:var(--shs-ink);font-family:inherit;font-weight:600}
.shs-hint{font-size:10.5px;fill:var(--shs-muted);font-family:inherit;font-style:italic}
.shs-num{font-size:12.5px;fill:var(--shs-ink);font-family:inherit;font-weight:600}
[data-theme="dark"] .shs{
  --shs-agent:#69a8f5; --shs-agent-soft:#1b2f47; --shs-gate:#e0a458;
  --shs-gate-soft:#392812; --shs-err:#e0785f; --shs-ok:#63b98a; --shs-issue:#a98ae0;
}
</style>

> **Note**: This article is part of an ongoing AI-assisted development series (/ai).

**A self-healing software** reads errors from your running application every few hours, groups them into issues, writes the fix, runs the tests, and either merges the change or sends it for human review. A [friend of mine](https://ankur.works) runs a working version in his applications, and I am building the same thing for some of my projects.

Some people have been publishing about this loop, from agents that [merge their own fixes](https://x.com/micqdf/status/2097372077254697057) to agents that [flag what needs review](https://x.com/shrimalmadhur/status/2096715548541456478).


### The whole pipeline runs in these steps:

- **Pulls the errors** from every source you have wired up, over MCP, periodically (every 12 hours, for my use case)
- **Groups them into issues** so one bug shows up once instead of many
- **Ranks what matters** so the worst issue gets picked up first
- **Writes the fix** with the full context of the project, the ticket, and the knowledge base
- **Runs the tests** as unit tests, integration tests, and browser tests, sending failed results back for another attempt
- **Decides the ending** using the merge list in the knowledge base

---

<div class="shs" id="fig-pipe">
  <div class="shs-sw">
    <button type="button" data-risk="low" aria-pressed="true">Low Risk Fix</button>
    <button type="button" data-risk="high" aria-pressed="false">High Risk Fix</button>
  </div>
  <svg viewBox="0 0 1060 470" role="img" aria-label="A pipeline running every twelve hours from event platforms through an event agent, a coding agent, a pull request and a test run, ending at an automatic merge or at human review">
    <g class="pp-base"></g>
    <g class="pp-dots"></g>
    <g class="pp-fore"></g>
  </svg>
</div>

<script>
(function(){
  var root=document.getElementById("fig-pipe"); if(!root) return;
  var SV="http://www.w3.org/2000/svg";
  var base=root.querySelector(".pp-base"), dots=root.querySelector(".pp-dots"), fore=root.querySelector(".pp-fore");
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(n,a){var e=document.createElementNS(SV,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function txt(p,x,y,s,c,an){var t=el("text",{x:x,y:y,class:c||"shs-lab","text-anchor":an||"middle"});t.textContent=s;p.appendChild(t);return t;}
  function pth(p,d,o){o=o||{};var a={d:d,fill:"none",stroke:o.stroke||"var(--shs-rule)","stroke-width":o.w||1.5,"stroke-linecap":"round"};
    if(o.dash)a["stroke-dasharray"]=o.dash; if(o.op!==undefined)a.opacity=o.op;
    var e=el("path",a);p.appendChild(e);return e;}
  function box(p,x,y,w,h,o){o=o||{};var e=el("rect",{x:x-w/2,y:y-h/2,width:w,height:h,rx:o.rx||7,
    fill:o.fill||"var(--shs-page)",stroke:o.stroke||"var(--shs-rule)","stroke-width":o.w||1.5});
    if(o.dash)e.setAttribute("stroke-dasharray",o.dash); if(o.op!==undefined)e.setAttribute("opacity",o.op);
    p.appendChild(e);return e;}
  var meas=null;
  function tw(s,cls){meas.setAttribute("class",cls);meas.textContent=s;return meas.getComputedTextLength();}
  function row(items,x0,gap,pad){
    var x=x0;
    items.forEach(function(it){
      it.w=Math.max(tw(it.n,"shs-key"),tw(it.d,"shs-hint"))+pad;
      it.x=x+it.w/2; x+=it.w+gap;
    });
  }

  var Y=190, CLOCK=70, TRI=250, ISS=380, COD=520, PR=660, TST=800, FORK=880;
  var SRC=[{n:"Error tracker",d:"Sentry, Rollbar",x:170},{n:"Product analytics",d:"PostHog, Amplitude",x:300},
           {n:"Database and server logs",d:"query errors, 4xx, 5xx",x:460}];
  var RES=[{n:"Ticket system",d:"Linear, Jira, GitHub",x:330},{n:"Repository",d:"GitHub, GitLab",x:530},
           {n:"Knowledge base",d:"Outline, Confluence",x:690}];

  var srcP=[], retryP=null, mergeP=null, apprP=null;
  var risk="low", parts=[], last=0, runT=0, RUN=6.5, raf=null, C={m:0,a:0,t:0}, N={};

  function drawBase(){
    base.innerHTML=""; fore.innerHTML=""; srcP=[];
    meas=el("text",{visibility:"hidden"}); base.appendChild(meas);

    txt(base,60,28,"Event platforms","shs-key","start");
    row(SRC,105,18,30);
    SRC.forEach(function(s,i){
      box(base,s.x,54,s.w,38,{rx:6});
      txt(base,s.x,50,s.n,"shs-key"); txt(base,s.x,64,s.d,"shs-hint");
      var d="M "+s.x+" 75 C "+s.x+" 132, "+(TRI+40)+" 148, "+(TRI+(i-1)*8)+" 172";
      pth(base,d,{dash:"3 4",op:.75});
      srcP.push(el("path",{d:d,fill:"none",stroke:"none"}));
      base.appendChild(srcP[i]);
    });

    pth(base,"M 96 "+Y+" H "+(FORK-14),{w:1.6});

    var ring=el("circle",{cx:CLOCK,cy:Y,r:20,fill:"none",stroke:"var(--shs-agent)","stroke-width":2.5,
      "stroke-linecap":"round",transform:"rotate(-90 "+CLOCK+" "+Y+")"});
    base.appendChild(el("circle",{cx:CLOCK,cy:Y,r:20,fill:"var(--shs-page)",stroke:"var(--shs-rule)","stroke-width":1.5}));
    fore.appendChild(ring); N.ring=ring;
    txt(base,CLOCK,Y+40,"every 12 hours","shs-key");
    txt(base,CLOCK,Y+56,"the run starts","shs-hint");

    function node(x,c){base.appendChild(el("circle",{cx:x,cy:Y,r:18,fill:"var(--shs-page)",
      stroke:c||"var(--shs-agent)","stroke-width":1.8}));}

    node(TRI);
    txt(base,TRI,Y-32,"Event agent","shs-key");
    txt(base,TRI,Y+40,"pulls the window, groups","shs-hint");
    txt(base,TRI,Y+55,"and ranks the errors","shs-hint");

    txt(base,ISS,Y-30,"Issues","shs-key");
    N.iss=txt(fore,ISS,Y+38,"0 ranked","shs-num");

    node(COD);
    txt(base,COD,Y-32,"Coding agent","shs-key");
    txt(base,COD,Y+40,"writes the change","shs-hint");
    txt(base,COD,Y+55,"on a branch","shs-hint");

    node(PR,"var(--shs-muted)");
    txt(base,PR,Y-32,"Pull request","shs-key");
    txt(base,PR,Y+40,"diff and ticket ref","shs-hint");

    node(TST,"var(--shs-gate)");
    txt(base,TST,Y-32,"Tests","shs-key");
    txt(base,TST,Y+40,"unit, integration,","shs-hint");
    txt(base,TST,Y+55,"Playwright","shs-hint");

    var rd="M "+TST+" "+(Y-24)+" C "+TST+" 112, "+(TST-56)+" 100, "+PR+" 100 C "+(COD+56)+" 100, "+COD+" 112, "+COD+" "+(Y-24);
    pth(base,rd,{stroke:"var(--shs-err)",dash:"4 4"});
    txt(base,(COD+TST)/2,90,"tests issues, back to the coding agent, twice then it stops","shs-hint");
    retryP=el("path",{d:rd,fill:"none",stroke:"none"}); base.appendChild(retryP);

    var md="M "+FORK+" "+Y+" C 912 "+Y+", 918 150, 934 130";
    var ad="M "+FORK+" "+Y+" C 912 "+Y+", 918 232, 934 254";
    var lowOn=(risk==="low");
    pth(base,md,{stroke:"var(--shs-ok)",op:lowOn?1:.2});
    pth(base,ad,{stroke:"var(--shs-gate)",op:lowOn?.25:1});
    mergeP=el("path",{d:md,fill:"none",stroke:"none"}); base.appendChild(mergeP);
    apprP=el("path",{d:ad,fill:"none",stroke:"none"}); base.appendChild(apprP);

    box(base,1000,120,116,34,{rx:17,stroke:"var(--shs-ok)",op:lowOn?1:.3});
    txt(base,1000,118,"Merged","shs-key").setAttribute("opacity",lowOn?1:.35);
    txt(base,1000,134,"tests green","shs-hint").setAttribute("opacity",lowOn?1:.35);
    N.m=txt(fore,1000,158,"0","shs-num"); N.m.setAttribute("opacity",lowOn?1:.35);

    box(base,1000,264,150,34,{rx:17,stroke:"var(--shs-gate)",op:lowOn?.3:1});
    txt(base,1000,262,"Human review","shs-key").setAttribute("opacity",lowOn?.35:1);
    txt(base,1000,278,"whatever is on your merge list","shs-hint").setAttribute("opacity",lowOn?.35:1);
    N.a=txt(fore,1000,302,"0","shs-num"); N.a.setAttribute("opacity",lowOn?.35:1);

    txt(base,60,352,"Connected over MCP","shs-key","start");
    row(RES,280,26,30);
    RES.forEach(function(r,i){
      box(base,r.x,392,r.w,40,{rx:6,fill:"var(--shs-agent-soft)",stroke:"var(--shs-agent)",w:1.2});
      txt(base,r.x,388,r.n,"shs-key"); txt(base,r.x,402,r.d,"shs-hint");
      var tgt=(i===0)?[TRI,COD]:[COD];
      tgt.forEach(function(t){
        pth(base,"M "+r.x+" 370 C "+r.x+" 320, "+t+" 300, "+t+" "+(Y+22),{stroke:"var(--shs-agent)",dash:"3 5",op:.4});
      });
    });
    meas.remove();
  }

  function dot(x,y,c,r){var e=el("circle",{cx:x,cy:y,r:r||4,fill:c});dots.appendChild(e);return e;}

  function fireRun(){
    C.t=0;
    for(var i=0;i<12;i++){
      var pi=i%3, p=srcP[pi], L=p.getTotalLength();
      var pt=p.getPointAtLength(0);
      parts.push({el:dot(pt.x,pt.y,"var(--shs-err)",3.4),kind:"ev",path:p,L:L,s:0,sp:150,delay:i*0.09});
    }
  }

  function emitIssue(){
    C.t++; N.iss.textContent=C.t+" ranked";
    parts.push({el:dot(TRI,Y,"var(--shs-issue)",5.5),kind:"iss",x:TRI,sp:112,tries:0,br:null});
  }

  function tick(ts){
    if(!last) last=ts;
    var dt=Math.min((ts-last)/1000,.05); last=ts;
    runT+=dt;
    var Cc=2*Math.PI*20, f=Math.min(runT/RUN,1);
    N.ring.setAttribute("stroke-dasharray",(Cc*f).toFixed(1)+" "+Cc.toFixed(1));
    if(runT>=RUN){runT=0;fireRun();}

    for(var i=parts.length-1;i>=0;i--){
      var p=parts[i];
      if(p.delay>0){p.delay-=dt;continue;}
      if(p.kind==="ev"){
        p.s+=p.sp*dt;
        if(p.s>=p.L){
          p.el.remove(); parts.splice(i,1);
          if(Math.random()<0.34) emitIssue();
          continue;
        }
        var pt=p.path.getPointAtLength(p.s);
        p.el.setAttribute("cx",pt.x); p.el.setAttribute("cy",pt.y);
        continue;
      }
      if(p.br){
        p.bs+=p.sp*dt;
        var bp=p.br.getPointAtLength(Math.min(p.bs,p.bL));
        p.el.setAttribute("cx",bp.x); p.el.setAttribute("cy",bp.y);
        if(p.bs>=p.bL){
          if(p.brName==="retry"){p.br=null;p.x=COD;p.el.setAttribute("fill","var(--shs-agent)");}
          else{
            if(p.brName==="merge"){C.m++;N.m.textContent=C.m;}
            else{C.a++;N.a.textContent=C.a;}
            p.el.remove(); parts.splice(i,1);
          }
        }
        continue;
      }
      var prev=p.x; p.x+=p.sp*dt;
      if(prev<COD&&p.x>=COD) p.el.setAttribute("fill","var(--shs-agent)");
      if(prev<TST&&p.x>=TST&&p.tries<2&&Math.random()<0.3){
        p.tries++; p.el.setAttribute("fill","var(--shs-err)");
        p.br=retryP; p.brName="retry"; p.bs=0; p.bL=retryP.getTotalLength();
        continue;
      }
      if(prev<FORK&&p.x>=FORK){
        var toMerge=(risk==="low")&&Math.random()<0.85;
        p.br=toMerge?mergeP:apprP; p.brName=toMerge?"merge":"appr";
        p.el.setAttribute("fill",toMerge?"var(--shs-ok)":"var(--shs-gate)");
        p.bs=0; p.bL=p.br.getTotalLength();
        continue;
      }
      p.el.setAttribute("cx",p.x);
    }
    raf=requestAnimationFrame(tick);
  }

  function staticFill(){
    dot(300,120,"var(--shs-err)",3.4); dot(220,150,"var(--shs-err)",3.4);
    dot(ISS,Y,"var(--shs-issue)",5.5); dot(580,Y,"var(--shs-agent)",5.5); dot(730,Y,"var(--shs-agent)",5.5);
    N.iss.textContent="6 ranked";
    N.m.textContent=risk==="low"?"5":"0"; N.a.textContent=risk==="low"?"1":"6";
  }

  function render(){
    dots.innerHTML=""; parts=[]; runT=0; C={m:0,a:0,t:0};
    drawBase();
    if(reduce){staticFill();return;}
    last=0; if(!raf) raf=requestAnimationFrame(tick);
  }

  Array.prototype.forEach.call(root.querySelectorAll(".shs-sw button"),function(b){
    b.addEventListener("click",function(){
      risk=b.getAttribute("data-risk");
      Array.prototype.forEach.call(root.querySelectorAll(".shs-sw button"),function(o){
        o.setAttribute("aria-pressed",o===b?"true":"false");});
      render();
    });
  });
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(render);}else{render();}
})();
</script>

---

## The Agents and the Checks

**The event agent** pulls errors from the last 12 hours out of the sources. It groups them by stack signature, route, and error type, scores each issue on how often it fired and how many users it affected, and creates tickets on the tracking board.

**The coding agent** reads a ticket, then builds up an understanding of the project from the repository and the knowledge base. It scores how sure it is about the cause before it starts writing the code. A low score sends the ticket to a developer and nothing gets written, and a high score gets the fix pushed to a branch and opened as a pull request linked to the ticket.

Once the pull request is open, it runs the tests and gets checked against the merge list. A failure at either leaves it for a human review, and it merges on its own only after clearing the checks.

<div class="shs" id="fig-flow">
  <div class="shs-sw">
    <button type="button" data-flow="pass" aria-pressed="true">Clears every check</button>
    <button type="button" data-flow="stop" aria-pressed="false">Stops at a check</button>
  </div>
  <svg viewBox="0 0 1000 250" role="img" aria-label="A fix passing from the event agent to the coding agent, which scores the cause, and then through the tests and merge rule checks, ending either at a merge or dropping to human review">
    <g class="fl-base"></g>
    <g class="fl-dots"></g>
  </svg>
</div>

<script>
(function(){
  var root=document.getElementById("fig-flow"); if(!root) return;
  var SV="http://www.w3.org/2000/svg";
  var base=root.querySelector(".fl-base"), dots=root.querySelector(".fl-dots");
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(n,a){var e=document.createElementNS(SV,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function txt(p,x,y,s,c){var t=el("text",{x:x,y:y,class:c||"shs-lab","text-anchor":"middle"});t.textContent=s;p.appendChild(t);return t;}
  function pth(p,d,o){o=o||{};var a={d:d,fill:"none",stroke:o.stroke||"var(--shs-rule)","stroke-width":o.w||1.5,"stroke-linecap":"round"};
    if(o.dash)a["stroke-dasharray"]=o.dash; if(o.op!==undefined)a.opacity=o.op;
    var e=el("path",a);p.appendChild(e);return e;}
  function box(p,x,y,w,h,o){o=o||{};var e=el("rect",{x:x-w/2,y:y-h/2,width:w,height:h,rx:o.rx||9,
    fill:o.fill||"var(--shs-page)",stroke:o.stroke||"var(--shs-rule)","stroke-width":o.w||1.5});
    if(o.op!==undefined)e.setAttribute("opacity",o.op); p.appendChild(e);return e;}

  var meas=null;
  function tw(s,cls){meas.setAttribute("class",cls);meas.textContent=s;return meas.getComputedTextLength();}

  var Y=95, REVY=212;
  var AG=[{n:"Event agent",d:"groups and ranks"},{n:"Coding agent",d:"writes the fix",gate:true}];
  var CK=[{n:"Tests",d:"series of tests"},{n:"Merge rule",d:"verifies for sensitive modules"}];
  var GATES=AG.filter(function(a){return a.gate;}).concat(CK);
  var mode="pass", stopAt=0, endX=0, revCx=0, startX=30;
  var dot=null, dx=0, div=null, ds=0, dL=0, pause=0, pending=false, last=0, raf=null;

  function drawBase(){
    base.innerHTML="";
    meas=el("text",{visibility:"hidden"}); base.appendChild(meas);

    var all=AG.concat(CK), GAP=20, PAD=34;
    all.forEach(function(it){it.w=Math.max(tw(it.n,"shs-key"),tw(it.d,"shs-hint"))+PAD;});
    var mw=Math.max(tw("Merged","shs-key"),tw("live in production","shs-hint"))+34;
    var rw=Math.max(tw("Human review","shs-key"),tw("sent for human review","shs-hint"))+34;
    var total=all.reduce(function(s,it){return s+it.w;},0)+GAP*(all.length-1)+56+mw;
    var x=Math.max(16,(1000-total)/2);
    startX=x;
    all.forEach(function(it){it.x=x+it.w/2; x+=it.w+GAP;});
    var lastRight=x-GAP;
    endX=lastRight+56+mw/2;
    revCx=(GATES[0].x+GATES[GATES.length-1].x)/2;
    var passOn=(mode==="pass");

    pth(base,"M "+startX+" "+Y+" H "+(lastRight+56),{w:1.6});

    GATES.forEach(function(g){
      var d="M "+g.x+" "+(Y+22)+" C "+g.x+" "+(Y+74)+", "+revCx+" "+(REVY-60)+", "+revCx+" "+(REVY-19);
      g.line=pth(base,d,{stroke:"var(--shs-gate)",dash:"4 5",op:passOn?.16:.3});
      g.path=el("path",{d:d,fill:"none",stroke:"none"}); base.appendChild(g.path);
    });

    AG.forEach(function(a){
      a.rect=box(base,a.x,Y,a.w,44,{fill:"var(--shs-agent-soft)",stroke:"var(--shs-agent)",w:1.6});
      txt(base,a.x,Y-3,a.n,"shs-key"); txt(base,a.x,Y+13,a.d,"shs-hint");
    });

    CK.forEach(function(c){
      c.rect=box(base,c.x,Y,c.w,44,{});
      txt(base,c.x,Y-3,c.n,"shs-key"); txt(base,c.x,Y+13,c.d,"shs-hint");
    });

    box(base,endX,Y,mw,38,{rx:19,stroke:"var(--shs-ok)",op:passOn?1:.3});
    txt(base,endX,Y-2,"Merged","shs-key").setAttribute("opacity",passOn?1:.35);
    txt(base,endX,Y+13,"live in production","shs-hint").setAttribute("opacity",passOn?1:.35);

    box(base,revCx,REVY,rw,38,{rx:19,stroke:"var(--shs-gate)",op:passOn?.3:1});
    txt(base,revCx,REVY-2,"Human review","shs-key").setAttribute("opacity",passOn?.35:1);
    txt(base,revCx,REVY+13,"sent for human review","shs-hint").setAttribute("opacity",passOn?.35:1);

    meas.remove();
  }

  function lit(c,col){c.rect.setAttribute("stroke",col);c.rect.setAttribute("stroke-width",2.4);}

  function spawn(){
    dots.innerHTML="";
    dot=el("circle",{cx:startX,cy:Y,r:5.5,fill:"var(--shs-agent)"});
    dots.appendChild(dot);
    dx=startX; div=null; ds=0;
  }

  function cycle(){
    if(mode==="stop") stopAt=(stopAt+1)%GATES.length;
    drawBase(); spawn();
  }

  function tick(ts){
    if(!last) last=ts;
    var dt=Math.min((ts-last)/1000,.05); last=ts;

    if(pause>0){
      pause-=dt;
      if(pause<=0&&pending){pending=false;cycle();}
      raf=requestAnimationFrame(tick); return;
    }

    if(div){
      if(ds<dL){
        ds+=250*dt;
        var p=div.getPointAtLength(Math.min(ds,dL));
        dot.setAttribute("cx",p.x); dot.setAttribute("cy",p.y);
        if(ds>=dL){pending=true;pause=1.1;}
      }
      raf=requestAnimationFrame(tick); return;
    }

    var prev=dx; dx+=200*dt;
    dot.setAttribute("cx",dx); dot.setAttribute("cy",Y);

    for(var i=0;i<GATES.length;i++){
      var g=GATES[i];
      if(prev<g.x&&dx>=g.x){
        if(mode==="stop"&&i===stopAt){
          lit(g,"var(--shs-gate)"); g.line.setAttribute("opacity",1);
          dot.setAttribute("fill","var(--shs-gate)");
          div=g.path; dL=div.getTotalLength(); ds=0; pause=.4;
        }else{
          lit(g,"var(--shs-ok)"); pause=.28;
        }
      }
    }

    if(!div&&dx>=endX){dot.setAttribute("fill","var(--shs-ok)");pending=true;pause=1.1;}
    raf=requestAnimationFrame(tick);
  }

  function staticFill(){
    dots.innerHTML="";
    if(mode==="pass"){
      GATES.forEach(function(g){lit(g,"var(--shs-ok)");});
      dots.appendChild(el("circle",{cx:endX,cy:Y,r:5.5,fill:"var(--shs-ok)"}));
    }else{
      GATES.forEach(function(g,i){
        if(i<stopAt) lit(g,"var(--shs-ok)");
        if(i===stopAt){lit(g,"var(--shs-gate)");g.line.setAttribute("opacity",1);}
      });
      var q=GATES[stopAt].path.getPointAtLength(GATES[stopAt].path.getTotalLength()*0.62);
      dots.appendChild(el("circle",{cx:q.x,cy:q.y,r:5.5,fill:"var(--shs-gate)"}));
    }
  }

  function render(){
    drawBase();
    if(reduce){staticFill();return;}
    spawn(); pending=false; pause=.5; last=0;
    if(!raf) raf=requestAnimationFrame(tick);
  }

  Array.prototype.forEach.call(root.querySelectorAll(".shs-sw button"),function(b){
    b.addEventListener("click",function(){
      mode=b.getAttribute("data-flow"); stopAt=0;
      Array.prototype.forEach.call(root.querySelectorAll(".shs-sw button"),function(o){
        o.setAttribute("aria-pressed",o===b?"true":"false");});
      render();
    });
  });
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(render);}else{render();}
})();
</script>


**Tests:** The pull request runs the full suite, meaning unit tests, integration tests, and browser tests (Playwright, Cypress). A failed result goes back to the coding agent with the output attached and it tries again, and after two attempts the run stops and the ticket goes to a developer. Browser tests matter most of the three, because unit tests can pass [while checkout is broken](https://x.com/wuweiweiwu/status/2097373155366928639). Simon Willison's [guide to agentic manual testing](https://simonwillison.net/guides/agentic-engineering-patterns/agentic-manual-testing/) covers how to wire that part up.

**The merge rule:** The last check is the merge list in the knowledge base. On my projects it covers _schema migrations, authentication, payments, and anything that deletes data._ A fix touching any of those goes to human review however confident the agent was and however the tests came back. 

Write the list yourself rather than letting the agent judge risk from the diff, because a stack trace is [untrusted input](https://x.com/mattjvalenta/status/2081067772537192923) and should not decide what the agent can change.

---

## Sources and Systems

The sources below are the ones I use. A mobile app would add its crash reporter, and an API service gateway would add its access logs.

<div class="shs" id="fig-conn">
  <div class="shs-sw">
    <button type="button" data-ag="0" aria-pressed="true">Event agent</button>
    <button type="button" data-ag="1" aria-pressed="false">Coding agent</button>
  </div>
  <svg viewBox="0 0 1000 540" role="img" aria-label="Two agents on the left connected over MCP to six external services on the right, with the ticket system shared between both">
    <g class="cn-base"></g>
    <g class="cn-dots"></g>
  </svg>
  <p class="shs-cap">The ticket system is the only connection both agents hold, which is how work passes from one to the other.</p>
</div>

<script>
(function(){
  var root=document.getElementById("fig-conn"); if(!root) return;
  var SV="http://www.w3.org/2000/svg";
  var base=root.querySelector(".cn-base"), dots=root.querySelector(".cn-dots");
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(n,a){var e=document.createElementNS(SV,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function txt(p,x,y,s,c,an,op){var t=el("text",{x:x,y:y,class:c||"shs-lab","text-anchor":an||"middle"});
    t.textContent=s; if(op!==undefined)t.setAttribute("opacity",op); p.appendChild(t);return t;}
  function box(p,x,y,w,h,o){o=o||{};var e=el("rect",{x:x-w/2,y:y-h/2,width:w,height:h,rx:o.rx||8,
    fill:o.fill||"var(--shs-page)",stroke:o.stroke||"var(--shs-rule)","stroke-width":o.w||1.5});
    if(o.op!==undefined)e.setAttribute("opacity",o.op); p.appendChild(e);return e;}

  var AG=[{n:"Event agent",d:"runs first, every 12 hours",y:170},
          {n:"Coding agent",d:"runs once an issue is ranked",y:370}];
  var CONN=[
    {n:"Error tracker",d:"Sentry, Rollbar, and the like",y:56,
     v:["reads the crashes in the window",null],dir:["in",null]},
    {n:"Product analytics",d:"PostHog, Amplitude, and the like",y:140,
     v:["reads where users got stuck",null],dir:["in",null]},
    {n:"Database and server logs",d:"query errors, 4xx and 5xx",y:224,
     v:["reads what the other two miss",null],dir:["in",null]},
    {n:"Ticket system",d:"Linear, Jira, GitHub Issues",y:308,
     v:["writes the ranked issue","reads the ticket, posts the branch"],dir:["out","both"]},
    {n:"Repository",d:"GitHub, GitLab",y:392,
     v:[null,"reads the project, opens the branch"],dir:[null,"both"]},
    {n:"Knowledge base",d:"Outline, Confluence, Notion",y:476,
     v:[null,"reads the standards before writing"],dir:[null,"in"]}
  ];

  var AX=190, CX=740, sel=0, links=[], pulses=[], last=0, acc=0, raf=null;

  function drawBase(){
    base.innerHTML=""; links=[];
    AG.forEach(function(a,i){
      var on=(i===sel);
      box(base,AX,a.y,220,62,{rx:10,fill:on?"var(--shs-agent-soft)":"var(--shs-page)",
        stroke:on?"var(--shs-agent)":"var(--shs-rule)",w:on?2:1.5,op:on?1:.5});
      txt(base,AX,a.y-4,a.n,"shs-key",null,on?1:.45);
      txt(base,AX,a.y+14,a.d,"shs-hint",null,on?1:.45);
    });

    CONN.forEach(function(c,i){
      var v=c.v[sel], on=!!v;
      box(base,CX,c.y,300,58,{rx:8,fill:on?"var(--shs-page)":"var(--shs-page)",
        stroke:on?"var(--shs-agent)":"var(--shs-rule)",w:on?1.8:1.2,op:on?1:.4});
      txt(base,CX-138,c.y-12,c.n,"shs-key","start",on?1:.4);
      txt(base,CX-138,c.y+4,c.d,"shs-hint","start",on?1:.4);
      txt(base,CX-138,c.y+20,v||"not used by this agent","shs-lab","start",on?.95:.3);

      [0,1].forEach(function(ai){
        if(!c.v[ai]) return;
        var ay=AG[ai].y, on2=(ai===sel);
        var d="M 302 "+ay+" C 460 "+ay+", 470 "+c.y+", 588 "+c.y;
        var e=el("path",{d:d,fill:"none",stroke:on2?"var(--shs-agent)":"var(--shs-rule)",
          "stroke-width":on2?1.6:1.2,opacity:on2?.85:.3});
        if(!on2) e.setAttribute("stroke-dasharray","3 5");
        base.appendChild(e);
        if(on2) links.push({el:e,dir:c.dir[ai],L:null});
      });
    });
    links.forEach(function(l){l.L=l.el.getTotalLength();});
    txt(base,AX,42,"Two agents","shs-key");
    txt(base,CX,528,"every one of these is an MCP connection","shs-hint");
  }

  function spawnPulse(){
    links.forEach(function(l){
      var outward=(l.dir==="out")||(l.dir==="both"&&Math.random()<0.5);
      var c=el("circle",{r:3.6,fill:"var(--shs-agent)"});
      dots.appendChild(c);
      pulses.push({el:c,link:l,s:outward?0:l.L,sp:outward?260:-260});
    });
  }

  function tick(ts){
    if(!last) last=ts;
    var dt=Math.min((ts-last)/1000,.05); last=ts;
    acc+=dt; if(acc>1.15){acc=0;spawnPulse();}
    for(var i=pulses.length-1;i>=0;i--){
      var p=pulses[i]; p.s+=p.sp*dt;
      if(p.s<0||p.s>p.link.L){p.el.remove();pulses.splice(i,1);continue;}
      var pt=p.link.el.getPointAtLength(p.s);
      p.el.setAttribute("cx",pt.x); p.el.setAttribute("cy",pt.y);
    }
    raf=requestAnimationFrame(tick);
  }

  function render(){
    dots.innerHTML=""; pulses=[]; drawBase();
    if(reduce){
      links.forEach(function(l){
        var pt=l.el.getPointAtLength(l.L*0.5);
        dots.appendChild(el("circle",{cx:pt.x,cy:pt.y,r:3.6,fill:"var(--shs-agent)"}));
      });
      return;
    }
    last=0; if(!raf) raf=requestAnimationFrame(tick);
  }

  Array.prototype.forEach.call(root.querySelectorAll(".shs-sw button"),function(b){
    b.addEventListener("click",function(){
      sel=+b.getAttribute("data-ag");
      Array.prototype.forEach.call(root.querySelectorAll(".shs-sw button"),function(o){
        o.setAttribute("aria-pressed",o===b?"true":"false");});
      render();
    });
  });
  render();
})();
</script>

- **Error tracker** (Sentry, Rollbar) for backend and frontend exceptions
- **Product analytics** (PostHog, Amplitude) for the places users get stuck without any exception firing
- **Database and server logs** (Postgres, MySQL, MongoDB, nginx) for query errors and for the 4xx and 5xx responses that never reach the error tracker
- **Ticket system** (Linear, Jira, GitHub Issues), where the event agent creates tickets and the coding agent reads them
- **Repository** (GitHub, GitLab), where the coding agent reads the project and opens its branch
- **Knowledge base** (Outline, Confluence, Notion), read before the coding agent writes the change

---

## The Knowledge Base

The knowledge base is the most important aspect of the entire pipeline, because it gives the coding agent the entire context including docs, repositories and internal workings. There are plenty of skills that you can use to create the docs and repository contexts. The agent reads it thoroughly before it starts writing the code.

It holds these kinds of thing:

- **Project overview:** what the project does, how it is laid out, and what each service is responsible for
- **An entry file** (CLAUDE.md, AGENTS.md): the first file the agent reads, pointing it at everything else
- **A file per module:** how that part of the codebase works and what to be careful with, kept next to the code it describes
- **Coding guidelines:** naming, file layout, error handling, and how the team structures a module
- **The merge list:** the changes that always need a person, where the agent can open a pull request and never merge it
- **Past review feedback:** the mistakes reviewers have already corrected, written down so the agent stops repeating them
- **Library choices:** which libraries the project uses and which ones to leave alone, such as calling the internal HTTP client instead of reaching for fetch

An incomplete or thin knowledge base gives you fixes that pass the tests but ignore your project conventions, which might result in a codebase that has several disconnected parts. This is the biggest risk in future maintenance of the project.

---

## Three Things to Watch

**The knowledge base goes stale:** The agent follows whatever the file says, so it needs updating whenever your something major changes. Update it in the same pull request, the way you would update a README.

**Coverage needs to be high:** The test suite is the only thing checking the agent's work, so on a file with no tests a wrong fix goes straight to main. Raise coverage on the files that throw the most errors first, and turn on automatic merging for those paths only.

**The confidence score is not a correctness check:** It only decides whether the agent attempts a fix, and the tests are what tell you the fix works. Keep human review on everything on the merge list until a separate model does the scoring.

---

## Already in Production

Every piece of this is already running somewhere. [levelsio](https://x.com/levelsio/status/2027817837083955440) asked publicly for this exact architecture earlier this year. [Ramp](https://x.com/RampLabs/status/2036169782764925106) runs an agent that triages its own alerts and pushes fixes across a thousand generated monitors. [Panos Ipeirotis](https://x.com/ipeirotis/status/2097410163187531892) lets agents handle bug reports from trusted users end to end.

Commercial tools now do parts of this out of the box. [Cursor Autofix](https://x.com/FastfixAI/status/2096751502391923018) hands a flagged issue to a cloud agent that fixes and pushes it, with roughly a third of those changes getting merged. [GitHub Copilot](https://x.com/GHchangelog/status/2097690268669481221) opens validated pull requests for bulk fixes. Sentry ships root cause analysis that opens a pull request for a person to merge.

So a self-healing software is buildable today with the models and tools already available. The knowledge base and the test coverage are the parts that you have to write yourself, and they decide how much of the entire self-healing loop can run without you.