// Shared utilities across all modules
const AppUtils = {
    initNavigation: function(activeModuleId) {
        // Highlight the current page in the sidebar
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            if(link.getAttribute('id') === activeModuleId) {
                link.classList.add('active');
            }
        });
    },

    logAction: function(moduleName, action) {
        console.log(`[${moduleName}] Action Executed: ${action}`);
    }
};

// Make explicitly globally available
window.AppUtils = AppUtils;
