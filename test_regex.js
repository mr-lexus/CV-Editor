const marked = require('marked');
marked.setOptions({ gfm: true });
const html = marked.parse('- [x] checked\n- [ ] unchecked');
console.log(html);
