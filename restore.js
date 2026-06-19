const fs = require('fs');
const path = require('path');

const pbPaths = [
    'C:\\Users\\admin\\.gemini\\antigravity\\conversations\\252b6375-042f-4f69-a0e9-2fea4d492a99.pb',
    'C:\\Users\\admin\\.gemini\\antigravity\\conversations\\4e58591a-18bc-4165-9825-044f4dbcd0ff.pb'
];

const targets = [
    'experience-details.html',
    'experiences.html',
    'faq.html',
    'gallery.html',
    'terms.html',
    'pricing.html',
    'style.css',
    'dark-mode.css',
    'rtl.css'
];

pbPaths.forEach(pbPath => {
    if (!fs.existsSync(pbPath)) {
        console.log('Not found:', pbPath);
        return;
    }
    console.log(`\n=== Processing ${path.basename(pbPath)} ===`);
    const buffer = fs.readFileSync(pbPath);
    
    // Convert to string, but handle potential null bytes or encoding issues.
    // Protobuf is binary, so converting directly to utf8 might lose some byte sequences, 
    // but string search should generally work for ascii sequences.
    const contentStr = buffer.toString('binary');
    
    targets.forEach(target => {
        console.log(`Searching for ${target}...`);
        let idx = 0;
        const matches = [];
        while (true) {
            idx = contentStr.indexOf(target, idx);
            if (idx === -1) break;
            matches.push(idx);
            idx += target.length;
        }
        console.log(`Found ${matches.length} references to ${target}`);
        
        // Let's try to extract for each match
        for (let i = matches.length - 1; i >= 0; i--) {
            const matchIdx = matches[i];
            
            // Search a large window around the match
            const startSearch = Math.max(0, matchIdx - 15000);
            const endSearch = Math.min(contentStr.length, matchIdx + 85000);
            const chunk = contentStr.substring(startSearch, endSearch);
            
            // Check if chunk has CodeContent or TargetContent/ReplacementContent
            if (chunk.includes('CodeContent') || chunk.includes('ReplacementContent') || chunk.includes('targetContent')) {
                console.log(`  Found content marker near index ${matchIdx}`);
                
                // Let's find the JSON-like block. 
                // Since it's stored in protobuf as a string field, it might contain escaped JSON.
                // Let's find the start of the JSON block by looking for {"TargetFile" or similar
                let jsonStartIdx = chunk.indexOf('{"TargetFile"');
                if (jsonStartIdx === -1) {
                    jsonStartIdx = chunk.indexOf('{"TargetFile');
                }
                
                if (jsonStartIdx !== -1) {
                    let braceCount = 0;
                    let jsonEndIdx = -1;
                    for (let j = jsonStartIdx; j < chunk.length; j++) {
                        if (chunk[j] === '{') braceCount++;
                        else if (chunk[j] === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                                jsonEndIdx = j;
                                break;
                            }
                        }
                    }
                    
                    if (jsonEndIdx !== -1) {
                        const jsonStr = chunk.substring(jsonStartIdx, jsonEndIdx + 1);
                        try {
                            // We need to unescape backslashes and double quotes if they are stored as JSON-inside-JSON/proto string.
                            // But first let's see if we can parse it directly.
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.TargetFile && (parsed.CodeContent || parsed.ReplacementContent)) {
                                const fileContent = parsed.CodeContent || parsed.ReplacementContent;
                                const destPath = parsed.TargetFile;
                                console.log(`  Successfully parsed JSON for ${target}. Length: ${fileContent.length}`);
                                
                                const fullDestPath = path.resolve(destPath);
                                fs.mkdirSync(path.dirname(fullDestPath), { recursive: true });
                                fs.writeFileSync(fullDestPath, fileContent, 'utf8');
                                console.log(`  Restored ${target} to ${fullDestPath}`);
                                break;
                            }
                        } catch (err) {
                            console.log(`  Direct parse failed (${err.message}). Trying manual extraction...`);
                            
                            // Let's locate CodeContent or ReplacementContent value.
                            let codeKey = '"CodeContent":"';
                            let codeStart = jsonStr.indexOf(codeKey);
                            if (codeStart === -1) {
                                codeKey = '"ReplacementContent":"';
                                codeStart = jsonStr.indexOf(codeKey);
                            }
                            
                            if (codeStart !== -1) {
                                const valStart = codeStart + codeKey.length;
                                // Find the ending quote before the next field (e.g. ","Description" or ","IsArtifact")
                                let valEnd = -1;
                                const markers = ['","Description"', '","IsArtifact"', '","Overwrite"', '","AllowMultiple"'];
                                for (const marker of markers) {
                                    const mIdx = jsonStr.indexOf(marker, valStart);
                                    if (mIdx !== -1) {
                                        valEnd = mIdx;
                                        break;
                                    }
                                }
                                if (valEnd !== -1) {
                                    let rawContent = jsonStr.substring(valStart, valEnd);
                                    // Unescape characters
                                    rawContent = rawContent
                                        .replace(/\\r\\n/g, '\n')
                                        .replace(/\\n/g, '\n')
                                        .replace(/\\"/g, '"')
                                        .replace(/\\\\/g, '\\');
                                    
                                    const destPath = parsedPath(jsonStr) || path.join(__dirname, target);
                                    const fullDestPath = path.resolve(destPath);
                                    fs.mkdirSync(path.dirname(fullDestPath), { recursive: true });
                                    fs.writeFileSync(fullDestPath, rawContent, 'utf8');
                                    console.log(`  Manually restored ${target} to ${fullDestPath}`);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    });
});

function parsedPath(jsonStr) {
    const key = '"TargetFile":"';
    const start = jsonStr.indexOf(key);
    if (start === -1) return null;
    const end = jsonStr.indexOf('"', start + key.length);
    if (end === -1) return null;
    return jsonStr.substring(start + key.length, end).replace(/\\\\/g, '\\');
}
