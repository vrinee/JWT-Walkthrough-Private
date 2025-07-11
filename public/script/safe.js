const body = document.querySelector('body');
const token = localStorage.getItem('token');
let videoPath = null;

if (token) {
    // Validate token with server
    fetch('/api/validate-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.valid) { // todo o javascript de criação de página que use o caminho do video terá de ser feito neste if
            console.log('Token is valid. User:', data.user);
            videoPath = data.user.safeUrl;  
            body.innerHTML = `
                <iframe src="videos/${videoPath}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;//exemplo do que fazer
        } else {
            console.log('Token is invalid');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    })
    .catch(error => {
        console.error('Error validating token:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
    });
} else {
    // No token found, redirect to login
    console.log('No token found');
    window.location.href = '/login';
}

// qualquer javascript que seja botao ou algo do tipo(que nao precisa do caminho do video) pode ser feito aqui