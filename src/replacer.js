import getTailwindClass from './lib/converter.js';

async function tranformFile(classes, code, mappings) {
  let classesTransformedCount = 0;
  try {
    const uniqueClassesSet = new Set();
    classes.forEach((regex) => {
      const match = code.match(regex);
      if (match?.length) {
        uniqueClassesSet.add([regex, match[0]]);
      }
    });

    const uniqueClasses = Array.from(uniqueClassesSet);
    uniqueClasses.sort((itemA, itemB) => {
      const a = itemA[1];
      const b = itemB[1];
      if (a.length < b.length) {
        return 1;
      }
      if (a.length > b.length) {
        return -1;
      }
      return a < b ? 1 : 0;
    });

    const transformedClasses = [];
    const notTransformedClasses = [];

    uniqueClasses.forEach(([regex, className]) => {
      const tw = getTailwindClass(className, mappings);
      if (tw) {
        transformedClasses.push(`<tr><td>${className}</td><td>${tw}</td></tr>`);
        code = code.replace(regex, tw);
        classesTransformedCount++;
      } else {
        notTransformedClasses.push(className);
      }
    });
    const atomicClassesCount = uniqueClasses.length;

    return {
      atomicClassesCount,
      code,
      classesTransformedCount,
      transformedClasses,
      notTransformedClasses,
    };
  } catch (err) {
    console.log('err', err);
  }
}

export default tranformFile;
