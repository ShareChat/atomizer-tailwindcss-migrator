# Atomizer Tailwindcss Migrator

CLI tool to refactor [atomizer](https://acss.io/) codebases to [tailwindcss](https://tailwindcss.com/)

![Screen Recording 2023-12-12 at 3 15 36 PM](https://github.com/ShareChat/atomizer-tailwindcss-migrator/assets/141409866/c1af2ba5-5734-48e5-b6a4-780504be10cd)

## Features

- Transform atomizer classes to tailwindcss classes
- Works with jsx, tsx, svelte, vue, html files
- Generate report of all the changes
- Dry run mode
- Customizable mappings - you can pass json file with mappings from atomizer classes to tailwindcss classes
- Customizable plugins - you can pass js file with plugins which will be loaded by the migrator

## Installation

npm

```bash
npm install @mohalla-tech/atomizer-tailwindcss-migrator -g
```

yarn

```bash
yarn add @mohalla-tech/atomizer-tailwindcss-migrator -g
```

pnpm

```bash
pnpm add @mohalla-tech/atomizer-tailwindcss-migrator -g
```

Now you can run the migrator using `tw-mg` command

## Options

### -h, --help

Show help

### -s, --style - required

Path to atomizer generated css file, it contains all the generated classes

### -t, --target <glob-pattern> - required

Target files to transform, supports glob pattern

### -d, --dry-run

Dry run mode, will only generate report and open it

### -no, --no-open

Do not open report in browser

### -m, --mappings

Path to json file with mappings from atomizer classes to tailwindcss classes, for example we may want to replace `$fzTitle` variable with `title` in tailwindcss variable so any class like `Fz($fzTitle)` will be replaced with `text-title`

Ex:

```json
{
  "$fzTitle": "title"
}
```

### -p, --plugins

Path to js file with plugins which will be loaded by the migrator this can be helpful if you want to do some custom transformation
for help on writing plugins see [Writing Plugins](#writing-plugins)

## Usage

if we want to run without any mappings or plugins

```bash
tw-mg -s ./path/to/atomizer.css -t ./path/to/target/files
```

with mappings

```bash
tw-mg -s ./path/to/atomizer.css -t ./path/to/target/files -m ./path/to/mappings.json
```

with plugins

```bash
tw-mg -s ./path/to/atomizer.css -t ./path/to/target/files -p ./path/to/plugins.js
```

with mappings and plugins

```bash
tw-mg -s ./path/to/atomizer.css -t ./path/to/target/files -m ./path/to/mappings.json -p ./path/to/plugins.js
```

dry run mode - it will only generate report and open it

```bash
tw-mg -s ./path/to/atomizer.css -t ./path/to/target/files -d
```

## Example

we have a file `/src/styles/main.css` with atomizer classes

```css
.Fz($fzTitle) {
  font-size: $fzTitle;
}

.D\(f\) {
  display: flex;
}

.Bgc\(c\) {
  background-color: $c;
}
```

we want to transform all the atomizer classes to tailwindcss classes within `/src/components` directory

```bash
tw-mg -s ./src/styles/main.css -t ./src/components/**/*.jsx -d
```

this will generate a report and open it in browser, you can then review the changes and apply them by removing `-d` flag

```bash
tw-mg -s ./src/styles/main.css -t ./src/components/**/*.jsx
```

## Writing Plugins

Plugin file must export an array of plugins which will be loaded by the migrator, plugins must be an object with `name` and `plugin` keys where `name` is the name of the plugin and `plugin` is a function which will be called for each atomizer class with `className` and `mappings` as arguments, `className` is the atomizer class and `mappings` is the mappings object passed to the migrator

```js
module.exports = [
  {
    name: 'plugin-name',
    plugin: function (className, mappings) {
      // do something with atomizer
      // return null in case you want to skip this plugin
      return newClassName;
    },
  },
];
```
