// Variables to store calculator state
let currentInput = '0';
let previousInput = '';
let calculationOperator = '';
let shouldResetScreen = false;
let fullExpression = '';
let parenthesesCount = 0;
let memoryValue = 0; // Initialize memory value
let calculationHistory = []; // Store calculation history
let isHistoryVisible = false; // Track if history panel is visible
let currentTheme = 'standard'; // Track current theme

// DOM Elements
const displayElement = document.getElementById('display');
const equationElement = document.getElementById('equation');
const themeToggle = document.getElementById('theme-toggle');
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeButton = document.getElementById('close-button');
const buttons = document.querySelectorAll('button');

/**
 * Initializes the calculator and event listeners
 */
function initCalculator() {
    // First ensure DOM elements are properly retrieved
    if (!displayElement || !equationElement) {
        console.error("Display elements not found, waiting for DOM...");
        setTimeout(initCalculator, 100);
        return;
    }
    
    // Reset calculator state
    currentInput = '0';
    previousInput = '';
    calculationOperator = '';
    shouldResetScreen = false;
    fullExpression = '';
    parenthesesCount = 0;
    memoryValue = 0;
    
    // Add button click animation
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('button-clicked');
            // Add button-active class for press effect
            button.classList.add('button-active');
            setTimeout(() => {
                button.classList.remove('button-clicked');
                button.classList.remove('button-active');
            }, 200);
        });
    });

    // Theme toggle functionality (Light/Dark toggle)
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        playToggleSound();
        
        // Add animation for theme change
        document.querySelector('.calculator').classList.add('theme-transition');
        setTimeout(() => {
            document.querySelector('.calculator').classList.remove('theme-transition');
        }, 500);
        
        // If theme selector exists, update it when toggle is used
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            if (document.body.classList.contains('light-theme')) {
                themeSelect.value = 'light';
                currentTheme = 'light';
            } else {
                themeSelect.value = 'standard';
                currentTheme = 'standard';
            }
        }
    });
    
    // Theme selector functionality
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            const selectedTheme = themeSelect.value;
            applyTheme(selectedTheme);
        });
    }
    
    // Add keyboard shortcut for theme cycling (T key)
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 't') {
            cycleThemes();
        }
    });

    // History toggle button
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    if (historyToggleBtn) {
        historyToggleBtn.addEventListener('click', toggleHistory);
        historyToggleBtn.title = 'Show calculation history (H)';
        // Add a pulsing animation to draw attention to the history feature
        historyToggleBtn.classList.add('pulse-once');
        setTimeout(() => {
            historyToggleBtn.classList.remove('pulse-once');
        }, 2000);
    }

    // Help modal functionality
    helpButton.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    closeButton.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // Keyboard event listener
    document.addEventListener('keydown', handleKeyboardInput);

    // Add button animation effect
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (button.contains(ripple)) {
                    button.removeChild(ripple);
                }
            }, 600);
        });
    });
    
    // Check if memory indicator already exists, if not create it
    const existingIndicator = document.getElementById('memory-indicator');
    if (!existingIndicator) {
        const memoryIndicator = document.createElement('div');
        memoryIndicator.className = 'memory-indicator';
        memoryIndicator.id = 'memory-indicator';
        memoryIndicator.textContent = 'M';
        
        const displayContainer = document.querySelector('.display-container');
        if (displayContainer) {
            displayContainer.appendChild(memoryIndicator);
            console.log("Memory indicator created");
        } else {
            console.error("Display container not found, cannot add memory indicator");
        }
    } else {
        console.log("Memory indicator already exists");
    }
    
    // Initialize memory indicator state
    displayMemoryIndicator();
    
    // Create background particles
    createBackgroundParticles();
    
    // Add quantum effects
    createQuantumBits();
    
    // Animate buttons sequentially on load
    setTimeout(() => {
        animateButtonsSequentially();
    }, 500);
    
    // Initialize display
    updateDisplay();

    // Welcome animation
    playWelcomeAnimation();
    
    // Create history panel if it doesn't exist
    createHistoryPanel();
    
    // Apply any saved theme preference
    loadThemePreference();
}

/**
 * Applies the selected theme to the calculator
 * @param {string} theme - The theme to apply ('standard', 'light', or 'corporate')
 */
