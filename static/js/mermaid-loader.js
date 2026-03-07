(function(){
  function loadScript(src, onload, onerror){
    var s = document.createElement('script');
    s.src = src;
    s.onload = onload;
    s.onerror = onerror;
    document.head.appendChild(s);
  }

  var localPath = '/static/js/mermaid.min.js';
  loadScript(localPath, function(){
    if(window.mermaid){
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
    }
  }, function(){
    // Fallback para CDN se o arquivo local não existir
    loadScript('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js', function(){
      if(window.mermaid){
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
      }
    });
  });
})();
