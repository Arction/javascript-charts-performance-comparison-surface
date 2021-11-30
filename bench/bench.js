requestAnimationFrame(async () => {
  console.log("start benchmark");
  console.log(BENCHMARK_CONFIG);

  const promiseTestDataSets = generateTestDataSets()
  
  const promiseBenchmarkImplementation = new Promise((resolve, reject) => {
    const benchScriptName = `./bench_${BENCHMARK_CONFIG.library}.js`;
    const benchScript = document.createElement("script");
    benchScript.onload = resolve;
    benchScript.src = benchScriptName;
    document.body.append(benchScript);
  });

  const [testDataSets] = await Promise.all([
    promiseTestDataSets,
    promiseBenchmarkImplementation,
  ]);
  const testData1 = testDataSets[0]

  console.log("benchmark ready");
  console.log(BENCHMARK_IMPLEMENTATION);
  console.log("beforeStart");
  await BENCHMARK_IMPLEMENTATION.beforeStart();

  console.log("waiting couple frames ...");
  for (let i = 0; i < 50; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  requestAnimationFrame(async () => {
    console.log("loadChart");
    const tStart = window.performance.now();
    await BENCHMARK_IMPLEMENTATION.loadChart(testData1);
    const tLoadup = window.performance.now() - tStart;
    console.log(`\t${tLoadup.toFixed(1)}ms`);
    let dataSamplesCount = testData1.length

    if (BENCHMARK_CONFIG.mode === "append") {
      // Simulate as if the application had been running for a preset time (config: appendHistorySeconds)
      console.log(`appending history data ${BENCHMARK_CONFIG.appendHistorySeconds}s ...`)
      while (dataSamplesCount < BENCHMARK_CONFIG.appendHistorySeconds * BENCHMARK_CONFIG.appendNewSamplesPerSecond) {
        const addSamplesCount = Math.min(Math.round(BENCHMARK_CONFIG.maxChunkDataPoints / BENCHMARK_CONFIG.appendSampleSize), BENCHMARK_CONFIG.appendHistorySeconds * BENCHMARK_CONFIG.appendNewSamplesPerSecond - dataSamplesCount)
        
        const newSamples = [];
        for (let i = 0; i < addSamplesCount; i += 1) {
          newSamples.push(testData1[(dataSamplesCount + i) % testData1.length]);
        }
        BENCHMARK_IMPLEMENTATION.appendData(newSamples);

        await new Promise(resolve => setTimeout(resolve, 1000))
        dataSamplesCount += addSamplesCount
        console.log(`\t${dataSamplesCount * BENCHMARK_CONFIG.appendSampleSize} / ${BENCHMARK_CONFIG.appendHistorySeconds * BENCHMARK_CONFIG.appendNewSamplesPerSecond * BENCHMARK_CONFIG.appendSampleSize} data points`)
      }
    }

    // Setup FPS monitoring.
    setTimeout(() => {
      console.log(`FPS monitoring start`)
      let fpsMonitoringStart = Date.now();
      let frames = 0;
      let fps;
      const recordFrame = () => {
        frames++;
        const tNow = Date.now();
        fps = 1000 / ((tNow - fpsMonitoringStart) / frames);
        requestAnimationFrame(recordFrame);
      };
      requestAnimationFrame(recordFrame);
      setInterval(() => console.log(`FPS: ${fps.toFixed(1)}`), 5000);
      setInterval(() => {
        console.log(`Reset FPS counter`)
        fpsMonitoringStart = Date.now()
        frames = 0
        fps = 0
      }, 10000)
    }, 2500);

    if (BENCHMARK_CONFIG.mode === "append") {
      let tPrev = window.performance.now();
      let newDataModulus = 0;
      const onEveryFrame = () => {
        const tNow = window.performance.now();
        const tDelta = tNow - tPrev;
        let newSamplesCountFloat =
          BENCHMARK_CONFIG.appendNewSamplesPerSecond * (tDelta / 1000) +
          newDataModulus;
        const newSamplesCount = Math.floor(newSamplesCountFloat);

        if (newSamplesCount > 0) {
          const newSamples = [];
          for (let i = 0; i < newSamplesCount; i += 1) {
            newSamples.push(testData1[(dataSamplesCount + i) % testData1.length]);
          }
          BENCHMARK_IMPLEMENTATION.appendData(newSamples);
          tPrev = tNow;
          dataSamplesCount += newSamplesCount;
          newDataModulus = newSamplesCountFloat % 1;
        }

        requestAnimationFrame(onEveryFrame);
      };
      onEveryFrame();
    }

    if (BENCHMARK_CONFIG.mode === "refresh") {
      let tStart = window.performance.now()
      let iRefresh = 0
      let tPrevDataSet = -1
      const onEveryFrame = () => {
        const tNow = window.performance.now()
        const tAnimation = tNow - tStart
        iRefresh += 1
        const iDataSet = Math.round( tAnimation / (1000 / BENCHMARK_CONFIG.refreshRate) ) % testDataSets.length
        if (tPrevDataSet !== iDataSet) {
          tPrevDataSet = iDataSet
          const dataSet = testDataSets[iDataSet]
          BENCHMARK_IMPLEMENTATION.refreshData(dataSet)
        }
        requestAnimationFrame(onEveryFrame)
      }
      onEveryFrame()
    }
  });
})

const generateTestDataSets = async () => {
  const { createSpectrumDataGenerator, createWaterDropDataGenerator } = xydata;

  if (BENCHMARK_CONFIG.mode === 'static') {
    return [await createSpectrumDataGenerator()
      .setSampleSize(BENCHMARK_CONFIG.columns)
      .setNumberOfSamples(BENCHMARK_CONFIG.rows)
      .generate()
      .toPromise()]
  } else if (BENCHMARK_CONFIG.mode === 'append') {
    const surfaceAppendRowsCount = Math.ceil(BENCHMARK_CONFIG.appendNewSamplesPerSecond * BENCHMARK_CONFIG.appendTimeDomainIntervalSeconds)
    return [await createSpectrumDataGenerator()
      .setSampleSize(BENCHMARK_CONFIG.appendSampleSize)
      .setNumberOfSamples(surfaceAppendRowsCount * 2)
      .generate()
      .toPromise()]
  }
  // Refreshing mode
  
  const interpolateDataSets = await Promise.all([
    createWaterDropDataGenerator()
      .setWaterDrops([
          {
              columnNormalized: 0.22,
              rowNormalized: 0.2,
              amplitude: 54,
          },
      ])
      .setRows(BENCHMARK_CONFIG.rows)
      .setColumns(BENCHMARK_CONFIG.columns)
      .generate()
      .then(data => data.map(row => row.map(y => y * .01)))
    ,
    createWaterDropDataGenerator()
      .setWaterDrops([
          {
              columnNormalized: 0.7,
              rowNormalized: 0.56,
              amplitude: 14,
          },
      ])
      .setRows(BENCHMARK_CONFIG.rows)
      .setColumns(BENCHMARK_CONFIG.columns)
      .generate()
      .then(data => data.map(row => row.map(y => y * .01)))
    ,
    createWaterDropDataGenerator()
      .setWaterDrops([
          {
              columnNormalized: 0.3,
              rowNormalized: 0.7,
              amplitude: 32,
          },
      ])
      .setRows(BENCHMARK_CONFIG.rows)
      .setColumns(BENCHMARK_CONFIG.columns)
      .generate()
      .then(data => data.map(row => row.map(y => y * .01)))
  ])
  
  const animationStepsPerDataSet = BENCHMARK_CONFIG.refreshRate === 60 ? 30 : 5
  console.log('generating', animationStepsPerDataSet, 'refresh animation steps')
  const dataSets = []
  for (let d = 0; d < interpolateDataSets.length; d += 1 ) {
    const dataSetA = interpolateDataSets[d]
    const dataSetB = interpolateDataSets[(d + 1) % interpolateDataSets.length]
    for (let i = 0; i < animationStepsPerDataSet; i += 1) {
      const interpolationAmount = i / (animationStepsPerDataSet - 1)
      if (interpolationAmount === 0) {
        dataSets.push(dataSetA)
      } else if (interpolationAmount === 1) {
        dataSets.push(dataSetB)
      } else {
        const interpolatedDataSet = []
        for (let row = 0; row < BENCHMARK_CONFIG.rows; row += 1 ) {
          interpolatedDataSet.push([])
          for (let column = 0; column < BENCHMARK_CONFIG.columns; column += 1) {
            const a = dataSetA[row][column]
            const b = dataSetB[row][column]
            interpolatedDataSet[row][column] = a + (b - a) * interpolationAmount
          }
        }
        dataSets.push(interpolatedDataSet)
      }
    }
  }
  return dataSets
}
