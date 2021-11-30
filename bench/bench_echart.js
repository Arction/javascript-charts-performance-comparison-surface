const BENCHMARK_IMPLEMENTATION = (() => {
  const beforeStart = () => {
    return new Promise(async (resolve, reject) => {
      const scripts = [
        'https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js',
        'https://cdn.jsdelivr.net/npm/echarts-gl/dist/echarts-gl.min.js'
      ]
      for (const script of scripts) {
        const libScript = document.createElement("script");
        libScript.src = script
        document.body.append(libScript);
        await new Promise(resolve => {
          libScript.onload = resolve
        });
      }
      resolve()
    });
  };

  let myChart;
  let z_data;
  let samplesCount = 0
  let column = 0

  const loadChart = (initialData) => {
    return new Promise((resolve, reject) => {
      myChart = echarts.init(document.getElementById('chart'));

      z_data = []
      for (let column = 0; column < initialData.length; column += 1) {
        for (let row = 0; row < initialData[column].length; row += 1) {
          z_data.push([row, column, initialData[column][row]])
        }
      }
      samplesCount += initialData.length
      column += initialData.length

      option = {
        tooltip: {},
        backgroundColor: '#fff',
        visualMap: {
            show: false,
            dimension: 2,
            min: -1,
            max: 1,
        },
        xAxis3D: {
            type: 'value'
        },
        yAxis3D: {
            type: 'value',
        },
        zAxis3D: {
            type: 'value',
            min: BENCHMARK_CONFIG.yAxisInterval[0],
            max: BENCHMARK_CONFIG.yAxisInterval[1]
        },
        grid3D: {
            viewControl: {
                projection: 'orthographic'
            },
            // hide grid and axes
            show: BENCHMARK_CONFIG.ticksEnabled,
        },
        series: [
            {
                type: 'surface',
                data: [...z_data]
            }
        ]
      };

      myChart.setOption(option);

      requestAnimationFrame(resolve);
    });
  };

  const appendData = (data) => {
    data.forEach(sample => {
      sample.forEach((el, i)=>{
        z_data.push(
             [i, column, el]
         )
     })
     
     samplesCount += 1
     column += 1
    })
    
    while(samplesCount > BENCHMARK_CONFIG.appendNewSamplesPerSecond * BENCHMARK_CONFIG.appendTimeDomainIntervalSeconds) {
      for (let i = 0; i < BENCHMARK_CONFIG.appendSampleSize; i += 1) {
        z_data.shift()
      }
      samplesCount -= 1
     }

    myChart.setOption({
      yAxis3D: {
        max: column,
        min: column - BENCHMARK_CONFIG.appendNewSamplesPerSecond * BENCHMARK_CONFIG.appendTimeDomainIntervalSeconds
      },
      series: [
        {
          data: z_data
        }
      ]
    });
  };

  const refreshData = (data) => {
    z_data = []
    for (let column = 0; column < data.length; column += 1) {
      for (let row = 0; row < data[column].length; row += 1) {
        z_data.push([row, column, data[column][row]])
      }
    }
    myChart.setOption({
      series: [
        {
          data: z_data
        }
      ]
    });
  }

  return {
    beforeStart,
    loadChart,
    appendData,
    refreshData,
  };
})();
