import atomizer from '../mappings/atomizer/basic.js';
import atomizerCustom from '../mappings/atomizer/custom.js';

import tailwindPixel from '../mappings/tailwind/pixel.js';
import tailwindRem from '../mappings/tailwind/rem.js';
import tailwindCustom from '../mappings/tailwind/custom.js';

const tailwindBase = [...tailwindRem, ...tailwindPixel];

import {
  addBreakpointPseudoClass,
  areEqualProperties,
  breakAtomizerClass,
  shortenHexColor,
} from '../helpers/index.js';

const specialCases = [
  {
    matcher: /Fw\(([bin])\)/,
    replacement(className) {
      const match = className.match(this.matcher);
      const value = match[1];
      if (value === 'b') {
        return 'font-bold';
      } else if (value === 'i') {
        return 'font-[inherit]';
      } else if (value === 'n') {
        return 'font-normal';
      }
    },
  },
  {
    matcher: /Translate\((.*), ?(.*)\)/,
    replacement(className, mappings) {
      const match = className.match(this.matcher);
      const x = match[1];
      const y = match[2];
      const twClassX = getTailwindClass(`TranslateX(${x})`, mappings);
      const twClassY = getTailwindClass(`TranslateY(${y})`, mappings);
      return twClassX && twClassY ? `${twClassX} ${twClassY}` : className;
    },
  },
  {
    matcher: /Wo(b|w)\((.*)\)/,
    replacement(className) {
      const match = className.match(this.matcher);
      const value = match[2];
      const mapping = {
        ba: 'break-all',
        ka: 'break-keep',
        n: 'break-normal',
        bw: 'break-words',
      };
      const twClass = mapping[value];
      return twClass || className;
    },
  },
  {
    matcher: /Bg\((.*)\)/,
    replacement(className, mappings) {
      const match = className.match(this.matcher);
      const value = match[1];
      const twClass = getTailwindClass(`Bgc(${value})`, mappings);
      return twClass || className;
    },
  },
  {
    matcher: /Bd\([0|n]\)/,
    replacement() {
      return 'border-none';
    },
  },
  {
    matcher: /H\(i\)/,
    replacement() {
      return 'h-[inherit]';
    },
  },
  {
    matcher: /W\(i\)/,
    replacement() {
      return 'w-[inherit]';
    },
  },
  {
    matcher: /Td\((.*)\)/,
    replacement(className) {
      const match = className.match(this.matcher);
      const value = match[1];
      const mapping = {
        lt: 'line-through',
        n: 'no-underline',
        o: 'overline',
        u: 'underline',
      };
      const twClass = mapping[value];
      return twClass || className;
    },
  },
  {
    matcher: /O\((0|n)\)/,
    replacement(className) {
      const match = className.match(this.matcher);
      const value = match[1];
      const mapping = {
        0: 'outline-0',
        n: 'outline-none',
      };
      const twClass = mapping[value];
      return twClass || className;
    },
  },
  {
    matcher: /Bd(starts|ends|ts|bs)\(n\)/,
    replacement(className) {
      const match = className.match(this.matcher);
      const value = match[1];
      const mapping = {
        starts: 'border-l-0',
        ends: 'border-r-0',
        ts: 'border-t-0',
        bs: 'border-b-0',
      };
      const twClass = mapping[value];
      return twClass || className;
    },
  },
];

const transformers = [
  {
    matcher: /([A-Z][a-z]*)\((black|white)\)/,
    transform(className) {
      const match = className.match(this.matcher);
      const value = match[2];
      if (value === 'black') {
        return `${match[1]}(#000)`;
      }
      if (value === 'white') {
        return `${match[1]}(#fff)`;
      }
      return className;
    },
  },
  {
    matcher: /([A-Z][a-zA-Z]*)\((\d+)\/(\d+)\)/,
    transform(className) {
      const match = className.match(this.matcher);
      const numerator = match[2];
      const denominator = match[3];
      const value = parseFloat(((numerator / denominator) * 100).toFixed(6));
      return `${match[1]}(${value}%)`;
    },
  },
  {
    matcher: /(Ai|Jc|As)\((i|e|s)\)/,
    transform(className) {
      const match = className.match(this.matcher);
      const value = match[2];
      const mapping = {
        i: 'inherit',
        e: 'fe',
        s: 'fs',
      };
      return `${match[1]}(${mapping[value]})`;
    },
  },
];

