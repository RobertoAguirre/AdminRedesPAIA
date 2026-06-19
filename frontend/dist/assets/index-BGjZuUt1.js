(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function c(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(a){if(a.ep)return;a.ep=!0;const r=c(a);fetch(a.href,r)}})();const B="/api";function F(){return localStorage.getItem("token")}function H(e,t){localStorage.setItem("token",e),localStorage.setItem("user",JSON.stringify(t))}function M(){localStorage.removeItem("token"),localStorage.removeItem("user")}function T(){const e=localStorage.getItem("user");return e?JSON.parse(e):null}async function b(e,t={}){const c={"Content-Type":"application/json",...t.headers},l=F();l&&(c.Authorization=`Bearer ${l}`);const a=await fetch(`${B}${e}`,{...t,headers:c}),r=await a.json().catch(()=>({}));if(!a.ok)throw new Error(r.error||"Error en la solicitud");return r}const m={register:e=>b("/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>b("/auth/login",{method:"POST",body:JSON.stringify(e)}),me:()=>b("/auth/me"),getAccounts:()=>b("/accounts"),getPlatforms:()=>b("/accounts/platforms"),createAccount:e=>b("/accounts",{method:"POST",body:JSON.stringify(e)}),updateAccount:(e,t)=>b(`/accounts/${e}`,{method:"PATCH",body:JSON.stringify(t)}),deleteAccount:e=>b(`/accounts/${e}`,{method:"DELETE"}),getPosts:e=>b(e?`/posts?status=${e}`:"/posts"),getStats:()=>b("/posts/stats"),getPost:e=>b(`/posts/${e}`),createPost:e=>b("/posts",{method:"POST",body:JSON.stringify(e)}),updatePost:(e,t)=>b(`/posts/${e}`,{method:"PATCH",body:JSON.stringify(t)}),publishPost:e=>b(`/posts/${e}/publish`,{method:"POST"}),deletePost:e=>b(`/posts/${e}`,{method:"DELETE"})};function R(e,t,c,l,a){const r=[{id:"dashboard",label:"Panel",icon:"📊"},{id:"posts",label:"Publicaciones",icon:"📝"},{id:"create",label:"Crear",icon:"✏️"},{id:"accounts",label:"Cuentas",icon:"🔗"}];return`
    <div class="flex min-h-screen">
      <aside class="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white lg:block">
        <div class="flex h-full flex-col p-4">
          <div class="mb-8 px-2">
            <h1 class="text-lg font-bold text-brand-700">AdminRedes</h1>
            <p class="text-xs text-slate-400">Zona horaria: CDMX</p>
          </div>
          <nav class="flex-1 space-y-1">${r.map(s=>`
      <button data-nav="${s.id}"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
        ${t===s.id?"bg-brand-50 text-brand-700":"text-slate-600 hover:bg-slate-100"}">
        <span>${s.icon}</span> ${s.label}
      </button>
    `).join("")}</nav>
          <div class="border-t border-slate-100 pt-4">
            <p class="truncate px-2 text-sm font-medium">${e.name}</p>
            <p class="truncate px-2 text-xs text-slate-400">${e.email}</p>
            <button id="logout-btn" class="btn-secondary mt-3 w-full text-xs">Cerrar sesión</button>
          </div>
        </div>
      </aside>

      <div class="flex flex-1 flex-col">
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <h1 class="font-bold text-brand-700">AdminRedes</h1>
          <select id="mobile-nav" class="input w-auto text-sm">
            ${r.map(s=>`<option value="${s.id}" ${t===s.id?"selected":""}>${s.label}</option>`).join("")}
          </select>
        </header>
        <main class="flex-1 p-4 lg:p-8">${c}</main>
      </div>
    </div>
  `}function _(e,t,c){var a;e.querySelectorAll("[data-nav]").forEach(r=>{r.addEventListener("click",()=>t(r.dataset.nav))});const l=e.querySelector("#mobile-nav");l&&l.addEventListener("change",r=>t(r.target.value)),(a=e.querySelector("#logout-btn"))==null||a.addEventListener("click",()=>{M(),c()})}const $={facebook:{label:"Facebook",color:"bg-blue-100 text-blue-800",icon:"📘"},instagram:{label:"Instagram",color:"bg-pink-100 text-pink-800",icon:"📷"},x:{label:"X",color:"bg-slate-100 text-slate-800",icon:"𝕏"},linkedin:{label:"LinkedIn",color:"bg-sky-100 text-sky-800",icon:"💼"},tiktok:{label:"TikTok",color:"bg-purple-100 text-purple-800",icon:"🎵"},youtube:{label:"YouTube",color:"bg-red-100 text-red-800",icon:"▶️"}},J={draft:{label:"Borrador",color:"bg-slate-100 text-slate-700"},scheduled:{label:"Programada",color:"bg-amber-100 text-amber-800"},published:{label:"Publicada",color:"bg-green-100 text-green-800"},failed:{label:"Fallida",color:"bg-red-100 text-red-800"}};function O(e){return e?new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Mexico_City"}).format(new Date(e)):"—"}function C(e){const t=$[e]||{label:e,color:"bg-slate-100 text-slate-700",icon:"🌐"};return`<span class="badge ${t.color}">${t.icon} ${t.label}</span>`}function N(e){const t=J[e]||{label:e,color:"bg-slate-100 text-slate-700"};return`<span class="badge ${t.color}">${t.label}</span>`}function u(e,t="info"){const c={info:"bg-slate-800",success:"bg-green-600",error:"bg-red-600"},l=document.createElement("div");l.className=`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${c[t]}`,l.textContent=e,document.body.appendChild(l),setTimeout(()=>l.remove(),3500)}function k(e){return window.confirm(e)}function U(e){let t="login";function c(){const a=t==="register";return`
      <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-4">
        <div class="card w-full max-w-md">
          <div class="mb-6 text-center">
            <h1 class="text-2xl font-bold text-slate-900">AdminRedes</h1>
            <p class="mt-1 text-sm text-slate-500">Administra y publica en tus redes sociales</p>
          </div>

          <div class="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            <button type="button" id="tab-login"
              class="rounded-md px-3 py-2 text-sm font-medium transition ${a?"text-slate-500 hover:text-slate-700":"bg-white text-brand-700 shadow-sm"}">
              Iniciar sesión
            </button>
            <button type="button" id="tab-register"
              class="rounded-md px-3 py-2 text-sm font-medium transition ${a?"bg-white text-brand-700 shadow-sm":"text-slate-500 hover:text-slate-700"}">
              Registrarse
            </button>
          </div>

          <form id="auth-form" class="space-y-4">
            <div id="name-field" class="${a?"":"hidden"}">
              <label class="mb-1 block text-sm font-medium">Nombre</label>
              <input name="name" type="text" class="input" placeholder="Tu nombre"
                ${a?"required":""} />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Correo electrónico</label>
              <input name="email" type="email" required class="input" placeholder="tu@correo.com" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Contraseña</label>
              <input name="password" type="password" required minlength="6" class="input"
                placeholder="Mínimo 6 caracteres" />
            </div>
            <div id="confirm-field" class="${a?"":"hidden"}">
              <label class="mb-1 block text-sm font-medium">Confirmar contraseña</label>
              <input name="confirmPassword" type="password" minlength="6" class="input"
                placeholder="Repite tu contraseña" ${a?"required":""} />
            </div>

            <button type="submit" class="btn-primary w-full" id="auth-submit">
              ${a?"Crear cuenta":"Iniciar sesión"}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-slate-500">
            ${a?'¿Ya tienes cuenta? <button type="button" id="switch-login" class="font-medium text-brand-600 hover:underline">Inicia sesión</button>':'¿Eres nuevo? <button type="button" id="switch-register" class="font-medium text-brand-600 hover:underline">Regístrate gratis</button>'}
          </p>
        </div>
      </div>
    `}function l(a,r){var o,n,d,p;const i=a.querySelector("#auth-form"),s=a.querySelector("#auth-submit");(o=a.querySelector("#tab-login"))==null||o.addEventListener("click",()=>{t="login",r()}),(n=a.querySelector("#tab-register"))==null||n.addEventListener("click",()=>{t="register",r()}),(d=a.querySelector("#switch-login"))==null||d.addEventListener("click",()=>{t="login",r()}),(p=a.querySelector("#switch-register"))==null||p.addEventListener("click",()=>{t="register",r()}),i==null||i.addEventListener("submit",async h=>{var y;h.preventDefault();const g=new FormData(i),f=Object.fromEntries(g.entries());if(t==="register"){if(!((y=f.name)!=null&&y.trim())){u("El nombre es obligatorio","error");return}if(f.password!==f.confirmPassword){u("Las contraseñas no coinciden","error");return}}try{s.disabled=!0,s.textContent=t==="register"?"Creando cuenta...":"Entrando...";const x=t==="register"?await m.register({name:f.name.trim(),email:f.email,password:f.password}):await m.login({email:f.email,password:f.password});H(x.token,x.user),u(t==="register"?`Cuenta creada. Bienvenido, ${x.user.name}`:`Bienvenido, ${x.user.name}`,"success"),e()}catch(x){u(x.message,"error")}finally{s.disabled=!1,s.textContent=t==="register"?"Crear cuenta":"Iniciar sesión"}})}return{html:c(),bind(a,r){l(a,()=>{a.innerHTML=c(),l(a,r)})}}}async function L(){try{const[{stats:e},{accounts:t},{posts:c}]=await Promise.all([m.getStats(),m.getAccounts(),m.getPosts()]),l=c.slice(0,5),a=t.filter(i=>i.isActive).length,r=l.length?l.map(i=>`
          <div class="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">${i.title||i.content.slice(0,60)}</p>
              <p class="mt-1 text-xs text-slate-400">${O(i.createdAt)}</p>
            </div>
            ${N(i.status)}
          </div>
        `).join(""):'<p class="py-4 text-sm text-slate-400">Aún no hay publicaciones</p>';return`
      <div>
        <h2 class="text-2xl font-bold">Panel de control</h2>
        <p class="mt-1 text-slate-500">Resumen de tu actividad en redes sociales</p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${S("Total",e.total,"📋")}
          ${S("Borradores",e.drafts,"📝")}
          ${S("Programadas",e.scheduled,"⏰")}
          ${S("Publicadas",e.published,"✅")}
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
          <div class="card">
            <h3 class="font-semibold">Publicaciones recientes</h3>
            <div class="mt-4">${r}</div>
          </div>
          <div class="card">
            <h3 class="font-semibold">Cuentas conectadas</h3>
            <p class="mt-2 text-3xl font-bold text-brand-600">${a}</p>
            <p class="text-sm text-slate-500">de ${t.length} cuentas registradas</p>
            ${t.length?`<div class="mt-4 flex flex-wrap gap-2">${t.map(i=>C(i.platform)).join("")}</div>`:'<p class="mt-4 text-sm text-slate-400">Conecta tus cuentas para empezar a publicar</p>'}
          </div>
        </div>
      </div>
    `}catch(e){return X(e.message)}}function S(e,t,c){return`
    <div class="card">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500">${e}</p>
        <span class="text-xl">${c}</span>
      </div>
      <p class="mt-2 text-3xl font-bold">${t}</p>
    </div>
  `}function X(e){return`<div class="card text-red-600">${e}</div>`}let q="";async function z(e,t){const c=q;async function l(){try{const{posts:s}=await m.getPosts(c||void 0),o=s.length?s.map(n=>`
            <tr class="border-b border-slate-100 hover:bg-slate-50">
              <td class="px-4 py-3">
                <p class="font-medium">${I(n.title||"Sin título")}</p>
                <p class="mt-0.5 max-w-md truncate text-xs text-slate-400">${I(n.content)}</p>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">${n.platforms.map(C).join("")}</div>
              </td>
              <td class="px-4 py-3">${N(n.status)}</td>
              <td class="px-4 py-3 text-sm text-slate-500">${O(n.scheduledAt||n.createdAt)}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  ${n.status!=="published"?`<button data-publish="${n._id}" class="text-xs font-medium text-brand-600 hover:underline">Publicar</button>`:""}
                  <button data-delete="${n._id}" class="text-xs font-medium text-red-600 hover:underline">Eliminar</button>
                </div>
              </td>
            </tr>
          `).join(""):'<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No hay publicaciones</td></tr>';return`
        <div>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold">Publicaciones</h2>
              <p class="mt-1 text-slate-500">Administra borradores, programadas y publicadas</p>
            </div>
            <button id="new-post" class="btn-primary">Nueva publicación</button>
          </div>

          <div class="mt-6 flex flex-wrap gap-2">
            ${a("","Todas")}
            ${a("draft","Borradores")}
            ${a("scheduled","Programadas")}
            ${a("published","Publicadas")}
            ${a("failed","Fallidas")}
          </div>

          <div class="card mt-4 overflow-x-auto p-0">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">Contenido</th>
                  <th class="px-4 py-3">Redes</th>
                  <th class="px-4 py-3">Estado</th>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>${o}</tbody>
            </table>
          </div>
        </div>
      `}catch(s){return`<div class="card text-red-600">${s.message}</div>`}}function a(s,o){return`<button data-filter="${s}" class="rounded-lg px-3 py-1.5 text-sm font-medium transition ${c===s?"bg-brand-600 text-white":"bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}">${o}</button>`}const r=await l();function i(s){var o;(o=s.querySelector("#new-post"))==null||o.addEventListener("click",()=>e("create")),s.querySelectorAll("[data-filter]").forEach(n=>{n.addEventListener("click",()=>{q=n.dataset.filter,t()})}),s.querySelectorAll("[data-publish]").forEach(n=>{n.addEventListener("click",async()=>{if(k("¿Publicar ahora en las cuentas seleccionadas?"))try{n.disabled=!0,await m.publishPost(n.dataset.publish),u("Publicación enviada","success"),t()}catch(d){u(d.message,"error")}})}),s.querySelectorAll("[data-delete]").forEach(n=>{n.addEventListener("click",async()=>{if(k("¿Eliminar esta publicación?"))try{await m.deletePost(n.dataset.delete),u("Publicación eliminada","success"),t()}catch(d){u(d.message,"error")}})})}return{html:r,bind:i}}function I(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function G(e){try{let i=function(s,o){var p;const n=s.querySelector("#create-form");let d=!1;(p=s.querySelector("#save-and-publish"))==null||p.addEventListener("click",()=>{d=!0,n.requestSubmit()}),n.addEventListener("submit",async h=>{h.preventDefault();const g=new FormData(n),f=g.getAll("accountIds");if(!f.length){u("Selecciona al menos una cuenta","error");return}const y={title:g.get("title"),content:g.get("content"),mediaUrl:g.get("mediaUrl"),accountIds:f},x=g.get("scheduledAt");x&&(y.scheduledAt=new Date(x).toISOString());try{n.querySelectorAll("button").forEach(D=>D.disabled=!0);const{post:j}=await m.createPost(y);d&&!x?(await m.publishPost(j._id),u("Publicación creada y enviada","success")):u(x?"Publicación programada":"Borrador guardado","success"),e("posts")}catch(A){u(A.message,"error"),d=!1}finally{n.querySelectorAll("button").forEach(A=>A.disabled=!1),d=!1}})};var t=i;const{accounts:c}=await m.getAccounts(),l=c.filter(s=>s.isActive);return l.length?{html:`
      <div class="max-w-2xl">
        <h2 class="text-2xl font-bold">Nueva publicación</h2>
        <p class="mt-1 text-slate-500">Crea contenido y elige dónde publicarlo</p>

        <form id="create-form" class="card mt-6 space-y-5">
          <div>
            <label class="mb-1 block text-sm font-medium">Título (opcional)</label>
            <input name="title" type="text" class="input" placeholder="Ej. Promoción de verano" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Contenido *</label>
            <textarea name="content" required rows="5" class="input" placeholder="Escribe el texto de tu publicación..."></textarea>
            <p class="mt-1 text-xs text-slate-400">Máximo recomendado: 280 caracteres para X, 2200 para Instagram</p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">URL de imagen o video (opcional)</label>
            <input name="mediaUrl" type="url" class="input" placeholder="https://..." />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Programar publicación (opcional)</label>
            <input name="scheduledAt" type="datetime-local" class="input" />
            <p class="mt-1 text-xs text-slate-400">Hora local de Ciudad de México</p>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Cuentas destino *</label>
            <div class="grid gap-2 sm:grid-cols-2">${l.map(s=>{var o,n;return`
        <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
          <input type="checkbox" name="accountIds" value="${s._id}" class="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <span class="text-lg">${((o=$[s.platform])==null?void 0:o.icon)||"🌐"}</span>
          <div>
            <p class="text-sm font-medium">${((n=$[s.platform])==null?void 0:n.label)||s.platform}</p>
            <p class="text-xs text-slate-400">${s.accountName}</p>
          </div>
        </label>
      `}).join("")}</div>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary">Guardar borrador</button>
            <button type="button" id="save-and-publish" class="btn-secondary">Guardar y publicar</button>
          </div>
        </form>
      </div>
    `,bind:i}:{html:`
          <div class="card max-w-lg text-center">
            <p class="text-lg font-medium">No hay cuentas conectadas</p>
            <p class="mt-2 text-sm text-slate-500">Conecta al menos una red social antes de crear publicaciones.</p>
            <button id="go-accounts" class="btn-primary mt-4">Ir a cuentas</button>
          </div>
        `,bind(s){var o;(o=s.querySelector("#go-accounts"))==null||o.addEventListener("click",()=>e("accounts"))}}}catch(c){return{html:`<div class="card text-red-600">${c.message}</div>`,bind(){}}}}async function V(){try{let i=function(s,o){const n=s.querySelector("#account-form");n==null||n.addEventListener("submit",async d=>{d.preventDefault();const p=new FormData(n),h=Object.fromEntries(p.entries());try{n.querySelector("button").disabled=!0,await m.createAccount(h),u("Cuenta conectada","success"),n.reset(),o()}catch(g){u(g.message,"error")}finally{n.querySelector("button").disabled=!1}}),s.querySelectorAll("[data-toggle]").forEach(d=>{d.addEventListener("click",async()=>{const p=d.dataset.active==="true";try{await m.updateAccount(d.dataset.toggle,{isActive:!p}),u(p?"Cuenta desactivada":"Cuenta activada","success"),o()}catch(h){u(h.message,"error")}})}),s.querySelectorAll("[data-delete]").forEach(d=>{d.addEventListener("click",async()=>{if(k("¿Eliminar esta cuenta?"))try{await m.deleteAccount(d.dataset.delete),u("Cuenta eliminada","success"),o()}catch(p){u(p.message,"error")}})})};var e=i;const[{accounts:t},{platforms:c}]=await Promise.all([m.getAccounts(),m.getPlatforms()]),l=t.length?t.map(s=>{var o;return`
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${((o=$[s.platform])==null?void 0:o.icon)||"🌐"}</span>
              <div>
                <p class="font-medium">${s.accountName}</p>
                <div class="mt-1">${C(s.platform)}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs ${s.isActive?"text-green-600":"text-slate-400"}">
                ${s.isActive?"● Activa":"○ Inactiva"}
              </span>
              <button data-toggle="${s._id}" data-active="${s.isActive}" class="btn-secondary text-xs">
                ${s.isActive?"Desactivar":"Activar"}
              </button>
              <button data-delete="${s._id}" class="text-xs font-medium text-red-600 hover:underline">Eliminar</button>
            </div>
          </div>
        `}).join(""):'<p class="py-6 text-sm text-slate-400">Aún no has conectado ninguna cuenta</p>';return{html:`
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold">Cuentas conectadas</h2>
        <p class="mt-1 text-slate-500">Administra las redes sociales vinculadas a tu cuenta</p>

        <form id="account-form" class="card mt-6 space-y-4">
          <h3 class="font-semibold">Conectar nueva cuenta</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">Plataforma</label>
              <select name="platform" required class="input">${c.map(s=>{var o;return`<option value="${s}">${((o=$[s])==null?void 0:o.label)||s}</option>`}).join("")}</select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Nombre de cuenta</label>
              <input name="accountName" required class="input" placeholder="@mi_negocio" />
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">ID de cuenta (opcional)</label>
            <input name="accountId" class="input" placeholder="ID externo de la plataforma" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Token de acceso (opcional)</label>
            <input name="accessToken" type="password" class="input" placeholder="Para integración con APIs reales" />
          </div>
          <button type="submit" class="btn-primary">Conectar cuenta</button>
        </form>

        <div class="card mt-6">
          <h3 class="font-semibold">Tus cuentas</h3>
          <div class="mt-2">${l}</div>
        </div>
      </div>
    `,bind:i}}catch(t){return{html:`<div class="card text-red-600">${t.message}</div>`,bind(){}}}}const w=document.getElementById("app");let E="dashboard";async function v(){const e=T();if(!e){const l=U(()=>v());w.innerHTML=l.html,l.bind(w,()=>v());return}let t="",c=null;switch(E){case"dashboard":t=await L();break;case"posts":{const l=await z(P,v);t=l.html,c=a=>l.bind(a);break}case"create":{const l=await G(P);t=l.html,c=a=>l.bind(a,v);break}case"accounts":{const l=await V();t=l.html,c=a=>l.bind(a,v);break}default:t=await L()}w.innerHTML=R(e,E,t),_(w,P,()=>v()),c&&c(w)}function P(e){E=e,v()}async function Y(){if(T())try{await m.me()}catch{localStorage.clear()}v()}Y();
