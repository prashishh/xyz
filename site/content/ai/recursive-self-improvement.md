---
title: "Recursive Self-Improvement"
date: 2026-11-20T00:00:00Z
draft: false
author: Prashish
tags:
  - ai
  - agents
  - automation
  - research
description: "recursive self-improvement is here, and a small version of it already works today"
article_kind: Perspective
---

<style>
.rsi{
  --rsi-ink:var(--text-color); --rsi-muted:var(--text-color-muted);
  --rsi-rule:var(--border-color-light); --rsi-page:var(--bg-color);
  --rsi-model:#1266d6; --rsi-model-soft:#dce9fb; --rsi-gate:#b5700e;
  --rsi-gate-soft:#f7e7cd; --rsi-err:#c0442f; --rsi-ok:#2e7d4f; --rsi-human:#7a4fc4;
  margin:40px 0 34px; font-family:inherit;
}
.rsi svg{display:block;width:100%;height:auto;overflow:visible}
.rsi-cap{font-size:.86rem;color:var(--rsi-muted);margin:14px 0 0;text-align:center;font-style:italic}
.rsi-lab{font-size:11.5px;fill:var(--rsi-muted);font-family:inherit}
.rsi-key{font-size:13.5px;fill:var(--rsi-ink);font-family:inherit;font-weight:600}
.rsi-hint{font-size:11.5px;fill:var(--rsi-muted);font-family:inherit;font-style:italic}
.rsi-num{font-size:12px;fill:var(--rsi-ink);font-family:inherit;font-weight:600}
.rsi-arrowhead{fill:var(--rsi-muted)}
[data-theme="dark"] .rsi{
  --rsi-model:#69a8f5; --rsi-model-soft:#1b2f47; --rsi-gate:#e0a458;
  --rsi-gate-soft:#392812; --rsi-err:#e0785f; --rsi-ok:#63b98a; --rsi-human:#a98ae0;
}
</style>

The first signs of **recursive self-improvement** are already here, in software development and also in model fine-tuning. It means a system uses its own output or result to make the **next version** of itself better. My earlier post on [Self-Healing Software](/ai/self-healing-software/) was about fixing bugs, and this one is about improving the entire system itself.

---

## How I Use It 

Before and after I build a major feature, I get independent reviews from three different models: **Gemini, ChatGPT and Claude**. The depth of the review depends on the task. A heavy task like research gets a slow, deep review model, and a light task gets a quick and cheaper one. 

Either way, I take reviews from different models and update my own view, or the view of my orchestrator agent (the agent that manages my other agents), after reading them.

The important part is that each model reviews the work **independently**. Each one works alone, with the same set of instructions and context, so none of them sees another model's answer. I sort what comes back like this:

* When two or more models find the same problem, it is very likely a real problem, so I count it as confirmed
* When only one model says it, the system checks it against the code or the data first
* The updated work goes back for another round, and the flow stops when a round finds nothing new

<div class="rsi" id="fig-rsi">
  <svg viewBox="0 0 620 660" role="img" aria-label="Work sent to three reviewing models, whose findings are compared and sorted into points found by several reviewers and points found by one, which gets checked first. A person applies the confirmed findings and the updated work returns through a fixed test for the next round.">
    <defs>
      <marker id="rsi-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L9 5 L1 9 z" class="rsi-arrowhead"></path></marker>
    </defs>
    <g class="rsi-base"></g>
    <g class="rsi-dots"></g>
  </svg>
  <p class="rsi-cap">Each round sends the updated work back to the reviewers, and the fixed test checks it on the way back.</p>
</div>

