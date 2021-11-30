
const url = new URL(document.URL)
const target = url.searchParams.get('target')

if (!target) {
    const targets = ['static', 'append', 'refresh']
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.flexDirection = 'column'
    targets.forEach((target) => {
        const link = document.createElement('a')
        link.href = `?target=${target}`
        link.innerHTML = target
        div.append(link)
    })
    document.body.append(div)
} else {
    const {
      lightningChart,
      AxisTickStrategies,
      SolidFill,
      ColorHSV,
      SolidLine,
      emptyFill,
      emptyLine,
      UIOrigins,
      LinearGradientFill,
      ColorHEX,
      UIElementBuilders,
      UILayoutBuilders,
      UIBackgrounds,
      Themes,
      ColorRGBA,
    } = lcjs;

    // ----- REFRESHING -----
    let data

    if (target === 'static') {
        data = {
            chartTitle: 'Static Surface Chart Speed Comparison (2000x2000 Grid)',
            categoryAxisTitle: 'JavaScript Chart Library',
            valueAxisTitle: '',
            values: [
              { name: 'LightningChart JS', values: [
                  { value: 1, label: '152 ms' },
              ] },
              {
                  name: 'Hardware accelerated competitor B', values: [
                      { value: 152 / 1302, label: '1302 ms' }
                  ]
              },
              {
                  name: 'Competitor A', values: [
                      { value: 152 / 14598, label: '14598 ms' },
                  ]
              },
              {
                  name: 'Competitor C', values: [
                      { value: 152 / 30720, label: '30720 ms' },
                  ]
              },
            ]
          }
    }

    if (target === 'refresh') {
        data = {
            chartTitle: 'Surface Chart Real-Time Performance Comparison (2000x2000 Grid, 10 Hz refresh rate)',
            categoryAxisTitle: 'JavaScript Chart Library',
            valueAxisTitle: '',
            values: [
              { name: 'LightningChart JS', values: [
                  // NOTE: FPS measurements over refresh rate (10) are clamped.
                  { value: Math.min(10, 60), label: 'FPS: 10.0' },
                  { value: 100 - 15.5, label: 'CPU: 15.5%' }
              ] },
              {
                  name: 'Hardware accelerated competitor B', values: [
                      { value: Math.min(10, 2.2), label: 'FPS: 2.2' },
                      { value: 100 - 100.0, label: 'CPU: 100.0%' }
                  ]
              },
              {
                  name: 'Competitor A', values: [
                      { value: -1, label: 'FAIL', color: '#ff0000' },
                      { value: -1, label: 'FAIL', color: '#ff0000' }
                  ]
              },
              {
                  name: 'Competitor C', values: [
                      { value: -1, label: 'FAIL', color: '#ff0000' },
                      { value: -1, label: 'FAIL', color: '#ff0000' }
                  ]
              }
            ]
          }
    }

    // ----- APPENDING -----
    if (target === 'append') {
        data = {
            chartTitle: 'Appending Surface Chart Performance Comparison (sample size = 500, stream rate 200 Hz)',
            categoryAxisTitle: 'JavaScript Chart Library',
            valueAxisTitle: '',
            values: [
              { name: 'LightningChart JS', values: [
                  { value: 60.0, label: 'FPS: 60.0' },
                  { value: 100 - 7.5, label: 'CPU: 7.5%' }
              ] },
              {
                  name: 'Hardware accelerated competitor B', values: [
                      { value: 5.8, label: 'FPS: 5.8' },
                      { value: 100 - 100.0, label: 'CPU: 100.0%' }
                  ]
              },
              {
                  name: 'Competitor A', values: [
                      { value: 0.7, label: 'FPS: 0.7' },
                      { value: 100 - 100.0, label: 'CPU: 100.0%' }
                  ]
              },
              {
                  name: 'Competitor C', values: [
                    { value: -1, label: 'FAIL', color: '#ff0000' },
                    { value: -1, label: 'FAIL', color: '#ff0000' }
                  ]
              }
            ]
          }
    }

    const chart = lightningChart()
        .ChartXY({theme: Themes.darkGold})
        .setTitle(data.chartTitle)

    const axisX = chart.getDefaultAxisX()
      .setTitle(data.categoryAxisTitle)
      .setTickStrategy(AxisTickStrategies.Empty)

      const legend = chart.addUIElement(UILayoutBuilders.Column)
        .setPosition({x: 100, y: 60})
        .setOrigin(UIOrigins.RightTop)
        .setMargin(16)
        .setPadding(8)

    const fillStyles = new Array(5).fill(0).map((_, i) => chart.getTheme().seriesFillStyle(i * 3))

    const valuesCount = data.values.reduce((prev, cur) => Math.max(prev, cur.values.length), 0)
    const yValuesMax = new Array(valuesCount).fill(0).map((_, i) => 
        data.values.reduce((prev, cur) => Math.max(prev, cur.values[i].value), 0)
    )

    const axesY = new Array(valuesCount).fill(0).map((_, i) => {
        if (i === 0) return chart.getDefaultAxisY()
            .setTitle(data.valueAxisTitle)
            .setTickStrategy(AxisTickStrategies.Empty)
        else
            return chart.addAxisY()
                .setTickStrategy(AxisTickStrategies.Empty)
                .setStrokeStyle(emptyLine)
    })

    const rectSeriesList = axesY.map((axisY) => chart.addRectangleSeries({yAxis: axisY}))
    let x = 1
    data.values.forEach((category, iCategory) => {
        const { name, values } = category
        const xCategoryStart = x
        const color = fillStyles[iCategory].getColor()
        const entry = legend.addElement(UIElementBuilders.CheckBox)
            .setButtonOnFillStyle(new SolidFill({color}))
            .setOn(true)
            .setText(name)
            .setTextFont((font) => font.setSize(18))
        values.forEach((valueItem, i) => {
            const { value, label } = valueItem
            const xBarStart = x
            x += 1
            const xBarEnd = x
            if (i < values.length - 1) { 
                x += 0.2
            }
            const xBarCenter = (xBarStart + xBarEnd) / 2
            const rectSeries = rectSeriesList[i]
            const valueMin = Math.max(value, yValuesMax[i] * .01)
            if (value !== -1) {
                const bar = rectSeries.add({
                    x1: xBarStart,
                    x2: xBarEnd,
                    y1: 0,
                    y2: valueMin,
                })
                bar.setFillStyle(new LinearGradientFill({
                    stops: [
                        {offset: 0, color: color.setA(60)},
                        {offset: 1, color}
                    ]
                }))
            }
            const uiLabel = chart.addUIElement(UIElementBuilders.TextBox.setBackground(UIBackgrounds.None), { x: axisX, y: axesY[i] })
                .setText(label)
                .setOrigin(UIOrigins.CenterBottom)
                .setMargin({bottom: 6})
                .setPosition({ x: xBarCenter, y: valueMin })
            if (valueItem.color) {
                uiLabel
                    .setTextFillStyle(new SolidFill({color: ColorHEX(valueItem.color)}))
                    .setTextFont((font) => font.setWeight('bold'))
            }
                
        })
        const xCategoryEnd = x
        const xCategoryCenter = (xCategoryStart + xCategoryEnd) / 2
        axisX.addCustomTick(UIElementBuilders.AxisTick)
            .setValue(xCategoryCenter)
            .setTextFormatter(_ => name)
            .setGridStrokeStyle(emptyLine)

        if (iCategory < data.values.length - 1) {
            x += 1
        }
    })
    x += 1
    axisX.setInterval(0, x, false, true)
    axesY.forEach((axisY, i) => axisY.setInterval(0, yValuesMax[i] * 1.1, false, true))

    // ;(async () => {
    //     const libs = [
    //         'lcjs-v.3.3.0',
    //         'plotly',
    //         'scichart'
    //     ]
    //     const dataSets = await Promise.all(libs.map(lib => 
    //         fetch(`benchmarks/${target}_pc_${lib}.json`)
    //             .then(r => r.json())
    //             .then(r => r.filter(item => ! item._TEMPLATE))
    //     ))
    //     console.log(dataSets)
    // })();
}
