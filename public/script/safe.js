document.addEventListener("DOMContentLoaded", function() {
const token = localStorage.getItem('token');
const videotag = document.getElementById('video-safe');
const safeimgtag = document.getElementById('safeImg'); // tag de imagem do cofre

safeimgtag.addEventListener('click', function(e) {
    e.preventDefault();
    if (token) {
    // Validar token no servidor
    fetch('/api/validate-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("response: ", data);
        if (data.valid) { // todo o javascript de criação de página que use o caminho do video terá de ser feito neste if
            console.log('Token válido. Usuário:', data.userName);
            let videoPath = data.safeUrl;  
			safeimgtag.remove(); // remover as tag com estilo css ou adequar o codigo para nao dar quebra de pagina no video tag
			videotag.innerHTML = `<video id="videoPlayer" controls autoplay>  <source src="/api/safe-file/${videoPath}" type="video/mp4"></video>`; //exemplo do que fazer
			localStorage.removeItem('token'); // remover o token apos exibir o video, opicional, faz o usuario ter de fazer login novamente
        } else {
            console.log('Token inválido. Redirecionando para login.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    })
    .catch(error => {
        console.error('Erro ao validar token:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
    });
} else {
    console.log('Token não encontrado. Redirecionando para login.');
    window.location.href = '/login';
}
});

});