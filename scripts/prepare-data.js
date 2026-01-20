const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../../');
const outputDir = path.join(__dirname, '../data');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Loading source data...');

// Load source files
const microorganisms = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'microorganisms.json'), 'utf8')
);
const antimicrobials = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'antimicrobials.json'), 'utf8')
);
const intrinsicResistant = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'intrinsic_resistant.json'), 'utf8')
);
const clinicalBreakpoints = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'clinical_breakpoints.json'), 'utf8')
);
const microorganismsGroups = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'microorganisms_groups.json'), 'utf8')
);

console.log(`Loaded ${microorganisms.length} microorganisms`);
console.log(`Loaded ${antimicrobials.length} antimicrobials`);
console.log(`Loaded ${intrinsicResistant.length} intrinsic resistance records`);
console.log(`Loaded ${clinicalBreakpoints.length} clinical breakpoint records`);
console.log(`Loaded ${microorganismsGroups.length} microorganism group records`);

// Filter bacteria - kingdom === "Bacteria" and rank in ["species", "genus"]
const bacteria = microorganisms.filter(
  mo => mo.kingdom === 'Bacteria' && ['species', 'genus'].includes(mo.rank)
);

console.log(`\nFiltered to ${bacteria.length} bacteria (species and genus only)`);

// Create a Set of bacteria mo codes for fast lookup
const bacteriaMoCodes = new Set(bacteria.map(b => b.mo));

// Filter intrinsic resistant to only include bacteria mo codes
const filteredIntrinsicResistant = intrinsicResistant.filter(
  ir => bacteriaMoCodes.has(ir.mo)
);

console.log(`Filtered intrinsic resistance to ${filteredIntrinsicResistant.length} records`);

// Filter clinical breakpoints to only include bacteria mo codes
const filteredClinicalBreakpoints = clinicalBreakpoints.filter(
  cb => bacteriaMoCodes.has(cb.mo)
);

console.log(`Filtered clinical breakpoints to ${filteredClinicalBreakpoints.length} records`);

// Filter microorganisms groups to only include bacteria mo codes
const filteredMicroorganismsGroups = microorganismsGroups.filter(
  mg => bacteriaMoCodes.has(mg.mo)
);

console.log(`Filtered microorganism groups to ${filteredMicroorganismsGroups.length} records`);

// Write output files
console.log('\nWriting output files...');

fs.writeFileSync(
  path.join(outputDir, 'bacteria.json'),
  JSON.stringify(bacteria, null, 2)
);
console.log(`Wrote bacteria.json (${bacteria.length} entries)`);

fs.writeFileSync(
  path.join(outputDir, 'antimicrobials.json'),
  JSON.stringify(antimicrobials, null, 2)
);
console.log(`Wrote antimicrobials.json (${antimicrobials.length} entries)`);

fs.writeFileSync(
  path.join(outputDir, 'intrinsic_resistant.json'),
  JSON.stringify(filteredIntrinsicResistant, null, 2)
);
console.log(`Wrote intrinsic_resistant.json (${filteredIntrinsicResistant.length} entries)`);

fs.writeFileSync(
  path.join(outputDir, 'clinical_breakpoints.json'),
  JSON.stringify(filteredClinicalBreakpoints, null, 2)
);
console.log(`Wrote clinical_breakpoints.json (${filteredClinicalBreakpoints.length} entries)`);

fs.writeFileSync(
  path.join(outputDir, 'microorganisms_groups.json'),
  JSON.stringify(filteredMicroorganismsGroups, null, 2)
);
console.log(`Wrote microorganisms_groups.json (${filteredMicroorganismsGroups.length} entries)`);

console.log('\nData preparation complete!');
