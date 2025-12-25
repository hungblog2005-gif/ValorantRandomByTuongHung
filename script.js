// script.js
class ValorantTeamRandomizer {
    constructor() {
        this.roles = ['Duelist', 'Controller', 'Initiator', 'Sentinel'];
        
        this.agents = {
            'Duelist': ['Jett', 'Reyna', 'Raze', 'Yoru', 'Phoenix', 'Neon'],
            'Controller': ['Omen', 'Brimstone', 'Viper', 'Astra', 'Harbor'],
            'Initiator': ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade'],
            'Sentinel': ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock']
        };
        
        this.initializeEventListeners();
        this.loadSavedPlayers();
    }
    
    initializeEventListeners() {
        document.getElementById('shuffle-btn').addEventListener('click', () => this.shufflePlayers());
        document.getElementById('randomize-btn').addEventListener('click', () => this.randomizeTeam());
        document.getElementById('export-btn').addEventListener('click', () => this.exportTeam());
        
        // Auto-save players list
        document.getElementById('player-list').addEventListener('input', () => {
            this.savePlayers();
        });
    }
    
    savePlayers() {
        const players = document.getElementById('player-list').value;
        localStorage.setItem('valorantPlayers', players);
    }
    
    loadSavedPlayers() {
        const saved = localStorage.getItem('valorantPlayers');
        if (saved) {
            document.getElementById('player-list').value = saved;
        }
    }
    
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    shufflePlayers() {
        const textarea = document.getElementById('player-list');
        let players = textarea.value.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (players.length === 0) {
            this.showNotification('Please enter at least one player!', 'error');
            return;
        }
        
        players = this.shuffleArray(players);
        textarea.value = players.join('\n');
        this.savePlayers();
        this.showNotification('Player list shuffled successfully!', 'success');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1001',
            animation: 'slideIn 0.3s ease, fadeOut 0.5s ease 2.5s forwards',
            backgroundColor: type === 'success' ? '#4CAF50' : '#f44336'
        });
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    randomizeTeam() {
        const textarea = document.getElementById('player-list');
        let players = textarea.value.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (players.length < 5) {
            this.showNotification('Need at least 5 players to create a team!', 'error');
            return;
        }
        
        // Show loading
        this.showLoading(true);
        
        // Simulate processing time for better UX
        setTimeout(() => {
            // Lấy 5 người chơi đầu tiên sau khi shuffle
            players = this.shuffleArray(players).slice(0, 5);
            
            const team = this.assignRolesAndAgents(players);
            this.displayResults(team);
            
            // Hide loading
            this.showLoading(false);
            
            this.showNotification('Team randomized successfully!', 'success');
        }, 500);
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = show ? 'flex' : 'none';
    }
    
    assignRolesAndAgents(players) {
        // Đảm bảo có đủ 4 role khác nhau và 1 role bị trùng
        const roles = [...this.roles]; // 4 role khác nhau
        const extraRole = this.getRandomItem(this.roles); // 1 role bị trùng
        const allRoles = [...roles, extraRole]; // Tổng cộng 5 role
        
        // Shuffle roles để phân phối ngẫu nhiên
        const shuffledRoles = this.shuffleArray(allRoles);
        
        const team = [];
        for (let i = 0; i < 5; i++) {
            const player = {
                name: players[i],
                role: shuffledRoles[i],
                agent: this.getRandomItem(this.agents[shuffledRoles[i]])
            };
            team.push(player);
        }
        
        return team;
    }
    
    displayResults(team) {
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';
        
        team.forEach(player => {
            const resultCard = document.createElement('div');
            resultCard.className = `result-card ${player.role.toLowerCase()}`;
            resultCard.innerHTML = `
                <h3>${player.name}</h3>
                <div class="role-section">
                    <strong>Role:</strong>
                    <span>${player.role}</span>
                </div>
                <div class="agent-section">
                    <strong>Agent:</strong>
                    <span>${player.agent}</span>
                </div>
            `;
            resultsContainer.appendChild(resultCard);
        });
    }
    
    exportTeam() {
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer.children.length === 0) {
            this.showNotification('No team to export!', 'error');
            return;
        }
        
        let exportText = 'Valorant Team Composition\n';
        exportText += '========================\n\n';
        
        const cards = resultsContainer.children;
        for (let i = 0; i < cards.length; i++) {
            const name = cards[i].querySelector('h3').textContent;
            const role = cards[i].querySelector('.role-section span').textContent;
            const agent = cards[i].querySelector('.agent-section span').textContent;
            
            exportText += `Player: ${name}\n`;
            exportText += `Role: ${role}\n`;
            exportText += `Agent: ${agent}\n`;
            exportText += '---\n';
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(exportText).then(() => {
            this.showNotification('Team composition copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback if clipboard API fails
            const textArea = document.createElement('textarea');
            textArea.value = exportText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Team composition copied to clipboard!', 'success');
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ValorantTeamRandomizer();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        animation: slideIn 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
    }
`;
document.head.appendChild(style);