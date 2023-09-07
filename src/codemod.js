import getTailwindClass from "./lib/converter.js";

export default function plugin({ types: t }) {
  function isClassNameIdentifier(path) {
    return path?.node?.name?.name === "className";
  }
  function convertAtomizerClassNamesToTailwind(className) {
    return className
      .split(" ")
      .map((val) => {
        const twClass = getTailwindClass(val);
        return twClass || val;
      })
      .join(" ");
  }

  function replaceClassName(path) {
    path.traverse({
      StringLiteral(identifierPath) {
        const { node } = identifierPath;
        const { value } = node;
        identifierPath.replaceWith(
          t.stringLiteral(convertAtomizerClassNamesToTailwind(value))
        );
        identifierPath.skip();
      },
      TemplateElement(templatePath) {
        const { node } = templatePath;
        const value = node.value.cooked;
        if (value) {
          templatePath.replaceWith(
            t.templateElement({
              raw: convertAtomizerClassNamesToTailwind(value),
            })
          );
        }
        templatePath.skip();
      },
    });
  }

  return {
    visitor: {
      JSXAttribute(path) {
        if (!isClassNameIdentifier(path)) {
          return;
        }
        replaceClassName(path);
      },
    },
  };
}
