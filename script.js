// Constants and State
const themes = ['remix', 'neon', 'classic', 'cyberpunk', 'matrix', 'sunset', 'ocean', 'forest', 'candy', 'retro'];
let currentTheme = 'remix';
let currentGlow = 'none';
let activeDropdown = null;
let activeNavButton = null;

// Theme and Glow Management
function setTheme(theme) {
    if (theme === 'random') {
        applyRandomColors();
        return;
    }
    currentTheme = theme;
    updateThemeDisplay();
    updateIframeTheme();
}

function setGlow(glow) {
    currentGlow = glow;
    updateGlowDisplay();
    updateIframeGlow();
}

// Display Updates
function updateThemeDisplay() {
    document.getElementById('currentTheme').textContent = 
        currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
}

function updateGlowDisplay() {
    document.getElementById('currentGlow').textContent = 
        currentGlow.charAt(0).toUpperCase() + currentGlow.slice(1);
}

// Iframe Communication
function updateIframeTheme() {
    const iframe = document.getElementById('ascii-frame');
    if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ theme: currentTheme }, '*');
    }
}

function updateIframeGlow() {
    const iframe = document.getElementById('ascii-frame');
    if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ glow: currentGlow }, '*');
    }
}

// Dropdown Management
function toggleDropdown(dropdownId, button) {
    const dropdown = document.getElementById(dropdownId);
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    const isMobile = window.innerWidth <= 1024;
    
    // Close any other open dropdown
    allDropdowns.forEach(d => {
        if (d !== dropdown && d.classList.contains('show')) {
            d.classList.remove('show');
            d.style.display = 'none';
        }
    });
    
    // Toggle current dropdown
    const isShowing = dropdown.classList.contains('show');
    if (isShowing) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
        // Small delay to ensure display: block is applied before adding show class
        setTimeout(() => {
            dropdown.classList.add('show');
        }, 10);
    }
    
    // For mobile: prevent scrolling when dropdown is open
    if (isMobile) {
        document.body.style.overflow = !isShowing ? 'hidden' : '';
    }
    
    // Position dropdown for desktop
    if (!isMobile && !isShowing) {
        const buttonRect = button.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const sidebar = document.querySelector('.sidebar');
        const sidebarRect = sidebar.getBoundingClientRect();
        
        // Check if dropdown would go below viewport
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const needsFlip = spaceBelow < dropdownRect.height + 8;
        
        if (needsFlip) {
            dropdown.style.top = 'auto';
            dropdown.style.bottom = 'calc(100% + 8px)';
        } else {
            dropdown.style.top = 'calc(100% + 8px)';
            dropdown.style.bottom = 'auto';
        }
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Random theme button
    document.getElementById('randomBtn').addEventListener('click', () => {
        setTheme('random');
        const btn = document.getElementById('randomBtn');
        btn.classList.add('button-flash');
        setTimeout(() => btn.classList.remove('button-flash'), 200);
    });

    // Dropdown toggles
    document.getElementById('themeBtn').addEventListener('click', (e) => {
        toggleDropdown('themeOptions', e.currentTarget);
    });

    document.getElementById('glowBtn').addEventListener('click', (e) => {
        toggleDropdown('glowOptions', e.currentTarget);
    });

    document.getElementById('downloadBtn').addEventListener('click', (e) => {
        toggleDropdown('downloadOptions', e.currentTarget);
    });

    // Theme selection
    document.querySelectorAll('#themeOptions button').forEach(button => {
        button.addEventListener('click', () => {
            setTheme(button.dataset.theme);
            // Update active state
            document.querySelectorAll('#themeOptions button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            // Close dropdown
            const dropdown = document.getElementById('themeOptions');
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
            document.body.style.overflow = '';
        });
    });

    // Glow selection
    document.querySelectorAll('#glowOptions button').forEach(button => {
        button.addEventListener('click', () => {
            setGlow(button.dataset.glow);
            // Update active state
            document.querySelectorAll('#glowOptions button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            // Close dropdown
            const dropdown = document.getElementById('glowOptions');
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
            document.body.style.overflow = '';
        });
    });

    // Download options
    document.querySelectorAll('#downloadOptions button').forEach(button => {
        button.addEventListener('click', () => {
            const format = button.dataset.format;
            if (format) {
                exportImage(format);
            }
            // Close dropdown
            const dropdown = document.getElementById('downloadOptions');
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
            document.body.style.overflow = '';
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.control-button') && !e.target.closest('.dropdown-content')) {
            closeAllDropdowns();
        }
    });

    // Close dropdowns on window resize
    window.addEventListener('resize', () => {
        closeAllDropdowns();
    });

    // Handle touch events for mobile scrolling
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
    });
}

// Helper function to close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// Mobile Navigation
function setupMobileNav() {
    const settingsPanel = document.getElementById('settingsPanel');
    const navButtons = document.querySelectorAll('.nav-button');
    
    function showPanel(content) {
        settingsPanel.innerHTML = content;
        settingsPanel.classList.add('show');
    }
    
    function createPanelContent(type) {
        switch(type) {
            case 'theme':
                return `
                    <div class="control-group">
                        <div class="control-label">Select Theme</div>
                        <div class="settings-options">
                            ${themes.map(theme => `
                                <button class="settings-option ${currentTheme === theme ? 'active' : ''}" 
                                        data-theme="${theme}">
                                    ${theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            case 'glow':
                return `
                    <div class="control-group">
                        <div class="control-label">Select Glow Effect</div>
                        <div class="settings-options">
                            <button class="settings-option ${currentGlow === 'none' ? 'active' : ''}" 
                                    data-glow="none">None</button>
                            <button class="settings-option ${currentGlow === 'normal' ? 'active' : ''}" 
                                    data-glow="normal">Normal</button>
                            <button class="settings-option ${currentGlow === 'strong' ? 'active' : ''}" 
                                    data-glow="strong">Strong</button>
                        </div>
                    </div>
                `;
            case 'download':
                return `
                    <div class="control-group">
                        <div class="control-label">Save As</div>
                        <div class="settings-options">
                            <button class="settings-option" data-format="png">.PNG</button>
                            <button class="settings-option" data-format="jpg">.JPG</button>
                        </div>
                    </div>
                `;
        }
    }
    
    // Setup mobile navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.id.replace('NavBtn', '').toLowerCase();
            
            if (type === 'random') {
                setTheme('random');
                return;
            }
            
            if (activeNavButton === button) {
                button.classList.remove('active');
                settingsPanel.classList.remove('show');
                activeNavButton = null;
            } else {
                navButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                showPanel(createPanelContent(type));
                activeNavButton = button;
            }
        });
    });
    
    // Handle settings panel option clicks
    settingsPanel.addEventListener('click', (e) => {
        const option = e.target.closest('.settings-option');
        if (!option) return;
        
        if (option.dataset.theme) {
            setTheme(option.dataset.theme);
        } else if (option.dataset.glow) {
            setGlow(option.dataset.glow);
        } else if (option.dataset.format) {
            console.log('Mobile export clicked:', option.dataset.format); // Debug log
            exportImage(option.dataset.format);
            // Close panel after initiating download
            settingsPanel.classList.remove('show');
            navButtons.forEach(b => b.classList.remove('active'));
            activeNavButton = null;
        }
        
        // Update active states
        option.parentElement.querySelectorAll('.settings-option').forEach(opt => {
            opt.classList.remove('active');
        });
        option.classList.add('active');
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.settings-panel') && 
            !e.target.closest('.nav-button')) {
            settingsPanel.classList.remove('show');
            navButtons.forEach(b => b.classList.remove('active'));
            activeNavButton = null;
        }
    });
}

