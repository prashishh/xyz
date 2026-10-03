---
title: High Agency
date: 2026-09-29T00:00:00Z
author: Prashish
description: "taking things into your own hands"
article_kind: Perspective
---

<style>
.ha{
  --ha-ink:var(--text-color); --ha-muted:var(--text-color-muted);
  --ha-rule:var(--border-color-light); --ha-page:var(--bg-color);
  --ha-mark:#1266d6; --ha-go:#2e7d4f; --ha-warn:#b5700e;
  margin:22px 0 22px; font-family:inherit;
}
[data-theme="dark"] .ha{ --ha-mark:#69a8f5; --ha-go:#63b98a; --ha-warn:#e0a458; }
.ha svg{display:block;width:100%;height:auto;max-width:440px;margin:0 auto}
.ha-b{font-size:13.5px;fill:var(--ha-ink);font-family:inherit}
.ha-tag{font-size:12px;font-weight:600;font-family:inherit}
</style>

**What is high agency**

High agency means turning a rough goal into the right result without waiting for someone to spell it out. It means owning the outcome and taking things into your own hands, instead of waiting on someone or doing only the task you were given.

- **Know what it is for:** Before you start, find out what the task is meant to achieve and whether this is the best way to get there. If the approach looks wrong, say so and suggest a better one. **Building the wrong thing fast isn't agency.**

<div class="ha" data-scene="order"><svg viewBox="0 0 400 142" role="img" aria-label="Both people are told to walk right, toward a wall with a flag behind it. One follows the order, hits the wall and says done. The other stops to ask whether this is the best way, turns the sign, puts a plank up the wall and reaches the flag."><g class="ag-world"></g></svg></div>

- **Come back with something done:** Bring a draft, a fix, or a first version. Where something is unclear, make your best guess, say what you guessed, and keep going, like "I assumed X because Y; if that's wrong, here's how I'd change it." On bigger work, ask first, with a default attached, like "I'm planning to do A unless you'd prefer B." **Coming back with a draft is agency.**

- **Go beyond the task:** Look at the bigger goal and point out what else you notice, like "While fixing this, I found Z is also causing the problem." **Doing something outside the work you were assigned is where agency starts.**

- **Communicate early:** Share what you are doing, what you found, and what you need before anyone asks. **Sharing updates before anyone asks is agency.**

- **Use AI to think better:** Use agents to explore options, challenge your approach, draft, and test, and check the output before handing it over. **Using AI only to move faster isn't agency.**

AI has been a boon for people with high agency, because it lets them try more ideas and get more done in less time.

<div class="ha" data-scene="task"><svg viewBox="0 0 400 142" role="img" aria-label="A task sits on a table. One person stands back and waits for someone to hand it over while a clock turns. The other walks over, picks it up, and carries it all the way to the finished tray."><g class="ag-world"></g></svg></div>

<script>
(function(){
  var SV="http://www.w3.org/2000/svg";
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var G=130, S=1.15, BLUE="var(--ha-mark)", GREY="var(--ha-muted)";

  function el(n,a){var e=document.createElementNS(SV,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function seg(t,a,b){return clamp((t-a)/(b-a),0,1);}
  function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
  function lerp(a,b,k){return a+(b-a)*k;}
  function mix(p,q,k){return [lerp(p[0],q[0],k),lerp(p[1],q[1],k)];}

  function ground(w){w.appendChild(el("line",{x1:8,y1:G+2,x2:392,y2:G+2,stroke:"var(--ha-rule)","stroke-width":1.4,"stroke-linecap":"round"}));}
  function table(w,x,top){
    w.appendChild(el("rect",{x:x-30,y:top,width:60,height:5,rx:2,fill:GREY}));
    [-24,24].forEach(function(o){w.appendChild(el("line",{x1:x+o,y1:top+5,x2:x+o,y2:G+2,stroke:GREY,"stroke-width":3,"stroke-linecap":"round"}));});
  }
  function arm(poly,sx,sy,hx,hy){
    poly.setAttribute("points",sx.toFixed(1)+","+sy.toFixed(1)+" "+((sx+hx)/2).toFixed(1)+","+((sy+hy)/2+5).toFixed(1)+" "+hx.toFixed(1)+","+hy.toFixed(1));
  }

  function person(w,color){
    var o={color:color};
    o.sh=w.appendChild(el("ellipse",{cx:0,cy:G+1,rx:21,ry:3.6,fill:"var(--ha-rule)"}));
    o.far=w.appendChild(el("polyline",{fill:"none",stroke:color,"stroke-width":5,"stroke-linecap":"round","stroke-linejoin":"round",opacity:.55}));
    o.g=w.appendChild(el("g",{}));
    o.g.appendChild(el("path",{d:"M -15 0 Q -15 -27 -8 -35 L 8 -35 Q 15 -27 15 0 Z",fill:color}));
    o.g.appendChild(el("circle",{cx:0,cy:-47,r:11,fill:color}));
    o.e1=o.g.appendChild(el("circle",{cy:-48,r:1.7,fill:"var(--ha-page)"}));
    o.e2=o.g.appendChild(el("circle",{cy:-48,r:1.7,fill:"var(--ha-page)"}));
    return o;
  }
  function front(o,w){
    o.near=w.appendChild(el("polyline",{fill:"none",stroke:o.color,"stroke-width":5,"stroke-linecap":"round","stroke-linejoin":"round"}));
    o.hand=w.appendChild(el("circle",{r:3.8,fill:o.color}));
  }
  function pose(o,x,y,bob,lean,h,face){
    face=face||1;
    o.g.setAttribute("transform","translate("+x.toFixed(1)+","+(y+bob).toFixed(1)+") rotate("+(lean*face)+") scale("+S+")");
    o.sh.setAttribute("cx",x.toFixed(1)); o.sh.setAttribute("cy",(y+1).toFixed(1));
    o.e1.setAttribute("cx",(-3.6+1.9*face).toFixed(2)); o.e2.setAttribute("cx",(3.6+1.9*face).toFixed(2));
    var sy=y+bob-31*S, hh=h||[x+11*face,y+bob-12];
    arm(o.near,x+9*S*face,sy,hh[0],hh[1]);
    o.hand.setAttribute("cx",hh[0].toFixed(1)); o.hand.setAttribute("cy",hh[1].toFixed(1));
    arm(o.far,x-9*S*face,sy,x-13*face,y+bob-12);
  }

  function tag(w,good){
    var col=good?"var(--ha-go)":"var(--ha-warn)";
    var t=el("text",{"class":"ha-tag","text-anchor":"middle",fill:col}); t.textContent=good?"Agency":"Not agency"; w.appendChild(t);
    var wd=t.getComputedTextLength()+22, x=392-wd;
    w.insertBefore(el("rect",{x:x,y:6,width:wd,height:22,rx:11,fill:"var(--ha-page)",stroke:col,"stroke-width":1.4}),t);
    t.setAttribute("x",(x+wd/2).toFixed(1)); t.setAttribute("y",21);
  }
  function cardProp(w){
    var g=el("g",{});
    var r=g.appendChild(el("rect",{x:-15,y:-19,width:30,height:38,rx:4,fill:BLUE,"fill-opacity":.16,stroke:BLUE,"stroke-width":1.7}));
    [[-8,9],[0,9],[8,0]].forEach(function(l){g.appendChild(el("line",{x1:-9,y1:l[0],x2:l[1],y2:l[0],stroke:BLUE,"stroke-width":2,"stroke-linecap":"round"}));});
    w.appendChild(g);
    return {g:g,rect:r,set:function(x,y,s){g.setAttribute("transform","translate("+x.toFixed(1)+","+y.toFixed(1)+") scale("+(s===undefined?1:s).toFixed(3)+")");}};
  }
  function tickProp(w,x,y){
    var g=el("g",{opacity:0,transform:"translate("+x+","+y+")"});
    g.appendChild(el("circle",{r:10,fill:"var(--ha-go)"}));
    g.appendChild(el("path",{d:"M -4.6 0.4 L -1.4 3.6 L 4.8 -3.4",fill:"none",stroke:"var(--ha-page)","stroke-width":2.2,"stroke-linecap":"round","stroke-linejoin":"round"}));
    w.appendChild(g);
    return {set:function(o){g.setAttribute("opacity",o.toFixed(3));}};
  }
  function clockProp(w,x,y){
    var g=el("g",{opacity:0,transform:"translate("+x+","+y+")"});
    g.appendChild(el("circle",{r:11,fill:"var(--ha-page)",stroke:"var(--ha-ink)","stroke-width":1.6}));
    var h=g.appendChild(el("line",{x1:0,y1:0,x2:0,y2:-7.5,stroke:"var(--ha-ink)","stroke-width":1.8,"stroke-linecap":"round"}));
    w.appendChild(g);
    return {set:function(o,ang){g.setAttribute("opacity",o.toFixed(3));h.setAttribute("transform","rotate("+(ang%360).toFixed(1)+")");}};
  }
  function bubbles(w,defs){
    var meas=w.appendChild(el("text",{"class":"ha-b",visibility:"hidden"}));
    var layer=w.appendChild(el("g",{}));
    var bottom=G-58*S-13;
    var list=defs.map(function(d){
      var wd=0; d.lines.forEach(function(s){meas.textContent=s;wd=Math.max(wd,meas.getComputedTextLength());}); wd+=22;
      var h=d.lines.length*16+14, top=bottom-h;
      var cx=clamp(d.x,6+wd/2,394-wd/2), left=cx-wd/2, tx=clamp(d.x,left+16,left+wd-16);
      var g=el("g",{opacity:0});
      g.appendChild(el("rect",{x:left,y:top,width:wd,height:h,rx:9,fill:"var(--ha-page)",stroke:GREY,"stroke-width":1.3}));
      g.appendChild(el("path",{d:"M "+(tx-6.5)+" "+(bottom-1)+" L "+(tx+6.5)+" "+(bottom-1)+" L "+tx+" "+(bottom+10)+" Z",fill:"var(--ha-page)"}));
      g.appendChild(el("path",{d:"M "+(tx-6.5)+" "+bottom+" L "+tx+" "+(bottom+10)+" L "+(tx+6.5)+" "+bottom,fill:"none",stroke:GREY,"stroke-width":1.3,"stroke-linejoin":"round"}));
      d.lines.forEach(function(s,i){var t=el("text",{x:cx,y:top+19+i*16,"class":"ha-b","text-anchor":"middle"});t.textContent=s;g.appendChild(t);});
      layer.appendChild(g);
      return {a:d.a,b:d.b,g:g};
    });
    w.removeChild(meas);
    return {update:function(tt){
      list.forEach(function(b){
        var o=seg(tt,b.a,b.a+.2)*(1-seg(tt,b.b-.2,b.b));
        b.g.setAttribute("opacity",o.toFixed(3));
        b.g.setAttribute("transform","translate(0,"+((1-o)*5).toFixed(2)+")");
      });
    }};
  }

  /* ---------- scene 1: waits for it / takes it ---------- */
  function taskScene(take){
    return function(w){
      var L=take?9.6:8, TBX=200, TOPY=100, TRX=346, START=60, STOP=146, END=290;
      ground(w); table(w,TBX,TOPY);
      var tray=w.appendChild(el("rect",{x:TRX-26,y:G-46,width:52,height:46,rx:6,fill:"none",stroke:GREY,"stroke-width":1.6,"stroke-dasharray":"5 5"}));
      var p=person(w,BLUE), card=cardProp(w); front(p,w);
      var clock=clockProp(w,TBX,44), tick=tickProp(w,TRX,66);
      var bub=bubbles(w,take?[{x:START,lines:["I'll take this."],a:.2,b:1.6}]
        :[{x:START,lines:["Waiting for someone","to hand it over."],a:.3,b:4.8},{x:START,lines:["..."],a:5.2,b:7.5}]);
      return {L:L,still:take?8.2:3.0,draw:function(tt){
        var px=START, moving=false;
        if(take){
          px=lerp(START,STOP,ease(seg(tt,1.2,2.9))); px=lerp(px,END,ease(seg(tt,4.0,6.4)));
          moving=(tt>1.2&&tt<2.9)||(tt>4.0&&tt<6.4);
        }
        var bob=moving?Math.sin(tt*13)*1.5:Math.sin(tt*1.8)*.8, lean=moving?4:0;
        var rest=[px+11,G+bob-12], h=rest, cx=TBX, cy=81, cs=1;
        if(take){
          var reach=ease(seg(tt,2.9,3.5)), lift=ease(seg(tt,3.5,4.0)), put=ease(seg(tt,6.4,7.1)), rel=ease(seg(tt,7.1,7.6));
          var grab=[TBX-17,90], carryH=[px+20,90+bob], carryC=[px+34,78+bob];
          h=mix(rest,grab,reach); h=mix(h,carryH,lift);
          cx=lerp(TBX,carryC[0],lift); cy=lerp(81,carryC[1],lift)-Math.sin(Math.PI*lift)*6;
          cx=lerp(cx,TRX,put); cy=lerp(cy,G-22,put); cs=lerp(1,.78,put);
          h=mix(h,[cx-14*cs,cy+12*cs],put); h=mix(h,rest,rel);
          tray.setAttribute("stroke",tt>7.0?"var(--ha-go)":GREY); tray.setAttribute("stroke-dasharray",tt>7.0?"":"5 5");
          tick.set(ease(seg(tt,7.2,7.7)));
        }else{ clock.set(ease(seg(tt,2.0,2.6)),tt*300); }
        card.set(cx,cy,cs); pose(p,px,G,bob,lean,h,1); bub.update(tt);
      }};
    };
  }

  /* ---------- scene 2: follows the order / questions it ---------- */
  function orderScene(think){
    return function(w){
      var L=think?12.2:8.8, START=40, WALLX=222, FLAGX=335;
      ground(w);
      var sg=w.appendChild(el("g",{}));
      sg.appendChild(el("line",{x1:90,y1:G,x2:90,y2:G-34,stroke:GREY,"stroke-width":3,"stroke-linecap":"round"}));
      var arrow=sg.appendChild(el("g",{transform:"translate(90,"+(G-36)+")"}));
      arrow.appendChild(el("path",{d:"M -16 -6 L 8 -6 L 8 -11 L 20 0 L 8 11 L 8 6 L -16 6 Z",fill:"var(--ha-warn)","fill-opacity":.3,stroke:"var(--ha-warn)","stroke-width":1.6,"stroke-linejoin":"round"}));
      w.appendChild(el("rect",{x:WALLX,y:G-56,width:22,height:58,fill:GREY,"fill-opacity":.35,stroke:GREY,"stroke-width":1.5}));
      [-40,-24,-8].forEach(function(o){w.appendChild(el("line",{x1:WALLX,y1:G+o,x2:WALLX+22,y2:G+o,stroke:GREY,"stroke-width":1,opacity:.6}));});
      var plank=w.appendChild(el("line",{x1:160,y1:G,x2:160,y2:G,stroke:"var(--ha-warn)","stroke-width":5,"stroke-linecap":"round",opacity:0}));
      w.appendChild(el("line",{x1:FLAGX,y1:G,x2:FLAGX,y2:G-64,stroke:GREY,"stroke-width":2.4,"stroke-linecap":"round"}));
      var cloth=w.appendChild(el("path",{d:"M "+FLAGX+" "+(G-64)+" L "+(FLAGX+24)+" "+(G-57)+" L "+FLAGX+" "+(G-50)+" Z",fill:GREY,"fill-opacity":.5}));
      var p=person(w,BLUE); front(p,w);
      var tick=tickProp(w,FLAGX+12,G-86);
      var bub=bubbles(w,think
        ?[{x:START,lines:["Told to go right."],a:.2,b:1.7},{x:135,lines:["Is this the best way","to get there?"],a:2.8,b:5.4}]
        :[{x:START,lines:["Told to go right."],a:.2,b:1.8},{x:204,lines:["Done."],a:5.4,b:8.1}]);
      function pos(s){
        if(s<25) return [135+s,G,0];
        if(s<108.5){var u=(s-25)/83.5; return [160+62*u,G-56*u,6];}
        if(s<130.5) return [222+(s-108.5),G-56,0];
        if(s<160.5){var v=(s-130.5)/30; return [244+24*v,G-56+56*v*v-Math.sin(Math.PI*v)*12,0];}
        return [268+(s-160.5),G,0];
      }
      return {L:L,still:think?11.4:7.0,draw:function(tt){
        var x=START,y=G,lean=0,moving=false;
        if(!think){
          x=lerp(START,204,ease(seg(tt,1.0,4.2))); moving=tt>1.0&&tt<4.2;
          var press=tt>4.2&&tt<5.6;
          var bob=moving?Math.sin(tt*13)*1.5:(press?Math.sin(tt*17)*1.8:Math.sin(tt*1.8)*.8);
          pose(p,x,G,bob,press?8:(moving?4:0),null,1);
        }else{
          if(tt<6.3){ x=lerp(START,135,ease(seg(tt,1.0,2.7))); moving=tt>1.0&&tt<2.7; }
          else{
            var s=210.5*ease(seg(tt,6.3,10.0)), q=pos(s); x=q[0]; y=q[1]; lean=q[2]; moving=tt<10.0;
          }
          var bobT=moving?Math.sin(tt*13)*1.5:Math.sin(tt*1.8)*.8;
          pose(p,x,y,bobT,moving&&!lean?4:lean,null,1);
          arrow.setAttribute("transform","translate(90,"+(G-36)+") rotate("+(-38*ease(seg(tt,5.0,5.8))).toFixed(1)+")");
          var pr=ease(seg(tt,5.2,6.2));
          plank.setAttribute("opacity",pr>0?1:0);
          plank.setAttribute("x2",lerp(160,222,pr).toFixed(1)); plank.setAttribute("y2",lerp(G,G-56,pr).toFixed(1));
          var lit=ease(seg(tt,10.0,10.5));
          cloth.setAttribute("fill",lit>0?"var(--ha-go)":GREY); cloth.setAttribute("fill-opacity",lerp(.5,1,lit).toFixed(2));
          tick.set(ease(seg(tt,10.4,10.9)));
        }
        bub.update(tt);
      }};
    };
  }

  var SCENES={
    task:[taskScene(false),taskScene(true)],
    order:[orderScene(false),orderScene(true)]
  };

  var armed=false;
  setTimeout(function(){armed=true;},6000);
  window.addEventListener("scroll",function(){armed=true;},{once:true,passive:true});

  function run(root,list){
    var w=root.querySelector(".ag-world"), idx=0, cur, t=0, last=0, onscreen=false;
    function start(i){ idx=i; w.innerHTML=""; cur=list[i](w); tag(w,i===list.length-1); t=0; }
    function paint(){
      w.setAttribute("opacity",Math.min(seg(t,0,.3),1-seg(t,cur.L-.4,cur.L)).toFixed(3));
      cur.draw(t);
    }
    if(reduce){ start(list.length-1); w.setAttribute("opacity",1); cur.draw(cur.still); return; }
    function frame(ts){
      if(!last) last=ts;
      var dt=Math.min((ts-last)/1000,.05); last=ts;
      if(onscreen&&armed){
        t+=dt;
        if(t>=cur.L) start((idx+1)%list.length);
        paint();
      }
      requestAnimationFrame(frame);
    }
    start(0); paint(); requestAnimationFrame(frame);
    if("IntersectionObserver" in window){ new IntersectionObserver(function(es){onscreen=es[0].isIntersecting;},{threshold:.6}).observe(root); }
  }

  function go(){
    [].forEach.call(document.querySelectorAll(".ha[data-scene]"),function(r){ run(r,SCENES[r.getAttribute("data-scene")]); });
  }
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(go);}else{go();}
})();
</script>
