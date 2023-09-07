import atomizerPseudoClasses from '../mappings/atomizer/pseudo.js';
import tailwindPseudoClasses from '../mappings/tailwind/pseudo.js';

function addBreakpoint(className, breakpoint) {
  if (!className) {
    return className;
  }
  return `${breakpoint ? `${breakpoint}:` : ''}${className}`;
}

function addPseudoClass(className, pseudoClass) {
  if (!className || !pseudoClass) {
    return className;
  }
  const twPseudoClass =
    tailwindPseudoClasses[atomizerPseudoClasses[pseudoClass]];
  return `${twPseudoClass ? `${twPseudoClass}:` : ''}${className}`;
}

function breakClassAndPseudoClass(className) {
  const hasPseudoClass = className.includes(':');
  if (hasPseudoClass) {
    return className.split(':');
  }
  return [className, ''];
}

function breakClassAndBreakpoint(className) {
  const hasBreakpoint = className.includes('--');
  if (hasBreakpoint) {
    return className.split('--');
  }
  return [className, ''];
}

/**
 * @typedef {object} AtomizerClass
 * @property {string} baseClass
 * @property {string} breakpoint
 * @property {string} pseudoClass
 */

/**
 * Breaks atomizer class name into baseClass, breakpoint and pseudoClass
 *
 * @param {string} className  atomizer class name
 * @return {AtomizerClass} {baseClass: string, breakpoint: string, pseudoClass: string}
 *
 * @example
 * breakAtomizerClass("Bgc(#fff)--sm:h") // {baseClass: "Bgc(#fff)", breakpoint: "sm", pseudoClass: "h"}
 * breakAtomizerClass("Bgc(#fff):h") // {baseClass: "Bgc(#fff)", breakpoint: "", pseudoClass: "h"}
 * breakAtomizerClass("Bgc(#fff)") // {baseClass: "Bgc(#fff)", breakpoint: "", pseudoClass: ""}
 * breakAtomizerClass("Bgc(#fff)--sm") // {baseClass: "Bgc(#fff)", breakpoint: "sm", pseudoClass: ""}
 */
function breakAtomizerClass(className) {
  const [tempClass, breakpoint] = breakClassAndBreakpoint(className);
  const [baseClass, pseudoClass] = breakClassAndPseudoClass(tempClass);
  return {
    baseClass,
    breakpoint,
    pseudoClass,
  };
}

function addBreakpointPseudoClass(className, breakpoint, pseudoClass) {
  if (!className) {
    return className;
  }
  const classWithBreakpoint = addBreakpoint(className, breakpoint);
  return addPseudoClass(classWithBreakpoint, pseudoClass);
}

function isValidHexColor(value) {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);
}

function shortenHexColor(value) {
  if (!isValidHexColor(value)) {
    return value;
  }
  if (value.length === 7) {
    const splitted = value.split('').slice(1);
    const check = [0, 2, 4];
    const canShorten = check.every(
      (idx) => splitted[idx] === splitted[idx + 1]
    );
    if (canShorten) {
      return '#' + splitted[0] + splitted[2] + splitted[4];
    }
  }
  return value;
}

function areEqualProperties(propertiesA, propertiesB) {
  if (propertiesA.length !== propertiesB.length) {
    return false;
  }
  return propertiesA.every((propertyA) =>
    propertiesB.some((propertyB) => areEqualProperty(propertyA, propertyB))
  );
}

function areEqualProperty(propertyA, propertyB) {
  const normalizedA = shortenHexColor(propertyA.replace('0px', '0'));
  const normalizedB = shortenHexColor(propertyB.replace('0px', '0'));
  return normalizedA === normalizedB;
}

function extractClasses(source) {
  const regex =
    /.[A-Z][a-zA-Z]*\\\(\\?\d*\\?\.?\/?[\d\w$#%\\\-,]+\\?\)\\?!?-{0,2}\w*\\?:?(h|a)?/g;
  const match = source.matchAll(regex);
  const classes = [];
  for (const m of match) {
    classes.push(new RegExp(m[0].trim().slice(1).replace(',$', ''), 'g'));
  }
  return classes;
}

export {
  addBreakpointPseudoClass,
  shortenHexColor,
  breakAtomizerClass,
  areEqualProperties,
  areEqualProperty,
  extractClasses,
};
