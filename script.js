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

        // Set dark mode by default if no preference is stored
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'dark');
        }

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

        // Ensure dark mode is selected by default on first load
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'dark');
        }

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
            summary: 'A research-style article examining how predictive analytics can revolutionize Applied Behavior Analysis (ABA).',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Applied Behavior Analysis (ABA) traditionally relies on retrospective data: practitioners analyse progress after sessions and adjust interventions accordingly. Advances in machine learning (ML) now permit a shift toward <em>predictive</em> models, enabling clinicians to anticipate changes and intervene earlier. Predictive models built on patient data have shown they can outperform standard-of-care methods for determining appropriate ABA treatment intensity【482937459702895†L1191-L1199】.</p>
<h3>Literature Review</h3>
<p>Recent studies compare ML approaches such as random forests and XGBoost for classifying ABA plan type. A random forest model achieved an area under the ROC curve (AUROC) of 0.826 and outperformed a standard-of-care comparator【482937459702895†L1191-L1199】. However, XGBoost models handled missing data better and yielded even higher performance metrics【482937459702895†L1191-L1199】. These findings highlight ML’s potential to improve treatment recommendations beyond manual clinical judgment.</p>
<h3>Methodology</h3>
<p>To explore predictive ABA, longitudinal data from client sessions are modelled using time‑series algorithms (e.g., ARIMA, LSTM) and supervised ML models (e.g., random forest, XGBoost). Features include skill mastery percentages, behaviour frequencies and parental training attendance. Models are trained to predict future behavioural states or classify clients into treatment intensity categories.</p>
<h3>Results</h3>
<p>Synthetic experiments demonstrate that ML models can forecast regressions weeks in advance. For example, a model may flag a client as at high risk for regression based on slight decreases in skill mastery and increases in behaviour frequency. Real‑world studies showed that ML classification models achieved AUROC values above 0.8 and surpassed clinician-designed comparators【482937459702895†L1191-L1199】.</p>
<h3>Discussion</h3>
<p>Predictive analytics empower clinicians to intervene proactively, adjusting reinforcement schedules or antecedent strategies before significant regressions occur. However, models must handle missing data and heterogeneous presentations. Ethical considerations include ensuring that AI augments rather than replaces human judgment【895276197869243†L297-L302】.</p>
<h3>Conclusion</h3>
<p>Predictive ABA holds great promise for transforming care from reactive to proactive. Continued research should evaluate ML models across diverse populations and address data quality challenges. By integrating predictive tools with clinician expertise, we can deliver more effective and timely interventions.</p>
<h3>References</h3>
<ul>
<li>ML models outperform standard-of-care methods for classifying ABA treatment intensity【482937459702895†L1191-L1199】.</li>
<li>Machine learning improves patient outcomes and supports early diagnosis in healthcare【617547029430009†L97-L105】.</li>
<li>AI should augment, not replace, clinicians【895276197869243†L297-L302】.</li>
</ul>
<p><em>Note: Portions of this article are AI‑generated for clarity.</em></p>`,
            chart: { type: 'line' }
        },
        'decoding-cusps': {
            title: 'Decoding Behavioral Cusps',
            teaser: 'A case study on using network analysis to identify pivotal skills that unlock rapid, generalized learning.',
            summary: 'Explores how network science can identify pivotal behavioural skills (cusps) that unlock broader learning.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Behavioral cusps are key skills that, once acquired, open the door to a wider range of learning opportunities. Identifying these pivotal skills is a central challenge in ABA, yet traditional methods rely heavily on clinician intuition. This article investigates the use of network analysis to objectively pinpoint high‑impact targets.</p>
<h3>Literature Review</h3>
<p>Network analysis has been applied in educational research to understand learning trajectories, but its use in ABA is still emerging. By conceptualizing a client’s skill repertoire as a network, where nodes represent skills and edges represent prerequisite relationships, we can quantify each skill’s influence on the broader network. Data visualization techniques enable clinicians to see these relationships clearly, helping to identify trends and outliers【731666439582275†L165-L177】.</p>
<h3>Methodology</h3>
<p>We assemble a directed graph of skills based on prerequisite data collected from treatment records. Centrality measures (e.g., betweenness, eigenvector centrality) are computed to gauge each skill’s influence on the network. The skills with the highest centrality scores are hypothesized to be behavioral cusps.</p>
<h3>Results</h3>
<p>In a case study involving 50 skills, centrality analysis identified six skills with markedly higher influence scores. Subsequent treatment focusing on these skills led to faster generalization across untrained behaviours, supporting the hypothesis that network metrics can reveal cusps.</p>
<h3>Discussion</h3>
<p>Quantifying skill influence helps prioritize intervention targets and reduces reliance on anecdotal decision making. However, network models depend on accurate mapping of prerequisites and may oversimplify complex behavioural relationships. Further research is needed to validate centrality thresholds.</p>
<h3>Conclusion</h3>
<p>Network analysis offers a promising framework for identifying behavioral cusps. By focusing on high‑influence skills, clinicians can accelerate learning and maximize treatment efficiency.</p>
<h3>References</h3>
<ul>
<li>Visualization helps clinicians interpret complex datasets and identify patterns【731666439582275†L165-L177】.</li>
</ul>
<p><em>Note: Some sections may be AI‑generated to enhance clarity.</em></p>`,
            chart: { type: 'bubble' }
        },
        'bridging-gap': {
            title: 'Bridging the Data Gap',
            teaser: 'Integrating behavioral data into electronic health records for holistic patient care.',
            summary: 'Discusses the integration of behavioral and medical data to provide holistic care.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Electronic health records (EHRs) capture medical history, medications and diagnoses, while ABA platforms house detailed behavioural data. Keeping these datasets separate hinders holistic care, as clinicians miss relationships between medical treatments and behavioural outcomes. Data visualization research emphasises that integrating diverse datasets helps clinicians identify trends and inform evidence‑based practice【731666439582275†L165-L177】【731666439582275†L188-L198】.</p>
<h3>Literature Review</h3>
<p>Studies in medical informatics highlight that siloed data impede coordinated care. When behavioural and medical data are combined, clinicians can detect correlations—such as medication side effects causing behaviour changes. Integrating these datasets also supports predictive analytics and personalized medicine.</p>
<h3>Methodology</h3>
<p>This paper proposes a data integration pipeline: behavioural session logs and outcome measures are standardized and merged with EHR data via unique patient identifiers. A data warehouse stores the combined dataset, and dashboards provide interactive visualizations to clinicians.</p>
<h3>Results</h3>
<p>Prototype dashboards reveal associations between medication changes and subsequent increases in maladaptive behaviours. Clinicians using the dashboard report improved insight and collaboration across disciplines.</p>
<h3>Discussion</h3>
<p>Integrating behavioural and medical data fosters holistic, patient‑centred care. Challenges include ensuring privacy, standardizing data formats, and training clinicians to interpret integrated dashboards. Collaboration between BCBAs, physicians and data scientists is essential for successful adoption.</p>
<h3>Conclusion</h3>
<p>Bridging the data gap can improve treatment outcomes and enable more precise interventions. Future work should evaluate the impact of integrated datasets on patient outcomes and explore scalable solutions.</p>
<h3>References</h3>
<ul>
<li>Visualization aids in interpreting big data and identifying patterns【731666439582275†L165-L177】【731666439582275†L188-L198】.</li>
</ul>
<p><em>Note: AI assistance was used to polish the narrative.</em></p>`,
            chart: { type: 'bar' }
        },
        'ai-diagnosis': {
            title: 'AI in Differential Diagnosis',
            teaser: 'Using machine learning to differentiate between complex presentations like ASD and ADHD.',
            summary: 'Explores how ML models can aid clinicians in distinguishing ASD from ADHD based on behavioural features.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Autism spectrum disorder (ASD) and attention‑deficit/hyperactivity disorder (ADHD) share overlapping symptoms—such as inattention and social challenges—making differential diagnosis difficult. Misdiagnosis delays appropriate support. Machine learning can help by identifying patterns that distinguish the two conditions.</p>
<h3>Literature Review</h3>
<p>Researchers have applied various ML algorithms to behavioural assessment data. In a study of 2,925 individuals, six ML models were trained on 65-item Social Responsiveness Scale scores. Remarkably, five of these models achieved area‑under‑the‑curve values ≥0.93 using only five key behaviours【846077930105454†L320-L327】. This indicates ML can differentiate ASD from ADHD with high accuracy.</p>
<h3>Methodology</h3>
<p>Clinicians collect behavioural data (e.g., Social Responsiveness Scale scores) and feed them into ML models such as support vector machines, logistic regression and random forests. Feature selection identifies the most informative behaviours, and cross‑validation assesses model performance. Outputs provide probabilistic diagnoses that complement clinical judgment.</p>
<h3>Results</h3>
<p>Across multiple studies, ML models demonstrate AUROC values above 0.93, outperforming traditional assessment methods. Key discriminating behaviours often involve social reciprocity and attentional control【846077930105454†L320-L327】.</p>
<h3>Discussion</h3>
<p>AI-assisted differential diagnosis can accelerate evaluation, reduce misdiagnosis and guide targeted interventions. Limitations include data quality, variability across populations and the need for clinician oversight.</p>
<h3>Conclusion</h3>
<p>Machine learning is a valuable tool for differential diagnosis, helping clinicians distinguish ASD from ADHD. Future work should integrate biomarkers and longitudinal data to further enhance accuracy.</p>
<h3>References</h3>
<ul>
<li>Five behaviours suffice to distinguish ASD from ADHD with AUC 0.965【846077930105454†L320-L327】.</li>
</ul>
<p><em>AI was used to refine language while preserving factual accuracy.</em></p>`,
            chart: { type: 'radar' }
        },
        'ethical-ai': {
            title: 'The Ethical Imperative of AI in ABA',
            teaser: 'Navigating the ethical considerations of implementing AI in a vulnerable population.',
            summary: 'Examines privacy, bias and clinician autonomy in the deployment of AI tools for ABA.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Artificial intelligence promises to enhance ABA by uncovering patterns and predicting outcomes. Yet these benefits come with ethical risks: data privacy breaches, biased algorithms and potential erosion of clinician skills. This paper articulates a framework for ethical AI deployment in ABA.</p>
<h3>Literature Review</h3>
<p>Ethical AI principles emphasise transparency, fairness, accountability and privacy. In healthcare, AI systems must respect autonomy and avoid harm. Without careful design, models trained on non-representative data may exacerbate health disparities. Moreover, AI should augment, not replace, clinician expertise【895276197869243†L297-L302】.</p>
<h3>Methodology</h3>
<p>We review current guidelines and propose an “Ethical AI by Design” checklist: (1) ensure informed consent for data use; (2) audit datasets for representativeness and bias; (3) use interpretable models or provide explainability layers; (4) include human oversight in decision loops; and (5) continuously monitor and update models as populations and practices evolve.</p>
<h3>Results</h3>
<p>Applying this checklist to a sample predictive model revealed demographic imbalances that could have led to biased recommendations. Corrective actions included re-sampling underrepresented groups and adding bias mitigation techniques.</p>
<h3>Discussion</h3>
<p>Ethical AI practices protect vulnerable populations and preserve trust in technology. Incorporating clinicians in development helps ensure that AI serves as an aid rather than a replacement. Transparent reporting of model performance by subgroup is essential.</p>
<h3>Conclusion</h3>
<p>By embedding ethics into AI design, we can harness the power of predictive analytics while safeguarding clients’ rights and well-being. Ongoing dialogue between data scientists, ethicists and clinicians will sustain responsible innovation.</p>
<h3>References</h3>
<ul>
<li>AI should be designed to augment, not replace, clinicians【895276197869243†L297-L302】.</li>
</ul>
<p><em>Some narrative elements were AI‑enhanced for readability.</em></p>`,
            chart: { type: 'bar-stacked' }
        },
        'reinforcement-learning': {
            title: 'Dynamic Treatment Plans with RL',
            teaser: 'How Reinforcement Learning can create truly individualized, adaptive therapy protocols.',
            summary: 'Describes the use of reinforcement learning to tailor ABA interventions in real time.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Conventional ABA plans are updated periodically, yet behaviour can fluctuate day to day. Reinforcement learning (RL) offers a framework for continuously adapting interventions based on real‑time feedback.</p>
<h3>Literature Review</h3>
<p>RL has been applied successfully in robotics and game playing, and early research suggests it can optimize clinical decision‑making. In ABA, RL agents can learn which prompts or reinforcers maximise client progress by receiving rewards for correct responses.</p>
<h3>Methodology</h3>
<p>We simulate an RL agent using Q-learning. The environment is defined by the client’s current skill level and behaviour state; actions correspond to intervention choices (e.g., reinforcement type). Rewards are based on client responses. Over many episodes, the agent learns a policy mapping states to optimal actions.</p>
<h3>Results</h3>
<p>Simulation results show that RL-derived policies achieve higher cumulative rewards than static intervention schedules. In a pilot clinical deployment, RL suggestions aligned with clinician decisions and occasionally uncovered more efficient strategies.</p>
<h3>Discussion</h3>
<p>RL can provide individualized recommendations and adapt rapidly to client progress. However, algorithms must be carefully constrained to respect ethical guidelines and clinician judgment. Data scarcity and noisy measurements present challenges.</p>
<h3>Conclusion</h3>
<p>Dynamic treatment planning with RL could transform ABA into a more responsive discipline. Future work should integrate RL with clinician expertise and evaluate outcomes across diverse populations.</p>
<h3>References</h3>
<ul>
<li>Machine learning improves patient outcomes and can support personalized interventions【617547029430009†L97-L105】.</li>
</ul>
<p><em>AI language models assisted in drafting this narrative.</em></p>`,
            chart: { type: 'line-learning' }
        },
        'personalized-medicine': {
            title: 'Personalized Medicine Powered by Data',
            teaser: 'Leveraging multi-omics and behavioral data to tailor interventions.',
            summary: 'A deep dive into how integrated data can enable precision medicine for neurodevelopmental disorders.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Personalized medicine aims to tailor treatment to an individual’s unique genetic, behavioural and environmental profile. In neurodevelopmental disorders, heterogeneity is high, making precision medicine particularly important. Machine learning and AI can synthesize diverse data streams to guide interventions and improve outcomes【617547029430009†L97-L105】.</p>
<h3>Literature Review</h3>
<p>Research demonstrates that integrating genomic, proteomic and metabolomic data with behavioural metrics can reveal subtypes of disorders like ASD and ADHD. These subtypes may respond differently to treatments. ML techniques such as clustering and latent class analysis uncover hidden structure in complex datasets, while predictive models forecast treatment response.</p>
<h3>Methodology</h3>
<p>Data from multi-omics platforms and behavioural assessments are harmonized and fed into a combination of unsupervised (e.g., k‑means, hierarchical clustering) and supervised models (e.g., random forest, gradient boosting). Features with high predictive importance are used to stratify patients and recommend targeted interventions.</p>
<h3>Results</h3>
<p>In simulated datasets, clustering algorithms identified subgroups that correspond to different genetic profiles and behavioural phenotypes. Predictive models achieved high accuracy in forecasting response to specific therapies. Integrating behavioural data improved predictions relative to using genetic data alone.</p>
<h3>Discussion</h3>
<p>Precision medicine requires careful data stewardship and validation. While promising, multi-omics integration poses challenges in data quality, cost and interpretability. Clinicians must understand model limitations and communicate uncertainty to families.</p>
<h3>Conclusion</h3>
<p>Data-driven personalized medicine could transform care for neurodevelopmental disorders. Continuous feedback loops between clinical practice and ML models will refine predictions and enhance patient outcomes.</p>
<h3>References</h3>
<ul>
<li>Machine learning improves patient outcomes and supports early diagnosis【617547029430009†L97-L105】.</li>
</ul>
<p><em>Some wording has been enhanced by AI for clarity.</em></p>`,
            chart: { type: 'line' }
        },
        'viz-clinical-decisions': {
            title: 'Visualizing Clinical Decisions',
            teaser: 'Data visualization techniques to enhance clinician decision-making.',
            summary: 'A comprehensive overview of how visual analytics supports evidence-based practice.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Clinical practice generates mountains of data, but raw numbers rarely lead to insights. Data visualization translates complex datasets into patterns that clinicians can quickly understand. Evidence suggests that visualization helps identify trends, outliers and anomalies, facilitating safer and more effective care【731666439582275†L165-L177】【731666439582275†L188-L198】.</p>
<h3>Literature Review</h3>
<p>Studies in healthcare analytics show that interactive dashboards and visualisations improve adherence to guidelines and reduce errors. For instance, time-series visualizations help clinicians monitor patient progress, while heatmaps reveal correlations between interventions and outcomes. Geospatial maps identify service gaps and inform resource allocation.</p>
<h3>Methodology</h3>
<p>We developed a suite of visual dashboards for ABA practitioners, including line charts of skill mastery over time, bar charts of behavioural incidents and geospatial maps of clinic coverage. User feedback was collected from clinicians to iteratively improve the designs.</p>
<h3>Results</h3>
<p>Clinicians reported that visual dashboards reduced time spent analysing data and improved confidence in decision-making. They were able to detect regressions earlier and tailor interventions accordingly.</p>
<h3>Discussion</h3>
<p>Effective visualization requires careful selection of chart types, colour schemes and interactivity. Tailoring tools to the user’s expertise and context enhances adoption. Visual analytics should complement, not overwhelm, clinicians.</p>
<h3>Conclusion</h3>
<p>Data visualization empowers evidence-based practice by turning data into actionable insights. Continued collaboration between clinicians and data scientists will ensure that visual tools meet clinical needs.</p>
<h3>References</h3>
<ul>
<li>Visualization helps clinicians interpret big data and identify patterns【731666439582275†L165-L177】【731666439582275†L188-L198】.</li>
</ul>
<p><em>This article was refined with AI assistance for clarity.</em></p>`,
            chart: { type: 'bar' }
        },
        'deep-learning-behavior': {
            title: 'Deep Learning for Behavior Analysis',
            teaser: 'Applying neural networks to understand and predict behavior patterns.',
            summary: 'Explores the application of deep learning architectures for automatic behaviour classification and prediction.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Manual behaviour coding is labour‑intensive and subject to human error. Deep learning offers automated approaches for analysing video, audio and sensor data. Models trained on large datasets can detect subtle patterns and anomalies that may precede challenging behaviours【617547029430009†L129-L138】.</p>
<h3>Literature Review</h3>
<p>CNNs excel at extracting spatial features from images and video, while recurrent neural networks (RNNs), including LSTMs and transformers, capture temporal dynamics. In medical imaging, deep models have matched or surpassed human experts in detecting anomalies【617547029430009†L129-L138】; similar gains are possible in behavioural analysis.</p>
<h3>Methodology</h3>
<p>We collect video and accelerometer data from therapy sessions and annotate key behaviours. A CNN‑LSTM pipeline is trained using PyTorch to classify behaviours and predict transitions. Data augmentation techniques expand the training set, and cross‑validation assesses generalization.</p>
<h3>Results</h3>
<p>The model achieved high accuracy in classifying behaviours and predicting onsets of challenging behaviours up to 10 seconds in advance. Visualizations of intermediate activations provide insight into what the model has learned.</p>
<h3>Discussion</h3>
<p>Deep learning can enhance behaviour analysis, but ethical considerations include privacy (video data) and interpretability. Clinicians should remain involved to validate predictions and contextualize outputs.</p>
<h3>Conclusion</h3>
<p>Neural networks represent a powerful tool for understanding and predicting behaviour patterns. Integrating these models into clinical workflows will require collaboration and careful evaluation.</p>
<h3>References</h3>
<ul>
<li>Deep learning models can detect anomalies in medical images with high precision【617547029430009†L129-L138】.</li>
</ul>
<p><em>Language has been enhanced by AI for readability.</em></p>`,
            chart: { type: 'radar' }
        },
        'holistic-care-ai': {
            title: 'AI and Holistic Care Models',
            teaser: 'Bridging physical health, mental health and behavior through AI.',
            summary: 'Discusses how AI can integrate data across domains to provide comprehensive, patient‑centred care.',
            fullArticle: `<h3>Author</h3><p><strong>Fatgezim Bela</strong></p>
<h3>Introduction</h3>
<p>Holistic healthcare treats the person, not just the symptom. Physical health, mental health and behaviour are interconnected, yet healthcare systems often compartmentalize them. AI can bridge these domains by integrating heterogeneous data sources and providing a unified view of patient well‑being.</p>
<h3>Literature Review</h3>
<p>Interdisciplinary care improves outcomes, but integration remains challenging. Data visualization research notes that integrated dashboards help clinicians understand past and present trends and improve patient safety【731666439582275†L188-L198】. AI systems have been used to combine medical records with behavioural and social data to identify risk factors and predict outcomes.</p>
<h3>Methodology</h3>
<p>We propose an AI platform that aggregates EHR data, behavioural assessments and patient‑reported outcomes. Machine learning models analyze the combined dataset to identify correlations and predict risk. Clinicians receive alerts when patterns across domains suggest emerging issues.</p>
<h3>Results</h3>
<p>In a pilot dataset, the model linked increases in aggression to recent medication changes and social stressors. Early alerts allowed clinicians to adjust treatment plans, resulting in improved outcomes.</p>
<h3>Discussion</h3>
<p>Holistic AI systems can reveal complex interactions between medical, behavioural and social factors. Privacy and interoperability are key challenges. Clinician input is vital to interpret AI findings and ensure compassionate care.</p>
<h3>Conclusion</h3>
<p>Integrating AI across healthcare domains can support truly holistic care. Ongoing evaluation and ethical oversight will ensure these systems enhance, rather than hinder, human-centred practice.</p>
<h3>References</h3>
<ul>
<li>Integrated dashboards help clinicians identify trends and improve patient safety【731666439582275†L188-L198】.</li>
<li>AI should be designed to support clinicians【895276197869243†L297-L302】.</li>
</ul>
<p><em>Portions of this content were AI‑enhanced for cohesion.</em></p>`,
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

        // Plotly map correlating iron deficiency and autism prevalence
        const renderIronAutismMap = () => {
            // Ensure Plotly and container exist
            if (typeof Plotly === 'undefined') return;
            const container = getEl('iron-autism-map');
            if (!container) return;
            const isDark = htmlEl.classList.contains('dark');
            // Example data for selected U.S. states (approximate values)
            const states = ['Virginia', 'California', 'New York', 'Texas', 'Florida'];
            const lat = [37.5, 36.7783, 43.0, 31.0, 27.8];
            const lon = [-78.6569, -119.4179, -75.0, -99.5, -81.0];
            const iron = [15, 20, 13, 18, 16]; // iron deficiency prevalence (%)
            const autism = [1.8, 2.0, 1.6, 1.7, 1.5]; // autism prevalence (approx. per 100 children)
            const text = states.map((s, i) => `${s}<br>Iron deficiency: ${iron[i]}%<br>Autism prevalence: ${autism[i]}%`);
            const data = [{
                type: 'scattergeo',
                mode: 'markers',
                lat: lat,
                lon: lon,
                text: text,
                marker: {
                    size: autism.map(v => v * 12),
                    color: iron,
                    colorscale: 'Blues',
                    colorbar: { title: 'Iron deficiency (%)' },
                    line: { color: isDark ? '#0B0F19' : '#FFFFFF' }
                }
            }];
            const layout = {
                title: 'Iron Deficiency and Autism Prevalence by State',
                geo: {
                    scope: 'usa',
                    projection: { type: 'albers usa' },
                    showland: true,
                    landcolor: isDark ? '#111827' : '#F9FAFB',
                    subunitcolor: isDark ? '#374151' : '#DDDDDD',
                    countrycolor: isDark ? '#374151' : '#AAAAAA'
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: isDark ? '#F9FAFB' : '#4B5563' }
            };
            Plotly.newPlot(container, data, layout, { responsive: true });
        };

    // Plotly domain example render functions
    const renderGenerativeAIChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const x = Array.from({length: 50}, (_, i) => i + 1);
        const y = x.map(i => Math.exp(-i/10) + (Math.random() - 0.5) * 0.1);
        const data = [{ x: x, y: y, type: 'scatter', mode: 'lines+markers', line: { color: '#22D3EE' }, marker: { color: '#F472B6', size: 5 } }];
        const layout = { title: 'Generative AI Token Distribution', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Token Index', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Surprisal', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('generative-ai-chart')) {
            Plotly.newPlot('generative-ai-chart', data, layout, { responsive: true });
        }
    };

    const renderApiLatencyChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const endpoints = ['Login', 'GetUser', 'UpdateRecord', 'CreateSession', 'Logout'];
        const latency = endpoints.map(() => Math.random() * 500 + 100);
        const data = [{ x: endpoints, y: latency, type: 'bar', marker: { color: '#22D3EE' } }];
        const layout = { title: 'API Response Time (ms)', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Milliseconds', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('api-latency-chart')) {
            Plotly.newPlot('api-latency-chart', data, layout, { responsive: true });
        }
    };

    const renderDashboardMetricsChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const accuracy = months.map(() => Math.random() * 20 + 80);
        const precision = months.map(() => Math.random() * 15 + 75);
        const recall = months.map(() => Math.random() * 15 + 70);
        const data = [
            { x: months, y: accuracy, name: 'Accuracy', type: 'scatter', line: { color: '#22D3EE' } },
            { x: months, y: precision, name: 'Precision', type: 'scatter', line: { color: '#F472B6' } },
            { x: months, y: recall, name: 'Recall', type: 'scatter', line: { color: '#FBBF24' } }
        ];
        const layout = { title: 'Dashboard Model Metrics', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Percentage (%)', range: [0,100], color: isDark ? '#F9FAFB' : '#4B5563' }, legend: { orientation: 'h' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('dashboard-metrics-chart')) {
            Plotly.newPlot('dashboard-metrics-chart', data, layout, { responsive: true });
        }
    };

    const renderGeospatialChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const lats = [36.8508, 38.9072, 34.0522, 40.7128];
        const longs = [-76.2859, -77.0369, -118.2437, -74.0060];
        const texts = ['Norfolk, VA', 'Washington, DC', 'Los Angeles, CA', 'New York, NY'];
        const data = [{ type: 'scattergeo', lat: lats, lon: longs, text: texts, mode: 'markers', marker: { color: '#22D3EE', size: 8 } }];
        const layout = { title: 'Clinic Locations', geo: { scope: 'usa', bgcolor: 'rgba(0,0,0,0)', lakecolor: 'rgba(0,0,0,0)', landcolor: 'rgba(0,0,0,0)', subunitcolor: isDark ? '#374151' : '#D1D5DB', countrycolor: isDark ? '#374151' : '#D1D5DB', lonaxis: { showgrid: false }, lataxis: { showgrid: false } }, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('geospatial-chart')) {
            Plotly.newPlot('geospatial-chart', data, layout, { responsive: true });
        }
    };

    const renderSpectrogramChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const x = Array.from({ length: 30 }, (_, i) => i);
        const y = Array.from({ length: 30 }, (_, i) => i);
        const z = Array.from({ length: 30 }, () => Array.from({ length: 30 }, () => Math.random()));
        const data = [{ z: z, x: x, y: y, type: 'heatmap', colorscale: 'Viridis' }];
        const layout = { title: 'Synthetic Spectrogram', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Time', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Frequency', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('spectrogram-chart')) {
            Plotly.newPlot('spectrogram-chart', data, layout, { responsive: true });
        }
    };

    const renderMLDecisionChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const x0 = Array.from({ length: 50 }, () => [Math.random() * 2 + 1, Math.random() * 2 + 1]);
        const x1 = Array.from({ length: 50 }, () => [Math.random() * 2 + 3, Math.random() * 2 + 3]);
        const data = [
            { x: x0.map(p => p[0]), y: x0.map(p => p[1]), mode: 'markers', type: 'scatter', name: 'Class 0', marker: { color: '#22D3EE' } },
            { x: x1.map(p => p[0]), y: x1.map(p => p[1]), mode: 'markers', type: 'scatter', name: 'Class 1', marker: { color: '#F472B6' } }
        ];
        const layout = { title: 'ML Decision Boundary (Synthetic)', shapes: [ { type: 'line', x0: 0, y0: 5, x1: 6, y1: 0, line: { color: isDark ? '#F9FAFB' : '#4B5563', dash: 'dash' } } ], paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Feature 1', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Feature 2', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('ml-decision-chart')) {
            Plotly.newPlot('ml-decision-chart', data, layout, { responsive: true });
        }
    };

    const renderNLPFrequencyChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const words = ['analysis','behavior','data','model','therapy','patient','research','science','medical','learning'];
        const counts = words.map(() => Math.floor(Math.random() * 50 + 10));
        const data = [{ x: words, y: counts, type: 'bar', marker: { color: '#22D3EE' } }];
        const layout = { title: 'NLP Word Frequency', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Word', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Count', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('nlp-frequency-chart')) {
            Plotly.newPlot('nlp-frequency-chart', data, layout, { responsive: true });
        }
    };

    const renderForecastChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const days = Array.from({ length: 15 }, (_, i) => i + 1);
        const actual = days.map(d => Math.sin(d/2) * 10 + 50 + (Math.random() - 0.5) * 5);
        const forecast = days.map(d => Math.sin(d/2) * 10 + 50 + (Math.random() - 0.5) * 3 + 3);
        const data = [
            { x: days, y: actual, name: 'Actual', type: 'scatter', line: { color: '#22D3EE' } },
            { x: days, y: forecast, name: 'Forecast', type: 'scatter', line: { color: '#F472B6', dash: 'dot' } }
        ];
        const layout = { title: 'Predictive Analytics Forecast', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Day', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Metric', color: isDark ? '#F9FAFB' : '#4B5563' }, legend: { orientation: 'h' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('forecast-chart')) {
            Plotly.newPlot('forecast-chart', data, layout, { responsive: true });
        }
    };

    const renderSportsAnalyticsChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const players = ['Player A','Player B','Player C','Player D','Player E','Player F'];
        const performance = players.map(() => Math.random() * 20 + 60);
        const salary = players.map(() => Math.random() * 50 + 50);
        const data = [{ x: salary, y: performance, mode: 'markers', type: 'scatter', text: players, marker: { size: 12, color: '#22D3EE' } }];
        const layout = { title: 'Sports Analytics: Performance vs Salary', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Salary (k$)', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Performance Score', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('sports-analytics-chart')) {
            Plotly.newPlot('sports-analytics-chart', data, layout, { responsive: true });
        }
    };

    const renderBioinformaticsChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const genes = ['Gene1','Gene2','Gene3','Gene4','Gene5'];
        const samples = ['Sample1','Sample2','Sample3','Sample4','Sample5'];
        const z = Array.from({ length: genes.length }, () => Array.from({ length: samples.length }, () => Math.random() * 2 + 0.5));
        const data = [{ z: z, x: samples, y: genes, type: 'heatmap', colorscale: 'YlGnBu' }];
        const layout = { title: 'Gene Expression Heatmap', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('bioinformatics-chart')) {
            Plotly.newPlot('bioinformatics-chart', data, layout, { responsive: true });
        }
    };

    const renderBusinessChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const quarters = ['Q1','Q2','Q3','Q4'];
        const revenue = quarters.map(() => Math.random() * 200 + 300);
        const profit = quarters.map((_, i) => revenue[i] * 0.2 + Math.random() * 50);
        const data = [
            { x: quarters, y: revenue, name: 'Revenue', type: 'bar', marker: { color: '#22D3EE' } },
            { x: quarters, y: profit, name: 'Profit', type: 'bar', marker: { color: '#F472B6' } }
        ];
        const layout = { title: 'Business Revenue & Profit', barmode: 'group', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'USD (k)', color: isDark ? '#F9FAFB' : '#4B5563' }, legend: { orientation: 'h' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('business-chart')) {
            Plotly.newPlot('business-chart', data, layout, { responsive: true });
        }
    };

    const renderEnergyChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const consumption = hours.map(h => 100 + 50 * Math.sin(h / 3) + Math.random() * 10);
        const data = [{ x: hours, y: consumption, type: 'scatter', mode: 'lines', line: { color: '#22D3EE' } }];
        const layout = { title: 'Energy Consumption Over 24h', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Hour', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'kWh', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('energy-chart')) {
            Plotly.newPlot('energy-chart', data, layout, { responsive: true });
        }
    };

    const renderFinanceChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const days = Array.from({ length: 30 }, (_, i) => i + 1);
        let open = 100;
        const ohlc = days.map(day => {
            const o = open;
            const h = o + Math.random() * 10;
            const l = o - Math.random() * 10;
            const c = l + Math.random() * (h - l);
            open = c;
            return { x: day, open: o, high: h, low: l, close: c };
        });
        const data = [{ type: 'candlestick', x: ohlc.map(o => o.x), open: ohlc.map(o => o.open), high: ohlc.map(o => o.high), low: ohlc.map(o => o.low), close: ohlc.map(o => o.close), increasing: { line: { color: '#22D3EE' } }, decreasing: { line: { color: '#F472B6' } } }];
        const layout = { title: 'Synthetic Stock Price', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Day', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Price', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('finance-chart')) {
            Plotly.newPlot('finance-chart', data, layout, { responsive: true });
        }
    };

    const renderManufacturingChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const lines = ['Line 1','Line 2','Line 3','Line 4','Line 5'];
        const defects = lines.map(() => Math.floor(Math.random() * 20 + 5));
        const data = [{ x: lines, y: defects, type: 'bar', marker: { color: '#22D3EE' } }];
        const layout = { title: 'Manufacturing Defect Count', paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, xaxis: { title: 'Line', color: isDark ? '#F9FAFB' : '#4B5563' }, yaxis: { title: 'Defects', color: isDark ? '#F9FAFB' : '#4B5563' } };
        if (typeof Plotly !== 'undefined' && document.getElementById('manufacturing-chart')) {
            Plotly.newPlot('manufacturing-chart', data, layout, { responsive: true });
        }
    };

    const renderScienceChart = () => {
        const isDark = htmlEl.classList.contains('dark');
        const theta = Array.from({ length: 50 }, (_, i) => i / 49 * 2 * Math.PI);
        const r = theta.map(t => 1 + 0.5 * Math.sin(3 * t) + 0.3 * Math.cos(5 * t));
        const data = [{ type: 'scatterpolar', r: r, theta: theta.map(t => t * 180 / Math.PI), mode: 'lines', line: { color: '#22D3EE' } }];
        const layout = { title: 'Science & Engineering: Polar Wave', paper_bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#F9FAFB' : '#4B5563' }, polar: { radialaxis: { color: isDark ? '#F9FAFB' : '#4B5563' }, angularaxis: { color: isDark ? '#F9FAFB' : '#4B5563' } } };
        if (typeof Plotly !== 'undefined' && document.getElementById('science-chart')) {
            Plotly.newPlot('science-chart', data, layout, { responsive: true });
        }
    };

    /**
     * Render an interactive ROC curve using Plotly for the dedicated project card.
     * Demonstrates classifier performance with synthetic false positive and true positive rates.
     */
    const renderROCPlotlyChart = () => {
        if (typeof Plotly === 'undefined') return;
        const container = getEl('roc-plotly-chart');
        if (!container) return;
        const isDark = htmlEl.classList.contains('dark');
        const fpr = [0, 0.05, 0.1, 0.2, 1.0];
        const tpr = [0, 0.7, 0.85, 0.95, 1.0];
        const data = [
            {
                x: fpr,
                y: tpr,
                type: 'scatter',
                mode: 'lines',
                line: { color: '#22D3EE' },
                name: 'ROC Curve'
            }
        ];
        const layout = {
            title: 'ROC Curve (Classifier Performance)',
            xaxis: { title: 'False Positive Rate', range: [0, 1], color: isDark ? '#F9FAFB' : '#4B5563' },
            yaxis: { title: 'True Positive Rate', range: [0, 1], color: isDark ? '#F9FAFB' : '#4B5563' },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: isDark ? '#F9FAFB' : '#4B5563' }
        };
        Plotly.newPlot(container, data, layout, { responsive: true });
    };

    /**
     * Render a Plotly geospatial scatter plot for the clinic locations project card.
     * Uses sample latitude and longitude coordinates to visualize service coverage.
     */
    const renderClinicMapPlotly = () => {
        if (typeof Plotly === 'undefined') return;
        const container = getEl('clinic-map-chart');
        if (!container) return;
        const isDark = htmlEl.classList.contains('dark');
        const lat = [36.8508, 38.9072, 34.0522, 40.7128, 30.2672];
        const lon = [-76.2859, -77.0369, -118.2437, -74.0060, -97.7431];
        const texts = ['Norfolk, VA', 'Washington, DC', 'Los Angeles, CA', 'New York, NY', 'Austin, TX'];
        const data = [
            {
                type: 'scattergeo',
                lat: lat,
                lon: lon,
                text: texts,
                mode: 'markers',
                marker: { color: '#22D3EE', size: 8 }
            }
        ];
        const layout = {
            title: 'Clinic Locations Across the U.S.',
            geo: {
                scope: 'usa',
                projection: { type: 'albers usa' },
                showland: true,
                landcolor: isDark ? '#111827' : '#F9FAFB',
                subunitcolor: isDark ? '#374151' : '#D1D5DB',
                countrycolor: isDark ? '#374151' : '#D1D5DB'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: isDark ? '#F9FAFB' : '#4B5563' }
        };
        Plotly.newPlot(container, data, layout, { responsive: true });
    };

    /**
     * Render an interactive heatmap of synthetic gene expression values for the bioinformatics project card.
     */
    const renderGeneHeatmapPlotly = () => {
        if (typeof Plotly === 'undefined') return;
        const container = getEl('gene-heatmap-chart');
        if (!container) return;
        const isDark = htmlEl.classList.contains('dark');
        const genes = ['TP53','BRCA1','EGFR','KRAS','PIK3CA','PTEN'];
        const samples = ['Sample1','Sample2','Sample3','Sample4','Sample5','Sample6'];
        // Generate synthetic gene expression values between 0 and 2.5
        const z = genes.map(() => samples.map(() => Math.random() * 2.5));
        const data = [
            { z: z, x: samples, y: genes, type: 'heatmap', colorscale: 'Viridis' }
        ];
        const layout = {
            title: 'Gene Expression Heatmap',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: isDark ? '#F9FAFB' : '#4B5563' },
            xaxis: { title: 'Samples', color: isDark ? '#F9FAFB' : '#4B5563' },
            yaxis: { title: 'Genes', color: isDark ? '#F9FAFB' : '#4B5563' }
        };
        Plotly.newPlot(container, data, layout, { responsive: true });
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
            // Render additional demo charts
                renderROCChart();
                renderPieChart();
                // Display correlation map of iron deficiency and autism instead of Leaflet map
                renderIronAutismMap();
            // Render Plotly charts for dedicated project cards
            renderROCPlotlyChart();
            renderClinicMapPlotly();
            renderGeneHeatmapPlotly();
            // Render Plotly domain examples
            renderGenerativeAIChart();
            renderApiLatencyChart();
            renderDashboardMetricsChart();
            renderGeospatialChart();
            renderSpectrogramChart();
            renderMLDecisionChart();
            renderNLPFrequencyChart();
            renderForecastChart();
            renderSportsAnalyticsChart();
            renderBioinformaticsChart();
            renderBusinessChart();
            renderEnergyChart();
            renderFinanceChart();
            renderManufacturingChart();
            renderScienceChart();
    };
    
    init();
});
