let memory = 0;
let displayMode = 'result';
let recognition = null;
let isListening = false;

// Inicializar el reconocimiento de voz
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        alert("Tu navegador no soporta reconocimiento de voz");
        return false;
    }
    
    recognition.lang = 'es-ES'; 
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        processVoiceCommand(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error('Error en reconocimiento de voz:', event.error);
        stopListening();
    };
    
    recognition.onend = function() {
        if (isListening) {
            recognition.start(); // Reiniciar la escucha 
        } else {
            const vozButton = document.querySelector('.voz-button');
            if (vozButton) {
                vozButton.textContent = 'Voz';
                vozButton.style.backgroundColor = '#999';
            }
        }
    };
    
    return true;
}

// Procesar comandos de voz
function processVoiceCommand(transcript) {
    console.log('Comando de voz recibido:', transcript);
    const voiceCommands = {
        'más': '+',
        'mas': '+',
        'suma': '+',
        'sumar': '+',
        'menos': '-',
        'resta': '-',
        'restar': '-',
        'por': '*',
        'multiplicado por': '*',
        'multiplicar': '*',
        'entre': '/',
        'dividido': '/',
        'dividido por': '/',
        'dividir': '/',
        'igual': '=',
        'resultado': '=',
        'calcular': '=',
        'seno': 'sin',
        'raíz': '√',
        'raiz': '√',
        'abrir paréntesis': '(',
        'abre paréntesis': '(',
        'parentesis abierto': '(',
        'cerrar paréntesis': ')',
        'cierra paréntesis': ')',
        'parentesis cerrado': ')',
        'punto': '.',
        'pi': '3.14159',
        'borrar': 'CE',
        'borrar todo': 'C',
        'limpiar': 'C'
    };

    // Procesamiento para números, operadores y comandos
    let processed = false;
    
    for (const [command, action] of Object.entries(voiceCommands)) {
        if (transcript.includes(command)) {
            processed = true;
            
            if (action === '=') {
                calculate();
            } else if (action === 'CE') {
                clearEntry();
            } else if (action === 'C') {
                clearAll();
            } else {
                appendToExpression(action);
            }
        }
    }
    
    // Procesar números 
    const numberWords = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    numberWords.forEach((word, index) => {
        if (transcript.includes(word)) {
            appendToExpression(index.toString());
            processed = true;
        }
    });
    
    // Procesar números directamente
    const numberPattern = /\b[0-9]+\b/g;
    const numbers = transcript.match(numberPattern);
    if (numbers) {
        numbers.forEach(number => {
            appendToExpression(number);
            processed = true;
        });
    }
    
    if (!processed) {
        // Feedback visual si no se reconoció ningún comando
        const resultInput = document.getElementById('result');
        const originalValue = resultInput.value;
        resultInput.value = "Comando no reconocido";
        setTimeout(() => { resultInput.value = originalValue; }, 1000);
    }
}

// Iniciar/detener la escucha de voz
function toggleVoiceRecognition() {
    if (!recognition && !initSpeechRecognition()) {
        return; 
    }
    if (!isListening) {
        startListening();
    } else {
        stopListening();
    }
}

function startListening() {
    isListening = true;
    recognition.start();
    
    const vozButton = document.querySelector('.voz-button');
    if (vozButton) {
        vozButton.textContent = '...';
        vozButton.style.backgroundColor = '#FF4444';
    }
}

function stopListening() {
    isListening = false;
    if (recognition) {
        recognition.stop();
    }
    
    // Restaurar apariencia del botón
    const vozButton = document.querySelector('.voz-button');
    if (vozButton) {
        vozButton.textContent = 'Voz';
        vozButton.style.backgroundColor = '#999';
    }
}

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

// Función de cálculo
function calculate() {
    const expressionInput = document.getElementById('expression');
    const resultInput = document.getElementById('result');
    let expression = expressionInput.value;

    try {
        // Convertir grados a radianes para la función seno
        expression = expression.replace(/sin\(/g, 'Math.sin((Math.PI/180) * ');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
        const result = eval(expression);
        resultInput.value = result;
        displayMode = 'result';
    } catch (error) {
        resultInput.value = 'Error';
        displayMode = 'result';
    }
}

function openAudio() {
    toggleVoiceRecognition();
}

window.addEventListener('DOMContentLoaded', initSpeechRecognition);