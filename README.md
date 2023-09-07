# atomizer-tailwindcss-migrator

CLI tool to refactor atomizer codebases to tailwindcss

Usage

for help

```bash
tw-mg -h
```

Lets say we have our atomizer css class at path `src/styles/main.css` and we want to transform all components under `src/components/atoms/`

```bash
tw-mg -s src/styles/main.css -t "src/components/atoms/*.js"
```

For dry run -- it will only generate report

```bash
tw-mg -s src/styles/main.css -t "src/components/atoms/*.js -d"
```

after running these a `transform-report.html` will be generated which will contain all the details.
