node -e "
const j=require('./base.json');console.log([...new Set(j.groups.map(g=>g.id))].join(','))"
