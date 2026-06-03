let currentCategoryData = null;
let emptyCellsSequence = []; 
let currentTargetIndex = -1; 
let currentCorrectAnswer = "";
let isInputLocked = false; 

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function returnToMenu() {
    showScreen('menu-screen');
}

function startGame(categoryId) {
    currentCategoryData = tableData[categoryId];
    emptyCellsSequence = [];
    currentTargetIndex = 0;
    isInputLocked = false;
    
    const table = document.getElementById('point-table');
    table.innerHTML = "";

    let thead = "<tr>";
    currentCategoryData.headers.forEach(h => thead += `<th>${h}</th>`);
    thead += "</tr>";
    table.innerHTML += thead;

    currentCategoryData.rows.forEach((row, rIdx) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<th>${row.name}</th>`;
        
        row.data.forEach((ans, cIdx) => {
            let td = document.createElement('td');
            
            if (ans === null) {
                td.classList.add('null-cell'); 
            } else if (ans === "-") {
                td.classList.add('slash-cell'); 
            } else {
                let items = Array.isArray(ans) ? ans : [ans];
                
                items.forEach((item, subIdx) => {
                    let container = document.createElement('div');
                    container.className = 'target-container';

                    let answerText = typeof item === 'object' ? item.name : item;
                    let displayText = typeof item === 'object' && item.display ? item.display : answerText;
                    let subText = typeof item === 'object' && item.sub ? item.sub : "";

                    if (subText) {
                        let note = document.createElement('div');
                        note.className = 'sub-note';
                        note.textContent = subText;
                        
                        // ★データに hideSub が設定されている表の場合、解答前は見えないようにする
                        if (currentCategoryData.hideSub) {
                            note.style.visibility = 'hidden'; 
                        }
                        
                        container.appendChild(note);
                    }

                    let targetDiv = document.createElement('div');
                    targetDiv.className = 'empty-target';
                    targetDiv.dataset.answer = answerText;
                    targetDiv.dataset.display = displayText;
                    targetDiv.dataset.rowName = row.name;
                    targetDiv.dataset.colName = currentCategoryData.headers[cIdx + 1];
                    
                    targetDiv.addEventListener('click', () => {
                        if (!isInputLocked) activateCell(rIdx, cIdx, subIdx);
                    });
                    
                    container.appendChild(targetDiv);
                    td.appendChild(container);
                    
                    emptyCellsSequence.push({ rIdx, cIdx, subIdx, element: targetDiv });
                });
            }
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    if (currentCategoryData.direction === "vertical") {
        emptyCellsSequence.sort((a, b) => {
            if (a.cIdx !== b.cIdx) return a.cIdx - b.cIdx; 
            if (a.rIdx !== b.rIdx) return a.rIdx - b.rIdx; 
            return a.subIdx - b.subIdx; 
        });
    }

    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('complete-message').classList.add('hidden');
    document.getElementById('current-target-info').textContent = "表の空欄をタップして開始";
    
    showScreen('game-screen');
    
    if(emptyCellsSequence.length > 0) {
        setTimeout(() => activateCell(emptyCellsSequence[0].rIdx, emptyCellsSequence[0].cIdx, emptyCellsSequence[0].subIdx), 500);
    }
}

function activateCell(rIdx, cIdx, subIdx) {
    document.querySelectorAll('.empty-target').forEach(el => el.classList.remove('active-target'));
    
    const targetIdx = emptyCellsSequence.findIndex(item => item.rIdx === rIdx && item.cIdx === cIdx && item.subIdx === subIdx);
    if (targetIdx === -1) return; 
    
    currentTargetIndex = targetIdx;
    const target = emptyCellsSequence[currentTargetIndex];
    target.element.classList.add('active-target');
    
    document.getElementById('current-target-info').textContent = `${target.element.dataset.rowName} - ${target.element.dataset.colName}`;
    currentCorrectAnswer = target.element.dataset.answer;

    target.element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    generateQuiz();
}

function generateQuiz() {
    document.getElementById('quiz-container').classList.remove('hidden');
    
    let wrongChoices = allAcupoints.filter(pt => pt !== currentCorrectAnswer);
    wrongChoices = wrongChoices.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    let choices = [currentCorrectAnswer, ...wrongChoices];
    choices = choices.sort(() => 0.5 - Math.random()); 

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, idx) => {
        btn.textContent = choices[idx];
        btn.disabled = false; 
    });
}

function checkAnswer(btnIndex) {
    if (isInputLocked) return; 
    isInputLocked = true; 

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true); 

    const selectedAnswer = buttons[btnIndex].textContent;
    const target = emptyCellsSequence[currentTargetIndex];
    const el = target.element;

    el.innerHTML = el.dataset.display; 
    el.classList.remove('active-target');

    if (selectedAnswer === currentCorrectAnswer) {
        el.classList.add('correct'); 
        
        // ★正解したら、そのセルの添え文字（サブノート）を表示させる
        const container = el.parentElement;
        const note = container.querySelector('.sub-note');
        if (note) {
            note.style.visibility = 'visible';
        }

    } else {
        el.classList.add('wrong'); 
    }

    emptyCellsSequence.splice(currentTargetIndex, 1);

    if (emptyCellsSequence.length > 0) {
        if (currentTargetIndex >= emptyCellsSequence.length) {
            currentTargetIndex = 0; 
        }
        const nextTarget = emptyCellsSequence[currentTargetIndex];
        
        setTimeout(() => {
            moveToNextTarget(nextTarget.rIdx, nextTarget.cIdx, nextTarget.subIdx);
        }, 300);
    } else {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('complete-message').classList.remove('hidden');
        document.getElementById('current-target-info').textContent = "コンプリート！";
        isInputLocked = false;
    }
}

function moveToNextTarget(rIdx, cIdx, subIdx) {
    document.querySelectorAll('.empty-target').forEach(el => el.classList.remove('active-target'));
    
    const targetIdx = emptyCellsSequence.findIndex(item => item.rIdx === rIdx && item.cIdx === cIdx && item.subIdx === subIdx);
    
    if (targetIdx !== -1) {
        currentTargetIndex = targetIdx;
        const target = emptyCellsSequence[currentTargetIndex];
        target.element.classList.add('active-target');
        
        document.getElementById('current-target-info').textContent = `${target.element.dataset.rowName} - ${target.element.dataset.colName}`;
        currentCorrectAnswer = target.element.dataset.answer;

        target.element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        generateQuiz();
    }
    
    isInputLocked = false; 
}
