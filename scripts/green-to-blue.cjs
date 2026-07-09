const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/CustomerDetail.jsx',
  'src/pages/OrderDetail.jsx',
];

const replacements = [
  // Primary accent colors
  ['#22C55E', '#3B82F6'],
  ['#16A34A', '#2563EB'],
  ['#16a34a', '#2563eb'],
  ['#1d4ed8', '#1d4ed8'], // keep existing blue
  ['#15803d', '#1d4ed8'], // dark green → dark blue

  // Dark background colors
  ['#041C15', '#0a1222'],
  ['#06281F', '#0f172a'],
  ['#061a14', '#0a1222'],
  ['#060f0a', '#070b14'],

  // Card/drawer backgrounds
  ['#0a1a12', '#0f172a'],
  ['#0a2e1e', '#0f172a'],
  ['#0a2a1f', '#0f172a'],
  ['#072e1f', '#0a1222'],
  ['#082b1e', '#0f172a'],
  ['#03120c', '#050810'],
  ['#0a1f16', '#0f172a'],
  ['#06140e', '#0a1222'],
  ['#051A0E', '#0a1222'],

  // Green RGBA to Blue RGBA
  ['rgba(34,197,94,', 'rgba(59,130,246,'],

  // Green gradient backgrounds
  ['linear-gradient(135deg,#16A34A,#22C55E)', 'linear-gradient(135deg,#2563EB,#3B82F6)'],
  ['linear-gradient(90deg,#22C55E,#16a34a)', 'linear-gradient(90deg,#3B82F6,#2563eb)'],
  ['linear-gradient(135deg, #16A34A, #22C55E)', 'linear-gradient(135deg, #2563EB, #3B82F6)'],
  ['linear-gradient(135deg,#22C55E,#16a34a)', 'linear-gradient(135deg,#3B82F6,#2563eb)'],
  ['linear-gradient(135deg, #22C55E, #16a34a)', 'linear-gradient(135deg, #3B82F6, #2563eb)'],
  ['linear-gradient(135deg,#15803d,#16a34a)', 'linear-gradient(135deg,#1d4ed8,#2563eb)'],
  ['linear-gradient(135deg,#15803d,#16a34a,#22c55e)', 'linear-gradient(135deg,#1d4ed8,#2563eb,#3B82F6)'],

  // Card backgrounds with rgba
  ['linear-gradient(145deg,rgba(10,26,18,0.9),rgba(4,16,11,0.95))', 'linear-gradient(145deg,rgba(15,23,42,0.9),rgba(10,18,34,0.95))'],
  ['linear-gradient(145deg,rgba(6,30,20,0.95),rgba(8,40,28,0.85))', 'linear-gradient(145deg,rgba(15,23,42,0.95),rgba(10,18,34,0.85))'],

  // Drawer/content backgrounds
  ['linear-gradient(160deg,#061a14 0%,#0a2e1e 100%)', 'linear-gradient(160deg,#0a1222 0%,#0f172a 100%)'],
  ['linear-gradient(160deg, #061a14 0%, #082b1e 100%)', 'linear-gradient(160deg, #0a1222 0%, #0f172a 100%)'],
  ['linear-gradient(160deg, #061a14 0%, #0a2e1e 100%)', 'linear-gradient(160deg, #0a1222 0%, #0f172a 100%)'],
  ['linear-gradient(160deg,#06140e,#0a1f16)', 'linear-gradient(160deg,#0a1222,#0f172a)'],
  ['linear-gradient(160deg, #06140e, #0a1f16)', 'linear-gradient(160deg, #0a1222, #0f172a)'],
  ['linear-gradient(160deg, #0a2a1f, #061a14)', 'linear-gradient(160deg, #0f172a, #0a1222)'],

  // Green glow/shadow
  ['box-shadow: 0 8px 24px rgba(34,197,94,0.35)', 'box-shadow: 0 8px 24px rgba(59,130,246,0.35)'],
  ["boxShadow: '0 8px 24px rgba(34,197,94,0.35)'", "boxShadow: '0 8px 24px rgba(59,130,246,0.35)'"],
  ["boxShadow: '0 8px 24px rgba(34,197,94,0.3)'", "boxShadow: '0 8px 24px rgba(59,130,246,0.3)'"],
  ["boxShadow: '0 4px 18px rgba(34,197,94,0.3)'", "boxShadow: '0 4px 18px rgba(59,130,246,0.3)'"],
  ["boxShadow: '0 4px 16px rgba(34,197,94,0.3)'", "boxShadow: '0 4px 16px rgba(59,130,246,0.3)'"],
  ["boxShadow: '0 8px 32px rgba(34,197,94,0.15)'", "boxShadow: '0 8px 32px rgba(59,130,246,0.15)'"],

  // Green-to-emerald gradient text
  ['from-green-300 to-emerald-500', 'from-blue-300 to-blue-600'],

  // Shadow effects
  ['shadow-green-500/5', 'shadow-blue-500/5'],
  ['shadow-green-500/10', 'shadow-blue-500/10'],
  ['shadow-green-500/15', 'shadow-blue-500/15'],
  ['shadow-green-500/20', 'shadow-blue-500/20'],

  // Tailwind text colors in green
  ['text-green-400', 'text-blue-400'],
  ['text-green-500', 'text-blue-500'],
  ['text-green-300', 'text-blue-300'],
  ['text-green-200', 'text-blue-200'],
  ['text-green-600', 'text-blue-600'],
  ['text-green-700', 'text-blue-700'],

  // Tailwind bg colors
  ['bg-green-500/', 'bg-blue-500/'],
  ['bg-green-400', 'bg-blue-400'],
  ['bg-green-500', 'bg-blue-500'],

  // Tailwind hover/focus bg
  ['hover:bg-green-500/', 'hover:bg-blue-500/'],
  ['focus:bg-green-500/', 'focus:bg-blue-500/'],

  // Tailwind border colors
  ['border-green-500/', 'border-blue-500/'],

  // Tailwind ring
  ['focus:ring-green-500/', 'focus:ring-blue-500/'],

  // Text gradient from
  ['from-green-300', 'from-blue-400'],

  // Green accent in inline styles
  ["color: '#22C55E'", "color: '#3B82F6'"],
  ["color: '#16A34A'", "color: '#2563EB'"],

  // Animation keyframe color changes (for progress bars etc)
  ["background: idx < currentIdx ? '#22C55E33' : 'rgba(255,255,255,0.05)'", "background: idx < currentIdx ? '#3B82F633' : 'rgba(255,255,255,0.05)'"],
  
  // Green string references in stage contexts
  ["rgba(34,197,94,0.12)", "rgba(59,130,246,0.12)"],
  ["rgba(34,197,94,0.15)", "rgba(59,130,246,0.15)"],
  ["rgba(34,197,94,0.2)", "rgba(59,130,246,0.2)"],
  ["rgba(34,197,94,0.25)", "rgba(59,130,246,0.25)"],
  ["rgba(34,197,94,0.08)", "rgba(59,130,246,0.08)"],
  ["rgba(34,197,94,0.06)", "rgba(59,130,246,0.06)"],
  ["rgba(34,197,94,0.1)", "rgba(59,130,246,0.1)"],
  ["rgba(34,197,94,0.3)", "rgba(59,130,246,0.3)"],
];

let total = 0;
for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log('SKIP:', file, '- not found');
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  let fileCount = 0;
  for (const [oldStr, newStr] of replacements) {
    const newContent = content.split(oldStr).join(newStr);
    const diffCount = (content.length - newContent.length) / oldStr.length;
    if (diffCount > 0) {
      fileCount += diffCount;
      total += diffCount;
    }
    content = newContent;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`OK  ${file}`);
}
console.log(`\nTotal: ${total} replacement units across ${files.length} files`);
