/* US-English presentation adapter for the existing Korean solid-geometry
 * generators. All figures, random values and source answers still come from
 * KoMath.generate(..., customSpecs); this file only supplies English wording. */
(() => {
  const source = KoMath;
  const definitions = [
    {
      id:'faces-edges-vertices',
      title:'Faces, Edges and Vertices Worksheets',
      level:'Grades 2–5 · solid figure attributes',
      standard:'CCSS 2.G.A.1 and later spatial reasoning review',
      instruction:'Count or identify the faces, edges, vertices, and other defining parts of each solid figure.',
      skills:[
        ['cuboid','5-2-5','Rectangular prism: faces, edges or vertices'],
        ['cuboid-edges','5-2-5','Edges of a rectangular prism'],
        ['prism','6-1-2','Prism attributes'],
        ['pyramid','6-1-2','Pyramid attributes'],
        ['cylinder','6-2-6','Circular bases of a cylinder'],
        ['cone','6-2-6','Vertex of a cone'],
        ['sphere','6-2-6','Radius of a sphere']
      ]
    },
    {
      id:'nets-of-3d-shapes',
      title:'Nets of 3D Shapes Worksheets',
      level:'Grades 5–6 · nets and solid figures',
      standard:'Related to CCSS 6.G.A.4; cylinder nets are an extension',
      instruction:'Study each net and identify the faces or the three-dimensional shape it makes.',
      skills:[
        ['cube-net','5-2-5','Net of a cube'],
        ['prism-net','6-1-2','Net of a triangular prism'],
        ['cylinder-net','6-2-6','Net of a cylinder']
      ]
    },
    {
      id:'counting-cubes',
      title:'Counting Cubes Worksheets',
      level:'Grade 5 · unit cubes and volume',
      standard:'CCSS 5.MD.C.4–5',
      instruction:'Use the top-view height map to count every unit cube in the structure.',
      skills:[['cube-count','6-2-2','Count all unit cubes']]
    },
    {
      id:'front-top-side-views-cubes',
      title:'Front Top and Side Views of Cubes Worksheets',
      level:'Grades 4–6 · spatial visualization',
      standard:'Spatial visualization practice; no direct Common Core claim',
      instruction:'Read the top-view height map, then find how many unit squares appear in the front or right-side view.',
      skills:[['cube-view','6-2-2','Front and right-side views from a top-view map']]
    },
    {
      id:'missing-hidden-cubes',
      title:'Missing and Hidden Cubes Worksheets',
      level:'Grade 5 · unit-cube structures',
      standard:'Related to CCSS 5.MD.C.4–5',
      instruction:'Use the top-view height map to reason about a removed stack and the cubes that remain.',
      skills:[['cube-missing','6-2-2','Missing stack and hidden cubes']]
    }
  ];

  const names = Object.fromEntries(definitions.flatMap(def => def.skills.map(([skill,,name]) => [skill,name])));
  let selected = 'all';
  let lastGenerated = [];
  const faceWords = {면:'faces',꼭짓점:'vertices',모서리:'edges'};
  const polygonNames = {삼:'triangular',사:'quadrilateral',오:'pentagonal',육:'hexagonal'};

  function solidAttribute(q, skill) {
    const korean = q.prompt;
    const attributeKey = Object.keys(faceWords).find(word => korean.includes(word));
    const attribute = faceWords[attributeKey] || 'parts';
    if (skill === 'cuboid' || skill === 'cuboid-edges') {
      return {
        prompt:`How many ${skill === 'cuboid-edges' ? 'edges' : attribute} does a rectangular prism have?`,
        reason:'A rectangular prism has 6 faces, 8 vertices, and 12 edges.'
      };
    }
    const polygonKey = Object.keys(polygonNames).find(word => korean.startsWith(word));
    const shape = `${polygonNames[polygonKey] || 'polygonal'} ${skill === 'prism' ? 'prism' : 'pyramid'}`;
    return {
      prompt:`How many ${attribute} does a ${shape} have?`,
      reason:skill === 'prism'
        ? `Separate the two congruent bases from the lateral faces, then count the ${attribute}.`
        : `Separate the base from the top vertex, then count the ${attribute}.`
    };
  }

  function translate(q, skill, unit) {
    let prompt = q.prompt;
    let answer = q.answer;
    let reason = q.reason;
    const heights = [...q.visual.matchAll(/<span>(\d+)<\/span>/g)].map(match => Number(match[1]));

    if (['cuboid','cuboid-edges','prism','pyramid'].includes(skill)) {
      ({prompt,reason} = solidAttribute(q, skill));
    } else if (skill === 'cylinder') {
      prompt = 'How many congruent circular bases does a cylinder have?';
      reason = 'A cylinder has 2 congruent circular bases.';
    } else if (skill === 'cone') {
      prompt = 'How many vertices does a cone have?';
      reason = 'A cone has 1 vertex at its point.';
    } else if (skill === 'sphere') {
      prompt = 'What is the name of a segment from the center of a sphere to its surface?';
      answer = 'radius';
      reason = 'Every radius runs from the center to the surface and has the same length.';
    } else if (skill === 'cube-net') {
      prompt = 'How many faces in this cube net are not shaded?';
      reason = 'A cube has 6 square faces. One is shaded, so 5 are not shaded.';
    } else if (skill === 'prism-net') {
      prompt = 'What three-dimensional figure is formed when this net is folded?';
      answer = 'triangular prism';
      reason = 'The net has 2 triangular bases and 3 rectangular lateral faces.';
    } else if (skill === 'cylinder-net') {
      prompt = 'When the lateral surface of a cylinder is cut straight along its height and opened flat, what shape is it?';
      answer = 'rectangle';
      reason = 'Opening the curved lateral surface along the height makes a rectangle.';
    } else if (skill === 'cube-count') {
      prompt = 'How many unit cubes are in the structure?';
      const total = heights.reduce((sum, value) => sum + value, 0);
      reason = `${heights.join(' + ')} = ${total} unit cubes.`;
    } else if (skill === 'cube-view') {
      const front = q.prompt.startsWith('앞');
      prompt = `How many unit squares are visible in the ${front ? 'front' : 'right-side'} view?`;
      reason = `For the ${front ? 'front' : 'right-side'} view, use the tallest stack in each overlapping row. The total is ${answer} unit squares.`;
    } else if (skill === 'cube-missing') {
      const total = heights.reduce((sum, value) => sum + value, 0);
      prompt = 'If the entire stack in the upper-left position is removed, how many unit cubes remain?';
      reason = `The structure has ${heights.join(' + ')} = ${total} cubes. Remove ${heights[0]} cubes: ${total} − ${heights[0]} = ${answer}.`;
    }

    const visual = q.visual
      .replaceAll('aria-label="문제 그림"','aria-label="Problem diagram"')
      .replaceAll('위에서 본 모양 · 숫자는 그 자리의 개수 · 아래쪽이 앞','Top view · each number is the stack height · the bottom edge is the front');
    return {
      ...q,
      prompt,
      answer:String(answer),
      reason,
      visual,
      task:'<span class="kblank" aria-label="Answer space"></span>',
      sourceSkill:skill,
      sourceUnit:unit,
      sourceAnswer:String(q.answer)
    };
  }

  for (const def of definitions) {
    Worksheets.types.push({
      id:def.id,
      title:def.title,
      family:'Practice extensions',
      group:'Spatial reasoning',
      example:'3 × 4',
      instruction:`${def.level}. ${def.instruction}`,
      bankId:`spatial:${def.id}`
    });
  }

  KoMath = {...source, generate(id, profile, seed, perSection) {
    if (!id.startsWith('spatial:')) return source.generate(id, profile, seed, perSection);
    const def = definitions.find(item => `spatial:${item.id}` === id);
    if (!def) throw new Error(`Unknown spatial worksheet ${id}`);
    const available = selected === 'all' ? def.skills : def.skills.filter(([skill]) => skill === selected);
    const count = Math.max(6, available.length);
    lastGenerated = [];
    return Array.from({length:count}, (_, index) => {
      const [skill,unit,name] = available[index % available.length];
      const sourceQuestion = source.generate(unit, 0, (seed + index * 7891) >>> 0, 1, [{skill,mode:0}])[0].questions[0];
      const question = translate(sourceQuestion, skill, unit);
      lastGenerated.push({skill,unit,sourceAnswer:String(sourceQuestion.answer),answer:question.answer});
      return {title:name,skill,questions:[question]};
    });
  }};

  globalThis.SpatialPractice = {
    definitions,
    names,
    setSkill(skill){ selected = skill; },
    getSelected(){ return selected; },
    lastGenerated(){ return lastGenerated.map(item => ({...item})); }
  };
})();
