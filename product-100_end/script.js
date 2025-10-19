document.addEventListener('DOMContentLoaded', () => {
    const csvFile = document.getElementById('csvFile');
    const titleInput = document.getElementById('titleInput');
    const fontSelect = document.getElementById('fontSelect');
    const bgColor = document.getElementById('bgColor');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const startButton = document.getElementById('startButton');
    const finalMessageInput = document.getElementById('finalMessageInput');
    
    const creditsContainer = document.getElementById('credits-container');
    const creditsContent = document.getElementById('credits-content');
    
    let parsedData = null;
    let dynamicStyleTag = null; 

    // スライダーの値を表示
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = `${speedSlider.value}秒`;
    });

    // CSVファイルの読み込みと解析 (変更なし)
    csvFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true, 
                skipEmptyLines: true,
                complete: function(results) {
                    if (results.errors.length > 0) {
                        alert("CSVファイルの解析中にエラーが発生しました。ヘッダーの形式を確認してください。");
                        return;
                    }
                    parsedData = results.data;
                    alert(`CSVファイルから ${parsedData.length} 件のデータを読み込みました。`);
                }
            });
        }
    });

    // --- アニメーションを動的に生成する関数 ---
    function createDynamicAnimation(finalTargetY, stopPointPercent) {
        // 既存の動的スタイルタグがあれば削除
        if (dynamicStyleTag) {
            dynamicStyleTag.remove();
        }

        // 新しいスタイルタグを作成
        dynamicStyleTag = document.createElement('style');
        document.head.appendChild(dynamicStyleTag);
        
        // 停止ポイントを含むキーフレームを生成
        const keyframes = `
            @keyframes dynamic-scroll {
                0% { 
                    transform: translateY(100vh); /* 画面下からスタート */
                }
                ${stopPointPercent.toFixed(2)}% { 
                    transform: translateY(${finalTargetY.toFixed(2)}px); /* 最終メッセージが画面中央に来る位置 */
                }
                100% {
                    /* 最終メッセージが中央で停止した後、コンテンツを少しだけ上に動かし続けることで、
                       停止しているように見せます。このプロジェクトでは、最終メッセージが中央で完全に停止させたいので、
                       100%の値を${finalTargetY.toFixed(2)}pxに設定して完全に停止させます。 */
                    transform: translateY(${finalTargetY.toFixed(2)}px); 
                }
            }
        `;
        dynamicStyleTag.textContent = keyframes;
    }
    // ----------------------------------------

    // エンドロールの開始処理
    startButton.addEventListener('click', () => {
        if (!parsedData || parsedData.length === 0) {
            alert("先に有効なCSVファイルを読み込んでください。");
            return;
        }

        // 1. 設定の適用
        const scrollDuration = parseFloat(speedSlider.value);
        const selectedFont = fontSelect.value;
        const selectedBgColor = bgColor.value;
        const customTitle = titleInput.value;
        const finalMessage = finalMessageInput.value; 

        // 背景色とフォントの適用
        creditsContainer.style.backgroundColor = selectedBgColor;
        creditsContent.style.fontFamily = selectedFont;

        // 2. リストの描画
        creditsContent.innerHTML = ''; 
        
        // --- 表題の追加 --- (省略なし)
        const titleDiv = document.createElement('div');
        titleDiv.className = 'title';
        titleDiv.textContent = customTitle;
        creditsContent.appendChild(titleDiv);

        const headers = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
        const headerSection = headers[0]; 
        const headerRole = headers[1];    
        const headerName = headers[2];    

        let currentSection = null;

        // --- データ行の追加 --- (省略なし)
        parsedData.forEach(row => {
            const section = row[headerSection] || ''; 
            const role = row[headerRole] || '';       
            const name = row[headerName] || '';       

            if (section && section !== currentSection) {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section-break';
                sectionDiv.textContent = section;
                creditsContent.appendChild(sectionDiv);
                currentSection = section;
            }

            const line = document.createElement('div');
            line.className = 'credit-line';

            const roleNameGroup = document.createElement('span');
            roleNameGroup.className = 'role-name-group'; 

            const roleSpan = document.createElement('span');
            roleSpan.className = 'role';
            roleSpan.textContent = role;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            nameSpan.textContent = name;
            
            roleNameGroup.appendChild(roleSpan);
            roleNameGroup.appendChild(nameSpan);
            line.appendChild(roleNameGroup);
            creditsContent.appendChild(line);
        });
        
        // --- 最終メッセージの追加 ---
        let finalMessageDiv = null;
        if (finalMessage) {
            finalMessageDiv = document.createElement('div');
            finalMessageDiv.className = 'final-message'; 
            finalMessageDiv.textContent = finalMessage;
            creditsContent.appendChild(finalMessageDiv);
        }

        // 3. アニメーションの開始と速度設定
        creditsContent.style.animation = 'none';
        creditsContent.style.transform = 'translateY(100vh)'; 
        creditsContent.offsetHeight; 

        
        if (finalMessageDiv) {
            // 最終メッセージが画面の中央に来る停止ポイントを計算

            const screenHeight = window.innerHeight;
            const contentHeight = creditsContent.offsetHeight;
            const finalMessageHeight = finalMessageDiv.offsetHeight;
            const finalMessageTop = finalMessageDiv.offsetTop;
            
            // 最終メッセージの中心を画面中央（screenHeight / 2）に合わせるために、
            // コンテンツ全体をどれだけ上へ動かす必要があるか（CSSのtransform: translateYの値）
            // finalTargetYは負の値になる
            const finalTargetY = (screenHeight / 2) - (finalMessageTop + (finalMessageHeight / 2));
            
            // 全移動距離 (px): 画面下端 (100vh) から最終メッセージの中心 (finalTargetY) までの距離
            // CSSのtransform: translateY(100vh) は px に変換すると screenHeight px の値になる
            const totalScrollDistancePx = screenHeight - finalTargetY; 
            
            // 停止までの移動距離 (px): 画面下端 (100vh) から最終メッセージの上端が画面に入るまでの距離
            // ここでは、コンテンツ全体が最終位置に到達するまでの総移動距離をアニメーション時間に対応させる
            
            // 画面高さを1回スクロールするのにscrollDuration秒かかる速度として計算
            const speedPerPx = scrollDuration / screenHeight; 
            
            // 最終メッセージが停止位置に到達するまでの時間（秒）
            const finalAnimationTime = totalScrollDistancePx * speedPerPx;
            
            // 停止ポイントの割合は、アニメーションの途中に停止を入れる場合に使うが、
            // 今回は最終位置で停止させるため、アニメーションの終了（100%）を停止位置に合わせる。
            // 途中のアニメーションの停止ポイントは不要だが、スムーズに見せるために、
            // 最終メッセージの表示が始まるタイミングの少し手前で減速ポイントとして設定する。
            const easeOutPoint = ((finalMessageTop - screenHeight) / totalScrollDistancePx) * 100;
            
            // 動的なキーフレームを生成してHTMLに挿入
            // 最終位置 (100%) を finalTargetY に固定することで停止させる
            createDynamicAnimation(finalTargetY, Math.max(90, easeOutPoint)); // 90%以降で停止に向かう
            
            // 停止を伴うアニメーションを適用
            creditsContent.style.animation = `dynamic-scroll ${finalAnimationTime.toFixed(2)}s ease-out forwards`;
            
        } else {
            // 最終メッセージがない場合は、以前の継続スクロールアニメーションを適用
            // 画面全体を通り過ぎる距離を計算
            const totalScrollDistancePx = creditsContent.offsetHeight + window.innerHeight;
            const finalAnimationTime = (totalScrollDistancePx / window.innerHeight) * scrollDuration;
            
            // 停止しないスクロール用のアニメーションを動的に生成
            createDynamicAnimation(-(creditsContent.offsetHeight + window.innerHeight), 99.9);

            creditsContent.style.animation = `dynamic-scroll ${finalAnimationTime.toFixed(2)}s linear`;
        }

        document.getElementById('settings-panel').style.display = 'none';
    });
});
