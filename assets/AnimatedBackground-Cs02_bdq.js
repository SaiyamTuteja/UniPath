import{r as i,j as t}from"./index-BsEMiAk7.js";const u=25;function p(){const r=i.useRef(null);return i.useEffect(()=>{const n=r.current;if(!n)return;const o=[];for(let a=0;a<u;a++){const e=document.createElement("div"),s=Math.random()*3+1,l=Math.random()*20+15,c=Math.random()*15,d=Math.random()>.5?"210":"185";e.className="particle",e.style.cssText=`
        width: ${s}px;
        height: ${s}px;
        left: ${Math.random()*100}%;
        background: hsl(${d}, 100%, 65%);
        animation-duration: ${l}s;
        animation-delay: -${c}s;
        opacity: ${Math.random()*.4+.1};
        filter: blur(${s>2?1:0}px);
      `,n.appendChild(e),o.push(e)}return()=>o.forEach(a=>a.remove())},[]),t.jsxs("div",{className:"fixed inset-0 overflow-hidden pointer-events-none z-0",children:[t.jsx("div",{className:"absolute inset-0 bg-[#0A0F1E]"}),t.jsx("div",{className:"absolute inset-0 bg-grid opacity-100"}),t.jsx("div",{className:"absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl",style:{background:"radial-gradient(circle, #3B82F6, transparent)"}}),t.jsx("div",{className:"absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl",style:{background:"radial-gradient(circle, #06B6D4, transparent)"}}),t.jsx("div",{className:"absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-6 blur-3xl",style:{background:"radial-gradient(circle, #8B5CF6, transparent)"}}),t.jsx("div",{ref:r,className:"absolute inset-0"})]})}export{p as A};
