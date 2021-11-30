
Start benchmark app with

```
cd bench
npm i
npm start
```

Modify active benchmark by directly editing `config.js` file.

### SciChart

SciChart JS requires extra effort compared to other chart libraries - **locally installed licensing Wizard and an active license**. You might have to edit your license key in `bench_scichart.js` file.

### Plotly

Requires `plotly-2.4.2.min.js` file to be placed in `bench/lib` folder.

## Reading benchmark measurements

- `"fail"` | If application doesn't display at all or displays incorrectly or performs with absolutely terribly `true`, otherwise `false`.
- `"initialRenderMs"` | Read from console.
- `"cpu"` | Read CPU usage as % from browser (Chrome) developer tools.
- `"fps"` | Read from console. Should be calculated average from period of at least 10 seconds.