function applyTheme(theme) {
    // Remove all theme classes first
    document.body.classList.remove('light-theme', 'corporate-theme');
    
    // Apply the selected theme
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        // Ensure toggle switch matches
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = true;
        }
    } else if (theme === 'corporate') {
        document.body.classList.add('corporate-theme');
        // Ensure toggle switch is off for corporate theme
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = false;
        }
    } else {
        // Standard theme - no additional classes
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = false;
        }
    }
    
    // Add transition effect
    document.querySelector('.calculator').classList.add('theme-transition');
    setTimeout(() => {
        document.querySelector('.calculator').classList.remove('theme-transition');
    }, 500);
    
    // Save the theme preference
    currentTheme = theme;
    saveThemePreference(theme);
    
    // Play theme change sound
    playToggleSound();
}

/**
 * Cycles through available themes
 */
function cycleThemes() {
    const themes = ['standard', 'light', 'corporate'];
    let currentIndex = themes.indexOf(currentTheme);
    let nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    // Update the theme selector dropdown
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = nextTheme;
    }
    
    // Apply the next theme
    applyTheme(nextTheme);
}

/**
 * Saves the theme preference to localStorage
 * @param {string} theme - The theme to save
 */
function saveThemePreference(theme) {
    try {
        localStorage.setItem('calculator-theme', theme);
    } catch (e) {
        console.error('Failed to save theme preference:', e);
    }
}

/**
 * Loads the theme preference from localStorage
 */
function loadThemePreference() {
    try {
        const savedTheme = localStorage.getItem('calculator-theme');
        if (savedTheme) {
            // Apply the saved theme
            applyTheme(savedTheme);
            // Update the dropdown
            const themeSelect = document.getElementById('theme-select');
            if (themeSelect) {
                themeSelect.value = savedTheme;
            }
        }
    } catch (e) {
        console.error('Failed to load theme preference:', e);
    }
}

/**
 * Creates the history panel if it doesn't exist already
 */
function createHistoryPanel() {
    if (!document.querySelector('.history-panel')) {
        const historyPanel = document.createElement('div');
        historyPanel.className = 'history-panel history-panel-hidden';
        historyPanel.id = 'history-panel';
        historyPanel.innerHTML = `
            <button class="history-close-btn" id="history-close-btn">×</button>
            <h3>Calculation History</h3>
            <button class="history-clear-btn" id="history-clear-btn">Clear History</button>
            <div class="history-list" id="history-list">
                <div class="history-empty">No calculations yet</div>
            </div>
        `;
        
        document.body.appendChild(historyPanel);
        
        // Add event listeners
        document.getElementById('history-close-btn').addEventListener('click', toggleHistory);
        document.getElementById('history-clear-btn').addEventListener('click', clearHistory);
    }
}

/**
 * Creates floating background particles
 */
function createBackgroundParticles() {
    const universe = document.querySelector('.universe');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        
        // Random size
        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random animation duration
        const duration = Math.random() * 30 + 10;
        particle.style.animation = `float-particle ${duration}s linear infinite`;
        
        // Random animation delay
        const delay = Math.random() * 20;
        particle.style.animationDelay = `${delay}s`;
        
        universe.appendChild(particle);
    }
}

/**
 * Animates buttons sequentially for an attractive loading effect
 */
function animateButtonsSequentially() {
    const allButtons = document.querySelectorAll('button');
    
    allButtons.forEach((button, index) => {
        setTimeout(() => {
            button.classList.add('button-active');
            setTimeout(() => {
                button.classList.remove('button-active');
            }, 100);
        }, index * 50);
    });
}

/**
 * Plays welcome animation sequence
 */
function playWelcomeAnimation() {
    displayElement.textContent = '';
    displayElement.classList.add('type-effect');
    
    const welcomeText = 'Welcome!';
    let i = 0;
    
    const typeInterval = setInterval(() => {
        if (i < welcomeText.length) {
            displayElement.textContent += welcomeText.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
            setTimeout(() => {
                displayElement.classList.remove('type-effect');
                currentInput = '0';
                updateDisplay();
            }, 1000);
        }
    }, 100);
}

/**
 * Plays toggle sound (not implemented with real sound to avoid autoplay issues)
 */
function playToggleSound() {
    // This would play a sound, but we're using a visual cue instead
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.transform = 'scale(1.05)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    });
}

/**
 * Updates the calculator display with current values
 */
function updateDisplay() {
    // Format the number properly for display
    displayElement.textContent = formatNumberForDisplay(currentInput);
    equationElement.textContent = previousInput;
    
    // Add typing effect for equation
    if (previousInput !== '') {
        equationElement.classList.add('typing');
        setTimeout(() => {
            equationElement.classList.remove('typing');
        }, 500); // Reduced from 1000ms to 500ms for quicker feedback
    }
}

