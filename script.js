// Variables to store calculator state
let currentInput = '0';
let previousInput = '';
let calculationOperator = '';
let shouldResetScreen = false;
let fullExpression = '';
let parenthesesCount = 0;
let memoryValue = 0; // Initialize memory value

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

    // Theme toggle functionality
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        playToggleSound();
        
        // Add animation for theme change
        document.querySelector('.calculator').classList.add('theme-transition');
        setTimeout(() => {
            document.querySelector('.calculator').classList.remove('theme-transition');
        }, 500);
    });

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

    // Initialize display
    updateDisplay();

    // Welcome animation
    playWelcomeAnimation();

    // Add quantum effects
    createQuantumBits();
    
    // Create background particles
    createBackgroundParticles();

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
            
            button.classList.add('button-clicked');
            button.classList.add('button-active');
            setTimeout(() => {
                button.classList.remove('button-clicked');
                button.classList.remove('button-active');
            }, 200);
        });
    });
    
    // Add memory indicator to the calculator
    const memoryIndicator = document.createElement('div');
    memoryIndicator.className = 'memory-indicator';
    memoryIndicator.id = 'memory-indicator';
    memoryIndicator.textContent = 'M';
    document.querySelector('.display-container').appendChild(memoryIndicator);
    
    // Animate buttons sequentially on load
    setTimeout(() => {
        animateButtonsSequentially();
    }, 500);
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
        }, 1000);
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
    
    // Return formatted number with thousand separators for large integers
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
    // Log current state for debugging
    console.log("Before handleNumber - currentInput:", currentInput, "previousInput:", previousInput);
    
    // Special handling for parentheses
    if (number === '(' || number === ')') {
        handleParentheses(number);
        return;
    }
    
    if (shouldResetScreen) {
        currentInput = number;
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
            currentInput += number;
        }
    }
    
    // Log after state for debugging
    console.log("After handleNumber - currentInput:", currentInput, "previousInput:", previousInput);
    
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
        // Similar to calculateExpression but simplified and doesn't update state
        // Apply same replacements for consistency
        expression = expression.replace(/\)\(/g, ')*(');
        expression = expression.replace(/(\d)(\()/g, '$1*$2');
        expression = expression.replace(/([+\-*/])(\d+)(\()/g, '$1$2*$3');
        
        // Convert to pure math expression
        let pureExpression = '';
        let numBuffer = '';
        let lastChar = '';
        
        for (let i = 0; i < expression.length; i++) {
            const char = expression.charAt(i);
            
            // Skip duplicate operators
            if ((char === '+' || char === '-' || char === '*' || char === '/') && 
                (lastChar === '+' || lastChar === '-' || lastChar === '*' || lastChar === '/')) {
                continue;
            }
            
            // Handle numbers
            if (/[0-9.]/.test(char)) {
                numBuffer += char;
            } else {
                if (numBuffer !== '') {
                    pureExpression += parseFloat(numBuffer);
                    numBuffer = '';
                }
                
                // Add implicit multiplication
                if (char === '(' && lastChar !== '' && /[0-9)]/.test(lastChar)) {
                    pureExpression += '*';
                }
                
                pureExpression += char;
            }
            
            lastChar = char;
        }
        
        // Add any remaining number
        if (numBuffer !== '') {
            pureExpression += parseFloat(numBuffer);
        }
        
        // Evaluate the expression
        const result = Function('"use strict"; return (' + pureExpression + ')')();
        
        if (!isFinite(result)) {
            return null;
        }
        
        // Return formatted result
        return Math.round(result * 100000) / 100000 + '';
    } catch (e) {
        return null;
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
            // Just reset memory to zero
            memoryValue = 0;
            displayMemoryIndicator();
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
        
        if (functionName === 'memory-clear') {
            memoryIndicator.classList.remove('active');
        } else {
            memoryIndicator.classList.add('active');
            
            // Add pulse animation
            memoryIndicator.style.animation = 'none';
            setTimeout(() => {
                memoryIndicator.style.animation = 'memory-pulse 2s infinite';
            }, 10);
        }
    }
    
    updateDisplay();
}

/**
 * Displays memory indicator when memory has a value
 */
function displayMemoryIndicator() {
    const memoryIndicator = document.getElementById('memory-indicator');
    
    if (memoryValue !== 0) {
        memoryIndicator.classList.add('active');
    } else {
        memoryIndicator.classList.remove('active');
    }
}

/**
 * Handles operator button clicks
 * @param {string} operator - The operator pressed
 */
