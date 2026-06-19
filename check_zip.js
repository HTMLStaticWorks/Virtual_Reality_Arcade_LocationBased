const fs = require('fs');
const zlib = require('zlib');

const pbPath = 'C:\\Users\\admin\\.gemini\\antigravity\\conversations\\252b6375-042f-4f69-a0e9-2fea4d492a99.pb';
const buf = fs.readFileSync(pbPath);

const decoders = [
    { name: 'gunzip', fn: zlib.gunzipSync },
    { name: 'inflate', fn: zlib.inflateSync },
    { name: 'unzip', fn: zlib.unzipSync },
    { name: 'brotli', fn: zlib.brotliDecompressSync }
];

decoders.forEach(d => {
    try {
        const dec = d.fn(buf);
        console.log(`${d.name} succeeded! Decompressed length: ${dec.length}`);
        const str = dec.toString('utf8');
        console.log('Sample of decompressed:', str.substring(0, 200));
    } catch (err) {
        console.log(`${d.name} failed: ${err.message}`);
    }
});
