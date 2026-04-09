document.addEventListener('DOMContentLoaded', () => {
    AppUtils.initNavigation('nav-dashboard');
    AppUtils.logAction('Dashboard', 'Initialized');

    const metricsBtn = document.getElementById('refresh-metrics');
    if(metricsBtn) {
        metricsBtn.addEventListener('click', () => {
            const dataDiv = document.getElementById('metrics-data');
            dataDiv.innerHTML = '<span style="color:var(--accent);">Live Data Synced! Revenue: $18,250 </span>';
        });
    }
});
