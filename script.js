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
    const navButtons = document.querySelectorAll('.nav-button');
    
    function showModal(content) {
        const modalContent = modalOverlay.querySelector('.modal-content');
        modalContent.innerHTML = content;
        modalOverlay.classList.add('show');
    }
    
    function createModalContent(type) {
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
            default:
                return '';
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
            
            if (activeNavButton === button && modalOverlay.classList.contains('show')) {
                modalOverlay.classList.remove('show');
                button.classList.remove('active');
                activeNavButton = null;
            } else {
                navButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                showModal(createModalContent(type));
                activeNavButton = button;
            }
        });
    });
    
    // Handle modal option clicks
    modalOverlay.addEventListener('click', (e) => {
        const option = e.target.closest('.settings-option');
        const isOverlay = e.target === modalOverlay;
        
        if (isOverlay) {
            modalOverlay.classList.remove('show');
            navButtons.forEach(b => b.classList.remove('active'));
            activeNavButton = null;
            return;
        }
        
        if (!option) return;
        
        if (option.dataset.theme) {
            setTheme(option.dataset.theme);
        } else if (option.dataset.glow) {
            setGlow(option.dataset.glow);
        } else if (option.dataset.format) {
            exportImage(option.dataset.format);
        }
        
        // Update active states
        option.parentElement.querySelectorAll('.settings-option').forEach(opt => {
            opt.classList.remove('active');
        });
        option.classList.add('active');
        
        // Close modal after selection
        modalOverlay.classList.remove('show');
        navButtons.forEach(b => b.classList.remove('active'));
        activeNavButton = null;
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
    
    // Get the iframe content
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const asciiArt = iframeDoc.querySelector('#ascii-art');
    
    if (!asciiArt) {
        console.error('Required elements not found');
        return;
    }

    // Create a temporary container for the clone
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1600px';  // Larger canvas for better quality
    tempContainer.style.height = '1600px';
    tempContainer.style.background = '#222337';
    tempContainer.style.display = 'flex';
    tempContainer.style.alignItems = 'center';
    tempContainer.style.justifyContent = 'center';
    
    // Create art container (matches ascii-art.html structure)
    const artContainer = document.createElement('div');
    artContainer.style.position = 'relative';
    artContainer.style.width = '1000px';
    artContainer.style.height = '1000px';
    artContainer.style.display = 'flex';
    artContainer.style.alignItems = 'center';
    artContainer.style.justifyContent = 'center';
    artContainer.style.padding = '1.5rem'; 
    artContainer.style.boxSizing = 'border-box';
    artContainer.style.background = 'transparent';
    tempContainer.appendChild(artContainer);
    
    // Clone and style the ASCII art
    const clone = asciiArt.cloneNode(true);
    clone.style.whiteSpace = 'pre';
    clone.style.lineHeight = '1.2';
    clone.style.margin = '0';
    clone.style.fontFamily = "'IBM Plex Mono', monospace";
    clone.style.fontWeight = '500';
    clone.style.letterSpacing = '-0.02em';
    clone.style.textAlign = 'center';
    clone.style.fontSize = '11px';
    clone.style.background = 'transparent';
    clone.style.transform = 'none';
    clone.className = asciiArt.className;

    // Add theme styles directly
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Theme styles */
        .theme-remix .number { color: #f78c6c; }
        .theme-remix .type { color: #82aaff; }
        .theme-remix .keyword { color: #c792ea; }
        .theme-remix .function { color: #c3e88d; }
        .theme-remix .comment { color: #546e7a; font-style: italic; }

        .theme-neon .number { color: #ff6ec7; }
        .theme-neon .type { color: #00ffff; }
        .theme-neon .keyword { color: #ffff00; }
        .theme-neon .function { color: #39ff14; }
        .theme-neon .comment { color: #ff9933; }

        .theme-classic .number { color: #ffcc00; }
        .theme-classic .type { color: #ff6600; }
        .theme-classic .keyword { color: #cc0000; }
        .theme-classic .function { color: #009900; }
        .theme-classic .comment { color: #333333; font-style: italic; }

        .theme-cyberpunk .number { color: #ff00ff; }
        .theme-cyberpunk .type { color: #00ffff; }
        .theme-cyberpunk .keyword { color: #ff0000; }
        .theme-cyberpunk .function { color: #00ff00; }
        .theme-cyberpunk .comment { color: #ff8800; }

        .theme-matrix .number { color: #00ff00; }
        .theme-matrix .type { color: #33ff33; }
        .theme-matrix .keyword { color: #66ff66; }
        .theme-matrix .function { color: #99ff99; }
        .theme-matrix .comment { color: #004400; }

        .theme-sunset .number { color: #ff6b6b; }
        .theme-sunset .type { color: #ffd93d; }
        .theme-sunset .keyword { color: #ff8e3c; }
        .theme-sunset .function { color: #ff4949; }
        .theme-sunset .comment { color: #6c5b7b; }

        .theme-ocean .number { color: #48cae4; }
        .theme-ocean .type { color: #00b4d8; }
        .theme-ocean .keyword { color: #0096c7; }
        .theme-ocean .function { color: #023e8a; }
        .theme-ocean .comment { color: #caf0f8; }

        .theme-forest .number { color: #95d5b2; }
        .theme-forest .type { color: #74c69d; }
        .theme-forest .keyword { color: #52b788; }
        .theme-forest .function { color: #40916c; }
        .theme-forest .comment { color: #2d6a4f; }

        .theme-candy .number { color: #ff99c8; }
        .theme-candy .type { color: #fcf6bd; }
        .theme-candy .keyword { color: #d0f4de; }
        .theme-candy .function { color: #a9def9; }
        .theme-candy .comment { color: #e4c1f9; }

        .theme-retro .number { color: #f4a261; }
        .theme-retro .type { color: #e9c46a; }
        .theme-retro .keyword { color: #2a9d8f; }
        .theme-retro .function { color: #264653; }
        .theme-retro .comment { color: #e76f51; }

        /* Glow effects */
        .glow-normal span {
            text-shadow: 0 0 4px currentColor, 0 0 8px currentColor;
        }

        .glow-strong span {
            text-shadow: 0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor, 0 0 32px currentColor;
        }
    `;
    tempContainer.appendChild(styleElement);
    
    // For random theme, copy CSS variables
    if (clone.classList.contains('theme-random')) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const computedStyle = iframeDoc.documentElement.style;
        const randomStyle = document.createElement('style');
        randomStyle.textContent = `
            :root {
                --random-number: ${computedStyle.getPropertyValue('--random-number')};
                --random-type: ${computedStyle.getPropertyValue('--random-type')};
                --random-keyword: ${computedStyle.getPropertyValue('--random-keyword')};
                --random-function: ${computedStyle.getPropertyValue('--random-function')};
                --random-comment: ${computedStyle.getPropertyValue('--random-comment')};
            }
            .theme-random .number { color: var(--random-number); }
            .theme-random .type { color: var(--random-type); }
            .theme-random .keyword { color: var(--random-keyword); }
            .theme-random .function { color: var(--random-function); }
            .theme-random .comment { color: var(--random-comment); }
        `;
        tempContainer.appendChild(randomStyle);
    }
    
    artContainer.appendChild(clone);
    
    // Add required font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap';
    fontLink.rel = 'stylesheet';
    tempContainer.appendChild(fontLink);
    
    // Add to document for rendering
    document.body.appendChild(tempContainer);
    
    // Wait for font to load
    document.fonts.ready.then(() => {
        // Capture with html2canvas
        html2canvas(tempContainer, {
            backgroundColor: "#222337",
            scale: 2,
            logging: false,
            width: 1600,
            height: 1600,
            onclone: function(clonedDoc) {
                const clonedArt = clonedDoc.querySelector('#ascii-art');
                if (clonedArt) {
                    clonedArt.style.whiteSpace = 'pre';
                    clonedArt.style.lineHeight = '1.2';
                    clonedArt.style.margin = '0';
                    clonedArt.style.fontFamily = "'IBM Plex Mono', monospace";
                    clonedArt.style.fontWeight = '500';
                    clonedArt.style.letterSpacing = '-0.02em';
                    clonedArt.style.textAlign = 'center';
                    clonedArt.style.fontSize = '11px';
                    clonedArt.style.background = 'transparent';
                    clonedArt.style.transform = 'none';
                }
            }
        }).then(canvas => {
            // Create download link
            const link = document.createElement('a');
            link.download = `ascii-peanut.${format}`;
            
            // Create a new canvas with the desired output size
            const outputCanvas = document.createElement('canvas');
            const outputSize = 1024; // Final image size
            outputCanvas.width = outputSize;
            outputCanvas.height = outputSize;
            const ctx = outputCanvas.getContext('2d');
            
            // Fill background
            ctx.fillStyle = '#222337';
            ctx.fillRect(0, 0, outputSize, outputSize);
            
            // Calculate scaling to fit the art properly with padding
            const scale = (outputSize * 1.05) / 1600; // Increased scale to 105% of output size
            const scaledWidth = canvas.width * scale;
            const scaledHeight = canvas.height * scale;
            const x = (outputSize - scaledWidth) / 2;
            const y = (outputSize - scaledHeight) / 2;
            
            // Draw the scaled image
            ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
            
            if (format === 'jpg') {
                link.href = outputCanvas.toDataURL('image/jpeg', 1.0);
            } else {
                link.href = outputCanvas.toDataURL('image/png');
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

// Add modal overlay to the DOM
const modalOverlay = document.createElement('div');
modalOverlay.className = 'modal-overlay';
modalOverlay.innerHTML = '<div class="modal-content"></div>';
document.body.appendChild(modalOverlay);

// Update showThemeOptions function
function showThemeOptions() {
    const isMobileOrTablet = window.innerWidth <= 1024;
    const themeOptions = document.getElementById('themeOptions');
    
    if (isMobileOrTablet) {
        const modalContent = modalOverlay.querySelector('.modal-content');
        modalContent.innerHTML = ''; // Clear existing content
        modalContent.appendChild(themeOptions);
        modalOverlay.classList.add('show');
        
        // Close modal when clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
        
        // Close modal after selecting a theme
        const themeButtons = themeOptions.querySelectorAll('button');
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modalOverlay.classList.remove('show');
            });
        });
    } else {
        themeOptions.style.display = themeOptions.style.display === 'none' ? 'grid' : 'none';
    }
}

// Update showGlowOptions function
function showGlowOptions() {
    const isMobileOrTablet = window.innerWidth <= 1024;
    const glowOptions = document.getElementById('glowOptions');
    
    if (isMobileOrTablet) {
        const modalContent = modalOverlay.querySelector('.modal-content');
        modalContent.innerHTML = ''; // Clear existing content
        modalContent.appendChild(glowOptions);
        modalOverlay.classList.add('show');
        
        // Close modal when clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
        
        // Close modal after selecting a glow option
        const glowButtons = glowOptions.querySelectorAll('button');
        glowButtons.forEach(button => {
            button.addEventListener('click', () => {
                modalOverlay.classList.remove('show');
            });
        });
    } else {
        glowOptions.style.display = glowOptions.style.display === 'none' ? 'block' : 'none';
    }
}