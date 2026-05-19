let currentCategoryData = null;
let emptyCellsSequence = []; // 回答すべきセルの順番リスト
let currentTargetIndex = -1; // 現在回答中のセルのインデックス
let currentCorrectAnswer = "";

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function returnToMenu() {
    showScreen('menu-screen');
}

// ゲーム開始：テーブルの構築
function startGame(categoryId) {
    currentCategoryData = tableData[categoryId];
    emptyCellsSequence = [];
    currentTargetIndex = 0;
    
    const table = document.getElementById('point-table');
    table.innerHTML = "";

    // ヘッダー作成
    let thead = "<tr>";
    currentCategoryData.headers.forEach(h => thead += `<th>${h}</th>`);
    thead += "</tr>";
    table.innerHTML += thead;

    // 行とセル作成
    currentCategoryData.rows.forEach((row, rIdx) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<th>${row.name}</th>`; // 経脈名
        
        row.data.forEach((ans, cIdx) => {
            let td = document.createElement('td');
            td.id = `cell-${rIdx}-${cIdx}`;
            
            if (ans === null) {
                td.classList.add('null-cell'); // 入力不可マス
            } else {
                td.classList.add('empty-cell');
                td.dataset.answer = ans;
                td.dataset.rowName = row.name;
                td.dataset.colName = currentCategoryData.headers[cIdx + 1];
                // タップされたらそのマスをアクティブにする
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

// 特定のセルをアクティブにする
function activateCell(rIdx, cIdx) {
    // 既存のアクティブ解除
    document.querySelectorAll('.empty-cell').forEach(el => el.classList.remove('active-target'));
    
    // 対象セルを検索
    const targetIdx = emptyCellsSequence.findIndex(item => item.rIdx === rIdx && item.cIdx === cIdx);
    if (targetIdx === -1) return; // すでに回答済み
    
    currentTargetIndex = targetIdx;
    const target = emptyCellsSequence[currentTargetIndex];
    target.element.classList.add('active-target');
    
    // 情報バー更新
    document.getElementById('current-target-info').textContent = `${target.element.dataset.rowName} - ${target.element.dataset.colName}`;
    currentCorrectAnswer = target.element.dataset.answer;

    // ズーム＆スクロール調整 (選択部分を画面中央へ)
    target.element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    generateQuiz();
}

// 4択問題の生成
function generateQuiz() {
    document.getElementById('quiz-container').classList.remove('hidden');
    
    // 正解以外の選択肢をランダムに3つ選ぶ
    let wrongChoices = allAcupoints.filter(pt => pt !== currentCorrectAnswer);
    wrongChoices = wrongChoices.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    let choices = [currentCorrectAnswer, ...wrongChoices];
    choices = choices.sort(() => 0.5 - Math.random()); // シャッフル

    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, idx) => {
        btn.textContent = choices[idx];
    });
}

// 回答のチェック
function checkAnswer(btnIndex) {
    const selectedAnswer = document.querySelectorAll('.choice-btn')[btnIndex].textContent;
    const target = emptyCellsSequence[currentTargetIndex];
    const td = target.element;

    td.textContent = currentCorrectAnswer; // セルに文字を埋める
    td.classList.remove('empty-cell', 'active-target');

    if (selectedAnswer === currentCorrectAnswer) {
        td.classList.add('correct'); // 黒字
    } else {
        td.classList.add('wrong'); // 赤字
    }

    // 回答済みリストから削除
    emptyCellsSequence.splice(currentTargetIndex, 1);

    // 次の空欄へ自動移動（末尾まで行ったら自動で次の段へ）
    if (emptyCellsSequence.length > 0) {
        // currentTargetIndex は配列が縮んだのでそのままのindexで次のセルになる
        if (currentTargetIndex >= emptyCellsSequence.length) {
            currentTargetIndex = 0; // 最後尾を回答した場合は最初に戻る
        }
        const nextTarget = emptyCellsSequence[currentTargetIndex];
        setTimeout(() => activateCell(nextTarget.rIdx, nextTarget.cIdx), 300);
    } else {
        // 全て完了
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('complete-message').classList.remove('hidden');
        document.getElementById('current-target-info').textContent = "コンプリート！";
    }
}
