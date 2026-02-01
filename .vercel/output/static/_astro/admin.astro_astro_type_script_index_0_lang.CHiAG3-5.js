document.querySelectorAll(".prepare-btn").forEach(n=>{n.addEventListener("click",async o=>{const e=o.target,a=e.dataset.slug,r=e.textContent;e.textContent="...",e.disabled=!0;try{const t=await fetch("/api/prepare-book",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:a})}),s=await t.json();if(t.ok)e.textContent="✓",e.classList.remove("bg-purple-600","hover:bg-purple-700"),e.classList.add("bg-green-600"),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-green-600"),e.classList.add("bg-purple-600","hover:bg-purple-700"),e.disabled=!1},2e3);else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),e.textContent="✗",e.classList.remove("bg-purple-600","hover:bg-purple-700"),e.classList.add("bg-red-600"),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-red-600"),e.classList.add("bg-purple-600","hover:bg-purple-700"),e.disabled=!1},2e3)}})});document.querySelectorAll(".format-btn").forEach(n=>{n.addEventListener("click",async o=>{const e=o.target,a=e.dataset.slug,r=e.textContent;e.textContent="...",e.disabled=!0;try{const t=await fetch("/api/format-book",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:a})}),s=await t.json();if(t.ok)e.textContent="✓",e.classList.remove("bg-blue-600","hover:bg-blue-700"),e.classList.add("bg-green-600"),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-green-600"),e.classList.add("bg-blue-600","hover:bg-blue-700"),e.disabled=!1},2e3);else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),e.textContent="✗",e.classList.remove("bg-blue-600","hover:bg-blue-700"),e.classList.add("bg-red-600"),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-red-600"),e.classList.add("bg-blue-600","hover:bg-blue-700"),e.disabled=!1},2e3)}})});const l=document.getElementById("consecutiveDialog"),c=document.getElementById("dialogTitle"),d=document.getElementById("dialogContent"),x=document.getElementById("closeDialog"),m=document.getElementById("closeDialogBtn"),i=document.getElementById("fixVersesBtn");let p="";x.addEventListener("click",()=>l.close());m.addEventListener("click",()=>l.close());l.addEventListener("click",n=>{n.target===l&&l.close()});i.addEventListener("click",async()=>{if(!p)return;const n=i.textContent;i.textContent="Corrigiendo...",i.disabled=!0;try{const o=await fetch("/api/fix-verses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:p})}),e=await o.json();if(o.ok)d.innerHTML=`
					<div class="text-center py-8">
						<div class="text-6xl mb-4">✅</div>
						<p class="text-green-600 font-bold text-lg">¡Corrección completada!</p>
						<p class="text-gray-600">${e.message}</p>
					</div>
				`,i.classList.add("hidden");else throw new Error(e.error||"Error desconocido")}catch(o){console.error("Error:",o),d.innerHTML=`
				<div class="text-center py-8">
					<div class="text-6xl mb-4">❌</div>
					<p class="text-red-600 font-bold">Error al corregir</p>
					<p class="text-gray-600">${o instanceof Error?o.message:"Error desconocido"}</p>
				</div>
			`}finally{i.textContent=n,i.disabled=!1}});document.querySelectorAll(".letter-btn").forEach(n=>{n.addEventListener("click",async o=>{const e=o.target,a=e.dataset.slug,r=e.textContent;e.textContent="...",e.disabled=!0;try{const t=await fetch("/api/fix-letter-verses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:a})}),s=await t.json();if(t.ok)e.textContent="✓",e.classList.remove("bg-pink-600","hover:bg-pink-700"),e.classList.add("bg-green-600"),c.textContent=`Versículos con letras: ${s.book}`,s.fixed>0?d.innerHTML=`
							<div class="text-center py-8">
								<div class="text-6xl mb-4">✅</div>
								<p class="text-green-600 font-bold text-lg">¡Corrección completada!</p>
								<p class="text-gray-600">Se corrigieron ${s.fixed} versículos con letras</p>
								${s.examples?`
									<div class="mt-4 text-left bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
										<p class="text-sm font-bold mb-2">Ejemplos corregidos:</p>
										${s.examples.map(g=>`<p class="text-xs text-gray-600 font-mono">${g}</p>`).join("")}
									</div>
								`:""}
							</div>
						`:d.innerHTML=`
							<div class="text-center py-8">
								<div class="text-6xl mb-4">📝</div>
								<p class="text-blue-600 font-bold text-lg">Sin cambios</p>
								<p class="text-gray-600">No se encontraron versículos con letras para corregir</p>
							</div>
						`,i.classList.add("hidden"),l.showModal(),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-green-600"),e.classList.add("bg-pink-600","hover:bg-pink-700"),e.disabled=!1},2e3);else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),e.textContent="✗",e.classList.remove("bg-pink-600","hover:bg-pink-700"),e.classList.add("bg-red-600"),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-red-600"),e.classList.add("bg-pink-600","hover:bg-pink-700"),e.disabled=!1},2e3)}})});document.querySelectorAll(".format-comments-btn").forEach(n=>{n.addEventListener("click",async o=>{const e=o.target,a=e.dataset.slug,r=e.textContent;e.textContent="...",e.disabled=!0;try{const t=await fetch("/api/format-comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:a})}),s=await t.json();if(t.ok)e.textContent="✓",e.classList.remove("bg-teal-600","hover:bg-teal-700"),e.classList.add("bg-green-600"),c.textContent=`Comentarios: ${s.book}`,d.innerHTML=`
						<div class="text-center py-8">
							<div class="text-6xl mb-4">✅</div>
							<p class="text-green-600 font-bold text-lg">¡Formateo completado!</p>
							<p class="text-gray-600">Se formatearon ${s.comments} comentarios</p>
							<p class="text-xs text-gray-500 mt-2">Los párrafos ahora están unidos y separados por cita bíblica</p>
						</div>
					`,i.classList.add("hidden"),l.showModal(),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-green-600"),e.classList.add("bg-teal-600","hover:bg-teal-700"),e.disabled=!1},2e3);else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),e.textContent="✗",e.classList.remove("bg-teal-600","hover:bg-teal-700"),e.classList.add("bg-red-600"),c.textContent="Error",d.innerHTML=`
					<div class="text-center py-8">
						<div class="text-6xl mb-4">❌</div>
						<p class="text-red-600 font-bold">${t instanceof Error?t.message:"Error desconocido"}</p>
					</div>
				`,l.showModal(),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-red-600"),e.classList.add("bg-teal-600","hover:bg-teal-700"),e.disabled=!1},2e3)}})});document.querySelectorAll(".link-notes-btn").forEach(n=>{n.addEventListener("click",async o=>{const e=o.target,a=e.dataset.slug,r=e.textContent;e.textContent="...",e.disabled=!0;try{const t=await fetch("/api/link-notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:a})}),s=await t.json();if(t.ok)e.textContent="✓",e.classList.remove("bg-indigo-600","hover:bg-indigo-700"),e.classList.add("bg-green-600"),c.textContent=`Notas vinculadas: ${s.book}`,d.innerHTML=`
						<div class="text-center py-8">
							<div class="text-6xl mb-4">✅</div>
							<p class="text-green-600 font-bold text-lg">¡Vinculación completada!</p>
							<p class="text-gray-600">Se vincularon ${s.notesLinked} notas al pie</p>
							<p class="text-xs text-gray-500 mt-2">Los asteriscos ahora son clicables y mostrarán sus comentarios</p>
						</div>
					`,i.classList.add("hidden"),l.showModal(),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-green-600"),e.classList.add("bg-indigo-600","hover:bg-indigo-700"),e.disabled=!1},2e3);else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),e.textContent="✗",e.classList.remove("bg-indigo-600","hover:bg-indigo-700"),e.classList.add("bg-red-600"),c.textContent="Error",d.innerHTML=`
					<div class="text-center py-8">
						<div class="text-6xl mb-4">❌</div>
						<p class="text-red-600 font-bold">${t instanceof Error?t.message:"Error desconocido"}</p>
					</div>
				`,l.showModal(),setTimeout(()=>{e.textContent=r,e.classList.remove("bg-red-600"),e.classList.add("bg-indigo-600","hover:bg-indigo-700"),e.disabled=!1},2e3)}})});document.querySelectorAll(".check-btn").forEach(n=>{n.addEventListener("click",async o=>{const e=o.target,a=e.dataset.slug;p=a||"";const r=e.textContent;e.textContent="...",e.disabled=!0,i.classList.add("hidden");try{const t=await fetch("/api/check-consecutive",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:a})}),s=await t.json();if(t.ok){c.textContent=`Verificación: ${s.book}`;let g="";s.missingVerses.length>0&&(g+=`
							<div class="mb-6">
								<h4 class="font-bold text-red-600 mb-2">
									Versículos faltantes (${s.missingVerses.length})
								</h4>
								<div class="bg-red-50 border border-red-200 rounded p-3 max-h-48 overflow-y-auto">
									${s.missingVerses.map(b=>`
										<div class="text-sm">
											<span class="font-mono font-bold text-red-700">${b.chapter}:${b.verse}</span>
											<span class="text-gray-600 ml-2">${b.context}</span>
										</div>
									`).join("")}
								</div>
							</div>
						`),s.unformattedVerses.length>0&&(g+=`
							<div class="mb-6">
								<h4 class="font-bold text-amber-600 mb-2">
									Versículos sin formatear (${s.unformattedVerses.length})
								</h4>
								<div class="bg-amber-50 border border-amber-200 rounded p-3 max-h-48 overflow-y-auto">
									${s.unformattedVerses.map(b=>`
										<div class="text-sm border-b border-amber-100 pb-2 last:border-0">
											<span class="font-mono text-amber-700">Línea ${b.line}:</span>
											<span class="text-gray-700 ml-2">${b.text}</span>
										</div>
									`).join("")}
								</div>
							</div>
						`),s.missingVerses.length===0&&s.unformattedVerses.length===0?g=`
							<div class="text-center py-8">
								<div class="text-6xl mb-4">✅</div>
								<p class="text-green-600 font-bold text-lg">¡Todo en orden!</p>
								<p class="text-gray-600">Total de capítulos: ${s.totalChapters}</p>
							</div>
						`:s.unformattedVerses.length>0&&i.classList.remove("hidden"),d.innerHTML=g,l.showModal()}else throw new Error(s.error||"Error desconocido")}catch(t){console.error("Error:",t),c.textContent="Error",d.innerHTML=`
					<div class="text-center py-8">
						<div class="text-6xl mb-4">❌</div>
						<p class="text-red-600 font-bold">${t instanceof Error?t.message:"Error desconocido"}</p>
					</div>
				`,l.showModal()}finally{e.textContent=r,e.disabled=!1}})});
