// login.js
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Resposta recebida do servidor:', data);
            const message = document.getElementById('login_message');
            message.textContent = data.message;

            if (data.success) {
                // Armazena o token JWT no sessionStorage
                localStorage.setItem('token', data.token);
                //alert('Login realizado com sucesso!');
                window.location.href = 'servicos.html'; // Redireciona após login bem-sucedido
            } else {
                alert('Erro ao fazer login');
            }
        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            const message = document.getElementById('login_message');
            message.textContent = 'Erro ao se conectar ao servidor. Tente novamente.';
        });
});
