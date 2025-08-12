// Global dark mode handler - works on all pages
(function() {
    'use strict';
    
    // Apply saved theme immediately to prevent flash
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Sidebar.js loaded successfully');
        
        const toggle = document.getElementById('darkModeToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        // Initialize dark mode toggle
        if (toggle) {
            console.log('Dark mode toggle found, initializing...');
            
            // Set initial state
            if (savedTheme === 'dark') {
                toggle.checked = true;
                console.log('Applied saved dark theme');
            }

            // Handle toggle change
            toggle.addEventListener('change', function() {
                const isDark = toggle.checked;
                console.log('Dark mode toggled:', isDark ? 'ON' : 'OFF');
                
                if (isDark) {
                    document.documentElement.classList.add('dark-mode');
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark-mode');
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                }
                
                // Trigger custom event for other scripts
                window.dispatchEvent(new CustomEvent('themeChanged', { 
                    detail: { isDark: isDark } 
                }));
            });
        } else {
            console.log('Dark mode toggle not found!');
        }

        // Mobile sidebar functionality
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                console.log('Mobile sidebar toggled');
                sidebar.classList.toggle('active');
                sidebarOverlay.classList.toggle('active');
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                console.log('Sidebar overlay clicked');
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }

        // Set active nav item based on current page
        setActiveNavItem();
        
        // Handle escape key for mobile sidebar
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // Function to set active navigation item
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            // Remove any existing active class
            item.classList.remove('active');
            
            // Check if this nav item matches current path
            const itemPath = item.getAttribute('href');
            if (itemPath && itemPath !== '#' && currentPath.includes(itemPath)) {
                item.classList.add('active');
            }
            
            // Special handling for home page
            if (currentPath === '/' && itemPath === '#') {
                item.classList.add('active');
            }
        });
    }

    // Function to check system theme preference
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', function(e) {
            // Only apply system theme if user hasn't set a preference
            if (!localStorage.getItem('theme')) {
                const isDark = e.matches;
                if (isDark) {
                    document.documentElement.classList.add('dark-mode');
                    document.body.classList.add('dark-mode');
                } else {
                    document.documentElement.classList.remove('dark-mode');
                    document.body.classList.remove('dark-mode');
                }
                
                const toggle = document.getElementById('darkModeToggle');
                if (toggle) {
                    toggle.checked = isDark;
                }
            }
        });
    }

    // Export functions for external use
    window.sidebarUtils = {
        toggleTheme: function() {
            const toggle = document.getElementById('darkModeToggle');
            if (toggle) {
                toggle.click();
            }
        },
        
        setTheme: function(theme) {
            const toggle = document.getElementById('darkModeToggle');
            if (toggle) {
                toggle.checked = theme === 'dark';
                toggle.dispatchEvent(new Event('change'));
            }
        },
        
        getTheme: function() {
            return localStorage.getItem('theme') || getSystemTheme();
        },
        
        closeMobileSidebar: function() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        }
    };

})();