/**
 * Formats a number for better display in the calculator
 * @param {string} value - The number to format
 * @returns {string} - The formatted number
 */
function formatNumberForDisplay(value) {
    // Handle error messages
    if (typeof value === 'string' && (value === 'Error' || value.startsWith('Error:'))) {
        return value;
    }
    
    // For empty input, show 0
    if (value === '' || value === null || value === undefined) {
        return '0';
    }
    
    // Remove any trailing operators before displaying
    if (/[+\-*/]$/.test(value)) {
        value = value.slice(0, -1);
    }
    
    // Convert to number and handle NaN
    let num = parseFloat(value);
    if (isNaN(num)) {
        return '0';
    }
    
    // For large numbers, use scientific notation
    if (Math.abs(num) >= 10**14) {
        return num.toExponential(8);
    }
    
    // For decimal numbers with many digits
    if (value.includes('.') && value.length > 14) {
        // Limit decimal places to preserve readability
        const parts = value.split('.');
        const integerPart = parts[0];
        let decimalPart = parts[1];
        
        // Keep decimals to fit within display
        const maxDecimalDigits = 10;
        if (decimalPart.length > maxDecimalDigits) {
            decimalPart = decimalPart.substring(0, maxDecimalDigits);
        }
        
        return `${integerPart}.${decimalPart}`;
    }
    
    // For integers, add thousand separators
    if (Number.isInteger(num) && Math.abs(num) >= 1000) {
        return num.toLocaleString('en-US');
    }
    
    return value;
}

/**
 * Handles number button clicks
 * @param {string} number - The number or character pressed
 */
function handleNumber(number) {
    // Special handling for parentheses
    if (number === '(' || number === ')') {
        handleParentheses(number);
        return;
    }
    
    // If display should be reset (after an operation or calculation)
    if (shouldResetScreen) {
        currentInput = number === '.' ? '0.' : number;
        shouldResetScreen = false;
    } else {
        // Replace initial 0 unless decimal point is being added
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            // Don't allow multiple decimal points
            if (number === '.' && currentInput.includes('.')) {
                return;
            }
            
            // Check if adding the number would make the display too long
            if (currentInput.length < 14) {
                currentInput += number;
            }
        }
    }
    
    updateDisplay();
}

/**
 * Handles parentheses input
 * @param {string} parenthesis - The parenthesis character
 */
function handleParentheses(parenthesis) {
    if (parenthesis === '(') {
        if (currentInput !== '0' && !shouldResetScreen) {
            // Implicit multiplication when a number is followed by an opening parenthesis
            handleOperator('*');
        }
        
        parenthesesCount++;
        
        if (shouldResetScreen) {
            previousInput += '(';
        } else {
            previousInput += currentInput + '(';
            currentInput = '0';
        }
    } else if (parenthesis === ')') {
        // Only add closing parenthesis if there are open parentheses
        if (parenthesesCount > 0) {
            parenthesesCount--;
            
            // Only add the current input if it's not already part of the expression
            // or if it's not the default value (0)
            if (currentInput !== '0' || previousInput.endsWith('(')) {
                previousInput += currentInput;
            }
            
            previousInput += ')';
            
            // Try to immediately evaluate the expression to provide visual feedback
            try {
                // Create a temporary copy of the expression to evaluate
                const tempExpression = previousInput;
                
                // Use a simplified evaluation to check if the expression is valid
                // but don't update the calculator state yet
                let validResult = evaluatePartialExpression(tempExpression);
                
                // Display the intermediate result but keep the expression in previousInput
                if (validResult !== null) {
                    currentInput = validResult;
                } else {
                    // If evaluation fails, just set to 0 (will be fixed when equals is pressed)
                    currentInput = '0';
                }
            } catch (e) {
                // If there's an error just continue with the default behavior
                currentInput = '0';
            }
            
            shouldResetScreen = true;
        }
    }
    
    updateDisplay();
}

/**
 * Evaluates a partial expression to provide immediate feedback
 * @param {string} expression - The expression to evaluate
 * @returns {string|null} - The result as string or null if invalid
 */
