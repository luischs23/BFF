document.querySelectorAll(".prepare-btn").forEach(r=>{r.addEventListener("click",async o=>{const e=o.target,d=e.dataset.slug,a=e.textContent;e.textContent="...",e.disabled=!0;try{const t=await fetch("/api/prepare-book",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:d})}),s=await t.json();if(t.ok)e.textContent="✓",e.classList.remove("bg-purple-600","hover:bg-purple-700"),e.classList.add("bg-green-600"),setTimeout(()=>{e.textContent=a,e.classList.remove("bg-green-600"),e.classList.add("bg-purple-600","hover:bg-purple-700"),e.disabled=!1},2e3);else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),e.textContent="✗",e.classList.remove("bg-purple-600","hover:bg-purple-700"),e.classList.add("bg-red-600"),setTimeout(()=>{e.textContent=a,e.classList.remove("bg-red-600"),e.classList.add("bg-purple-600","hover:bg-purple-700"),e.disabled=!1},2e3)}})});document.querySelectorAll(".format-btn").forEach(r=>{r.addEventListener("click",async o=>{const e=o.target,d=e.dataset.slug,a=e.textContent;e.textContent="...",e.disabled=!0;try{const t=await fetch("/api/format-book",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:d})}),s=await t.json();if(t.ok)e.textContent="✓",e.classList.remove("bg-blue-600","hover:bg-blue-700"),e.classList.add("bg-green-600"),setTimeout(()=>{e.textContent=a,e.classList.remove("bg-green-600"),e.classList.add("bg-blue-600","hover:bg-blue-700"),e.disabled=!1},2e3);else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),e.textContent="✗",e.classList.remove("bg-blue-600","hover:bg-blue-700"),e.classList.add("bg-red-600"),setTimeout(()=>{e.textContent=a,e.classList.remove("bg-red-600"),e.classList.add("bg-blue-600","hover:bg-blue-700"),e.disabled=!1},2e3)}})});const l=document.getElementById("consecutiveDialog"),p=document.getElementById("dialogTitle"),g=document.getElementById("dialogContent"),m=document.getElementById("closeDialog"),u=document.getElementById("closeDialogBtn"),n=document.getElementById("fixVersesBtn");let b="";m.addEventListener("click",()=>l.close());u.addEventListener("click",()=>l.close());l.addEventListener("click",r=>{r.target===l&&l.close()});n.addEventListener("click",async()=>{if(!b)return;const r=n.textContent;n.textContent="Corrigiendo...",n.disabled=!0;try{const o=await fetch("/api/fix-verses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:b})}),e=await o.json();if(o.ok)g.innerHTML=`
					<div class="text-center py-8">
						<div class="text-6xl mb-4">✅</div>
						<p class="text-green-600 font-bold text-lg">¡Corrección completada!</p>
						<p class="text-gray-600">${e.message}</p>
					</div>
				`,n.classList.add("hidden");else throw new Error(e.error||"Error desconocido")}catch(o){console.error("Error:",o),g.innerHTML=`
				<div class="text-center py-8">
					<div class="text-6xl mb-4">❌</div>
					<p class="text-red-600 font-bold">Error al corregir</p>
					<p class="text-gray-600">${o instanceof Error?o.message:"Error desconocido"}</p>
				</div>
			`}finally{n.textContent=r,n.disabled=!1}});document.querySelectorAll(".check-btn").forEach(r=>{r.addEventListener("click",async o=>{const e=o.target,d=e.dataset.slug;b=d||"";const a=e.textContent;e.textContent="...",e.disabled=!0,n.classList.add("hidden");try{const t=await fetch("/api/check-consecutive",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:d})}),s=await t.json();if(t.ok){p.textContent=`Verificación: ${s.book}`;let c="";s.missingVerses.length>0&&(c+=`
							<div class="mb-6">
								<h4 class="font-bold text-red-600 mb-2">
									Versículos faltantes (${s.missingVerses.length})
								</h4>
								<div class="bg-red-50 border border-red-200 rounded p-3 max-h-48 overflow-y-auto">
									${s.missingVerses.map(i=>`
										<div class="text-sm">
											<span class="font-mono font-bold text-red-700">${i.chapter}:${i.verse}</span>
											<span class="text-gray-600 ml-2">${i.context}</span>
										</div>
									`).join("")}
								</div>
							</div>
						`),s.unformattedVerses.length>0&&(c+=`
							<div class="mb-6">
								<h4 class="font-bold text-amber-600 mb-2">
									Versículos sin formatear (${s.unformattedVerses.length})
								</h4>
								<div class="bg-amber-50 border border-amber-200 rounded p-3 max-h-48 overflow-y-auto">
									${s.unformattedVerses.map(i=>`
										<div class="text-sm border-b border-amber-100 pb-2 last:border-0">
											<span class="font-mono text-amber-700">Línea ${i.line}:</span>
											<span class="text-gray-700 ml-2">${i.text}</span>
										</div>
									`).join("")}
								</div>
							</div>
						`),s.missingVerses.length===0&&s.unformattedVerses.length===0?c=`
							<div class="text-center py-8">
								<div class="text-6xl mb-4">✅</div>
								<p class="text-green-600 font-bold text-lg">¡Todo en orden!</p>
								<p class="text-gray-600">Total de capítulos: ${s.totalChapters}</p>
							</div>
						`:s.unformattedVerses.length>0&&n.classList.remove("hidden"),g.innerHTML=c,l.showModal()}else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),p.textContent="Error",g.innerHTML=`
					<div class="text-center py-8">
						<div class="text-6xl mb-4">❌</div>
						<p class="text-red-600 font-bold">${t instanceof Error?t.message:"Error desconocido"}</p>
					</div>
				`,l.showModal()}finally{e.textContent=a,e.disabled=!1}})});
