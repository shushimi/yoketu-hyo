let currentCategoryData = null;
let emptyCellsSequence = []; 
let currentTargetIndex = -1; 
let currentCorrectAnswer = "";
let isInputLocked = false; // ★連打・誤作動防止の厳格なロック

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
            td.id = `cell-${rIdx}-${cIdx}`;
            
            if (ans === null) {
                td.classList.add('null-cell'); 
            } else {
                td.classList.add('empty-cell');
                td.dataset.answer = ans;
                td.dataset.rowName = row.name;
                td.dataset.colName = currentCategoryData.headers[cIdx + 1];
                // 手動タップ時の処理
                td.addEventListener('click', () => {
                    if (!isInputLocked) activateCell(rIdx, cIdx);
                });
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

// ユーザーが手動でマスをタップした時の処理
function activateCell(rIdx, cIdx) {
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
    
    // 正解以外の選択肢を5つ選ぶ (6択用)
    let wrongChoices = allAcupoints.filter(pt => pt !== currentCorrectAnswer);
    wrongChoices = wrongChoices.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    let choices = [currentCorrectAnswer, ...wrongChoices];
    choices = choices.sort(() => 0.5 - Math.random()); // シャッフル

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, idx) => {
        btn.textContent = choices[idx];
        btn.disabled = false; // ボタンを押せる状態に戻す
    });
}

// 回答ボタンが押された時の処理
function checkAnswer(btnIndex) {
    if (isInputLocked) return; // ★連打されたら完全に弾く
    isInputLocked = true; // ★ロックをかける

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true); // ★画面上のボタンも押せなくする

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

    // 回答済みのマスをリストから消す
    emptyCellsSequence.splice(currentTargetIndex, 1);

    if (emptyCellsSequence.length > 0) {
        if (currentTargetIndex >= emptyCellsSequence.length) {
            currentTargetIndex = 0; 
        }
        const nextTarget = emptyCellsSequence[currentTargetIndex];
        
        // 0.3秒後に自動で次のマスへ移動
        setTimeout(() => {
            moveToNextTarget(nextTarget.rIdx, nextTarget.cIdx);
        }, 300);
    } else {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('complete-message').classList.remove('hidden');
        document.getElementById('current-target-info').textContent = "コンプリート！";
        isInputLocked = false;
    }
}

// プログラムが自動で次のマスへ進むための専用処理
function moveToNextTarget(rIdx, cIdx) {
    document.querySelectorAll('.empty-cell').forEach(el => el.classList.remove('active-target'));
    
    const targetIdx = emptyCellsSequence.findIndex(item => item.rIdx === rIdx && item.cIdx === cIdx);
    
    if (targetIdx !== -1) {
        currentTargetIndex = targetIdx;
        const target = emptyCellsSequence[currentTargetIndex];
        target.element.classList.add('active-target');
        
        document.getElementById('current-target-info').textContent = `${target.element.dataset.rowName} - ${target.element.dataset.colName}`;
        currentCorrectAnswer = target.element.dataset.answer;

        target.element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        generateQuiz();
    }
    
    isInputLocked = false; // ★無事に移動が終わったらロックを解除して次の入力を待つ
}