// ASCII Art Scaling
function scaleAsciiArt() {
    const pre = document.getElementById('ascii-art');
    const frame = document.querySelector('.frame-container');
    const innerFrame = document.querySelector('.frame-container-inner');
    
    // Reset any existing transforms
    pre.style.transform = 'none';
    
    // Get dimensions
    const frameSize = Math.min(frame.offsetWidth, frame.offsetHeight);
    const contentWidth = pre.scrollWidth;
    const contentHeight = pre.scrollHeight;
    
    // Calculate available space and scale
    const padding = parseInt(getComputedStyle(innerFrame).padding) * 2;
    const availableSpace = frameSize - padding;
    const horizontalScale = availableSpace / contentWidth;
    const verticalScale = availableSpace / contentHeight;
    const scale = Math.min(horizontalScale, verticalScale, 1);
    
    // Apply the transform
    pre.style.transform = `scale(${scale})`;
}

// Image Export
function exportImage(format) {
    console.log('Starting export:', format);
    
    const iframe = document.getElementById('ascii-frame');
    const frameContainer = document.querySelector(".frame-container");
    
    // Get the iframe content
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const asciiArt = iframeDoc.querySelector('#ascii-art');
    
    if (!asciiArt || !frameContainer) {
        console.error('Required elements not found');
        return;
    }

    // Create a temporary container for the clone
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);
    
    // Clone the ASCII art
    const clone = asciiArt.cloneNode(true);
    tempContainer.appendChild(clone);
    
    // Apply current theme and glow
    clone.className = asciiArt.className;
    tempContainer.style.background = '#222337';
    tempContainer.style.width = '600px';
    tempContainer.style.height = '600px';
    tempContainer.style.display = 'flex';
    tempContainer.style.alignItems = 'center';
    tempContainer.style.justifyContent = 'center';
    tempContainer.style.padding = '2rem';
    tempContainer.style.boxSizing = 'border-box';
    
    // Capture the clone
    html2canvas(tempContainer, {
        backgroundColor: "#222337",
        scale: 2,
        logging: true,
        width: 600,
        height: 600
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.download = `ascii-peanut.${format}`;
        
        if (format === 'jpg') {
            const jpgCanvas = document.createElement('canvas');
            jpgCanvas.width = canvas.width;
            jpgCanvas.height = canvas.height;
            const ctx = jpgCanvas.getContext('2d');
            
            ctx.fillStyle = '#222337';
            ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            
            link.href = jpgCanvas.toDataURL('image/jpeg', 0.9);
        } else {
            link.href = canvas.toDataURL('image/png');
        }
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        document.body.removeChild(tempContainer);
        
    }).catch(error => {
        console.error('Export failed:', error);
        document.body.removeChild(tempContainer);
    });
}