function evaluatePartialExpression(expression) {
    try {
        // Don't evaluate empty expressions
        if (!expression || expression.trim() === '') {
            return null;
        }
        
        // Apply same replacements for consistency
        let parsedExpression = expression;
        
        // Handle implicit multiplication
        parsedExpression = parsedExpression.replace(/\)\(/g, ')*(');
        parsedExpression = parsedExpression.replace(/(\d)(\()/g, '$1*$2');
        
        // Clean up the expression - handle incomplete expressions
        // If expression ends with an operator, remove it
        parsedExpression = parsedExpression.replace(/[+\-*/]$/, '');
        
        // Ensure balanced parentheses
        let openCount = (parsedExpression.match(/\(/g) || []).length;
        let closeCount = (parsedExpression.match(/\)/g) || []).length;
        
        // Add missing closing parentheses
        while (openCount > closeCount) {
            parsedExpression += ')';
            closeCount++;
        }
        
        console.log("Evaluating expression:", parsedExpression);
        
        // Safe evaluation using function constructor
        // Ensure we're using proper JavaScript evaluation that respects order of operations
        const result = Function('"use strict"; return (' + parsedExpression + ')')();
        
        console.log("Evaluation result:", result);
        
        // Format the result
        if (!isFinite(result)) {
            return null; // Division by zero or other error
        }
        
        // Round to avoid floating point precision issues
        const roundedResult = Math.round(result * 1e12) / 1e12;
        
        // Convert to string and return
        return roundedResult.toString();
    } catch (e) {
        console.error("Evaluation error:", e);
        return null; // Any error during evaluation
    }
}

/**
 * Handles special functions like backspace, percent, sqrt, and memory operations
 * @param {string} functionName - The function to execute
 */
function handleFunction(functionName) {
    console.log("Function called:", functionName);
    
    switch (functionName) {
        case 'backspace':
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            break;
        case 'percent':
            if (currentInput !== '0') {
                currentInput = (parseFloat(currentInput) / 100).toString();
            }
            break;
        case 'sqrt':
            if (currentInput !== '0') {
                const num = parseFloat(currentInput);
                if (num < 0) {
                    currentInput = 'Error';
                } else {
                    currentInput = Math.sqrt(num).toString();
                }
            }
            break;
        case 'memory-clear':
            // Reset memory to zero
            memoryValue = 0;
            console.log("Memory cleared, new value:", memoryValue);
            
            // Get memory indicator element and update its state
            const mcIndicator = document.getElementById('memory-indicator');
            if (mcIndicator) {
                mcIndicator.classList.remove('active');
                // Force update of animation state
                mcIndicator.style.animation = 'none';
                mcIndicator.offsetHeight; // Force reflow
            } else {
                console.error("Memory indicator element not found");
            }
            
            // Set shouldResetScreen to true to allow new inputs
            shouldResetScreen = true;
            break;
        case 'memory-recall':
            // Replace current input with memory value
            currentInput = memoryValue.toString();
            shouldResetScreen = true;
            break;
        case 'memory-add':
            // First make sure we have a valid current input
            let addValue = parseFloat(currentInput);
            if (!isNaN(addValue)) {
                // Add to memory without changing display
                memoryValue += addValue;
                console.log("Memory after M+:", memoryValue);
                displayMemoryIndicator();
                shouldResetScreen = true;
            }
            break;
        case 'memory-subtract':
            // First make sure we have a valid current input
            let subtractValue = parseFloat(currentInput);
            if (!isNaN(subtractValue)) {
                // Subtract from memory without changing display
                memoryValue -= subtractValue;
                console.log("Memory after M-:", memoryValue);
                displayMemoryIndicator();
                shouldResetScreen = true;
            }
            break;
    }
    
    // Add memory indicator animation when memory functions are used
    if (functionName.startsWith('memory')) {
        const memoryIndicator = document.getElementById('memory-indicator');
        
        if (!memoryIndicator) {
            console.error("Memory indicator not found");
            return;
        }
        
        if (functionName === 'memory-clear') {
            // Already handled in the case statement above
        } else if (functionName === 'memory-recall') {
            // No need to update indicator, only using the value
        } else {
            // For M+ and M-, ensure the indicator is visible if memory is not zero
            if (memoryValue !== 0) {
                memoryIndicator.classList.add('active');
                
                // Add pulse animation
                memoryIndicator.style.animation = 'none';
                memoryIndicator.offsetHeight; // Force reflow
                memoryIndicator.style.animation = 'memory-pulse 2s infinite';
            } else {
                memoryIndicator.classList.remove('active');
            }
        }
    }
    
    updateDisplay();
}

/**
 * Displays memory indicator when memory has a value
 */
function displayMemoryIndicator() {
    const memoryIndicator = document.getElementById('memory-indicator');
    
    if (!memoryIndicator) {
        console.error("Memory indicator element not found");
        return;
    }
    
    console.log("Updating memory indicator, memory value:", memoryValue);
    
    if (memoryValue !== 0) {
        memoryIndicator.classList.add('active');
        // Ensure animation is applied
        if (memoryIndicator.style.animation !== 'memory-pulse 2s infinite') {
            memoryIndicator.style.animation = 'none';
            memoryIndicator.offsetHeight; // Force reflow
            memoryIndicator.style.animation = 'memory-pulse 2s infinite';
        }
    } else {
        memoryIndicator.classList.remove('active');
        memoryIndicator.style.animation = 'none';
    }
}

/**
 * Handles operator button clicks
 * @param {string} operator - The operator pressed
 */
function handleOperator(operator) {
    // If current display shows error, clear it first
    if (currentInput === 'Error: Division by zero' || currentInput === 'Error') {
        handleClear();
        return;
    }
    
    // Don't allow consecutive operators
    if (shouldResetScreen && previousInput.length > 0) {
        // Replace the last operator with the new one
        previousInput = previousInput.replace(/[+\-*/]$/, operator);
    } else {
        // Add current input and operator to previous input
        if (previousInput === '') {
            previousInput = currentInput + operator;
        } else {
            previousInput += currentInput + operator;
        }
        
        // Try to evaluate partial expression to update display with intermediate result
        try {
            const tempExpression = previousInput.replace(/[+\-*/]$/, ''); // Remove trailing operator
            const partialResult = evaluatePartialExpression(tempExpression);
            if (partialResult !== null) {
                currentInput = partialResult;
            }
        } catch (e) {
            // If evaluation fails, keep current input as is
        }
    }
    
    calculationOperator = operator;
    shouldResetScreen = true;
    
    updateDisplay();
    
    // Add calculating effect for visual feedback
    displayElement.classList.add('calculating');
    setTimeout(() => {
        displayElement.classList.remove('calculating');
    }, 300);
}

/**
 * Calculates the result of a mathematical expression with proper order of operations
 */
function calculateExpression() {
    try {
        // Construct the full expression
        let expression = previousInput;
        
        // Remove equals sign if present
        expression = expression.replace(/=/g, '');
        
        console.log("Raw expression:", expression);
        
        // If expression is empty or doesn't have currentInput at the end
        // We need to add the currentInput to complete it
        if (!expression.endsWith(currentInput) && 
            !shouldResetScreen && 
            currentInput !== '0') {
            expression += currentInput;
        }
        
        // Fix parentheses issues - ensure proper pairing
        let openParenCount = (expression.match(/\(/g) || []).length;
        let closeParenCount = (expression.match(/\)/g) || []).length;
        
        // Add missing closing parentheses if needed
        while (openParenCount > closeParenCount) {
            expression += ")";
            closeParenCount++;
        }
        
        // Replace any invalid combination like ")(" with ")*("
        expression = expression.replace(/\)\(/g, ')*(');
        
        // Handle implicit multiplication like "3(4+2)" by inserting * before (
        expression = expression.replace(/(\d)(\()/g, '$1*$2');
        
        // Also handle cases where there's an operator followed by a number and parenthesis
        // Like 2+3(12/6) -> 2+3*(12/6)
        expression = expression.replace(/([+\-*/])(\d+)(\()/g, '$1$2*$3');
        
        // Remove any trailing operators to avoid syntax errors
        expression = expression.replace(/[+\-*/]$/, '');
        
        console.log("Cleaned expression:", expression);
        
        // Calculate the result using direct evaluation
        // Use Function constructor for safer evaluation
        const result = Function('"use strict"; return (' + expression + ')')();
        console.log("Calculated result:", result);
        
        // Ensure the result is a valid number
        if (!isFinite(result)) {
            throw new Error("Division by zero or other arithmetic error");
        }
        
        // Save to history before updating currentInput
        addToHistory(expression, result);
        
        // Format result to avoid extremely long decimals but maintain precision
        if (Math.abs(result) > 10**14) {
            // Use scientific notation for very large numbers
            currentInput = result.toExponential(8);
        } else {
            // Round to 12 decimal places to avoid floating point issues
            currentInput = Math.round(result * 10**12) / 10**12 + '';
        }
        
        previousInput = '';
        
        // Trigger calculation success animation
        animateCalculationSuccess();
        
        console.log("Final result set to:", currentInput);
    } catch (error) {
        console.error("Calculation error:", error);
        currentInput = 'Error';
        previousInput = '';
        animateCalculationError();
    }
    
    calculationOperator = '';
    shouldResetScreen = true;
    parenthesesCount = 0;
    updateDisplay();
    // Update history display if it's visible
    updateHistoryDisplay();
}

/**
 * Safely evaluates a mathematical expression
 * @param {string} expression - The expression to evaluate
 * @returns {number} - The calculated result
 */
function safeEval(expression) {
    try {
        // Use Function instead of eval for slightly better security
        return Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
        console.error("Evaluation error:", error);
        throw new Error("Invalid expression");
    }
}

/**
 * Animates the display on successful calculation
 */
function animateCalculationSuccess() {
    displayElement.classList.add('calculation-success');
    
    // Create success particles
    createParticleBurst(5, 'success-particle');
    
    setTimeout(() => {
        displayElement.classList.remove('calculation-success');
    }, 1000);
}

/**
 * Animates the display on calculation error
 */
function animateCalculationError() {
    displayElement.classList.add('calculation-error');
    
    // Create error particles
    createErrorParticles();
    
    setTimeout(() => {
        displayElement.classList.remove('calculation-error');
    }, 1000);
}

/**
 * Creates a particle burst effect on successful calculation
 */
function createParticleBurst(count, className) {
    const container = document.querySelector('.calculator');
    const display = document.querySelector('.display');
    const rect = display.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate relative position
    const centerX = rect.left - containerRect.left + rect.width / 2;
    const centerY = rect.top - containerRect.top + rect.height / 2;
    
    // Create particles
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = className;
        
        // Random position offset
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 80;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Random size
        const size = 3 + Math.random() * 5;
        
        // Set styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--angle', `${angle}rad`);
        particle.style.setProperty('--delay', `${Math.random() * 0.2}s`);
        particle.style.setProperty('--duration', `${0.5 + Math.random()}s`);
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            container.removeChild(particle);
        }, 1500);
    }
}

