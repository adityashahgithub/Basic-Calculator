// Variables to store calculator state
let currentInput = '0';
let previousInput = '';
let calculationOperator = '';
let shouldResetScreen = false;
let fullExpression = '';
let parenthesesCount = 0;

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
            setTimeout(() => {
                button.classList.remove('button-clicked');
            }, 200);
        });
    });

    // Theme toggle functionality
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        playToggleSound();
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
    displayElement.textContent = currentInput;
    equationElement.textContent = previousInput;
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
            previousInput += ' (';
        } else {
            previousInput += currentInput + ' (';
            currentInput = '0';
        }
    } else if (parenthesis === ')') {
        // Only add closing parenthesis if there are open parentheses
        if (parenthesesCount > 0) {
            parenthesesCount--;
            previousInput += currentInput + ' )';
            calculateExpression();
        }
    }
    
    updateDisplay();
}

/**
 * Handles special functions like backspace and percent
 * @param {string} functionName - The function to execute
 */
function handleFunction(functionName) {
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
    }
    updateDisplay();
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
    
    // If there's a previous operation waiting, calculate it first
    if (calculationOperator !== '') {
        calculateSimpleOperation();
    }
    
    // Add operator to previous input
    if (previousInput === '') {
        previousInput = currentInput + ' ' + operator;
    } else {
        previousInput += ' ' + currentInput + ' ' + operator;
    }
    
    calculationOperator = operator;
    shouldResetScreen = true;
    updateDisplay();
}

/**
 * Calculates a simple operation between two numbers
 * Used when chaining operations (e.g., 1+2+3 should calculate 1+2 first)
 */
function calculateSimpleOperation() {
    if (calculationOperator === '') return;
    
    const prevValue = parseFloat(previousInput.split(' ')[0]);
    const currValue = parseFloat(currentInput);
    
    let result;
    
    switch (calculationOperator) {
        case '+':
            result = prevValue + currValue;
            break;
        case '-':
            result = prevValue - currValue;
            break;
        case '*':
            result = prevValue * currValue;
            break;
        case '/':
            if (currValue === 0) {
                currentInput = 'Error: Division by zero';
                previousInput = '';
                calculationOperator = '';
                updateDisplay();
                return;
            }
            result = prevValue / currValue;
            break;
    }
    
    // Format result to avoid extremely long decimals
    previousInput = Math.round(result * 100000) / 100000 + '';
    calculationOperator = '';
}

/**
 * Calculates the result of a mathematical expression with proper order of operations
 * Uses a simplified approach that handles basic arithmetic
 */
function calculateExpression() {
    try {
        // Construct the full expression
        let expression = previousInput + ' ' + currentInput;
        
        // Remove equals sign if present
        expression = expression.replace('=', '');
        
        // Basic validation
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            throw new Error("Invalid expression");
        }
        
        // Process the expression safely
        let result = evaluateExpression(expression);
        
        // Handle division by zero
        if (!isFinite(result)) {
            currentInput = 'Error: Division by zero';
            previousInput = '';
        } else {
            // Format result to avoid extremely long decimals
            currentInput = Math.round(result * 100000) / 100000 + '';
            previousInput = '';
        }
    } catch (error) {
        currentInput = 'Error';
        previousInput = '';
    }
    
    calculationOperator = '';
    shouldResetScreen = true;
    parenthesesCount = 0;
    updateDisplay();
}

/**
 * Evaluates a mathematical expression safely
 * @param {string} expression - The expression to evaluate
 * @returns {number} - The result of the evaluation
 */
