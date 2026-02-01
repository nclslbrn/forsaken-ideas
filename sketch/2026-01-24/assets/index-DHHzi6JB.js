var an=Object.defineProperty;var un=(_,y,A)=>y in _?an(_,y,{enumerable:!0,configurable:!0,writable:!0,value:A}):_[y]=A;var _e=(_,y,A)=>un(_,typeof y!="symbol"?y+"":y,A);(function(){"use strict";var _=document.createElement("style");_.textContent=`html{overflow:hidden}#windowFrame svg,#windowFrame canvas{display:block;width:100vw;max-width:100%;height:auto}
/*$vite$:1*/`,document.head.appendChild(_);const y=[0,31,59,90,120,151,181,212,243,273,304,334],ve=60*1e3,Se=(e,n)=>e!=null&&typeof e[n]=="function",we=e=>typeof e=="number",W=e=>typeof e=="string",be=e=>W(e)||we(e)?new Date(e):Se(e,"toDate")?e.toDate():e,G=e=>!(e%4)&&(!!(e%100)||!(e%400));function V(e,n=Object.create(null)){return(...o)=>{const t=JSON.stringify(o);return t!==void 0?t in n?n[t]:n[t]=e.apply(null,o):e.apply(null,o)}}const Me=V((e,n)=>e.repeat(n)),I=V((e,n=" ")=>{const o=Me(String(n),e);return(t,r)=>t==null?o:(t=t.toString(),r=r!==void 0?r:t.length,r<e?o.substring(r)+t:t)}),p=I(2,"0"),xe=I(3,"0"),Ae=I(4,"0"),Ce=e=>typeof e=="function";let M=(e=>{const n={sepED:" ",sepDM:"/",sepMY:"/",sepHM:":",date:["E","/ED","d","/DM","MMM","/MY","yyyy"],time:["H","/HM","mm"],...e};return!n.dateTime&&(n.dateTime=[...n.date,", ",...n.time]),n})({months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],days:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],sepHM:".",date:["dd","/DM","MM","/MY","yyyy"],time:["h","/HM","mm"," ","a"],units:{y:{s:"y",p:"y"},M:{s:"m",p:"m"},d:{s:"d",p:"d"},h:{s:"h",p:"h"},m:{s:"min",p:"min"},s:{s:"s",p:"s"},t:{s:"ms",p:"ms"}},less:"< %s",past:"%s ago",now:"just now",future:"in %s"});const Le=(e,n,o)=>y[n]+o+~~(n>1&&G(e)),Ee=(e,n,o)=>{const t=new Date(Date.UTC(e,0,1)).getDay()||7;if(!n){if(t===5&&o<4)return 53;if(t===6&&o<3)return 52+~~G(e-1);if(t===7&&o<2)return 52}const r=(t<5?8:15)-t;return Math.ceil((Le(e,n,o)-r)/7+1)},C={yyyy:e=>Ae(e.getFullYear()),yy:e=>p(e.getFullYear()%100),MMM:e=>M.months[e.getMonth()],MM:e=>p(e.getMonth()+1),M:e=>String(e.getMonth()+1),dd:e=>p(e.getDate()),d:e=>String(e.getDate()),E:e=>M.days[e.getDay()],ww:e=>p(C.w(e,!1)),w:e=>String(Ee(e.getFullYear(),e.getMonth(),e.getDate())),q:e=>String((e.getMonth()/3|0)+1),HH:e=>p(e.getHours()),H:e=>String(e.getHours()),hh:e=>{const n=e.getHours()%12;return p(n>0?n:12)},h:e=>{const n=e.getHours()%12;return String(n>0?n:12)},mm:e=>p(e.getMinutes()),m:e=>String(e.getMinutes()),ss:e=>p(e.getSeconds()),s:e=>String(e.getSeconds()),SS:e=>xe(e.getMilliseconds()),S:e=>String(e.getMilliseconds()),A:e=>e.getHours()<12?"AM":"PM",a:e=>e.getHours()<12?"am":"pm",Z:(e,n=!1)=>{const o=n?0:e.getTimezoneOffset(),t=Math.abs(o);return`${o<0?"+":"-"}${p(t/60|0)}:${p(t%60)}`},ZZ:(e,n=!1)=>n?"Z":C.Z(e,n),"/DM":()=>M.sepDM,"/ED":()=>M.sepED,"/HM":()=>M.sepHM,"/MY":()=>M.sepMY},Te=(e=>(n=Date.now(),o=!1)=>{let t=be(n);return o&&(t=new Date(t.getTime()+t.getTimezoneOffset()*ve)),e.map(r=>{var s;return W(r)?r.startsWith("\\")?r.substring(1):((s=C[r])==null?void 0:s.call(C,t,o))??r:Ce(r)?r(t,o):r}).join("")})(["yyyy","MM","dd","-","HH","mm","ss"]),J=Symbol(),L=Array.isArray,Fe=e=>typeof e=="function",Z=Object.getPrototypeOf,B=e=>{let n;return e!=null&&typeof e=="object"&&((n=Z(e))===null||Z(n)===null)},R=e=>typeof e=="string",Oe=((e,n=o=>o!==void 0?": "+o:"")=>class extends Error{constructor(t){super(e(t)+n(t));_e(this,"origMessage");this.origMessage=t!==void 0?String(t):""}})(()=>"illegal argument(s)"),P=e=>{throw new Oe(e)},De=e=>typeof e=="number",Re=new Set(["__proto__","prototype","constructor"]),$=e=>Re.has(e),Pe=e=>L(e)?e.some($):R(e)?e.indexOf(".")!==-1?e.split(".").some($):$(e):!1,K=e=>L(e)?(e.every(n=>R(n)||De(n))||Q(e),e):R(e)?e.length>0?e.split("."):[]:e!=null?[e]:[],ke=(e,n)=>{if(e==null)return!1;n=K(n);for(let o=n.length-1,t=0;t<=o;t++){const r=n[t];if(!e.hasOwnProperty(r)||(e=e[r],e==null&&t<o))return!1}return!0},ze=e=>{const n=K(e);return Pe(n)&&Q(e),n},Q=e=>P(`illegal path: ${JSON.stringify(e)}`);function He(e){const n=ze(e);let[o,t,r,s]=n;switch(n.length){case 0:return(i,c)=>c;case 1:return(i,c)=>i?(i[o]=c,i):void 0;case 2:return(i,c)=>{let a;return i&&(a=i[o])?(a[t]=c,i):void 0};case 3:return(i,c)=>{let a;return i&&(a=i[o])&&(a=a[t])?(a[r]=c,i):void 0};case 4:return(i,c)=>{let a;return i&&(a=i[o])&&(a=a[t])&&(a=a[r])?(a[s]=c,i):void 0};default:return(i,c)=>{let a=i;const f=n.length-1;for(let u=0;u<f;u++)if(!(a=a[n[u]]))return;return a[n[f]]=c,i}}}const j=(e,n,o)=>He(n)(e,o),Ie=/^(function\s+\w+)?\s*\(\{([\w\s,:]+)\}/;function ee(e,n){const o={prefix:"@",unwrap:!0,...n};return B(e)?ne(e,o):L(e)?te(e,o):e}const ne=(e,n,o,t=[],r={},s=[])=>{o=o||e;for(let i in e)E(o,[...t,i],r,s,n);return!n.unwrap||t.length?e:le(e,r)},te=(e,n,o,t=[],r={},s=[])=>{o=o||e;for(let i=0,c=e.length;i<c;i++)E(o,[...t,i],r,s,n);return!n.unwrap||t.length?e:le(e,r)},E=(e,n,o,t,r)=>{const s=n.join("/");t.indexOf(s)>=0&&P(`cyclic references not allowed: ${s}`);let[i,c]=ie(e,n);if(!o[s]){if(c)return o[s]=!0,i;let a=J;t.push(s),B(i)?ne(i,{...r,unwrap:!1},e,n,o,t):L(i)?te(i,{...r,unwrap:!1},e,n,o,t):!r.onlyFnRefs&&R(i)&&i.startsWith(r.prefix)?a=E(e,oe(n,i,r.prefix.length),o,t,r):Fe(i)?a=$e(i,f=>E(e,oe(n,f,0),o,t,r),s,o):ke(e,n)||(i=Be(e,n,o,t,r)),a!==J&&(j(e,n,a),i=a),o[s]=!0,t.pop()}return i},Be=(e,n,o,t,r)=>{let s=t.pop(),i;for(let c=1,a=n.length;c<=a;c++)i=E(e,n.slice(0,c),o,t,r);return t.push(s),i},$e=(e,n,o,t)=>{const r=Ie.exec(e.toString());let s;if(r){const i=r[2].replace(/\s|(,\s*$)/g,"").split(/,/g).map(c=>c.split(":")[0]).reduce((c,a)=>(c[a]=n(a),c),{});s=e(i,n)}else s=e(n);return U(s,o,t),s},U=(e,n,o)=>{o[n]=!0,B(e)?Ue(e,n,o):L(e)&&Ye(e,n,o)},Ue=(e,n,o)=>{let t,r;for(let s in e)t=e[s],r=n+"/"+s,U(t,r,o)},Ye=(e,n,o)=>{let t,r;for(let s=0,i=e.length;s<i;s++)t=e[s],r=n+"/"+s,U(t,r,o)},oe=(e,n,o=1)=>{if(n.charAt(o)==="/")return n.substring(o+1).split("/");e=e.slice(0,e.length-1);const t=n.substring(o).split("/");for(let r=0,s=t.length;r<s;r++)if(t[r]==="..")!e.length&&P(`invalid lookup path: ${n}`),e.pop();else return e.concat(t.slice(r));return!e.length&&P(`invalid lookup path: ${n}`),e};class re{constructor(n){this._value=n}deref(){return this._value}}const ie=(e,n)=>{const o=n.length-1;let t=e,r=e instanceof re;for(let s=0;t!=null&&s<=o;s++)t=t[n[s]],t instanceof re&&(r=!0,t=t.deref());return[t,r]},le=(e,n)=>{for(let o in n){const t=o.split("/"),r=ie(e,t);r[1]&&j(e,t,r[0])}return e},se=1/2**32;class Ne{float(n=1){return this.int()*se*n}probability(n){return this.float()<n}norm(n=1){return(this.int()*se-.5)*2*n}normMinMax(n,o){const t=this.minmax(n,o);return this.float()<.5?t:-t}minmax(n,o){return this.float()*(o-n)+n}minmaxInt(n,o){n|=0;const t=(o|0)-n;return t?n+this.int()%t:n}minmaxUint(n,o){n>>>=0;const t=(o>>>0)-n;return t?n+this.int()%t:n}}const Y=Math.random;class qe extends Ne{int(){return Y()*4294967296>>>0}float(n=1){return Y()*n}norm(n=1){return(Y()-.5)*2*n}}const Xe=new qe,{sin:k,cos:N,floor:w,ceil:We,abs:T,sqrt:Ge,atan2:Ve,pow:ce,random:b}=Math,ae=[(e,n)=>(e^n)===e+n||e>>n===e+n,(e,n)=>e+n<e^n&&(e+n)%4,(e,n)=>(e+~n)%n<<2,(e,n)=>(e^n)%We(b()*10),(e,n)=>k(n*e)>.5||T(e-n)%2>.5,(e,n)=>n%5>1&&(e^n)>2,(e,n)=>e%3>0&&n%4>1,(e,n)=>(e&n)===0,(e,n)=>(e|n)!==e+n,(e,n)=>(e&n^(e|n))%3>0,(e,n)=>(e^n<<1)%7<3,(e,n)=>(e*n^e+n)%8>4,(e,n)=>(e&n<<2)>(n&e<<1),(e,n)=>w(k(e*.3)*N(n*.3)*4)%2,(e,n)=>(w(e*N(n*.2))+n)%5<2,(e,n)=>T(k(e*n*.1))>.6,(e,n)=>(e*e+n*n)%13<6,(e,n)=>w(Ge(e*e+n*n))%3===0,(e,n)=>Ve(n,e)*10%6<3,(e,n)=>(e*3+n*5)%11>(e+n*2)%7,(e,n)=>((e^n)+(e&n))%9<4,(e,n)=>((e>>1)+(n>>2))%2!==((e>>2)+(n>>1))%2,(e,n)=>(w(e/3)+w(n/2))%3===1,(e,n)=>(e+1)*(n+1)%7<3,(e,n)=>(e*n+e+n+1)%6!==0,(e,n)=>(e%4===0||n%4===0)&&(e+n)%8<4,(e,n)=>(e>>1^n>>1)%3>0&&(e+n)%5<3,(e,n)=>(e^n)%w(b()*16+4)<w(b()*8+2),(e,n)=>k(e*b()*2)*N(n*b()*3)>b()-.5,(e,n)=>(e+n)*b()*10%7<3,(e,n)=>T(e-n)%6<2||(e+n)%8<3,(e,n)=>(T(e-10)+T(n-10))%7<3,(e,n)=>(e<<1|n>>1)%5>(n<<1|e>>1)%3,(e,n)=>(e&10^n&12)!==0,(e,n)=>(e.toString(2).split("1").length+n.toString(2).split("1").length)%3>0,(e,n)=>(e+n)%3===0!=(e*n%5===0),(e,n)=>(e*(e+1)/2+n)%8<4,(e,n)=>(ce(e,2)+ce(n,2))%10<5],{floor:Je,ceil:Ze,min:q,max:ue,abs:F,sqrt:x}=Math,fe=(e,n)=>e.sort((o,t)=>n()>.5),Ke=(e,n)=>e[0]+n*(e[1]-e[0]),X=e=>{if(e.length===0)return e;let n=1/0,o=1/0,t=-1/0,r=-1/0;e.forEach(([a,f,u,m])=>{n=q(n,a),o=q(o,f),t=ue(t,a+u),r=ue(r,f+m)});const s=t-n,i=r-o,c=q(1/s,1/i);return e.map(([a,f,u,m])=>[(a-n)*c,(f-o)*c,u*c,m*c])},me=[(e,n)=>{const o=1/x(e),t=o*.25,r=o,s=[];let i=0;for(;i<1;){const c=F(.5-i)/.5,a=1-c*c,f=t+(r-t)*a;let u=0;for(;u<1;){const m=F(.5-u)/.5,g=1-m*m,d=t+(r-t)*g;s.push([i,u,f,d]),u+=d}i+=f}return X(s)},(e,n)=>{const o=1/x(e),t=o*.25,r=o,s=[];let i=0;for(;i<1;){const c=F(.5-i)/.5,a=c*c,f=t+(r-t)*a;let u=0;for(;u<1;){const m=F(.5-u)/.5,g=m*m,d=t+(r-t)*g;s.push([i,u,f,d]),u+=d}i+=f}return X(s)},(e,n)=>{const o=x(e),t=1/o,r=t*.25,s=t*2,i=[];let c=0,a=0;for(;c<=1;){const u=F(.5-c)/.5,m=u*u,g=r+(s-r)*m;i.push(g),c+=g}i.forEach((u,m)=>i[m]=u/=c);const f=[];for(let u=0;u<i.length;u++){const m=[];for(let h=0;h<x(e);h++)m.push(Ke([.05,.95],n())*o);const g=m.reduce((h,v)=>h+=v,0);m.forEach((h,v)=>{m[v]/=g});const[d,D]=m.reduce((h,v)=>[[...h[0],[h[1],a,v,i[u]]],h[1]+v],[[],0]);a+=i[u],f.push(...d)}return f},(e,n)=>{const o=(r,s,i)=>{if(i[r]===void 0)return i;const[c,a,f,u]=i[r],m=1/Ze(1+n()*4);let g=[];if(s){const d=fe([f*m,f*(1-m)],n);g=[[c,a,d[0],u],[c+d[0],a,d[1],u]]}else{const d=fe([u*m,u*(1-m)],n);g=[[c,a,f,d[0]],[c,a+d[0],f,d[1]]]}return i.splice(r,1),i.push(...g),i};let t=[[0,0,1,1]];for(let r=0;r<x(e);r++)t=o(Je(n()*t.length),n()>.5,t);return t},(e,n)=>{const o=x(e),t=1/o,r=[];for(let s=0;s<o;s++)for(let i=0;i<o;i++)r.push([s*t,i*t,t,t]);return X(r)}],{floor:de,ceil:ge,min:Sn,max:wn,round:bn,abs:Mn}=Math,he=(e,n,o,t,r)=>(e-n)/(o-n)*(r-t)+t,Qe=e=>{const n=Xe;return ee({RND:n,...e,margin:({width:o,height:t})=>{const r=n.minmax(.001,.05);return[r,o/t*r]},gridSize:()=>[2+ge(n.float()*3),2+ge(n.float()*3)],ruleIdx:()=>de(ae.length*n.float()),cells:()=>(o,t=[])=>{const r=Array.from(Array(me.length)).map((i,c)=>c).filter(i=>!t.includes(i)),s=de(n.float()*r.length);return[r[s],me[r[s]](o,()=>n.float())]},pattern:({gridSize:o,cells:t})=>{const[r,s]=t(o[0],[]);return{type:r,elem:s}},grid:({gridSize:o,cells:t,pattern:r,margin:s})=>{const[i,c]=t(o[1],[r.type]);return c}},{onlyFnRefs:!0})},je=e=>ee({...Qe(e),...e,rule:({ruleIdx:n})=>ae[n],subcells:({grid:n,pattern:o,rule:t,RND:r,margin:s})=>{const i=[],c=[],a=[];s.map(f=>1-f*2);for(let f=0;f<n.length;f++){const[u,m,g,d]=n[f];for(let D=0;D<o.elem.length;D++){const[h,v,sn,cn]=o.elem[D],S=[he(u+h*g,0,1,-.5,.5),he(m+v*d,0,1,-.5,.5),g*sn,d*cn];t(f,D)?(i.push(S),c.push(0),r.float()>.5&&a.push([r.minmax(S[0],S[0]+S[2]),r.minmax(S[1],S[1]+S[3]),5])):(i.push(S),c.push(1))}}return{cells:i,cellType:c,lights:a}}},{onlyFnRefs:!0}),en=()=>{const e=document.getElementById("infobox");e!=null&&e.classList.toggle("active")},nn=()=>{window.openOffFrame=()=>{document.body.classList.toggle("openedOffWindow")},window.back=()=>{document.referrer&&document.referrer.indexOf(location.protocol+"//"+location.host)>-1?history.back():window.location.href="/"};const e=document.querySelectorAll("button[data-action]");if(typeof e<"u")for(let n=0;n<e.length;n++){const o=e[n].getAttribute("data-action");e[n].addEventListener("click",function(){const t=window[o];typeof t!="function"?console.log(o," is not defined"):t()},!1)}},pe=(e,n,o)=>{const t=e.createShader(n);return e.shaderSource(t,o),e.compileShader(t),e.getShaderParameter(t,e.COMPILE_STATUS)?t:(console.error("Shader compile failed:",e.getShaderInfoLog(t)),e.deleteShader(t),null)},tn=(e,n,o)=>{const t=e.createProgram();return e.attachShader(t,n),e.attachShader(t,o),e.linkProgram(t),e.getProgramParameter(t,e.LINK_STATUS)?t:(console.error("Program link failed:",e.getProgramInfoLog(t)),null)};var on=`precision mediump float;

attribute vec3 a_position;

void main() {
    vec4 positionVec4 = vec4(a_position, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}`,rn=`precision highp float;

#ifdef GL_ES
precision lowp float;
#endif

#define MAX_STEPS 64
#define MAX_DIST 5.0
#define SURF_DIST 0.001

#define MAX_CELLS 256
#define MAX_LIGHTS 12

uniform vec2 u_resolution;

uniform vec4 u_cells[MAX_CELLS];     
uniform float u_cellType[MAX_CELLS]; 
uniform int u_cellCount;

uniform float u_depthA; 
uniform float u_depthB; 
uniform vec3 u_colorA;
uniform vec3 u_colorB;

uniform vec3 u_lightPos[MAX_LIGHTS];
uniform vec3 u_lightColor;
uniform int u_lightCount;

uniform float u_time;

float sdCube(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0, s,
        0, 1, 0,
        -s, 0, c
    );
}
mat3 rotateX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
        1, 0, 0,
        0, c, -s,
        0, s, c
    );
}

vec2 iBox(vec3 ro, vec3 rd, vec3 rad) {
    vec3 m = 1.0 / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * rad;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    return vec2(max(max(t1.x, t1.y), t1.z),
        min(min(t2.x, t2.y), t2.z));
}

vec4 map(vec3 p) {
    float d = MAX_DIST;
    int hitCell = -1;
    float cellType = 0.0;
    p *= rotateY(radians(u_time));
    

    for (int i = 0; i < MAX_CELLS; i++) {
        if (i >= u_cellCount) break;

        vec4 c = u_cells[i];

        float depth = mix(u_depthA, u_depthB, u_cellType[i]);

        vec3 center = vec3(
            c.x + c.z * 0.5,
            c.y + c.w * 0.5,
            depth * 0.33
        );

        vec3 size = vec3(c.z * 0.94, c.w * 0.94, 0.33); 

        float dBox = sdCube(p - center, size * 0.5);

        if (dBox < d) {
            d = dBox;
            hitCell = i;
            cellType = u_cellType[i];
        }
    }

    return vec4(d, 1.0, 1.0, cellType);
}

vec3 calcNormal(vec3 pos) {
    vec3 eps = vec3(.001, 0., 0.);
    return normalize(vec3(
        map(pos + eps.xyy).x - map(pos - eps.xyy).x,
        map(pos + eps.yxy).x - map(pos - eps.yxy).x,
        map(pos + eps.yyx).x - map(pos - eps.yyx).x)
    );
}

vec4 intersect(vec3 ro, vec3 rd) {
    vec2 bb = iBox(ro, rd, vec3(8.05));
    if (bb.y < bb.x) return vec4(-1.0);

    float tmin = bb.x;
    float tmax = bb.y;

    float t = tmin;
    vec4 res = vec4(-1.0);
    for (int i = 0; i < 64; i++) {
        vec4 h = map(ro + rd * t);
        if (h.x < 0.002 || t > tmax) break;
        res = vec4(t, h.yzw);
        t += h.x;
    }
    if (t > tmax) res = vec4(-1.0);
    return res;
}

float softshadow(in vec3 ro, in vec3 rd, float mint, float k) {
    vec2 bb = iBox(ro, rd, vec3(8.05));
    float tmax = bb.y;

    float res = 1.0;
    float t = mint;
    for (int i = 0; i < 64; i++) {
        float h = map(ro + rd * t).x;
        res = min(res, k * h / t);
        if (res < 0.001) break;
        t += clamp(h, 0.005, 0.1);
        if (t > tmax) break;
    }
    return clamp(res, 0.0, 1.0);
}

void main() {
    vec2 st = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    float camAngle = u_time * 0.5;
    float camDist = 1.125;
    vec3 rayOrigin = vec3(
        camDist * cos(camAngle),
        0.5,
        camDist * sin(camAngle)
    );
    vec3 target = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(target - rayOrigin);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    vec3 rayDir = normalize(forward + st.x * right + st.y * up);

    vec3 col = vec3(0.01);
    vec4 tmat = intersect(rayOrigin, rayDir);

    if (tmat.x > 0.) {
        vec3 pos = rayOrigin + tmat.x * rayDir;
        vec3 nor = calcNormal(pos);
        vec3 matcol = vec3(0.95);
        
        
        

        float occ = tmat.y * 3.;

        const vec3 light = normalize(vec3(-7., 1., -1.));
        float dif = dot(nor, light);
        float sha = 1.;
        if (dif > 0.) sha = softshadow(pos, light, .01, 64.);
        dif = max(dif, 0.);
        vec3 hal = normalize(light - rayDir);
        float spe = dif * sha *
                pow(clamp(dot(hal, nor), 0., 1.), 16.) *
                (.3 + .6 * pow(clamp(1. - dot(hal, light), 0., 1.), 5.));

        float sky = 0.5 + 0.5 * nor.y;
        float bac = max(
                0.1 + 0.9 * dot(nor, vec3(-light.x, light.y, -light.z)),
                0.0);

        vec3 lin = vec3(0.0);
        lin += 1. * dif * vec3(1.1, .85, .6) * sha;
        lin += .5 * sky * vec3(.1, .2, .4) * occ;
        lin += .1 * bac * vec3(1., 1., 1.) * (.5 + .5 * occ);
        lin += .25 * occ * vec3(.15, .17, .2);
        col = matcol * lin + spe * 128.0;
    }
    col = 1.5 * col / (1. + col);
    col = sqrt(col);
    gl_FragColor = vec4(col, 1.);
}`;const[z,H]=[window.innerWidth,window.innerHeight],ln=document.getElementById("windowFrame"),O=document.createElement("canvas");document.getElementById("loading");let ye=null;ln.appendChild(O);const l={gl:O.getContext("webgl",{preserveDrawingBuffer:!0}),frame:0,frameRequest:null,uniforms:{},init:()=>{if(ye=je({width:z,height:H}),!l.gl){console.error("WebGL not supported");return}O.width=z,O.height=H,l.gl.viewport(0,0,z,H);const e=pe(l.gl,l.gl.VERTEX_SHADER,on),n=pe(l.gl,l.gl.FRAGMENT_SHADER,rn),o=tn(l.gl,e,n);l.gl.useProgram(o);const t=l.gl.createBuffer(),r=new Float32Array([-1,-1,1,-1,-1,1,1,1]),s=l.gl.getAttribLocation(o,"a_position");l.uniforms={resolution:l.gl.getUniformLocation(o,"u_resolution"),cellCount:l.gl.getUniformLocation(o,"u_cellCount"),cells:l.gl.getUniformLocation(o,"u_cells"),cellType:l.gl.getUniformLocation(o,"u_cellType"),depthA:l.gl.getUniformLocation(o,"u_depthA"),depthB:l.gl.getUniformLocation(o,"u_depthB"),colorA:l.gl.getUniformLocation(o,"u_colorA"),colorB:l.gl.getUniformLocation(o,"u_colorB"),lightPos:l.gl.getUniformLocation(o,"u_lightPos"),lightColor:l.gl.getUniformLocation(o,"u_lightColor"),lightCount:l.gl.getUniformLocation(o,"u_lightCount"),time:l.gl.getUniformLocation(o,"u_time")},l.gl.bindBuffer(l.gl.ARRAY_BUFFER,t),l.gl.bufferData(l.gl.ARRAY_BUFFER,r,l.gl.STATIC_DRAW),l.gl.enableVertexAttribArray(s),l.gl.vertexAttribPointer(s,2,l.gl.FLOAT,!1,0,0),l.gl.disable(l.gl.DEPTH_TEST),l.gl.enable(l.gl.BLEND),l.gl.clearColor(1,1,1,1),l.frameRequest&&cancelAnimationFrame(l.frameRequest),l.render()},render:()=>{const{subcells:e}=ye;l.frame++,l.gl.clear(l.gl.COLOR_BUFFER_BIT),l.gl.uniform2f(l.uniforms.resolution,z,H),l.gl.uniform1i(l.uniforms.cellCount,e.cells.length),l.gl.uniform4fv(l.uniforms.cells,e.cells.reduce((n,o)=>[...n,...o],[])),l.gl.uniform1fv(l.uniforms.cellType,e.cellType.flat()),l.gl.uniform1f(l.uniforms.depthA,.25),l.gl.uniform1f(l.uniforms.depthB,.5),l.gl.uniform3f(l.uniforms.colorA,0,.1,1),l.gl.uniform3f(l.uniforms.colorB,1,0,0),l.gl.uniform3fv(l.uniforms.lightPos,e.lights.reduce((n,o)=>[...n,...o],[])),l.gl.uniform3f(l.uniforms.lightColor,1,1,1),l.gl.uniform1i(l.uniforms.lightCount,e.lights.length),l.gl.drawArrays(l.gl.TRIANGLE_STRIP,0,4),l.gl.uniform1f(l.uniforms.time,l.frame*.01),l.frameRequest=requestAnimationFrame(l.render)}};l.init(),window.init=l.init,window.exportJPG=()=>{downloadCanvas(O,`2026 01 24-${Te()}`,"jpeg",1)},window.infobox=en,nn()})();
