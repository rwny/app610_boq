document.addEventListener('DOMContentLoaded', function() {
    const calcInput = document.getElementById('calcInput');
    const calcResult = document.getElementById('calcResult');
    let lastValidResult = ''; // Store the last valid result

    // Function to evaluate the calculation
    function evaluate() {
        const expression = calcInput.value.trim();
        
        if (!expression) {
            calcResult.textContent = '';
            return;
        }
        
        try {
            // Use Function constructor to safely evaluate the expression
            const result = new Function('return ' + expression)();
            
            // Format the result
            if (typeof result === 'number') {
                // Format number with commas and up to 4 decimal places
                calcResult.textContent = result.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4
                });
                lastValidResult = calcResult.textContent; // Save successful result
            } else {
                calcResult.textContent = result.toString();
                lastValidResult = calcResult.textContent; // Save successful result
            }
        } catch (e) {
            // Show last valid result instead of error
            if (lastValidResult) {
                calcResult.textContent = lastValidResult;
            } else {
                // If no previous valid result, show the input expression
                calcResult.textContent = expression;
            }
        }
    }

    // Add event listeners
    calcInput.addEventListener('input', evaluate);
    calcInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            evaluate();
            // Optionally select the input text for easy replacement
            calcInput.select();
        }
    });
    
    // Initial evaluation
    evaluate();
});
