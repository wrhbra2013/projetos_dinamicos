

function togglePasswordVisibility() {
    let senhaInput = document.getElementById("senha");   
 
    

    if (senhaInput.type === "password") {
        senhaInput.type = "text";
    } else {
        senhaInput.type = "password";
    }
    
}

document.addEventListener('DOMContentLoaded', function() {
    const senhaInput = document.getElementById('senha');
    const confirmaInput = document.getElementById('confirma');
    

    const mostrarSenhaCheckbox = document.getElementById('mostrarSenhaCheckbox');
    
    if (senhaInput &&  confirmaInput && mostrarSenhaCheckbox) {
    mostrarSenhaCheckbox.addEventListener('change', function() {
    // Se o checkbox estiver marcado, muda o tipo para 'text', senão para 'password'
    senhaInput.type = this.checked ? 'text' : 'password';
    confirmaInput.type = this.checked ? 'text' : 'password';
    });
    }
    });