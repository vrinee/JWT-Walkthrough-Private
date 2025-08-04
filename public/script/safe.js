document.addEventListener("DOMContentLoaded", function() {
const token = localStorage.getItem('token');
const videotag = document.getElementById('video-safe');
const safeimgtag = document.getElementById('safeImg'); // tag de imagem do cofre
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close-modal');

// Function to show modal with animation
function showModal() {
    modal.classList.add('show');
}

// Function to hide modal with animation
function hideModal() {
    modal.classList.remove('show');
    // Change safe image back to closed
    safeimgtag.src = '/safe/closed.png';
    // Clear video content when modal is closed
    setTimeout(() => {
        videotag.innerHTML = '';
    }, 1500); // Wait for animation to complete (matching CSS transition)
}

// Close modal when clicking the X button
closeModal.addEventListener('click', hideModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        hideModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        hideModal();
    }
});

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
            let videoPath = data.safeFile;  
            
            // Change safe image to opened
            safeimgtag.src = '/safe/opened.png';
            
            // Create video element and show modal
            videotag.innerHTML = `<video id="videoPlayer" controls autoplay>  <source src="/api/safe-file/${videoPath}" type="video/mp4"></video>`;
            
            // Show modal with animation
            showModal();
            
            // Remove token só depois de tocar
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.addEventListener('ended', function() {
                console.log('Video finished playing, removing token');
                localStorage.removeItem('token');
                hideModal();
            });
            
            // Optional: Hide modal when video ends
            videoPlayer.addEventListener('ended', function() {
                setTimeout(() => {
                    hideModal();
                }, 2000); // Wait 2 seconds after video ends
            });
            
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