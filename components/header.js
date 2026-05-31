document.write(`
<input type="checkbox" id="contrast-toggle" class="css-toggle-checkbox">
<label for="contrast-toggle" class="contrast-label" aria-label="Alternar alto contraste">\u25E7</label>
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
<label for="help-toggle" class="help-label" aria-label="Ajuda">?</label>
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

<input type="checkbox" id="mobile-menu-toggle" class="css-toggle-checkbox">
<label for="mobile-menu-toggle" class="mobile-menu-button" aria-label="Abrir menu"><span></span></label>

<div class="mobile-menu-wrapper">
  <label for="mobile-menu-toggle" class="mobile-menu-close" aria-label="Fechar menu">&times;</label>
  <nav class="mobile-menu">
    <ul class="nav-list">
      <li><a href="${ROOT}/index.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-home"></i> In&iacute;cio</a></li>
      <li><a href="${ROOT}/pages/adocao.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-paw"></i> Ado&ccedil;&atilde;o</a></li>
      <li><a href="${ROOT}/pages/castracao.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-user-md"></i> Castra&ccedil;&atilde;o</a></li>
      <li><a href="${ROOT}/pages/procura_se.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-search"></i> Procura-se</a></li>
      <li><a href="${ROOT}/pages/doacao.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-donate"></i> Doa&ccedil;&atilde;o</a></li>
      <li><a href="${ROOT}/pages/parceria.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-handshake"></i> Parceria</a></li>
      <li><a href="${ROOT}/pages/voluntario.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-hands-helping"></i> Voluntário</a></li>
      <li><a href="${ROOT}/pages/sobre.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-info-circle"></i> Sobre</a></li>
      <li><a href="${ROOT}/pages/transparencia.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-file-invoice"></i> Transpar&ecirc;ncia</a></li>
      <li><a href="${ROOT}/pages/eventos.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-calendar-alt"></i> Eventos</a></li>
      <li><a href="${ROOT}/login/index.html" onclick="document.getElementById('mobile-menu-toggle').checked = false;"><i class="fas fa-lock"></i> Admin</a></li>
    </ul>
  </nav>
</div>

<header class="main-header">
  <main class="main-header-controls"></main>
  <div class="nav-container">
    <img src="${ROOT}/static/css/imagem/ong.jpg" alt="Logo ONG AMOR ANIMAL MARILIA" />
  </div>
  <div class="nav-wrapper">
    <nav class="main-nav">
      <ul class="nav-list">
        <li><a href="${ROOT}/index.html">In&iacute;cio</a></li>
        <li><a href="${ROOT}/pages/adocao.html">Ado&ccedil;&atilde;o</a></li>
        <li><a href="${ROOT}/pages/castracao.html">Castra&ccedil;&atilde;o</a></li>
        <li><a href="${ROOT}/pages/procura_se.html">Procura-se</a></li>
        <li><a href="${ROOT}/pages/doacao.html">Doa&ccedil;&atilde;o</a></li>
        <li><a href="${ROOT}/pages/parceria.html">Parceria</a></li>
        <li><a href="${ROOT}/pages/voluntario.html">Voluntário</a></li>
        <li><a href="${ROOT}/pages/sobre.html">Sobre</a></li>
        <li><a href="${ROOT}/pages/transparencia.html">Transpar&ecirc;ncia</a></li>
        <li><a href="${ROOT}/pages/eventos.html">Eventos</a></li>
        <li><a href="${ROOT}/login/index.html">Admin</a></li>
      </ul>
    </nav>
  </div>
</header>
`);
