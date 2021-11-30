const BENCHMARK_IMPLEMENTATION = (() => {
  let plotData;

  const beforeStart = () => {
    return new Promise((resolve, reject) => {
      const libScript = document.createElement("script");
      libScript.onload = () => resolve();
      libScript.src = "lib/plotly-2.4.2.min.js";
      document.body.append(libScript);
    });
  };

  const loadChart = (initialData) => {
    return new Promise((resolve, reject) => {
      plotData = [
        {
          z: initialData,
          type: "surface",
        },
      ];

      const layout = {
        autosize: true,
        scene: {
          aspectmode: "manual",
          zaxis: {
            range: BENCHMARK_CONFIG.yAxisInterval,
            autorange: false,
            showgrid: BENCHMARK_CONFIG.ticksEnabled,
            zeroline: BENCHMARK_CONFIG.ticksEnabled,
            showline: BENCHMARK_CONFIG.ticksEnabled,
            autotick: false,
            title: !BENCHMARK_CONFIG.ticksEnabled && '',
            ticks: '',
            showspikes: BENCHMARK_CONFIG.ticksEnabled,
            showticklabels: BENCHMARK_CONFIG.ticksEnabled
          },
          yaxis: {
            autorange: true,
            showgrid: BENCHMARK_CONFIG.ticksEnabled,
            zeroline: BENCHMARK_CONFIG.ticksEnabled,
            showline: BENCHMARK_CONFIG.ticksEnabled,
            autotick: true,
            title: !BENCHMARK_CONFIG.ticksEnabled && '',
            ticks: '',
            showspikes: BENCHMARK_CONFIG.ticksEnabled,
            showticklabels: BENCHMARK_CONFIG.ticksEnabled,
          },
          xaxis: {
            autorange: true,
            showgrid: BENCHMARK_CONFIG.ticksEnabled,
            zeroline: BENCHMARK_CONFIG.ticksEnabled,
            showline: BENCHMARK_CONFIG.ticksEnabled,
            autotick: true,
            title: !BENCHMARK_CONFIG.ticksEnabled && '',
            ticks: '',
            showspikes: BENCHMARK_CONFIG.ticksEnabled,
            showticklabels: BENCHMARK_CONFIG.ticksEnabled

          },
        },
      };
      Plotly.newPlot("chart", plotData, layout);

      requestAnimationFrame(resolve);
    });
  };

  const appendData = (data) => {
    for (let i = 0; i < data.length; i += 1) {
      plotData[0]["z"].push(data[i]);
    }
    while (plotData[0]["z"].length > BENCHMARK_CONFIG.appendNewSamplesPerSecond * BENCHMARK_CONFIG.appendTimeDomainIntervalSeconds) {
      plotData[0]["z"].shift();
    }

    Plotly.redraw("chart");
  };

  const refreshData = (data) => {
    plotData[0].z = data
    Plotly.redraw("chart");
  }

  return {
    beforeStart,
    loadChart,
    appendData,
    refreshData,
  };
})();
