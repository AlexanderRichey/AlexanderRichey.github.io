document.addEventListener("DOMContentLoaded",function(){const a=function(b,d,c){let a;return function(){const e=this,f=arguments,g=function(){a=null,c||b.apply(e,f)},h=c&&!a;clearTimeout(a),a=setTimeout(g,d),h&&b.apply(e,f)}},b=function(){const a=document.getElementsByTagName("header")[0];let b=0;const c=function(){window.scrollY<10?(a.style.transform="translateY(0rem)",a.style.borderBottom="1px solid #fff"):b<window.scrollY&&window.scrollY>10?(a.style.transform="translateY(-7rem)",a.style.borderBottom="1px solid #fff"):b>window.scrollY&&window.scrollY>10&&(a.style.transform="translateY(0rem)",a.style.borderBottom="1px solid #eee"),b=window.scrollY};document.addEventListener("scroll",c),window.addEventListener("turbo:load",function a(){document.removeEventListener("scroll",c),window.removeEventListener("turbo:load",a)})},c=function(){const a=document.querySelectorAll("img");a.forEach(function(a){if(a.dataset.imgGrow||a.id==="img-grow-img"||a.dataset.nogrow)return;a.dataset.imgGrow=!0,a.classList.add("img-grow--target"),a.addEventListener("click",function(d){d.stopPropagation();const c=document.createElement("img");c.src=a.src,c.id="img-grow-img",c.className="img-grow--img";const b=document.createElement("div");b.id="img-grow",b.className="img-grow--flex-center",b.appendChild(c),document.body.appendChild(b),document.body.style.overflow="hidden",document.addEventListener("click",function(){b.remove(),document.body.style.overflow="auto",document.removeEventListener("click",this)})})})};window.addEventListener("turbo:load",a(function(){b(),c()},200))})