/**
 * Creates error particles on calculation error
 */
function createErrorParticles() {
    const container = document.querySelector('.calculator');
    const display = document.querySelector('.display');
    const rect = display.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate relative position
    const left = rect.left - containerRect.left;
    const top = rect.top - containerRect.top;
    const width = rect.width;
    const height = rect.height;
    
    // Create particles
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'error-particle';
        
        // Random position
        const x = left + Math.random() * width;
        const y = top + Math.random() * height;
        
        // Set styles
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--delay', `${Math.random() * 0.5}s`);
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            container.removeChild(particle);
        }, 2000);
    }
}

/**
 * Handles the equals button click
 */
function handleEqual() {
    // Log for debugging
    console.log("handleEqual called - currentInput:", currentInput, "previousInput:", previousInput);
    
    // Don't do anything if there's nothing to calculate
    if (previousInput === '' && currentInput === '0') {
        console.log("Nothing to calculate, returning");
        return;
    }
    
    // Add closing parentheses if needed
    let finalExpression = previousInput;
    
    // Add current input to the expression if needed
    if (!finalExpression.endsWith(currentInput) && 
        !shouldResetScreen && 
        currentInput !== '0') {
        finalExpression += currentInput;
    }
    
    // Add closing parentheses if needed
    while (parenthesesCount > 0) {
        finalExpression += ')';
        parenthesesCount--;
        console.log("Added closing parenthesis, new finalExpression:", finalExpression);
    }
    
    // Remove trailing operators to avoid syntax errors
    finalExpression = finalExpression.replace(/[+\-*/]$/, '');
    
    console.log("Final expression before calculation:", finalExpression);
    
    // Update the expression display
    equationElement.textContent = finalExpression + '=';
    
    // Store the expression for calculation
    previousInput = finalExpression;
    
    // Use calculateExpression for proper order of operations
    calculateExpression();
    
    // Add calculating class for visual feedback
    displayElement.classList.add('calculating');
    
    setTimeout(() => {
        displayElement.classList.remove('calculating');
    }, 300);
}

