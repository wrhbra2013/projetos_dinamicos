document.write(
'<input type="checkbox" id="contrast-toggle" class="css-toggle-checkbox">' +
'<label for="contrast-toggle" class="contrast-label" aria-label="Alternar alto contraste"><i class="fas fa-eye"></i></label>' +
'<script>' +
'(function(){' +
'  var t = document.getElementById(\'contrast-toggle\');' +
'  if(!t) return;' +
'  if(localStorage.getItem(\'highContrast\')===\'true\'){ document.body.classList.add(\'high-contrast\'); t.checked=true; }' +
'  t.addEventListener(\'change\', function(){' +
'    if(t.checked){ document.body.classList.add(\'high-contrast\'); localStorage.setItem(\'highContrast\',\'true\'); }' +
'    else{ document.body.classList.remove(\'high-contrast\'); localStorage.setItem(\'highContrast\',\'false\'); }' +
'  });' +
'})();' +
'<\/script>' +
'<input type="checkbox" id="help-toggle" class="help-checkbox">' +
'<label for="help-toggle" class="help-label" aria-label="Ajuda"><i class="fas fa-circle-info"></i></label>' +
'<div class="help-dropdown">' +
'  <div class="help-content">' +
'    <h4>Ajuda</h4>' +
'    <p>Em caso de erros, d&uacute;vidas ou sugest&otilde;es entre em contato conosco.</p>' +
'    <hr>' +
'    <h5>Erros comuns:</h5>' +
'    <ul>' +
'      <li><strong>Pet n&atilde;o adicionado:</strong> Preencha Nome, Esp&eacute;cie e Sexo do pet.</li>' +
'      <li><strong>Inscri&ccedil;&atilde;o n&atilde;o enviada:</strong> Verifique se todos os campos obrigat&oacute;rios est&atilde;o preenchidos.</li>' +
'      <li><strong>Vagas esgotadas:</strong> O mutir&atilde;o atingiu o limite de vagas.</li>' +
'      <li><strong>Mutir&atilde;o encerrado:</strong> As inscri&ccedil;&otilde;es foram encerradas ap&oacute;s a data do evento.</li>' +
'    </ul>' +
'    <p>E deixe o seu melhor contato.</p>' +
'    <p><strong>Email:</strong> <a href="mailto:amoranimalmariliadev@gmail.com">amoranimalmariliadev@gmail.com</a></p>' +
'  </div>' +
'</div>' +
'<header class="main-header">' +
'  <main class="main-header-controls"></main>' +
'  <div style="text-align:center;padding:10px 0 0">' +
'    <a href="' + ROOT + '/login/index.html" style="display:inline-block;padding:8px 24px;background:var(--brand-teal);color:#fff;border-radius:6px;text-decoration:none;font-weight:600"><i class="fas fa-lock"></i> Acesso</a>' +
'  </div>' +
'  <div class="nav-container">' +
'    <img src="' + ROOT + '/static/css/imagem/ong.jpg" alt="Logo ONG AMOR ANIMAL MARILIA" />' +
'    <p style="margin:5px 0 0;font-size:0.9rem;color:var(--muted-color);text-align:center">Sistema de Gestao de Dados da ONG</p>' +
'  </div>' +
'  <div class="search-wrapper">' +
'    <div class="search-inner">' +
'      <input type="text" id="site-search" class="search-input" placeholder="Pesquisar em todo o site...">' +
'      <i class="fas fa-search search-icon"></i>' +
'    </div>' +
'    <div id="search-results" class="search-results-box"></div>' +
'  </div>' +
'</header>' +
'<script>' +
'(function(){' +
'  var PAGES = [' +
'    { t:"Inicio", d:"Pagina inicial da ONG Amor Animal", k:"inicio home principal ong amor animal marilia", i:"fa-home", c:"#14b8a6", u:"index.html" },' +
'    { t:"Adocao", d:"Animais disponiveis para adocao", k:"adocao adotar pet cachorro gato animal", i:"fa-paw", c:"#f59e0b", u:"pages/adocao.html" },' +
'    { t:"Castracao", d:"Agendamento de castracao", k:"castracao castrar cirurgia veterinario mutirao", i:"fa-user-md", c:"#10b981", u:"pages/castracao.html" },' +
'    { t:"Procura-se", d:"Animais desaparecidos", k:"procura se perdido desaparecido busca", i:"fa-search", c:"#f97316", u:"pages/procura_se.html" },' +
'    { t:"Doacao", d:"Contribua com doacoes", k:"doacao doar contribuir ajuda dinheiro", i:"fa-donate", c:"#8b5cf6", u:"pages/doacao.html" },' +
'    { t:"Parceria", d:"Seja um parceiro da ONG", k:"parceria parceiro empresa apoiar", i:"fa-handshake", c:"#14b8a6", u:"pages/parceria.html" },' +
'    { t:"Voluntario", d:"Seja um voluntario", k:"voluntario voluntariado ajudar trabalho", i:"fa-hands-helping", c:"#ec4899", u:"pages/voluntario.html" },' +
'    { t:"Sobre", d:"Conheca a ONG Amor Animal", k:"sobre nos historia missao quem somos", i:"fa-info-circle", c:"#3b82f6", u:"pages/sobre.html" },' +
'    { t:"Transparencia", d:"Portal da transparencia", k:"transparencia prestacao contas documentos", i:"fa-file-invoice", c:"#6366f1", u:"pages/transparencia.html" },' +
'    { t:"Eventos", d:"Eventos da ONG", k:"eventos feira adocao mutirao castracao agenda", i:"fa-calendar-alt", c:"#a855f7", u:"pages/eventos.html" },' +
'    { t:"Admin", d:"Painel administrativo", k:"admin administrador login acesso gestao", i:"fa-lock", c:"#64748b", u:"login/index.html" }' +
'  ];' +
'  var input = document.getElementById("site-search");' +
'  var results = document.getElementById("search-results");' +
'  if (!input || !results) return;' +
'  function searchPages(q) {' +
'    if (!q || q.length < 2) { results.style.display = "none"; return; }' +
'    q = q.toLowerCase();' +
'    var found = [];' +
'    for (var i = 0; i < PAGES.length; i++) {' +
'      var p = PAGES[i];' +
'      if (p.t.toLowerCase().indexOf(q) !== -1 || p.d.toLowerCase().indexOf(q) !== -1 || p.k.indexOf(q) !== -1) {' +
'        found.push(p);' +
'      }' +
'    }' +
'    renderResults(found, q);' +
'  }' +
'  function renderResults(found, q) {' +
'    if (found.length === 0) {' +
'      results.innerHTML = "<div class=\"sr-none\">Nenhum resultado encontrado para <strong>" + q + "</strong></div>";' +
'    } else {' +
'      var html = "";' +
'      for (var i = 0; i < found.length; i++) {' +
'        var p = found[i];' +
'        html += "<a href=\"" + ROOT + "/" + p.u + "\" data-search-link=\"1\">";' +
'        html += "<span class=\"sr-icon\" style=\"background:" + p.c + "\"><i class=\"fas " + p.i + "\"></i></span>";' +
'        html += "<div><div class=\"sr-title\">" + p.t + "</div><div class=\"sr-desc\">" + p.d + "</div></div>";' +
'        html += "</a>";' +
'      }' +
'      results.innerHTML = html;' +
'    }' +
'    results.style.display = "block";' +
'  }' +
'  results.addEventListener("click", function(e) {' +
'    var link = e.target.closest("a[data-search-link]");' +
'    if (link) { input.value = ""; results.style.display = "none"; }' +
'  });' +
'  var debounceTimer;' +
'  input.addEventListener("input", function() {' +
'    clearTimeout(debounceTimer);' +
'    debounceTimer = setTimeout(function() { searchPages(input.value); }, 300);' +
'  });' +
'  input.addEventListener("focus", function() {' +
'    if (input.value.length >= 2) results.style.display = "block";' +
'  });' +
'  document.addEventListener("click", function(e) {' +
'    if (results.style.display !== "none" && !results.contains(e.target) && e.target !== input) {' +
'      results.style.display = "none";' +
'    }' +
'  });' +
'  input.addEventListener("keydown", function(e) {' +
'    if (e.key === "Escape") { results.style.display = "none"; input.blur(); }' +
'  });' +
'})();' +
'<\/script>'
);
