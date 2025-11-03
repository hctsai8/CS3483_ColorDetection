class Dashboard {
    constructor() {
        this.initializeCharts();
        this.loadAnalyticsData();
        this.bindEvents();
    }

    initializeCharts() {
        // Only initialize the main usage chart
        this.createUsageChart();
    }

    createUsageChart() {
        const ctx = document.getElementById('usageChart').getContext('2d');
        
        // Generate sample data for the month
        const labels = [];
        const data = [];
        const currentDate = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(Math.floor(Math.random() * 100) + 20);
        }

        this.usageChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Usage (minutes)',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#cbd5e1'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#cbd5e1'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#06b6d4'
                    }
                }
            }
        });
    }

    loadAnalyticsData() {
        // Load data from localStorage or API
        const colorHistory = localStorage.getItem('colorHistory') || '[]';
        const fingertipHistory = localStorage.getItem('fingertipColorHistory') || '[]';
        
        const mouseColors = JSON.parse(colorHistory);
        const fingertipColors = JSON.parse(fingertipHistory);
        
        // Update stats in the analytics card
        const totalColors = mouseColors.length + fingertipColors.length;
        const totalSessions = Math.floor(totalColors / 7) + 1; // Estimate sessions
        
        // Update the total colors stat
        const totalColorsStat = document.querySelector('.stat-number');
        if (totalColorsStat) {
            totalColorsStat.textContent = totalColors;
        }
        
        // Update individual card metrics
        this.updateCardMetrics('mouse', mouseColors.length);
        this.updateCardMetrics('fingertip', fingertipColors.length);
        
        this.updateWelcomeMessage();
    }

    updateCardMetrics(type, colorCount) {
        // Update metrics in action cards based on actual data
        const cards = document.querySelectorAll('.action-card');
        cards.forEach(card => {
            const icon = card.querySelector('.card-icon');
            if ((type === 'mouse' && icon.textContent === '🖱️') ||
                (type === 'fingertip' && icon.textContent === '🖐️')) {
                const metrics = card.querySelectorAll('.metric-value');
                if (metrics[0]) metrics[0].textContent = colorCount;
                if (metrics[1]) metrics[1].textContent = Math.floor(colorCount / 6) + 1;
            }
        });
    }

    updateWelcomeMessage() {
        const hour = new Date().getHours();
        const welcomeText = document.querySelector('.welcome-content h2');
        const welcomeIcon = document.querySelector('.welcome-icon');
        
        if (welcomeText && welcomeIcon) {
            if (hour < 12) {
                welcomeText.textContent = 'Good morning!';
                welcomeIcon.textContent = '🌅';
            } else if (hour < 18) {
                welcomeText.textContent = 'Good afternoon!';
                welcomeIcon.textContent = '☀️';
            } else {
                welcomeText.textContent = 'Good evening!';
                welcomeIcon.textContent = '🌙';
            }
        }
    }

    bindEvents() {
        // Update stats periodically
        setInterval(() => {
            this.loadAnalyticsData();
        }, 30000); // Update every 30 seconds
        
        // Add click analytics
        document.querySelectorAll('.card-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardTitle = e.target.closest('.action-card').querySelector('h3').textContent;
                this.logAnalytics('card_click', { card: cardTitle });
            });
        });
    }

    logAnalytics(event, data) {
        // Log analytics events (could be sent to server)
        console.log('Analytics Event:', event, data);
        
        // Store in localStorage for demo purposes
        const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
        analytics.push({
            event,
            data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('analytics', JSON.stringify(analytics.slice(-100))); // Keep last 100 events
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        if (notification && notificationText) {
            notificationText.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.remove('hidden');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 3000);
        }
    }
}

// Navigation functions (keeping for compatibility)
function navigateToColorDetection() {
    window.location.href = 'index.html';
}

function navigateToMouseDetection() {
    window.location.href = 'index.html';
}

function navigateToFingertipDetection() {
    window.location.href = 'fingertip.html';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