<script>
(function(){
  var root=document.getElementById("fig-rsi"); if(!root) return;
  var SV="http://www.w3.org/2000/svg";
  var base=root.querySelector(".rsi-base"), dots=root.querySelector(".rsi-dots");
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(n,a){var e=document.createElementNS(SV,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function txt(p,x,y,s,c,an){var t=el("text",{x:x,y:y,class:c||"rsi-lab","text-anchor":an||"middle"});t.textContent=s;p.appendChild(t);return t;}
  function box(p,x,y,w,h,o){o=o||{};
    var st=o.stroke||"var(--rsi-rule)", sw=o.w||1.5;
    var e=el("rect",{x:x-w/2,y:y-h/2,width:w,height:h,rx:o.rx||9,fill:o.fill||"var(--rsi-page)",stroke:st,"stroke-width":sw});
    e._s=st; e._w=sw; p.appendChild(e); return e;}
  function pth(p,d,o){o=o||{};
    var a={d:d,fill:"none",stroke:o.stroke||"var(--rsi-rule)","stroke-width":o.w||1.5,"stroke-linecap":"round"};
    if(o.dash)a["stroke-dasharray"]=o.dash; if(o.arrow)a["marker-end"]="url(#rsi-arrow)";
    if(o.op!==undefined)a.opacity=o.op;
    var e=el("path",a);p.appendChild(e);return e;}

  var D={
    fa:"M 360 72 C 360 110, 218 110, 218 148",
    fb:"M 360 72 L 360 148",
    fc:"M 360 72 C 360 110, 502 110, 502 148",
    ra:"M 218 204 C 218 240, 360 236, 360 272",
    rb:"M 360 204 L 360 272",
    rc:"M 502 204 C 502 240, 360 236, 360 272",
    la:"M 330 324 C 330 350, 244 346, 244 372",
    lb:"M 390 324 C 390 350, 476 346, 476 372",
    lc:"M 476 424 L 476 468",
    ld:"M 446 520 C 446 548, 420 546, 420 570",
    lx:"M 540 520 C 552 548, 580 552, 588 576",
    le:"M 244 424 C 244 520, 300 526, 300 570",
    lp:"M 235 596 H 96 Q 60 596 60 560 V 82 Q 60 46 96 46 H 245"
  };
  var REV=[{n:"Claude",x:218,f:"fa",r:"ra"},{n:"Gemini",x:360,f:"fb",r:"rb"},{n:"ChatGPT",x:502,f:"fc",r:"rc"}];
  var ROUNDS=[[3,2],[3,1],[2,1],[1,1],[1,0],[0,0]];
  var COL={rev:"var(--rsi-model)",ok:"var(--rsi-ok)",one:"var(--rsi-gate)",err:"var(--rsi-err)",ink:"var(--rsi-ink)"};

  var rd=0, parts=[], timers=[], last=0, raf=null, C={fix:0,drop:0}, N={}, P={}, gateS=0;

  function nActive(){return 3;}

  function drawBase(){
    base.innerHTML=""; P={}; N={};

    Object.keys(D).forEach(function(k){
      var o={};
      if(k==="lp"){o={w:1.6,arrow:true};}
      if(k==="lx"){o={stroke:"var(--rsi-err)",dash:"4 4",op:.7};}
      if(k==="le"||k==="ld"){o={stroke:"var(--rsi-ok)",op:.55};}
      if(k==="lb"||k==="lc"){o={stroke:"var(--rsi-gate)",op:.55};}
      if((k==="fc"||k==="rc")&&nActive()<3){o.op=.2;}
      P[k]=pth(base,D[k],o);
    });

    N.work=box(base,360,46,230,52,{rx:10,fill:"var(--rsi-model-soft)",stroke:"var(--rsi-model)",w:1.6});
    txt(base,360,51,"The work","rsi-key");
    N.round=txt(base,492,50,"round 1","rsi-hint","start");

    REV.forEach(function(v,i){
      var on=i<nActive(), g=el("g",{opacity:on?1:.3});
      v.box=box(g,v.x,176,132,56,{});
      txt(g,v.x,181,v.n,"rsi-key");
      base.appendChild(g);
    });

    N.compare=box(base,360,298,300,52,{});
    txt(base,360,303,"Compare the reviews","rsi-key");

    box(base,244,398,184,52,{stroke:"var(--rsi-ok)"});
    txt(base,244,403,"Found by two or more","rsi-key");

    box(base,476,398,184,52,{stroke:"var(--rsi-gate)"});
    txt(base,476,403,"Found by one","rsi-key");

    N.check=box(base,476,494,184,52,{});
    txt(base,476,499,"Check each one","rsi-key");

    base.appendChild(el("circle",{cx:588,cy:578,r:5,fill:"var(--rsi-page)",stroke:"var(--rsi-err)","stroke-width":1.6}));
    txt(base,588,602,"not a bug","rsi-hint");
    N.drop=txt(base,588,617,"0 dropped","rsi-num");

    N.decide=box(base,360,596,250,52,{rx:10,fill:"var(--rsi-model-soft)",stroke:"var(--rsi-human)",w:1.6});
    txt(base,360,601,"You decide and update","rsi-key");
    N.fix=txt(base,360,645,"0 changes made","rsi-num");

    N.gate=el("circle",{cx:60,cy:320,r:22,fill:"var(--rsi-page)",stroke:"var(--rsi-gate)","stroke-width":1.8});
    N.gate._s="var(--rsi-gate)"; N.gate._w=1.8; base.appendChild(N.gate);
    txt(base,60,324,"test","rsi-key");

    gateS=0;
    var L=P.lp.getTotalLength(), best=1e9;
    for(var s=0;s<=L;s+=3){var q=P.lp.getPointAtLength(s), d=Math.abs(q.x-60)+Math.abs(q.y-320);
      if(d<best){best=d;gateS=s;}}
  }

  function later(sec,fn){timers.push({t:sec,fn:fn});}
  function flash(r,col){
    if(!r) return;
    r.setAttribute("stroke",col||"var(--rsi-model)"); r.setAttribute("stroke-width",2.6);
    later(.4,function(){r.setAttribute("stroke",r._s);r.setAttribute("stroke-width",r._w);});
  }
  function dot(c,r){var e=el("circle",{cx:-20,cy:-20,r:r||5,fill:c,opacity:0});dots.appendChild(e);return e;}
  function go(names,c,r,done,delay,mark){
    parts.push({el:dot(c,r),names:names,i:0,s:0,L:P[names[0]].getTotalLength(),delay:delay||0,done:done,sp:190,mark:mark});
  }
  function setCounts(){
    N.fix.textContent=C.fix+(C.fix===1?" change made":" changes made");
    N.drop.textContent=C.drop+" dropped";
  }

  function startRound(){
    var n=nActive(), pend=n;
    N.round.textContent="round "+(rd+1);
    N.decide.setAttribute("stroke","var(--rsi-human)"); N.decide._s="var(--rsi-human)";
    function arrive(){pend--; if(pend===0){flash(N.compare); later(.35,sortFindings);}}
    REV.forEach(function(v,i){
      if(i>=n) return;
      go([v.f],COL.rev,5,function(){
        flash(v.box);
        go([v.r],COL.rev,4.5,arrive,.15);
      },i*.12);
    });
  }

  function sortFindings(){
    var f=ROUNDS[rd], a=f[0], s=f[1], pend=a+s;
    if(pend===0){clean();return;}
    function finish(){pend--; if(pend===0) later(.4,loopBack);}
    function applied(){C.fix++; setCounts(); flash(N.decide,"var(--rsi-ok)"); finish();}
    for(var i=0;i<a;i++){
      go(["la","le"],COL.ok,5,applied,i*.28);
    }
    for(var j=0;j<s;j++){
      (function(j){
        var drop=(j===0&&rd%2===0);
        go(["lb","lc"],COL.one,5,function(){
          flash(N.check,"var(--rsi-gate)");
          later(.3,function(){
            if(drop){go(["lx"],COL.err,5,function(){C.drop++; setCounts(); finish();});}
            else{go(["ld"],COL.ok,5,applied);}
          });
        },j*.28);
      })(j);
    }
  }

  function loopBack(){
    var fired=false;
    go(["lp"],COL.ink,5.5,function(){
      flash(N.work); rd++; later(.6,startRound);
    },0,{s:gateS,fn:function(){flash(N.gate,"var(--rsi-ok)");}});
  }

  function clean(){
    N.decide.setAttribute("stroke","var(--rsi-ok)"); N.decide._s="var(--rsi-ok)";
    N.round.textContent="round "+(rd+1)+", clean";
    later(2.6,function(){rd=0; C={fix:0,drop:0}; setCounts(); startRound();});
  }

  function tick(ts){
    if(!last) last=ts;
    var dt=Math.min((ts-last)/1000,.05); last=ts;

    for(var t=timers.length-1;t>=0;t--){
      timers[t].t-=dt;
      if(timers[t].t<=0){var fn=timers[t].fn; timers.splice(t,1); fn();}
    }

    var cur=parts.slice();
    cur.forEach(function(p){
      if(parts.indexOf(p)<0) return;
      if(p.delay>0){p.delay-=dt;return;}
      p.el.setAttribute("opacity",1);
      var prev=p.s; p.s+=p.sp*dt;
      if(p.mark&&p.names[p.i]==="lp"&&!p.mark.done&&prev<p.mark.s&&p.s>=p.mark.s){p.mark.done=true;p.mark.fn();}
      if(p.s>=p.L){
        if(p.i+1<p.names.length){p.i++;p.s=0;p.L=P[p.names[p.i]].getTotalLength();}
        else{p.el.remove();parts.splice(parts.indexOf(p),1);if(p.done)p.done();return;}
      }
      var pt=P[p.names[p.i]].getPointAtLength(Math.min(p.s,p.L));
      p.el.setAttribute("cx",pt.x); p.el.setAttribute("cy",pt.y);
    });
    raf=requestAnimationFrame(tick);
  }

  function staticFill(){
    var pts=[["fa",.6,COL.rev],["fb",.6,COL.rev],["ra",.5,COL.rev],["rb",.5,COL.rev],["la",.7,COL.ok],["le",.5,COL.ok],["lb",.7,COL.one],["ld",.6,COL.ok],["lx",.8,COL.err],["lp",.5,COL.ink]];
    pts.forEach(function(p){
      var path=P[p[0]], q=path.getPointAtLength(path.getTotalLength()*p[1]);
      dots.appendChild(el("circle",{cx:q.x,cy:q.y,r:5,fill:p[2]}));
    });
    C={fix:3,drop:1}; setCounts(); N.round.textContent="round 2";
  }

  function render(){
    dots.innerHTML=""; parts=[]; timers=[]; rd=0; C={fix:0,drop:0}; last=0;
    drawBase(); setCounts();
    if(reduce){staticFill();return;}
    later(.4,startRound);
    if(!raf) raf=requestAnimationFrame(tick);
  }

  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(render);}else{render();}
})();
</script>

The reviews come back full of bugs, ideas and opinions, and they often point in different directions. AI has become good at finding where the reviews agree and where they disagree, but it still needs someone to nudge it in one direction. 

For now, that is the **human**. In some cases I really do not know which way is right, and then I let the consensus (what most models agree on) decide. Otherwise, my part is to look at the findings, merge them and decide where the work goes.

**The real test comes at the very end.** After the reviews, the work has to pass (1) guardrails and (2) tests. I use this mostly when I fine-tune models.

---

## What the Reviews Caught

Here are some things the reviews caught in my own projects:

* **Two models found the same bug.** In Nepali, *kar* means "do", and it also means "tax". One of my apps had a rule that looked for *kar* to find tax questions, so a request like "compare kar" was sent to a tax lesson
* **One model made a wrong claim.** It said a function rounded 1.5 up to 2. The code showed that it kept the fraction, so it was not a bug
* **A reviewer corrected my own number.** I had reported that my AI text detector caught 92.7% of AI texts. A review found the real number was 91.4%, because the detector gives no verdict on texts under 60 words and 11 test texts were that short
* **A tool accepted a bad rewrite.** My text rewriter accepted a three-word sentence as a rewrite of a 64-word text

---

## Using It for Research

Every few days, I run a research task on one of my major code bases. It fetches research papers and case studies from different journals and looks for what can be improved in the model and maybe even in the code. Other models can then review what it found, the same way they review a feature.

You can do the same for competitors. One model reads their website, pricing and news and writes a summary, and other models check it for mistakes.

I use the same cross-checking in my Atlas project. One group of models writes each record, and a different group checks it, so no model checks its own work. [AI Atlas](/ai/daily-ai-briefing/) runs this every night.

---

## What the Labs Are Doing

OpenAI says its GPT-5.3-Codex model [helped build itself](https://www.nbcnews.com/tech/innovation/openai-says-new-codex-coding-model-helped-build-rcna257521). An Anthropic spokesperson told [Fortune](https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/) that between 70 and 90 percent of the company's code is now written by AI. Both are the companies' own claims, and there is now an [ICLR 2026 workshop](https://iclr.cc/virtual/2026/workshop/10000796) on this research.

These research systems work in a similar way. The system suggests a change, and a score that the system cannot edit checks it. If the score gets better, the change is kept. The [Darwin Gödel Machine](https://arxiv.org/abs/2505.22954) used this to rewrite its own code, and its score on SWE-bench (a coding test) went from 20.0% to 50.0%. [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) made an important piece of Gemini's own code run 23% faster. Karpathy's [autoresearch](https://github.com/karpathy/autoresearch) lets an AI agent edit a training file, and it keeps an edit only if the model scores better on a validation test.

---

## Start Here

Pick one piece of work that has a clear result, like a feature plan, a pull request or a competitor summary.

* The work goes to three or more models from different companies, with the same instructions
* Each model works alone and shows evidence for every finding
* The agents sort the findings into those found by more than one model and those found by only one
* Each finding is checked against the code, the data or the source, and the agents write down what changed and what was rejected
* One test that the models cannot change, like a set of examples or a checklist, keeps the loop honest. Models often [make the same mistakes](https://arxiv.org/abs/2506.07962). In a study of more than 350 models, two wrong models gave the same wrong answer 60% of the time on one popular test
* The loop stops when a round finds nothing new

Recursive self-improvement is still early, but a small version of it already works today. One piece of work, reviewed by three or more models from different companies, is enough to begin. Keep iterating, and you will find something amazing.