/**
 * Clears the calculator
 */
function handleClear() {
    currentInput = '0';
    previousInput = '';
    calculationOperator = '';
    parenthesesCount = 0;
    updateDisplay();
}

/**
 * Handles keyboard input events
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardInput(event) {
    // Don't process keyboard inputs when typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return;
    }
    
    // Determine which key was pressed
    const key = event.key;
    
    // Add button animation when key is pressed
    if (key >= '0' && key <= '9') {
        animateButton(`button[data-number="${key}"]`);
        handleNumber(key);
    } else if (key === '.') {
        animateButton(`button[data-number="."]`);
        handleNumber('.');
    } else if (key === '+') {
        animateButton('button[data-action="add"]');
        handleOperator('+');
    } else if (key === '-') {
        animateButton('button[data-action="subtract"]');
        handleOperator('-');
    } else if (key === '*' || key === 'x' || key === 'X') {
        animateButton('button[data-action="multiply"]');
        handleOperator('*');
    } else if (key === '/') {
        animateButton('button[data-action="divide"]');
        handleOperator('/');
    } else if (key === '=' || key === 'Enter') {
        animateButton('button[data-action="calculate"]');
        handleEqual();
        event.preventDefault(); // Prevent form submission if inside a form
    } else if (key === 'Escape') {
        animateButton('button[data-action="clear"]');
        handleClear();
    } else if (key === 'Backspace') {
        animateButton('button[data-action="backspace"]');
        handleFunction('backspace');
    } else if (key === '%') {
        animateButton('button[data-action="percent"]');
        handleFunction('percent');
    } else if (key === '(' || key === ')') {
        animateButton(`button[data-number="${key}"]`);
        handleNumber(key);
    } else if (key.toLowerCase() === 'r') {
        animateButton('button[data-action="sqrt"]');
        handleFunction('sqrt');
    } else if (key.toLowerCase() === 'm') {
        if (event.ctrlKey) {
            // Ctrl+M for Memory Clear
            animateButton('button[data-action="memory-clear"]');
            handleFunction('memory-clear');
        } else {
            // M for Memory Recall
            animateButton('button[data-action="memory-recall"]');
            handleFunction('memory-recall');
        }
    } else if (key === '+' && event.shiftKey) {
        // Shift+Plus for Memory Add (usually Shift+= on most keyboards)
        animateButton('button[data-action="memory-add"]');
        handleFunction('memory-add');
    } else if (key === '_' && event.shiftKey) {
        // Shift+Minus for Memory Subtract (usually Shift+- on most keyboards)
        animateButton('button[data-action="memory-subtract"]');
        handleFunction('memory-subtract');
    } else if (key.toLowerCase() === 'h') {
        // H key to toggle history
        toggleHistory();
    } else if (key.toLowerCase() === 't') {
        // T key to cycle through themes
        cycleThemes();
    }
}

/**
 * Animates a button to give visual feedback for keyboard presses
 * @param {string} selector - CSS selector for the button
 */
function animateButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('button-active');
        
        // Create ripple effect in center of button
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            button.classList.remove('button-active');
            if (button.contains(ripple)) {
                button.removeChild(ripple);
            }
        }, 200);
    }
}

/**
 * Creates quantum bit particles for animation
 */
function createQuantumBits() {
    const calculator = document.querySelector('.calculator');
    const quantumBits = document.createElement('div');
    quantumBits.className = 'quantum-bits';
    
    // Create 15 quantum bits
    for (let i = 0; i < 15; i++) {
        const bit = document.createElement('div');
        bit.className = 'quantum-bit';
        
        // Set random position
        const left = Math.random() * 100;
        bit.style.left = `${left}%`;
        
        // Set random animation duration and delay
        const duration = 3 + Math.random() * 4; // 3-7 seconds
        const delay = Math.random() * 5; // 0-5 seconds
        
        bit.style.setProperty('--bit-duration', `${duration}s`);
        bit.style.setProperty('--bit-delay', `${delay}`);
        
        quantumBits.appendChild(bit);
    }
    
    calculator.appendChild(quantumBits);
}

/**
 * Adds a calculation to the history
 * @param {string} expression - The expression calculated
 * @param {number} result - The result of the calculation
 */
function addToHistory(expression, result) {
    // Format the result for display
    let formattedResult;
    if (Math.abs(result) > 10**14) {
        formattedResult = result.toExponential(8);
    } else {
        formattedResult = Math.round(result * 10**12) / 10**12;
    }
    
    // Add the calculation to history
    calculationHistory.unshift({
        expression: expression,
        result: formattedResult,
        timestamp: new Date().toLocaleTimeString()
    });
    
    // Limit history to 10 items
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }
    
    // Update history display if it's visible
    if (isHistoryVisible) {
        updateHistoryDisplay();
    }
}