// Random Theme Generation
function generateRandomColors() {
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + Math.floor(Math.random() * 90 + 45)) % 360;
    const hue3 = (hue2 + Math.floor(Math.random() * 90 + 45)) % 360;
    
    return {
        number: `hsl(${hue1}, 100%, 70%)`,
        type: `hsl(${hue2}, 100%, 70%)`,
        keyword: `hsl(${hue3}, 100%, 70%)`,
        function: `hsl(${(hue1 + 180) % 360}, 100%, 70%)`,
        comment: `hsl(${hue2}, 30%, 60%)`
    };
}

function applyRandomColors() {
    const colors = generateRandomColors();
    const style = document.createElement('style');
    style.textContent = `
        .theme-random .number { color: ${colors.number}; }
        .theme-random .type { color: ${colors.type}; }
        .theme-random .keyword { color: ${colors.keyword}; }
        .theme-random .function { color: ${colors.function}; }
        .theme-random .comment { color: ${colors.comment}; }
    `;
    
    document.querySelectorAll('style').forEach(s => {
        if (s.textContent.includes('theme-random')) {
            s.remove();
        }
    });
    
    document.head.appendChild(style);
    currentTheme = 'random';
    updateThemeDisplay();
    updateIframeTheme();
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Close all dropdowns immediately
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.style.display = 'none';
        dropdown.classList.remove('show');
    });
    
    // Initialize displays and navigation
    updateThemeDisplay();
    updateGlowDisplay();
    setupEventListeners();
    setupMobileNav();
    
    // Setup window event listeners
    window.addEventListener('resize', scaleAsciiArt);
    window.addEventListener('load', scaleAsciiArt);
    window.addEventListener('orientationchange', () => {
        setTimeout(scaleAsciiArt, 100);
    });
    
    // Wait for iframe to load before sending initial settings
    const iframe = document.getElementById('ascii-frame');
    iframe.addEventListener('load', () => {
        updateIframeTheme();
        updateIframeGlow();
    });
});