function handleOperator(operator) {
    // Log current state for debugging
    console.log("Before handleOperator - currentInput:", currentInput, "previousInput:", previousInput);
    
    // If current display shows error, clear it first
    if (currentInput === 'Error: Division by zero' || currentInput === 'Error') {
        handleClear();
        return;
    }
    
    // Add operator to previous input without calculating immediately
    if (previousInput === '') {
        previousInput = currentInput + operator;
    } else {
        previousInput += currentInput + operator;
    }
    
    calculationOperator = operator;
    shouldResetScreen = true;
    
    // Log after state for debugging
    console.log("After handleOperator - currentInput:", currentInput, "previousInput:", previousInput);
    
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
        
        // Convert the expression to pure math (no string concatenation)
        // This is done by explicitly converting each number to a float
        let pureExpression = '';
        let numBuffer = '';
        let lastChar = '';
        
        for (let i = 0; i < expression.length; i++) {
            const char = expression.charAt(i);
            
            // Skip duplicate operators
            if ((char === '+' || char === '-' || char === '*' || char === '/') && 
                (lastChar === '+' || lastChar === '-' || lastChar === '*' || lastChar === '/')) {
                continue;
            }
            
            // Handle numbers
            if (/[0-9.]/.test(char)) {
                // If digit or decimal, add to number buffer
                numBuffer += char;
            } else {
                // If operator or parenthesis
                if (numBuffer !== '') {
                    // Add number to formatted expression
                    pureExpression += parseFloat(numBuffer);
                    numBuffer = '';
                }
                
                // Add implicit multiplication between number and opening parenthesis
                if (char === '(' && lastChar !== '' && /[0-9)]/.test(lastChar)) {
                    pureExpression += '*';
                }
                
                // Add the operator or parenthesis
                pureExpression += char;
            }
            
            lastChar = char;
        }
        
        // Add any remaining number
        if (numBuffer !== '') {
            pureExpression += parseFloat(numBuffer);
        }
        
        console.log("Pure math expression:", pureExpression);
        
        // Verify the expression is valid
        if (!/^[0-9+\-*/().]+$/.test(pureExpression)) {
            throw new Error("Invalid characters in expression");
        }
        
        // Calculate the result safely
        const result = safeEval(pureExpression);
        console.log("Calculated result:", result);
        
        // Ensure the result is a valid number
        if (!isFinite(result)) {
            throw new Error("Division by zero or other arithmetic error");
        }
        
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
    if (previousInput === '') {
        console.log("Nothing to calculate, returning");
        return;
    }
    
    // Add closing parentheses if needed
    while (parenthesesCount > 0) {
        previousInput += currentInput + ')';
        parenthesesCount--;
        console.log("Added closing parenthesis, new previousInput:", previousInput);
    }
    
    // Store the final expression with the current input
    let finalExpression = previousInput;
    
    // Only add currentInput if it's not already the last number in previousInput
    // This is important for expressions like "2+3(12/6)" where we need to ensure
    // the current input (which might be "0" due to how parentheses are processed)
    // doesn't overwrite the actual last number in the expression
    if (!previousInput.endsWith(currentInput) && 
        currentInput !== '0' && 
        !shouldResetScreen) {
        finalExpression += currentInput;
    }
    
    // Remove trailing operators like +, -, *, / to prevent syntax errors
    finalExpression = finalExpression.replace(/[+\-*/]$/, '');
    
    console.log("Final expression before calculation:", finalExpression);
    
    // Display the equation in the history
    equationElement.textContent = finalExpression + '=';
    
    // Calculate the result
    previousInput = finalExpression;
    
    // Use calculateExpression for all calculations to ensure proper order of operations
    calculateExpression();
    
    // Add calculating class to display for animation during calculation
    displayElement.classList.add('calculating');
    
    setTimeout(() => {
        displayElement.classList.remove('calculating');
        
        // After calculation, show success or error animation
        if (isNaN(result)) {
            animateCalculationError();
        } else {
            animateCalculationSuccess();
        }
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
 * Handles keyboard input for numbers and operations
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardInput(event) {
    console.log("Key pressed:", event.key);
    
    // Numbers 0-9
    if (/[0-9]/.test(event.key)) {
        event.preventDefault();
        handleNumber(event.key);
        animateButton(`[data-number="${event.key}"]`);
    }
    // Decimal point
    else if (event.key === '.') {
        event.preventDefault();
        handleNumber('.');
        animateButton('[data-number="."]');
    }
    // Operators
    else if (event.key === '+') {
        event.preventDefault();
        handleOperator('+');
        animateButton('[data-action="add"]');
    }
    else if (event.key === '-') {
        event.preventDefault();
        handleOperator('-');
        animateButton('[data-action="subtract"]');
    }
    else if (event.key === '*' || event.key === 'x' || event.key === 'X') {
        event.preventDefault();
        handleOperator('*');
        animateButton('[data-action="multiply"]');
    }
    else if (event.key === '/' || event.key === '÷') {
        event.preventDefault();
        handleOperator('/');
        animateButton('[data-action="divide"]');
    }
    // Parentheses
    else if (event.key === '(') {
        event.preventDefault();
        handleNumber('(');
        animateButton('[data-number="("]');
    }
    else if (event.key === ')') {
        event.preventDefault();
        handleNumber(')');
        animateButton('[data-number=")"]');
    }
    // Equal and Enter
    else if (event.key === '=' || event.key === 'Enter') {
        event.preventDefault();
        handleEqual();
        animateButton('[data-action="calculate"]');
    }
    // Clear (Escape)
    else if (event.key === 'Escape') {
        event.preventDefault();
        handleClear();
        animateButton('[data-action="clear"]');
    }
    // Backspace
    else if (event.key === 'Backspace') {
        event.preventDefault();
        handleFunction('backspace');
        animateButton('[data-action="backspace"]');
    }
    // Percent
    else if (event.key === '%') {
        event.preventDefault();
        handleFunction('percent');
        animateButton('[data-action="percent"]');
    }
    // Square root (r key)
    else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        handleFunction('sqrt');
        animateButton('[data-action="sqrt"]');
    }
    // Memory functions
    else if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        handleFunction('memory-recall');
        animateButton('[data-action="memory-recall"]');
    }
    else if (event.ctrlKey && (event.key === 'm' || event.key === 'M')) {
        event.preventDefault();
        handleFunction('memory-clear');
        animateButton('[data-action="memory-clear"]');
    }
    else if (event.shiftKey && (event.key === '+')) {
        event.preventDefault();
        handleFunction('memory-add');
        animateButton('[data-action="memory-add"]');
    }
    else if (event.shiftKey && (event.key === '-')) {
        event.preventDefault();
        handleFunction('memory-subtract');
        animateButton('[data-action="memory-subtract"]');
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

// Initialize the calculator when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCalculator); 