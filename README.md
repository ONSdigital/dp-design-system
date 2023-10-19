# dp-design-system

[![GitHub release](https://img.shields.io/github/release/ONSdigital/dp-design-system.svg)](https://github.com/ONSdigital/dp-design-system/releases)

`dp-design-system` is the Digital Publishing (DP) build of the [ONS Design System](https://service-manual.ons.gov.uk/design-system).

dp-design-system allows us to use the modules from the ONS design system that are pertinent to the ONS website, in tandem with any patterns or styles that are DP-specific. An example of this would be the cookies banner and its JS interactions, which the ONS website handles differently to the way the design system does.

## Getting started

### Using nvm

If you work across multiple Node.js projects there's a good chance they require different Node.js and npm versions.

To enable this we use [nvm (Node Version Manager)](https://github.com/creationix/nvm) to switch between versions easily.

- Install nvm

```bash
brew install nvm
```

- Run nvm install in the project directory (this will use .nvmrc)

```bash
nvm install
```

### Manually install Node and NPM

1. Install [Node][node] (version denoted in `.nvmrc`) and [NPM][npm].
2. Run `npm install` from the root of the repo you've cloned onto your machine.

### Generate the CSS and JS

- Make sure you are using the correct version of node and npm

```bash
nvm use
```

- Build the CSS and JS, and start the local web server with

```bash
npm run dev
```

- Once built, you can find assets stored on the web server, default location is `localhost:9002/dist/assets/`

### Using via the ONS CDN

When PRs are merged into `main`, compiled assets are made available on the ONS CDN. Versioning is done based on the seven-character commit hash. The following files are made available via the CDN:

- Module JS: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/js/main.js`
- ES5 JS (for older browsers, targets IE11): `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/js/main.es5.js`
- CSS: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/css/main.css`
- Favicons: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/favicons`
- Fonts: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/fonts`

## Dependencies

- [nvm](https://github.com/creationix/nvm)

which installs:

- [Node][node]
- [NPM][npm]

## Configuration

Locally served on port 9002
.sass-lint

## Linter

This app lints using [eslint](https://eslint.org/) with [Airbnb](https://airbnb.io/javascript) base configuration. See `.eslintrc.json` for settings

### Run

```bash
npm run lint
```

### Fix

Some linting issues can be fixed automatically. To use this functionality, pass the file you wish to fix at the end of the command

```bash
npm run lint:fix path/to/js/file/to/fix
```

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

Copyright © 2023, Office for National Statistics (<https://www.ons.gov.uk>)

Released under MIT license, see [LICENSE](LICENSE.md) for details.

[node]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