function evaluateExpression(expression) {
    // Clean up the expression - remove all spaces
    expression = expression.replace(/\s+/g, '');
    
    // Replace string representation with actual mathematical operations
    // This ensures our evaluation handles numbers, not strings (avoids '1'+'1'='11' issue)
    let processedExpression = expression.replace(/(\d+\.?\d*|\.\d+)([+\-*/])(\d+\.?\d*|\.\d+)/g, (match, p1, operator, p2) => {
        const num1 = parseFloat(p1);
        const num2 = parseFloat(p2);
        
        switch (operator) {
            case '+':
                return num1 + num2;
            case '-':
                return num1 - num2;
            case '*':
                return num1 * num2;
            case '/':
                if (num2 === 0) {
                    throw new Error("Division by zero");
                }
                return num1 / num2;
        }
    });
    
    // Use Function constructor to evaluate the expression safely
    // Note: This is still using eval under the hood, but with some added safety checks
    try {
        // Check for division by zero
        if (expression.includes('/0')) {
            throw new Error("Division by zero");
        }
        
        // Use Function instead of eval for slightly better security
        return Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
        throw new Error("Calculation error");
    }
}

/**
 * Handles the equals button click
 */
function handleEqual() {
    // Don't do anything if there's nothing to calculate
    if (previousInput === '') return;
    
    // Add closing parentheses if needed
    while (parenthesesCount > 0) {
        previousInput += ' ' + currentInput + ' )';
        parenthesesCount--;
    }
    
    previousInput += ' ' + currentInput + ' =';
    
    // Store the equation for display
    const equation = previousInput;
    
    // For simple calculations like 1+1, use the simple operation method
    if (!equation.includes('(') && !equation.includes(')') && 
        (equation.match(/[+\-*/]/g) || []).length === 1) {
        // Extract operator and operands
        const parts = equation.split(' ');
        const num1 = parseFloat(parts[0]);
        const operator = parts[1];
        const num2 = parseFloat(parts[2]);
        
        let result;
        
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 === 0) {
                    currentInput = 'Error: Division by zero';
                    previousInput = '';
                    updateDisplay();
                    return;
                }
                result = num1 / num2;
                break;
        }
        
        currentInput = Math.round(result * 100000) / 100000 + '';
        previousInput = '';
    } else {
        // For complex expressions, use the full calculation method
        calculateExpression();
    }
    
    // Add pulsing effect to the result
    displayElement.style.animation = 'none';
    void displayElement.offsetWidth; // Trigger reflow
    displayElement.style.animation = 'pulse 1.5s 1';
    setTimeout(() => {
        displayElement.style.animation = '';
    }, 1500);
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
    else if (event.key === '*') {
        event.preventDefault();
        handleOperator('*');
        animateButton('[data-action="multiply"]');
    }
    else if (event.key === '/') {
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
}

/**
 * Animates a button to give visual feedback for keyboard presses
 * @param {string} selector - CSS selector for the button
 */
function animateButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('button-clicked');
        setTimeout(() => {
            button.classList.remove('button-clicked');
        }, 200);
    }
}

// Initialize the calculator when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCalculator); 



/**
 * Handles the equals button click
 */
function handleEqual() {
    // Don't do anything if there's nothing to calculate
    if (previousInput === '') return;
    
    // Add closing parentheses if needed
    while (parenthesesCount > 0) {
        previousInput += ' ' + currentInput + ' )';
        parenthesesCount--;
    }
    
    previousInput += ' ' + currentInput + ' =';
    
    // Store the equation for display
    const equation = previousInput;
    
    // For simple calculations like 1+1, use the simple operation method
    if (!equation.includes('(') && !equation.includes(')') && 
        (equation.match(/[+\-*/]/g) || []).length === 1) {
        // Extract operator and operands
        const parts = equation.split(' ');
        const num1 = parseFloat(parts[0]);
        const operator = parts[1];
        const num2 = parseFloat(parts[2]);
        
        let result;
        
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 === 0) {
                    currentInput = 'Error: Division by zero';
                    previousInput = '';
                    updateDisplay();
                    return;
                }
                result = num1 / num2;
                break;
        }
        
        currentInput = Math.round(result * 100000) / 100000 + '';
        previousInput = '';
    } else {
        // For complex expressions, use the full calculation method
        calculateExpression();
    }
    
    // Make sure to update the display with the result
    updateDisplay();
    
    // Add pulsing effect to the result
    displayElement.style.animation = 'none';
    void displayElement.offsetWidth; // Trigger reflow
    displayElement.style.animation = 'pulse 1.5s 1';
    setTimeout(() => {
        displayElement.style.animation = '';
    }, 1500);
} 