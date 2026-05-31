document.write(`
<script>
(function() {
  var toggle = document.getElementById('contrast-toggle');
  if (!toggle) return;
  if (localStorage.getItem('highContrast') === 'true') {
    document.body.classList.add('high-contrast');
    toggle.checked = true;
  }
  toggle.addEventListener('change', function() {
    if (toggle.checked) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  });
})();
<\/script>
<script src="${ROOT}/static/js/main.js"><\/script>

<footer>
  <div class="footer-content">
    <p class="footer-copyright">&copy; 2026 - ONG Amor Animal Marilia.</p>
  </div>
  <div class="footer-social">
    <a href="https://www.instagram.com/grupoamoranimal/?hl=pt" target="_blank">
      <img src="${ROOT}/static/css/favicon/insta.png" alt="Instagram">
    </a>
    <a href="https://api.whatsapp.com/send?phone=5514998151723&text=ONGAmor%20Animal" target="_blank">
      <img src="${ROOT}/static/css/favicon/whats.png" alt="WhatsApp">
    </a>
    <a href="https://web.facebook.com/ongamoranimal" target="_blank">
      <img src="${ROOT}/static/css/favicon/face.png" alt="Facebook">
    </a>
  </div>
</footer>
`);
