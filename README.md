# candoia-frontend

### Development Environment Setup

1. [Download and install iojs](https://iojs.org/)
2. Clone the frontend repository (`git clone ...`)
3. `cd` to the cloned repository
4. execute `npm install`

### Tasks:

#### Start
To start Candoia, execute `npm start`. By default, it will be started in `development` mode.

alternatively:

- `npm start -- --env=development` to explicitly start in `development` mode
- `npm start -- --env=production` to explicitly start in `production` mode
- `npm start -- --env=test` to explicitly start in `test` mode

#### Releases
To create a release for all platforms and architectures, execute `npm run release`.

alternatively:

- `npm run release -- --platform=<platform> --arch=<arch>`
- <platform> is either empty or one of: "all", "linux", "win32", or "darwin".
- <arch> is either empty, or one of: "all", "ia32", or "x64".

Releases will land in `/releases/version/Candoia-<platform>-<arch>`. Behind the scenes, we are using [electron-packager](https://www.npmjs.com/package/electron-packager) to package for Windows, Linux, and Mac.

#### Test
To run tests, execute `npm test`.

We use [jasmine 2.2](http://jasmine.github.io/2.2/introduction.html) for tests. All `.spec.js` files will automatically be collected.

#### Build Only
To only build, execute `npm run build`

### Project Layout

- `app` - Candoia goes here
- `config` - place for environment specific stuff
- `build` - in this folder lands built, runnable application
- `releases` - ready for distribution installers will land here
- `resources` - resources for particular operating system
- `tasks` - build and development environment scripts