/**
 * Updates the history display with the current history
 */
function updateHistoryDisplay() {
    const historyPanel = document.getElementById('history-panel');
    if (!historyPanel) return;
    
    // Store the close button to reattach later
    const closeButton = historyPanel.querySelector('.history-close-btn');
    
    // Clear existing history except close button
    historyPanel.innerHTML = '';
    
    // Reattach close button
    if (closeButton) {
        historyPanel.appendChild(closeButton);
    } else {
        // Create close button if it doesn't exist
        const newCloseButton = document.createElement('button');
        newCloseButton.className = 'history-close-btn';
        newCloseButton.innerHTML = '&times;';
        newCloseButton.addEventListener('click', () => {
            toggleHistory();
        });
        historyPanel.appendChild(newCloseButton);
    }
    
    // Add history heading
    const historyHeading = document.createElement('h3');
    historyHeading.textContent = 'Calculation History';
    historyPanel.appendChild(historyHeading);
    
    // Add clear history button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear History';
    clearButton.className = 'history-clear-btn';
    clearButton.addEventListener('click', clearHistory);
    historyPanel.appendChild(clearButton);
    
    // Add history items
    if (calculationHistory.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'history-empty';
        emptyMessage.textContent = 'No calculations yet';
        historyPanel.appendChild(emptyMessage);
    } else {
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        
        calculationHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const itemHeader = document.createElement('div');
            itemHeader.className = 'history-item-header';
            itemHeader.textContent = `Calculation #${calculationHistory.length - index} • ${item.timestamp}`;
            
            const itemExpression = document.createElement('div');
            itemExpression.className = 'history-item-expression';
            itemExpression.textContent = item.expression;
            
            const itemResult = document.createElement('div');
            itemResult.className = 'history-item-result';
            itemResult.textContent = `= ${item.result}`;
            
            // Add recall button to use the result in current calculation
            const recallButton = document.createElement('button');
            recallButton.className = 'history-recall-btn';
            recallButton.innerHTML = '<i class="fas fa-redo"></i>';
            recallButton.title = 'Use this result';
            recallButton.addEventListener('click', () => recallHistoryItem(item));
            
            historyItem.appendChild(itemHeader);
            historyItem.appendChild(itemExpression);
            historyItem.appendChild(itemResult);
            historyItem.appendChild(recallButton);
            historyList.appendChild(historyItem);
        });
        
        historyPanel.appendChild(historyList);
    }
}

/**
 * Clears the calculation history
 */
function clearHistory() {
    calculationHistory = [];
    updateHistoryDisplay();
}

/**
 * Recalls a history item to the current calculation
 * @param {Object} item - The history item to recall
 */
function recallHistoryItem(item) {
    currentInput = item.result.toString();
    updateDisplay();
    
    // Close history panel after recalling an item for better UX
    setTimeout(() => {
        if (isHistoryVisible) {
            toggleHistory();
        }
    }, 300);
}

/**
 * Toggles the history panel visibility
 */
function toggleHistory() {
    // Check if history panel already exists
    let historyPanel = document.getElementById('history-panel');
    
    if (historyPanel && isHistoryVisible) {
        // Hide history panel
        historyPanel.classList.add('history-panel-hidden');
        setTimeout(() => {
            historyPanel.remove();
        }, 300);
        isHistoryVisible = false;
    } else {
        // Create and show history panel
        if (!historyPanel) {
            historyPanel = document.createElement('div');
            historyPanel.id = 'history-panel';
            historyPanel.className = 'history-panel history-panel-hidden';
            document.body.appendChild(historyPanel); // Append to body for better positioning
            
            // Add close button for the history panel
            const closeHistoryBtn = document.createElement('button');
            closeHistoryBtn.className = 'history-close-btn';
            closeHistoryBtn.innerHTML = '&times;';
            closeHistoryBtn.addEventListener('click', () => {
                toggleHistory(); // Call toggleHistory to close the panel
            });
            historyPanel.appendChild(closeHistoryBtn);
            
            // Force a reflow before adding the visible class
            historyPanel.offsetHeight;
        }
        
        // Update history content
        updateHistoryDisplay();
        
        // Show panel with animation
        setTimeout(() => {
            historyPanel.classList.remove('history-panel-hidden');
        }, 10);
        
        isHistoryVisible = true;
    }
}

// DOM ready event listener
document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
}); 