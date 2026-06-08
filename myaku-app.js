let emptyCellsSequence = []; 
let currentTargetIndex = -1; 
let isInputLocked = false; 

// ページ読み込み時にゲーム開始
window.onload = startGame;

function startGame() {
    emptyCellsSequence = [];
    currentTargetIndex = 0;
    isInputLocked = false;
    
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = "";

    tableData.forEach((row, rIdx) => {
        let tr = document.createElement('tr');
        
        // --- 脈診セル ---
        let myakuTd = document.createElement('td');
        if (row.emptyMyaku) {
            myakuTd.className = 'empty-target col-myaku';
            myakuTd.innerHTML = row.myaku.map(a => `<span class="blank">[　]</span>`).join('・');
            myakuTd.addEventListener('click', () => {
                if (!isInputLocked) activateCellByElement(myakuTd);
            });
            emptyCellsSequence.push({ rIdx, type: 'myaku', answers: row.myaku, answered: [], element: myakuTd });
        } else {
            myakuTd.className = 'correct col-myaku';
            myakuTd.innerHTML = `<span class="correct-text">${row.myaku.join('・')}</span>`;
        }
        tr.appendChild(myakuTd);

        // --- 内容セル（常に表示） ---
        let contentTd = document.createElement('td');
        contentTd.className = 'content-cell';
        contentTd.textContent = row.content;
        tr.appendChild(contentTd);

        // --- 主病証セル ---
        let byouTd = document.createElement('td');
        if (row.emptyByou) {
            byouTd.className = 'empty-target col-byou';
            byouTd.innerHTML = row.byou.map(a => `<span class="blank">[　]</span>`).join('・');
            byouTd.addEventListener('click', () => {
                if (!isInputLocked) activateCellByElement(byouTd);
            });
            emptyCellsSequence.push({ rIdx, type: 'byou', answers: row.byou, answered: [], element: byouTd });
        } else {
            byouTd.className = 'correct col-byou';
            byouTd.innerHTML = `<span class="correct-text">${row.byou.join('・')}</span>`;
        }
        tr.appendChild(byouTd);

        tbody.appendChild(tr);
    });

    document.getElementById('quiz-container').classList.add('hidden');
    
    // 最初のマスをアクティブに
    if(emptyCellsSequence.length > 0) {
        setTimeout(() => moveToNextTarget(0), 500);
    }
}

// 手動でセルをタップした時の処理
function activateCellByElement(tdElement) {
    const targetIdx = emptyCellsSequence.findIndex(item => item.element === tdElement);
    if (targetIdx !== -1) moveToNextTarget(targetIdx);
}

function moveToNextTarget(targetIdx) {
    if (targetIdx >= emptyCellsSequence.length) targetIdx = 0;
    
    document.querySelectorAll('.empty-target').forEach(el => el.classList.remove('active-target'));
    
    currentTargetIndex = targetIdx;
    const target = emptyCellsSequence[currentTargetIndex];
    target.element.classList.add('active-target');
    
    let infoType = target.type === 'myaku' ? "【脈診】を回答" : "【主病証】を回答";
    document.getElementById('current-target-info').textContent = infoType;

    target.element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    
    generateQuiz();
}

function generateQuiz() {
    const target = emptyCellsSequence[currentTargetIndex];
    document.getElementById('quiz-container').classList.remove('hidden');
    
    // まだ答えていない正解を取得
    let remainingAnswers = target.answers.filter(a => !target.answered.includes(a));
    
    // 列の種類に合わせてダミーを取得
    let dummyPool = target.type === 'myaku' ? allMyaku : allByou;
    let wrongChoices = dummyPool.filter(a => !target.answers.includes(a));
    wrongChoices = wrongChoices.sort(() => 0.5 - Math.random()).slice(0, 6 - remainingAnswers.length);
    
    // 正解とダミーを混ぜてシャッフル
    let choices = [...remainingAnswers, ...wrongChoices];
    choices = choices.sort(() => 0.5 - Math.random()); 

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, idx) => {
        btn.textContent = choices[idx];
        btn.disabled = false; 
    });
    
    isInputLocked = false;
}

function checkAnswer(btnIndex) {
    if (isInputLocked) return; 
    isInputLocked = true; 

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true); 

    const selectedAnswer = buttons[btnIndex].textContent;
    const target = emptyCellsSequence[currentTargetIndex];
    const el = target.element;

    // ★ 順不同判定：選んだ言葉が答えの中にあり、かつ未回答であれば正解！
    if (target.answers.includes(selectedAnswer) && !target.answered.includes(selectedAnswer)) {
        target.answered.push(selectedAnswer);
        
        // マスの表示を更新
        let html = target.answered.map(a => `<span class="correct-text">${a}</span>`).join('・');
        let blanks = target.answers.length - target.answered.length;
        if (blanks > 0) {
            if(html) html += '・';
            html += Array(blanks).fill(`<span class="blank">[　]</span>`).join('・');
        }
        el.innerHTML = html;

        // すべて埋まったかチェック
        if (target.answered.length === target.answers.length) {
            el.classList.remove('active-target');
            el.classList.add('correct');
            
            emptyCellsSequence.splice(currentTargetIndex, 1);
            if (emptyCellsSequence.length > 0) {
                setTimeout(() => moveToNextTarget(currentTargetIndex), 300);
            } else {
                finishGame();
            }
        } else {
            // まだ同じマスに答えるべきものが残っている場合、選択肢を作り直して継続
            setTimeout(() => generateQuiz(), 300);
        }
    } else {
        // ★ 間違えた場合：残りを赤字で強制的に埋めて次のマスへ進む（ペナルティ）
        let remaining = target.answers.filter(a => !target.answered.includes(a));
        
        let html = target.answered.map(a => `<span class="correct-text">${a}</span>`).join('・');
        if(html) html += '・';
        html += remaining.map(a => `<span class="wrong-text">${a}</span>`).join('・');
        
        el.innerHTML = html;
        el.classList.remove('active-target');
        el.classList.add('wrong-cell');

        emptyCellsSequence.splice(currentTargetIndex, 1);
        if (emptyCellsSequence.length > 0) {
            setTimeout(() => moveToNextTarget(currentTargetIndex), 500);
        } else {
            finishGame();
        }
    }
}

function finishGame() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('complete-message').classList.remove('hidden');
    document.getElementById('current-target-info').textContent = "コンプリート！";
    isInputLocked = false;
}
