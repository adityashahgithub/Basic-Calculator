// Variables to store calculator state
let currentInput = '0';
let previousInput = '';
let calculationOperator = '';
let shouldResetScreen = false;
let fullExpression = '';
let parenthesesCount = 0;

// Get DOM elements
const displayElement = document.getElementById('display');
const equationElement = document.getElementById('equation');

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
 * Handles operator button clicks
 * @param {string} operator - The operator pressed
 */
function handleOperator(operator) {
    // If current display shows error, clear it first
    if (currentInput === 'Error: Division by zero') {
        handleClear();
        return;
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
    // Clean up the expression
    expression = expression.replace(/[^0-9+\-*/().]/g, '');
    
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
    calculateExpression();
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
    }
    // Decimal point
    else if (event.key === '.') {
        event.preventDefault();
        handleNumber('.');
    }
    // Operators
    else if (['+', '-', '*', '/'].includes(event.key)) {
        event.preventDefault();
        handleOperator(event.key);
    }
    // Parentheses
    else if (event.key === '(' || event.key === ')') {
        event.preventDefault();
        handleNumber(event.key);
    }
    // Equal and Enter
    else if (event.key === '=' || event.key === 'Enter') {
        event.preventDefault();
        handleEqual();
    }
    // Clear (Escape or Delete)
    else if (event.key === 'Escape' || event.key === 'Delete') {
        event.preventDefault();
        handleClear();
    }
}

// Add keyboard event listener
document.addEventListener('keydown', handleKeyboardInput);

// Initialize display
updateDisplay(); 