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
        'predictive-aba': {
            title: 'The Future of ABA is Predictive',
            teaser: 'Exploring how machine learning can shift ABA from a reactive to a proactive model of care.',
            summary: 'This article explores how machine learning can shift ABA from a reactive to a proactive model of care, allowing for earlier, more effective interventions.',
            fullArticle: `<p>For decades, Applied Behavior Analysis has operated on a reactive model. We collect data, analyze it retrospectively, and adjust treatment plans based on past performance. While effective, this approach has an inherent lag. What if we could move from reacting to the past to predicting the future?</p><p>By applying machine learning models like ARIMA and LSTM to longitudinal client data, we can begin to forecast behavioral trends. Imagine an algorithm that flags a client as being at high risk for regression two weeks before it occurs, based on subtle changes in session data. This allows clinicians to intervene proactively, adjusting reinforcement schedules or introducing new antecedent strategies <em>before</em> significant issues arise. This isn't about replacing clinical judgment; it's about augmenting it with powerful, predictive tools that allow us to be more efficient, effective, and ultimately, more impactful in our work.</p>`,
            chart: { type: 'line' }
        },
        'decoding-cusps': {
            title: 'Decoding Behavioral Cusps',
            teaser: 'A case study on using network analysis to identify pivotal skills that unlock rapid, generalized learning.',
            summary: 'A case study on using network analysis to identify pivotal skills that unlock rapid, generalized learning.',
            fullArticle: `<p>A behavioral cusp is a skill that, once learned, opens up a whole new world of learning opportunities for an individual. Identifying these pivotal skills is one of the most critical tasks for a BCBA. Traditionally, this is done through clinical observation and experience. But can we make this process more data-driven?</p><p>Using network analysis, we can model a client’s entire skill repertoire as a series of interconnected nodes. By analyzing how the acquisition of one skill (a node) impacts the rate of acquisition in connected skills, we can start to quantify the “influence” of each target. Skills with the highest influence scores are strong candidates for being behavioral cusps. This data-driven approach allows us to prioritize high-impact targets, ensuring our interventions are not just teaching skills, but unlocking a client’s potential for exponential growth.</p>`,
            chart: { type: 'bubble' }
        },
        'bridging-gap': {
            title: 'Bridging the Data Gap',
            teaser: 'Integrating behavioral data into electronic health records for holistic patient care.',
            summary: 'An opinion piece on integrating behavioral data into electronic health records for holistic patient care.',
            fullArticle: `<p>In today’s healthcare landscape, data is often siloed. A patient’s medical history lives in an Electronic Health Record (EHR), while their rich, detailed behavioral data from ABA therapy resides in a separate platform. As someone with a foot in both worlds, I see this as a massive missed opportunity.</p><p>Consider how a change in medication might correlate with an increase in maladaptive behaviors, or how mastering a communication skill could impact reported anxiety levels at a pediatrician’s visit. By integrating these datasets, we can create a truly holistic view of the individual. This allows for more informed medical decisions, more precise behavioral interventions, and a collaborative care model where physicians and BCBAs can speak the same data-driven language. My goal is to build the pipelines and platforms that make this integrated vision a reality, ensuring that no data point—and no opportunity to improve a life—is left behind.</p>`,
            chart: { type: 'bar' }
        },
        'ai-diagnosis': {
            title: 'AI in Differential Diagnosis',
            teaser: 'Using machine learning to differentiate between complex presentations like ASD and ADHD.',
            summary: 'This article discusses the potential for machine learning models to assist clinicians in the complex process of differential diagnosis between conditions with overlapping symptoms, such as ASD and ADHD.',
            fullArticle: `<p>The symptomatic overlap between neurodevelopmental disorders like ASD and ADHD presents a significant diagnostic challenge. Inattention, impulsivity, and social difficulties can manifest in both, leading to potential misdiagnosis and suboptimal treatment pathways. Machine learning offers a powerful tool to augment clinical judgment in this area.</p><p>By training models on large, multidimensional datasets—including behavioral observations, cognitive assessments, and even biomarker data—we can identify subtle, high-dimensional patterns that may not be apparent to the human observer. A Support Vector Machine (SVM), for example, can find the optimal hyperplane that separates two diagnostic groups in a high-dimensional feature space. This doesn’t replace the clinician, but provides them with a probabilistic tool to inform their diagnostic decision-making, leading to more accurate, earlier diagnoses and better-tailored support for the individual.</p>`,
            chart: { type: 'radar' }
        },
        'ethical-ai': {
            title: 'The Ethical Imperative of AI in ABA',
            teaser: 'Navigating the ethical considerations of implementing AI in a vulnerable population.',
            summary: 'A critical examination of the ethical responsibilities we have when developing and deploying AI tools in the context of ABA therapy.',
            fullArticle: `<p>The promise of AI in ABA is immense, but it comes with profound ethical responsibilities. We must be vigilant about issues of data privacy, algorithmic bias, and the potential for de-skilling our workforce. An algorithm trained on a non-diverse dataset may inadvertently perpetuate existing health disparities. An over-reliance on predictive models could lead to a reduction in critical clinical judgment.</p><p>The solution is not to shy away from technology, but to embrace a framework of “Ethical AI by Design.” This means building systems with transparency, ensuring that models are interpretable (“explainable AI”), and conducting regular audits for bias. It also means prioritizing the clinician-client relationship, ensuring that AI serves as a tool to enhance, not replace, the compassionate, human-centered care that is the cornerstone of our field.</p>`,
            chart: { type: 'bar-stacked' }
        },
        'reinforcement-learning': {
            title: 'Dynamic Treatment Plans with RL',
            teaser: 'How Reinforcement Learning can create truly individualized, adaptive therapy protocols.',
            summary: 'An exploration of how Reinforcement Learning (RL) agents can be used to dynamically optimize treatment plans in real-time based on client performance.',
            fullArticle: `<p>Traditional ABA treatment plans are often reviewed and modified on a weekly or bi-weekly basis. Reinforcement Learning (RL), a branch of AI, offers the potential for near-instantaneous optimization. An RL agent can be conceptualized as a “digital clinician” that observes a client’s response to a specific intervention (e.g., a prompt level, a reinforcer) and receives a “reward” based on the outcome (e.g., a correct, independent response).</p><p>Over thousands of simulated and real-world trials, the agent learns a “policy”—a set of rules for which intervention to select in any given situation to maximize the cumulative reward (i.e., client progress). This could lead to hyper-personalized treatment plans that adapt not just day-to-day, but moment-to-moment, ensuring every learning opportunity is optimized for the individual’s unique learning style and motivation.</p>`,
            chart: { type: 'line-learning' }
        },
        'personalized-medicine': {
            title: 'Personalized Medicine Powered by Data',
            teaser: 'Leveraging multi-omics and behavioral data to tailor interventions.',
            summary: 'This insight discusses how integrating genomic, phenotypic and behavioral data can enable highly individualized medical treatments that improve outcomes and reduce adverse events.',
            fullArticle: `<p>Personalized medicine seeks to move beyond one-size-fits-all approaches by considering the unique biological, behavioral and environmental context of each patient. In my practice, I envision combining multi-omics (genomic, proteomic, metabolomic) data with longitudinal behavioral metrics to generate profiles that guide precision interventions.</p><p>Machine learning models can discover latent subtypes within complex disorders like autism and ADHD, illuminating why certain patients respond well to specific therapies while others do not. By continually learning from outcomes, these systems refine their recommendations, helping clinicians choose treatments that are most likely to be effective for a given individual. This fusion of data science and medicine promises not only better outcomes but also more efficient use of healthcare resources.</p>`,
            chart: { type: 'line' }
        },
        'viz-clinical-decisions': {
            title: 'Visualizing Clinical Decisions',
            teaser: 'Data visualization techniques to enhance clinician decision-making.',
            summary: 'Discusses the role of visual analytics in helping clinicians interpret complex datasets, identify trends and anomalies, and make evidence-based decisions.',
            fullArticle: `<p>Clinicians are inundated with data—from behavioral observations and electronic health records to sensor and wearable data. Visual analytics transforms this deluge of information into intuitive charts, dashboards and heatmaps that reveal critical patterns at a glance.</p><p>For example, a clinician might use a time-series dashboard to monitor progress on key goals, quickly spotting plateaus or regressions that warrant intervention. Geospatial maps can highlight regional disparities in service access, guiding resource allocation. By making data visible and comprehensible, visualization empowers clinicians to base their decisions on evidence rather than intuition alone.</p>`,
            chart: { type: 'bar' }
        },
        'deep-learning-behavior': {
            title: 'Deep Learning for Behavior Analysis',
            teaser: 'Applying neural networks to understand and predict behavior patterns.',
            summary: 'Examines how convolutional and recurrent neural networks can analyze behavioral data to identify latent patterns and inform interventions.',
            fullArticle: `<p>Behavior analysis has long relied on human observers to record and interpret patterns. Deep learning introduces the possibility of automating and enhancing this process by training models on vast datasets of video, audio and sensor data.</p><p>Convolutional neural networks (CNNs) can classify complex behaviors from video, while recurrent neural networks (RNNs) and transformers capture temporal dependencies in sequences of events. In my work, I experiment with PyTorch models that learn to detect precursors to challenging behaviors, enabling earlier interventions. Integrating these models with clinical workflows must be done thoughtfully, ensuring transparency and preserving the clinician’s role as the ultimate decision-maker.</p>`,
            chart: { type: 'radar' }
        },
        'holistic-care-ai': {
            title: 'AI and Holistic Care Models',
            teaser: 'Bridging physical health, mental health and behavior through AI.',
            summary: 'Explores how AI systems can integrate data from multiple domains to support holistic healthcare and coordinate care among providers.',
            fullArticle: `<p>Holistic care recognizes that physical health, mental health and behavior are deeply intertwined. Yet, these domains often remain isolated within healthcare systems. AI has the potential to unify them by aggregating data from electronic health records, behavioral assessments, patient-reported outcomes and even social determinants of health.</p><p>By modeling these interconnected variables, AI can identify root causes of complex presentations, recommend coordinated interventions and monitor responses across domains. For example, a spike in anxiety might be linked to a medication change, suggesting the need for both pharmacological adjustment and increased behavioral support. Through this lens, AI becomes a catalyst for truly integrative, patient-centered care.</p>`,
            chart: { type: 'bar-stacked' }
        }
    };
    
    const renderInsightChart = (chartConfig) => {
        const textColor = '#9CA3AF';
        const gridColor = 'rgba(255, 255, 255, 0.1)';
        let config;
        if (chartConfig.type === 'line') {
            config = {
                type: 'line',
                data: {
                    labels: ['W1','W2','W3','W4','W5','W6'],
                    datasets: [
                        { label: 'Actual', data: [10,12,15,14,18,null], borderColor: '#22D3EE', fill: false },
                        { label: 'Predicted', data: [null,null,null,null,18,22], borderColor: '#F472B6', borderDash: [5,5], fill: false }
                    ]
                },
                options: { scales: { y: { title: { display: true, text: 'Value' } } } }
            };
        } else if (chartConfig.type === 'bubble') {
            config = {
                type: 'bubble',
                data: { datasets: [ { label: 'Skills', data: [ {x:20,y:30,r:15}, {x:40,y:10,r:10}, {x:30,y:25,r:25} ], backgroundColor: 'rgba(34,211,238,0.5)' } ] },
                options: { scales: { x: { title: { display: true, text: 'Generality' } }, y: { title: { display: true, text: 'Impact' } } } }
            };
        } else if (chartConfig.type === 'bar') {
            config = {
                type: 'bar',
                data: { labels: ['A','B','C'], datasets: [ { label: 'Counts', data: [30,20,50], backgroundColor: ['#22D3EE','#4B5563','#F472B6'] } ] },
                options: {}
            };
        } else if (chartConfig.type === 'radar') {
            config = {
                type: 'radar',
                data: {
                    labels: ['Inattention','Hyperactivity','Social Deficit','Repetitive'],
                    datasets: [
                        { label: 'Profile A', data: [6,4,9,8], borderColor: '#22D3EE', backgroundColor: 'rgba(34,211,238,0.2)' },
                        { label: 'Profile B', data: [9,8,5,2], borderColor: '#F472B6', backgroundColor: 'rgba(244,114,182,0.2)' }
                    ]
                }
            };
        } else if (chartConfig.type === 'bar-stacked') {
            config = {
                type: 'bar',
                data: {
                    labels: ['Data Privacy','Algorithmic Bias','Clinical Judgment'],
                    datasets: [
                        { label: 'Risk', data: [8,9,6], backgroundColor: '#F472B6' },
                        { label: 'Mitigation', data: [7,8,9], backgroundColor: '#22D3EE' }
                    ]
                }
            };
        } else if (chartConfig.type === 'line-learning') {
            config = {
                type: 'line',
                data: {
                    labels: Array.from({ length: 100 }, (_, i) => i + 1),
                    datasets: [ { label: 'Agent Reward', data: Array.from({ length: 100 }, (_, i) => Math.log(i+1) * 20), borderColor: '#22D3EE', tension: 0.4, pointRadius: 0 } ]
                },
                options: { scales: { x: { title: { display: true, text: 'Episodes' } }, y: { title: { display: true, text: 'Reward' } } } }
            };
        } else {
            return;
        }
        // Apply common styling
        config.options = config.options || {};
        config.options.responsive = true;
        config.options.maintainAspectRatio = false;
        config.options.plugins = config.options.plugins || {};
        config.options.plugins.legend = { labels: { color: textColor } };
        if (config.options.scales) {
            Object.keys(config.options.scales).forEach(axis => {
                config.options.scales[axis].ticks = { ...(config.options.scales[axis].ticks || {}), color: textColor };
                config.options.scales[axis].grid = { ...(config.options.scales[axis].grid || {}), color: gridColor };
                if (config.options.scales[axis].title) config.options.scales[axis].title.color = textColor;
            });
        }
        createChart('insight-modal-chart', config);
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

    // --- PLOTLY DEMONSTRATION ---
    /**
     * Render the Plotly demonstration chart.
     * Uses pre-defined arrays for epochs and accuracy to build a line chart.
     */
    const renderPlotlyDemo = () => {
        const epochs = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
        const accuracy = [0.545244129544237,0.5672789228047704,0.564233600241796,0.5572959251407621,0.5712322717601058,0.6116175350540323,0.6597095979615637,0.6896807473987014,0.6923635545572526,0.6836793666733189,0.6900002938034788,0.723902812459987,0.7726050111047993,0.8097182206708461,0.8195086352047135,0.8113629005000481,0.8111580752436134,0.8374703825968497,0.8844963162898886,0.9273883575218288];
        const data = [{ x: epochs, y: accuracy, mode: 'lines+markers', name: 'Accuracy', line: { color: '#22D3EE' } }];
        const isDark = document.documentElement.classList.contains('dark');
        const layout = {
            title: 'Model Training Accuracy over Epochs',
            xaxis: { title: 'Epoch', color: isDark ? '#F9FAFB' : '#4B5563' },
            yaxis: { title: 'Accuracy', color: isDark ? '#F9FAFB' : '#4B5563' },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: isDark ? '#F9FAFB' : '#4B5563' }
        };
        if (typeof Plotly !== 'undefined' && document.getElementById('plotly-chart')) {
            Plotly.newPlot('plotly-chart', data, layout, { responsive: true });
        }
    };

    // Additional demonstration charts
    const renderROCChart = () => {
        const ctx = getEl('demo-roc-chart')?.getContext('2d');
        if (!ctx) return;
        if (chartInstances['demo-roc-chart']) chartInstances['demo-roc-chart'].destroy();
        const isDark = htmlEl.classList.contains('dark');
        const textColor = isDark ? '#9CA3AF' : '#4B5563';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        chartInstances['demo-roc-chart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0','0.1','0.2','0.5','1.0'],
                datasets: [{ label: 'ROC Curve', data: [0,0.6,0.8,0.9,1], borderColor: '#22D3EE', fill: false, tension: 0.4 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'False Positive Rate', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { title: { display: true, text: 'True Positive Rate', color: textColor }, min: 0, max: 1, ticks: { color: textColor }, grid: { color: gridColor } }
                },
                plugins: { legend: { labels: { color: textColor } } }
            }
        });
    };

    const renderPieChart = () => {
        const ctx = getEl('demo-pie-chart')?.getContext('2d');
        if (!ctx) return;
        if (chartInstances['demo-pie-chart']) chartInstances['demo-pie-chart'].destroy();
        const isDark = htmlEl.classList.contains('dark');
        chartInstances['demo-pie-chart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Group 1','Group 2','Group 3'],
                datasets: [{ data: [40,30,30], backgroundColor: ['#22D3EE','#4B5563','#F472B6'], borderWidth: 0 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#9CA3AF' : '#4B5563' } } }
            }
        });
    };

    const initLeafletMap = () => {
        if (typeof L === 'undefined') return;
        const mapEl = getEl('demo-map');
        if (!mapEl) return;
        const map = L.map(mapEl).setView([37.5, -77.5], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        const markers = [
            { coords: [36.8508, -76.2859], label: 'Norfolk, VA' },
            { coords: [38.9072, -77.0369], label: 'Washington, DC' },
            { coords: [34.0522, -118.2437], label: 'Los Angeles, CA' },
            { coords: [40.7128, -74.0060], label: 'New York, NY' }
        ];
        markers.forEach(m => L.marker(m.coords).addTo(map).bindPopup(m.label));
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
        // Render Plotly demonstration chart
        renderPlotlyDemo();
    };
    
    init();
});
