document.addEventListener('DOMContentLoaded', () => {
    AppUtils.initNavigation('nav-module1');
    AppUtils.logAction('AI Chef Module', 'Initialized');

    const chatForm = document.getElementById('chat-form');
    if(chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input').value;
            const output = document.getElementById('chat-output');
            
            output.innerHTML += `<div style="margin-bottom: 0.5rem;"><strong>You:</strong> ${input}</div>`;
            output.innerHTML += `<div style="color:var(--accent); margin-bottom: 1rem;"><strong>AI Chef:</strong> Processing simulated request... I suggest a saffron infusion to balance the acidity.</div>`;
            document.getElementById('chat-input').value = '';
        });
    }
});
