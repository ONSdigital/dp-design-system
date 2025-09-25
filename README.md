# dp-design-system

[![GitHub release](https://img.shields.io/github/release/ONSdigital/dp-design-system.svg)](https://github.com/ONSdigital/dp-design-system/releases)

`dp-design-system` is the Digital Publishing (DP) build of the [ONS Design System](https://service-manual.ons.gov.uk/design-system).

dp-design-system allows us to use the modules from the ONS design system that are pertinent to the ONS website, in tandem with any patterns or styles that are DP-specific. An example of this would be the cookies banner and its JS interactions, which the ONS website handles differently to the way the design system does.

## Getting started

### Install dependencies

If you work across multiple Node.js projects there's a good chance they require different Node.js and npm versions.

It is recommended that you use [nvm (Node Version Manager)](https://github.com/creationix/nvm) to switch between versions easily:

1. Install [nvm](https://github.com/nvm-sh/nvm):

   ```shell
   brew install nvm
   ```

   :warning: Make sure to follow the instructions provided at the end of the install to configure up your shell profile.

2. Install the node version specified in [`.nvmrc`](./.nvmrc) through nvm:

   ```shell
   nvm install
   ```

#### Tooling

For Javascript auditing we use `auditjs` which requires you to [setup an OSS Index account](https://github.com/ONSdigital/dp/blob/main/guides/MAC_SETUP.md#oss-index-account-and-configuration)

### Generate the CSS and JS

- Build the CSS and JS, and start the local web server with

  ```shell
  make debug
  ```

- Once built, you can find assets stored on the web server, default location is [localhost:9002/dist/assets/](http://localhost:9002/dist/assets/)

### Using via the ONS CDN

When PRs are merged into `main`, compiled assets are made available on the ONS CDN. Versioning is done based on the seven-character commit hash. The following files are made available via the CDN:

- Module JS: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/js/main.js`
- ES5 JS (for older browsers, targets IE11): `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/js/main.es5.js`
- CSS: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/css/main.css`
- Favicons: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/favicons`
- Fonts: `https://cdn.ons.gov.uk/dp-design-system/{COMMIT_HASH}/fonts`

## Configuration

| Environment variable | Default | Description                                                      |
|----------------------|---------|------------------------------------------------------------------|
| PORT                 | 9002    | The port used when running the file server for local development |

## Linter

This app lints using [eslint](https://eslint.org/) with [Airbnb](https://airbnb.io/javascript) base configuration. See `.eslintrc.json` for settings.

### Run

```bash
make lint
```

### Fix

Some linting issues can be fixed automatically. To use this functionality, pass the file you wish to fix at the end of the command:

```bash
nvm exec -- npm run lint:fix path/to/js/file/to/fix
```

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

Copyright © Crown Copyright ([Office for National Statistics](https://www.ons.gov.uk>))

Released under MIT license, see [LICENSE](LICENSE.md) for details.
