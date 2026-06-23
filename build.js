const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const projectsDir = path.join(__dirname, 'content', 'projects');
const outputFile = path.join(__dirname, 'content', 'projects.json');

const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));

const projects = files.map(file => {
  const raw = fs.readFileSync(path.join(projectsDir, file), 'utf8');
  const { data } = matter(raw);
  return { ...data, slug: file.replace('.md', '') };
});

projects.sort((a, b) => (a.order || 99) - (b.order || 99));

fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
console.log(`Built ${projects.length} projects → content/projects.json`);
