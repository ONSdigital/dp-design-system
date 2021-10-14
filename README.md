# dp-design-system

dp-design-system is the Digital Publishing (DP) build of the [ONS Design System](https://ons-design-system.netlify.app).

dp-design-system allows us to use the modules from the ONS design system that are pertinent to the ONS website, in tandem with any patterns or styles that are DP-specific. An example of this would be the cookies banner and its JS interactions, which the ONS website handles differently to the way the design system does.

## Getting started

### How to install and run locally

1. Clone this repo onto your machine.
2. If not already installed then install [Node][node] (`v14+`) and [NPM][npm].
3. Run `npm install` from the root of the repo you've cloned onto your machine.
4. Build the CSS and JS, and start the local web server with `npm run dev`.
5. Once built, you can find assets stored on the web server, default location is `localhost:9001/dist/assets/`

### Using via the ONS CDN

When PRs are merged into `main`, compiled assets are made available on the ONS CDN. Versioning is done based on the seven-character commit hash. The following files are made available via the CDN:

- Module JS: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/js/main.js`
- ES5 JS (for older browsers, targets IE11): `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/js/main.es5.js`
- CSS: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/css/main.css`
- Favicons: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/favicons`
- Fonts: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/fonts`

## Dependencies

1. [Node][node] and [NPM][npm]

## Configuration

Locally served on port 9001
.sass-lint

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

Copyright © 2021, Office for National Statistics (https://www.ons.gov.uk)

Released under MIT license, see [LICENSE](LICENSE.md) for details.

[node]: <https://nodejs.org/en/>
[npm]: <https://www.npmjs.com/>