const customMatchers = createMatchers();

function extractValueFromCustomClass(className, regex) {
  const match = className.match(regex);
  return match ? match[2] : null;
}

function substituteValueToProperty(expr, value) {
  return expr.replace('value', value);
}

function createMatchers() {
  const list = Object.entries(atomizerCustom);

  const customMatchers = [];

  list.forEach(([key, value]) => {
    const newKey = key.replace(/([A-Z][\w]*)\((.*)\)/, '^($1)\\((.*)\\)$');
    const regExpr = new RegExp(newKey);
    customMatchers.push({
      className: key,
      regex: regExpr,
      properties: value,
    });
  });

  return customMatchers;
}

function findKeyWithValue(list, value) {
  const item = list.find(([, val]) => {
    return areEqualProperties(value, val);
  });

  return item ? item[0] : null;
}

function findCustomTailwindClass(value) {
  const item = tailwindCustom.find(([_, val]) => {
    return areEqualProperties(value, val);
  });
  return item ? item[0] : null;
}

function findTailwindClass(properties) {
  const twClass = findKeyWithValue(tailwindBase, properties);
  return twClass || null;
}

function getAtomicClassProperties(className) {
  return atomizer[className]?.map((prop) => prop.trim());
}

function findCustomAtomicClass(className) {
  const match = customMatchers.find(({ regex }) => className.match(regex));
  return match || null;
}

function createCustomTailwindClass(className, value, customMapping = {}) {
  if (value.includes('$')) {
    const replaceWith = customMapping[value.slice(1)];
    return className.replace(
      '[value]',
      replaceWith ? replaceWith : value.slice(1)
    );
  } else {
    return className.replace('value', value);
  }
}

const getTailwindClass = (function main() {
  function getTailwindClassInternal(atomicClassName, mappings) {
    let { baseClass, breakpoint, pseudoClass } =
      breakAtomizerClass(atomicClassName);

    const transformer = transformers.find(({ matcher }) =>
      baseClass.match(matcher)
    );

    if (transformer) {
      baseClass = transformer.transform(baseClass);
    }

    const specialCase = specialCases.find(({ matcher }) =>
      baseClass.match(matcher)
    );

    if (specialCase) {
      const twClass = specialCase.replacement(baseClass, mappings);
      return addBreakpointPseudoClass(twClass, breakpoint, pseudoClass);
    }

    const properties = getAtomicClassProperties(baseClass);

    if (properties) {
      const twClass = findTailwindClass(properties);

      if (twClass) {
        return addBreakpointPseudoClass(twClass, breakpoint, pseudoClass);
      }
    }

    const matched = findCustomAtomicClass(baseClass);

    if (matched) {
      const { properties, regex } = matched;
      const value = shortenHexColor(
        extractValueFromCustomClass(baseClass, regex)
      );
      const propertiesWithValues = properties.map((property) =>
        substituteValueToProperty(property, value)
      );
      let twClass = findTailwindClass(propertiesWithValues);
      if (twClass) {
        return addBreakpointPseudoClass(twClass, breakpoint, pseudoClass);
      }
      twClass = findCustomTailwindClass(properties);
      if (twClass) {
        twClass = createCustomTailwindClass(twClass, value, mappings);
      }
      return addBreakpointPseudoClass(twClass, breakpoint, pseudoClass);
    }
    return null;
  }

  const cache = new Map();

  function getTailwindClass(atomicClassName, mappings) {
    if (cache.has(atomicClassName) && cache.get(atomicClassName)) {
      return cache.get(atomicClassName);
    }
    const twClass = getTailwindClassInternal(atomicClassName, mappings);
    cache.set(atomicClassName, twClass);
    return twClass;
  }

  return getTailwindClass;
})();

export default getTailwindClass;
