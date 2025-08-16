// JavaScript logic extracted from the single-page portfolio for the AI dashboard and project charts

document.addEventListener('DOMContentLoaded', () => {
    let state = { clients: [], activeClientId: null };
    let chartInstances = {};

    const getEl = id => document.getElementById(id);
    const htmlEl = document.documentElement;

    // --- THEME TOGGLE ---
    const themeToggle = getEl('theme-toggle');
    const sunIcon = getEl('theme-icon-sun');
    const moonIcon = getEl('theme-icon-moon');

    const themeCheck = () => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlEl.classList.add('dark');
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            htmlEl.classList.remove('dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    };

    const themeSwitch = () => {
        htmlEl.classList.toggle('dark');
        localStorage.setItem('theme', htmlEl.classList.contains('dark') ? 'dark' : 'light');
        themeCheck();
        if (state.activeClientId) renderMainChart(getActiveClient());
        renderProjectCharts();
    };

    themeToggle.addEventListener('click', themeSwitch);

    // --- DATA GENERATION ---
    const generateDummyData = (today) => {
        const clients = [];
        const clientProfiles = [
            { name: "Leo Carter", diagnosis: "ASD Level 2", baseSkill: 0.2, baseBeh: 8 },
            { name: "Sofia Garcia", diagnosis: "ASD Level 1", baseSkill: 0.4, baseBeh: 5 },
            { name: "Kenji Tanaka", diagnosis: "ADHD", baseSkill: 0.3, baseBeh: 6 },
        ];
        clientProfiles.forEach((profile, i) => {
            const client = { id: 1000 + i, name: profile.name, diagnosis: profile.diagnosis, allData: [] };
            for (let w = 12; w >= 0; w--) {
                const weekDate = new Date(today);
                weekDate.setDate(today.getDate() - w * 7);
                const progressFactor = (12 - w) / 12;
                const skillMastery = Math.min(100, (profile.baseSkill * 100) + (progressFactor * 60) + (Math.random() - 0.5) * 10);
                const behaviorFreq = Math.max(0, profile.baseBeh * (1 - progressFactor * 0.75) + (Math.random() - 0.5) * 2);
                const ptAttended = Math.random() > 0.3 ? 1 : 0;
                client.allData.push({ date: weekDate, skillMastery, behaviorFreq, ptAttended });
            }
            clients.push(client);
        });
        return clients;
    };

    // --- UTILITIES & RENDERING ---
    const getActiveClient = () => state.clients.find(c => c.id === state.activeClientId);
    
    const createChart = (id, config) => {
        const ctx = getEl(id)?.getContext('2d');
        if (!ctx) return;
        if (chartInstances[id]) chartInstances[id].destroy();
        chartInstances[id] = new Chart(ctx, config);
    };

    const renderClientList = () => {
        getEl('client-list').innerHTML = state.clients.map(client => `
            <div class="client-list-item p-3 rounded-lg cursor-pointer border-l-4 border-transparent hover:bg-gray-500/10 ${client.id === state.activeClientId ? 'active' : ''}" data-client-id="${client.id}">
                <div class="font-bold text-light">${client.name}</div>
                <div class="text-sm text-medium">${client.diagnosis}</div>
            </div>`).join('');
    };

    const renderKPIs = (client) => {
        const latestData = client.allData[client.allData.length - 1];
        const firstData = client.allData[0];
        getEl('kpi-mastery').textContent = `${latestData.skillMastery.toFixed(0)}%`;
        const reduction = firstData.behaviorFreq > 0 ? ((firstData.behaviorFreq - latestData.behaviorFreq) / firstData.behaviorFreq) * 100 : 100;
        getEl('kpi-behavior').textContent = `${Math.max(0, reduction).toFixed(0)}%`;
        const ptTotal = client.allData.reduce((sum, d) => sum + d.ptAttended, 0);
        getEl('kpi-parent-training').textContent = `${((ptTotal / client.allData.length) * 100).toFixed(0)}%`;
        getEl('kpi-forecast').textContent = `~${(Math.random() * 3 + 2).toFixed(0)}w`;
    };

    const renderMainChart = (client) => {
        const isDark = htmlEl.classList.contains('dark');
        const textColor = isDark ? '#9CA3AF' : '#4B5563';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        createChart('main-chart', {
            type: 'line',
            data: {
                labels: client.allData.map(d => d.date),
                datasets: [
                    { label: 'Skill Mastery %', data: client.allData.map(d => d.skillMastery), yAxisID: 'y', borderColor: '#22D3EE', tension: 0.3, pointRadius: 0 },
                    { label: 'Behavior Frequency', data: client.allData.map(d => d.behaviorFreq), yAxisID: 'y1', borderColor: '#F472B6', tension: 0.3, pointRadius: 0 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { type: 'time', time: { unit: 'week' }, ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { position: 'left', title: { display: true, text: 'Mastery %', color: textColor }, min: 0, max: 100, ticks: { color: textColor }, grid: { color: gridColor } },
                    y1: { position: 'right', title: { display: true, text: 'Frequency', color: textColor }, min: 0, ticks: { color: textColor }, grid: { drawOnChartArea: false } }
                },
                plugins: { legend: { labels: { color: textColor } } }
            }
        });
    };
    
    const renderProjectCharts = () => {
        const isDark = htmlEl.classList.contains('dark');
        const textColor = isDark ? '#9CA3AF' : '#4B5563';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        const commonOptions = (yLabel, xLabel) => ({ 
            responsive: true, maintainAspectRatio: false, 
            plugins: { legend: { display: false } }, 
            scales: { 
                x: { title: { display: true, text: xLabel, color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } }, 
                y: { title: { display: true, text: yLabel, color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } } 
            } 
        });

        createChart('project-chart-1', { type: 'scatter', data: { datasets: [{ label: 'Escape-Motivated', data: Array.from({length: 20}, () => ({ x: Math.random() * 5 + 1, y: Math.random() * 5 + 6 })), backgroundColor: 'rgba(244, 114, 182, 0.7)' }, { label: 'High Social Motivation', data: Array.from({length: 20}, () => ({ x: Math.random() * 5 + 6, y: Math.random() * 5 + 1 })), backgroundColor: 'rgba(34, 211, 238, 0.7)' }] }, options: { ...commonOptions('Maladaptive Behavior Score', 'Communication Score'), plugins: { legend: { display: true, labels: { color: textColor } } } } });
        createChart('project-chart-2', { type: 'line', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun (Pred.)'], datasets: [{ label: 'Historical', data: [65, 59, 80, 81, 95, null], borderColor: '#22D3EE', tension: 0.4, fill: false }, { label: 'Forecast', data: [null, null, null, null, 95, 100], borderColor: '#F472B6', borderDash: [5,5], tension: 0.4, fill: false }] }, options: { ...commonOptions('Skill Mastery %', 'Month'), plugins: { legend: { display: true, labels: { color: textColor } } } } });
        createChart('project-chart-3', { type: 'doughnut', data: { labels: ['Positive', 'Neutral', 'Negative'], datasets: [{ data: [300, 50, 100], backgroundColor: ['#22D3EE', '#4B5563', '#F472B6'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor } } } } });
        createChart('project-chart-4', { type: 'bar', data: { labels: ['Parent Training', 'Session Duration', 'Time of Day', 'RBT Consistency'], datasets: [{ label: 'Importance', data: [0.92, 0.75, 0.43, 0.21], backgroundColor: ['#22D3EE', '#818cf8', '#a78bfa', '#f472b6'] }] }, options: { ...commonOptions('Feature', 'Predictive Importance'), indexAxis: 'y', plugins: { legend: { display: false } } } });
    };

    const renderDashboard = () => {
        const client = getActiveClient();
        if (!client) return;
        getEl('no-client-selected').classList.add('hidden');
        getEl('client-dashboard-view').classList.remove('hidden');
        getEl('current-client-name').textContent = client.name;
        renderKPIs(client);
        renderMainChart(client);
    };

    const setupEventListeners = () => {
        getEl('client-list').addEventListener('click', e => {
            const targetClient = e.target.closest('.client-list-item');
            if (targetClient) {
                state.activeClientId = parseInt(targetClient.dataset.clientId);
                renderClientList();
                renderDashboard();
            }
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-in-section').forEach(section => observer.observe(section));
        
        getEl('contact-form').addEventListener('submit', e => {
            e.preventDefault();
            const name = getEl('name').value;
            const email = getEl('email').value;
            const message = getEl('message').value;
            const subject = `Portfolio Contact from ${name}`;
            const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
            window.location.href = `mailto:fatgezimbela1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });

        const mobileMenuButton = getEl('mobile-menu-button');
        const mobileMenu = getEl('mobile-menu');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('-translate-x-full');
        });
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('-translate-x-full');
            });
        });

        // Insight Modal Listeners
        const insightModal = getEl('insight-modal');
        getEl('insights').addEventListener('click', e => {
            e.preventDefault();
            const link = e.target.closest('.read-more-link');
            if (link) {
                const insightId = link.dataset.insightId;
                const insight = insightsContent[insightId];
                getEl('insight-modal-title').textContent = insight.title;
                getEl('insight-modal-summary').innerHTML = insight.summary;
                getEl('insight-modal-full').innerHTML = insight.fullArticle;
                insightModal.classList.add('visible');
                renderInsightChart(insight.chart);
            }
        });
        const closeModal = () => insightModal.classList.remove('visible');
        getEl('insight-modal-close').addEventListener('click', closeModal);
        insightModal.addEventListener('click', e => {
            if (e.target === insightModal) closeModal();
        });
        getEl('expand-insight-btn').addEventListener('click', () => {
            getEl('insight-modal-full').classList.remove('hidden');
            getEl('expand-insight-btn').classList.add('hidden');
        });
    };

    // --- INSIGHTS CONTENT & RENDERING ---
    const insightsContent = {
        'predictive-aba': { title: 'The Future of ABA is Predictive', teaser: 'Exploring how machine learning can shift ABA from a reactive to a proactive model of care.', summary: 'This article explores how machine learning can shift ABA from a reactive to a proactive model of care, allowing for earlier, more effective interventions.', fullArticle: `<p>For decades, Applied Behavior Analysis has operated on a reactive model. We collect data, analyze it retrospectively, and adjust treatment plans based on past performance. While effective, this approach has an inherent lag. What if we could move from reacting to the past to predicting the future?</p><p>By applying machine learning models like ARIMA and LSTM to longitudinal client data, we can begin to forecast behavioral trends. Imagine an algorithm that flags a client as being at high risk for regression two weeks before it occurs, based on subtle changes in session data. This allows clinicians to intervene proactively, adjusting reinforcement schedules or introducing new antecedent strategies *before* significant issues arise. This isn't about replacing clinical judgment; it's about augmenting it with powerful, predictive tools that allow us to be more efficient, effective, and ultimately, more impactful in our work.</p>`, chart: { type: 'line' } },
        // Additional insight objects can be added here...
    };
    
    const renderInsightChart = (chartConfig) => {
        // Placeholder: implement per-insight charts if needed
        // At present, this function can be extended to display charts in the modal
    };

    const renderInsightsGrid = () => {
        const grid = getEl('insights-grid');
        grid.innerHTML = Object.entries(insightsContent).map(([id, {title, teaser}]) => `
            <div class="p-6 rounded-lg section-bg flex flex-col">
                <h3 class="text-xl font-bold text-light mb-2">${title}</h3>
                <p class="flex-grow mb-4">${teaser}</p>
                <a href="#" class="font-semibold text-primary read-more-link" data-insight-id="${id}">Read More &rarr;</a>
            </div>
        `).join('');
    };


    // --- INITIALIZATION ---
    const init = () => {
        const today = new Date();
        state.clients = generateDummyData(today);
        renderClientList();
        renderProjectCharts();
        renderInsightsGrid();
        setupEventListeners();
        themeCheck();
    };
    
    init();
});
