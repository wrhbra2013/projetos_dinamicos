document.write(`
<input type="checkbox" id="contrast-toggle" class="css-toggle-checkbox">
<label for="contrast-toggle" class="contrast-label" aria-label="Alternar alto contraste"><i class="fas fa-eye"></i></label>
<script>
(function(){
  var t = document.getElementById('contrast-toggle');
  if(!t) return;
  if(localStorage.getItem('highContrast')==='true'){ document.body.classList.add('high-contrast'); t.checked=true; }
  t.addEventListener('change', function(){
    if(t.checked){ document.body.classList.add('high-contrast'); localStorage.setItem('highContrast','true'); }
    else{ document.body.classList.remove('high-contrast'); localStorage.setItem('highContrast','false'); }
  });
})();
<\/script>

<input type="checkbox" id="help-toggle" class="help-checkbox">
<label for="help-toggle" class="help-label" aria-label="Ajuda"><i class="fas fa-circle-info"></i></label>
<div class="help-dropdown">
  <div class="help-content">
    <h4>Ajuda</h4>
    <p>Em caso de erros, d&uacute;vidas ou sugest&otilde;es entre em contato conosco.</p>
    <hr>
    <h5>Erros comuns:</h5>
    <ul>
      <li><strong>Pet n&atilde;o adicionado:</strong> Preencha Nome, Esp&eacute;cie e Sexo do pet.</li>
      <li><strong>Inscri&ccedil;&atilde;o n&atilde;o enviada:</strong> Verifique se todos os campos obrigat&oacute;rios est&atilde;o preenchidos.</li>
      <li><strong>Vagas esgotadas:</strong> O mutir&atilde;o atingiu o limite de vagas.</li>
      <li><strong>Mutir&atilde;o encerrado:</strong> As inscri&ccedil;&otilde;es foram encerradas ap&oacute;s a data do evento.</li>
    </ul>
    <p>E deixe o seu melhor contato.</p>
    <p><strong>Email:</strong> <a href="mailto:amoranimalmariliadev@gmail.com">amoranimalmariliadev@gmail.com</a></p>
  </div>
</div>

<header class="main-header">
  <main class="main-header-controls"></main>
  <div style="text-align:center;padding:10px 0 0">
    <a href="${ROOT}/login/index.html" style="display:inline-block;padding:8px 24px;background:var(--brand-teal);color:#fff;border-radius:6px;text-decoration:none;font-weight:600"><i class="fas fa-lock"></i> Acesso</a>
  </div>
  <div class="nav-container">
    <img src="${ROOT}/static/css/imagem/ong.jpg" alt="Logo ONG AMOR ANIMAL MARILIA" />
    <p style="margin:5px 0 0;font-size:0.9rem;color:var(--muted-color);text-align:center">Sistema de Gestão de Dados da ONG</p>
  </div>
  <div style="max-width:600px;margin:10px auto 0;padding:0 15px 15px">
    <div style="position:relative">
      <input type="text" id="site-search" placeholder="Pesquisar em todo o site..." style="width:100%;padding:10px 40px 10px 14px;border:2px solid var(--brand-teal);border-radius:8px;font-size:1rem;outline:none;background:var(--container-bg);color:var(--text-color)">
      <i class="fas fa-search" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--brand-teal)"></i>
    </div>
    <div id="search-results" style="display:none;position:absolute;top:100%;left:15px;right:15px;max-width:570px;margin:0 auto;background:var(--container-bg);border:1px solid #ddd;border-radius:0 0 8px 8px;max-height:400px;overflow-y:auto;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.1)"></div>
  </div>
</header>

<style>
#search-results a {
  display:flex;align-items:center;gap:10px;padding:10px 14px;text-decoration:none;color:var(--text-color);border-bottom:1px solid var(--bg-alt);transition:background 0.2s
}
#search-results a:last-child { border-bottom:none;border-radius:0 0 8px 8px }
#search-results a:hover { background:var(--bg-alt) }
#search-results .sresult-icon { width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0 }
#search-results .sresult-title { font-weight:600;font-size:0.9rem }
#search-results .sresult-desc { font-size:0.8rem;color:var(--muted-color) }
#search-results .sresult-none { padding:20px;text-align:center;color:var(--muted-color) }
</style>

<script>
(function(){
  var PAGES = [
    { title:'In\u00EDcio', desc:'P\u00E1gina inicial da ONG Amor Animal', keywords:'inicio home principal ong amor animal marilia', icon:'fa-home', color:'#14b8a6', url:'index.html' },
    { title:'Ado\u00E7\u00E3o', desc:'Animais dispon\u00EDveis para ado\u00E7\u00E3o', keywords:'adocao adotar pet cachorro gato animal', icon:'fa-paw', color:'#f59e0b', url:'pages/adocao.html' },
    { title:'Castra\u00E7\u00E3o', desc:'Agendamento de castra\u00E7\u00E3o', keywords:'castracao castrar cirurgia veterinario mutirao', icon:'fa-user-md', color:'#10b981', url:'pages/castracao.html' },
    { title:'Procura-se', desc:'Animais desaparecidos', keywords:'procura se perdido desaparecido busca', icon:'fa-search', color:'#f97316', url:'pages/procura_se.html' },
    { title:'Doa\u00E7\u00E3o', desc:'Contribua com doa\u00E7\u00F5es', keywords:'doacao doar contribuir ajuda dinheiro', icon:'fa-donate', color:'#8b5cf6', url:'pages/doacao.html' },
    { title:'Parceria', desc:'Seja um parceiro da ONG', keywords:'parceria parceiro empresa apoiar', icon:'fa-handshake', color:'#14b8a6', url:'pages/parceria.html' },
    { title:'Volunt\u00E1rio', desc:'Seja um volunt\u00E1rio', keywords:'voluntario voluntariado ajudar trabalho', icon:'fa-hands-helping', color:'#ec4899', url:'pages/voluntario.html' },
    { title:'Sobre', desc:'Conhe\u00E7a a ONG Amor Animal', keywords:'sobre nos historia missao quem somos', icon:'fa-info-circle', color:'#3b82f6', url:'pages/sobre.html' },
    { title:'Transpar\u00EAncia', desc:'Portal da transpar\u00EAncia', keywords:'transparencia prestacao contas documentos', icon:'fa-file-invoice', color:'#6366f1', url:'pages/transparencia.html' },
    { title:'Eventos', desc:'Eventos da ONG', keywords:'eventos feira adocao mutirao castracao agenda', icon:'fa-calendar-alt', color:'#a855f7', url:'pages/eventos.html' },
    { title:'Admin', desc:'Painel administrativo', keywords:'admin administrador login acesso gestao', icon:'fa-lock', color:'#64748b', url:'login/index.html' }
  ];

  var input = document.getElementById('site-search');
  var results = document.getElementById('search-results');

  function searchPages(q) {
    if (!q || q.length < 2) { results.style.display = 'none'; return; }
    q = q.toLowerCase();
    var found = PAGES.filter(function(p) {
      return p.title.toLowerCase().indexOf(q) !== -1 ||
             p.desc.toLowerCase().indexOf(q) !== -1 ||
             p.keywords.indexOf(q) !== -1;
    });
    renderResults(found, q);
  }

  function renderResults(found, q) {
    if (found.length === 0) {
      results.innerHTML = '<div class="sresult-none">Nenhum resultado encontrado para "<strong>' + q + '</strong>"</div>';
    } else {
      var html = '';
      found.forEach(function(p) {
        html += '<a href="' + ROOT + '/' + p.url + '" onclick="document.getElementById(\'site-search\').value=\'\';document.getElementById(\'search-results\').style.display=\'none\'">';
        html += '<span class="sresult-icon" style="background:' + p.color + ';color:#fff"><i class="fas ' + p.icon + '"></i></span>';
        html += '<div><div class="sresult-title">' + p.title + '</div><div class="sresult-desc">' + p.desc + '</div></div>';
        html += '</a>';
      });
      results.innerHTML = html;
    }
    results.style.display = 'block';
  }

  var debounceTimer;
  input.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() { searchPages(input.value); }, 300);
  });
  input.addEventListener('focus', function() {
    if (input.value.length >= 2) results.style.display = 'block';
  });
  document.addEventListener('click', function(e) {
    if (!input.parentElement.contains(e.target) && !results.contains(e.target)) results.style.display = 'none';
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { results.style.display = 'none'; input.blur(); }
  });
})();
<\/script>
`);
