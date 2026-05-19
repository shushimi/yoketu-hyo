let currentCategoryData = null;
let emptyCellsSequence = []; 
let currentTargetIndex = -1; 
let currentCorrectAnswer = "";
let isProcessing = false; // ★連打防止用のフラグを追加

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
    isProcessing = false;
    
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
            td.id = `cell-${rIdx}-${cIdx}`;
            
            if (ans === null) {
                td.classList.add('null-cell'); 
            } else {
                td.classList.add('empty-cell');
                td.dataset.answer = ans;
                td.dataset.rowName = row.name;
                td.dataset.colName = currentCategoryData.headers[cIdx + 1];
                td.addEventListener('click', () => activateCell(rIdx, cIdx));
                emptyCellsSequence.push({ rIdx, cIdx, element: td });
            }
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('complete-message').classList.add('hidden');
    document.getElementById('current-target-info').textContent = "表の空欄をタップして開始";
    
    showScreen('game-screen');
}

function activateCell(rIdx, cIdx) {
    if (isProcessing) return; // 処理中は別のセルをタップできないようにする

    document.querySelectorAll('.empty-cell').forEach(el => el.classList.remove('active-target'));
    
    const targetIdx = emptyCellsSequence.findIndex(item => item.rIdx === rIdx && item.cIdx === cIdx);
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
    
    // ★正解以外の選択肢を5つ選ぶ (6択用)
    let wrongChoices = allAcupoints.filter(pt => pt !== currentCorrectAnswer);
    wrongChoices = wrongChoices.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    let choices = [currentCorrectAnswer, ...wrongChoices];
    choices = choices.sort(() => 0.5 - Math.random()); // シャッフル

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, idx) => {
        btn.textContent = choices[idx];
        btn.disabled = false; // ★ボタンを再び押せるようにする
    });

    isProcessing = false; // 入力受付開始
}

function checkAnswer(btnIndex) {
    if (isProcessing) return; // ★連打防止：処理中なら弾く
    isProcessing = true; // ★処理中フラグを立てる

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true); // ★画面上のボタンを全て無効化

    const selectedAnswer = buttons[btnIndex].textContent;
    const target = emptyCellsSequence[currentTargetIndex];
    const td = target.element;

    td.textContent = currentCorrectAnswer; 
    td.classList.remove('empty-cell', 'active-target');

    if (selectedAnswer === currentCorrectAnswer) {
        td.classList.add('correct'); 
    } else {
        td.classList.add('wrong'); 
    }

    emptyCellsSequence.splice(currentTargetIndex, 1);

    if (emptyCellsSequence.length > 0) {
        if (currentTargetIndex >= emptyCellsSequence.length) {
            currentTargetIndex = 0; 
        }
        const nextTarget = emptyCellsSequence[currentTargetIndex];
        setTimeout(() => activateCell(nextTarget.rIdx, nextTarget.cIdx), 300);
    } else {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('complete-message').classList.remove('hidden');
        document.getElementById('current-target-info').textContent = "コンプリート！";
        isProcessing = false;
    }
}
