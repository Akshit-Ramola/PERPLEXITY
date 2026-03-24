fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'testu123',
        email: 't123@test.com',
        password: 'Password!123'
    })
})
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
