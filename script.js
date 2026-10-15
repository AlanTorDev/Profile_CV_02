const toggle=document.getElementById("themeToggle");
const label=toggle?.querySelector(".theme-label");
const icon=toggle?.querySelector(".theme-icon");

function setTheme(theme){
  document.documentElement.dataset.theme=theme;
  localStorage.setItem("cv-theme",theme);
  if(toggle){
    const dark=theme==="dark";
    toggle.setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");
    if(label) label.textContent=dark?"LIGHT":"DARK";
    if(icon) icon.textContent=dark?"☀":"◐";
  }
}
setTheme(localStorage.getItem("cv-theme")==="light"?"light":"dark");

toggle?.addEventListener("click",()=>{
  setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark");
});

const reveals=document.querySelectorAll(".reveal");
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("visible");
      observer.unobserve(e.target);
    }
  });
},{threshold:.12});
reveals.forEach(x=>observer.observe(x));

const terminal=document.getElementById("terminal3d");
if(terminal){
  const parent=terminal.parentElement;
  parent.addEventListener("mousemove",e=>{
    const r=parent.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)/(r.width/2);
    const y=(e.clientY-r.top-r.height/2)/(r.height/2);
    terminal.style.transform=`rotateX(${-y*8}deg) rotateY(${x*8}deg) translateZ(10px)`;
  });
  parent.addEventListener("mouseleave",()=>terminal.style.transform="");
}

document.querySelectorAll(".tilt").forEach(card=>{
  card.addEventListener("mousemove",e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)/r.width;
    const y=(e.clientY-r.top-r.height/2)/r.height;
    card.style.transform=`perspective(900px) rotateX(${-y*8}deg) rotateY(${x*8}deg) translateZ(8px) scale(1.01)`;
  });
  card.addEventListener("mouseleave",()=>card.style.transform="");
});

const sections=document.querySelectorAll("section[id]");
const links=document.querySelectorAll(".nav-links a");
const navObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${e.target.id}`));
    }
  });
},{rootMargin:"-30% 0px -60% 0px"});
sections.forEach(s=>navObserver.observe(s));


// ===== UI UPGRADE v2 =====
const progress=document.getElementById("scrollProgress");
const glow=document.getElementById("cursorGlow");
const menu=document.getElementById("menuToggle");
const nav=document.getElementById("navLinks");

function updateScrollProgress(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  if(progress) progress.style.width=`${max>0?(window.scrollY/max)*100:0}%`;
}
window.addEventListener("scroll",updateScrollProgress,{passive:true});
updateScrollProgress();

if(glow && window.matchMedia("(pointer:fine)").matches){
  window.addEventListener("pointermove",e=>{
    glow.style.left=`${e.clientX}px`; glow.style.top=`${e.clientY}px`; glow.style.opacity="1";
  },{passive:true});
  document.addEventListener("mouseleave",()=>glow.style.opacity="0");
}

function closeMenu(){
  if(!menu||!nav) return;
  menu.classList.remove("open"); nav.classList.remove("open"); menu.setAttribute("aria-expanded","false");
}
menu?.addEventListener("click",()=>{
  const open=!menu.classList.contains("open");
  menu.classList.toggle("open",open); nav?.classList.toggle("open",open); menu.setAttribute("aria-expanded",String(open));
});
nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
window.addEventListener("resize",()=>{if(window.innerWidth>1100) closeMenu()});

// ===== MICRO-INTERACTIONS v4 =====
const finePointer=window.matchMedia("(pointer:fine)").matches;
if(finePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  document.querySelectorAll(".card,.edu,.skill,.profile-grid aside div,.metrics>div").forEach(el=>{
    el.addEventListener("mousemove",e=>{
      const r=el.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width*100;
      const py=(e.clientY-r.top)/r.height*100;
      el.style.setProperty("--mx",`${px}%`);
      el.style.setProperty("--my",`${py}%`);
    });
  });
}

// Animate timeline numbers once they enter the viewport.
const statNumbers=document.querySelectorAll(".job .stats b");
const statObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;
    if(el.dataset.counted)return;
    el.dataset.counted="1";
    const text=el.firstChild?.textContent?.trim()||"";
    const match=text.match(/^(\d+)(.*)$/);
    if(!match)return;
    const target=Number(match[1]);
    const suffix=match[2];
    if(target>999)return;
    const duration=700;
    const start=performance.now();
    const tick=now=>{
      const p=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-p,3);
      el.firstChild.textContent=`${Math.round(target*eased)}${suffix}`;
      if(p<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
},{threshold:.65});
statNumbers.forEach(el=>statObserver.observe(el));

// Scroll-linked experience rail: the timeline subtly fills as the section is read.
const timeline=document.querySelector(".timeline");
function updateTimelineProgress(){
  if(!timeline)return;
  const r=timeline.getBoundingClientRect();
  const focus=window.innerHeight*0.52;
  const p=Math.max(0,Math.min(1,(focus-r.top)/(Math.max(1,r.height))));
  timeline.style.setProperty("--timeline-progress",`${(p*100).toFixed(1)}%`);
}
window.addEventListener("scroll",updateTimelineProgress,{passive:true});
window.addEventListener("resize",updateTimelineProgress);
updateTimelineProgress();
