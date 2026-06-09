const fs = require('fs');
const path = require('path');

const pngPath = process.argv[2] || path.join(__dirname, 'icon.png');
const icoPath = process.argv[3] || path.join(__dirname, 'icon.ico');

// Read PNG file
const pngData = fs.readFileSync(pngPath);

// Validate PNG
if (pngData[0] !== 0x89 || pngData[1] !== 0x50 || pngData[2] !== 0x4E || pngData[3] !== 0x47) {
    console.error('File is not a valid PNG');
    process.exit(1);
}

// Read PNG dimensions from IHDR chunk
const width = pngData.readUInt32BE(16);
const height = pngData.readUInt32BE(20);
console.log(`PNG dimensions: ${width}x${height}`);

// ICO dimensions must fit in a byte (0-255), 0 means 256
const icoWidth = width > 255 ? 0 : width;
const icoHeight = height > 255 ? 0 : height;

// ICO header
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);   // Reserved
icoHeader.writeUInt16LE(1, 2);   // Type: ICO
icoHeader.writeUInt16LE(1, 4);   // Count: 1 image

// ICONDIRENTRY
const entry = Buffer.alloc(16);
entry.writeUInt8(icoWidth, 0);    // Width
entry.writeUInt8(icoHeight, 1);   // Height
entry.writeUInt8(0, 2);           // Colors (0 means >256)
entry.writeUInt8(0, 3);           // Reserved
entry.writeUInt16LE(1, 4);        // Color planes
entry.writeUInt16LE(32, 6);       // Bits per pixel
entry.writeUInt32LE(pngData.length, 8);  // Size of image data
entry.writeUInt32LE(22, 12);      // Offset to image data (6 + 16 = 22)

// Combine all parts
const icoData = Buffer.concat([icoHeader, entry, pngData]);
fs.writeFileSync(icoPath, icoData);

console.log(`Created ${icoPath} (${icoData.length} bytes)`);
