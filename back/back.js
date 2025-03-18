let memory = 0;
let displayMode = 'result'; // 'result' o 'expression'
let stream = null;

function appendToExpression(value) {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');

    // Mantener el 0 en el resultado hasta que se presione igual
    resultInput.value = '0';

    if (displayMode === 'result' && '0123456789.'.includes(value)) {
        expressionInput.value = value;
        displayMode = 'expression';
    } else if (displayMode === 'result') {
        if (value === 'sin' || value === '√') {
            expressionInput.value = (value === 'sin' ? 'sin(' : 'sqrt(') + resultInput.value;
        } else {
            expressionInput.value = resultInput.value + value;
        }
        displayMode = 'expression';
    } else {
        expressionInput.value += value === 'sin' ? 'sin(' : value === '√' ? 'sqrt(' : value;
    }
}

function clearEntry() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');
    expressionInput.value = expressionInput.value.slice(0, -1);
    // Mantener el 0 en el resultado
    resultInput.value = '0';
}

function clearAll() {
    document.getElementById('expression').value = '';
    document.getElementById('result').value = '0';
    displayMode = 'result';
}

function memoryStore() {
    const resultInput = document.getElementById('result');
    if (resultInput.value !== '' && resultInput.value !== 'Error') {
        memory = parseFloat(resultInput.value);
        const originalValue = resultInput.value;
        resultInput.value = 'M';
        setTimeout(() => { resultInput.value = originalValue; }, 500);
    }
}

function memoryRecall() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');

    if (displayMode === 'result') {
        expressionInput.value = memory.toString();
        // Mantener el 0 en el resultado
        resultInput.value = '0';
        displayMode = 'expression';
    } else {
        expressionInput.value += memory.toString();
        // Mantener el 0 en el resultado
        resultInput.value = '0';
    }
}

function calculate() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');
    let expression = expressionInput.value;

    try {
        expression = expression.replace(/sin\(/g, 'Math.sin(');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
        const result = eval(expression);
        resultInput.value = result;
        displayMode = 'result';
    } catch (error) {
        resultInput.value = 'Error';
        displayMode = 'result';
    }
}

function openCamera() {
    document.getElementById('camera-container').style.display = 'flex';
}

function closeCamera() {
    document.getElementById('camera-container').style.display = 'none';
}