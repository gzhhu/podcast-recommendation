const svgChart = (props, data) => {
  const { width, height, margin, id, selector } = props;

  var svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", id)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  return {
    svg,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  };
};

const decimalRounder = n => {
  const rounder = Math.pow(10, n);
  return d => {
    return Math.round(d * rounder) / rounder;
  };
};

const keyConfig = [
  { csv: "1", g: "-", color: "#c7001e", label: "1" },
  { csv: "2", g: "-", color: "#f6a580", label: "2" },
  { csv: "3", g: "n", color: "#cccccc", label: "3" },
  { csv: "4", g: "+", color: "#92c6db", label: "4" },
  { csv: "5", g: "+", color: "#086fad", label: "5" }
];

const ratioOfLikert = (keys, getN, data) => {
  const ratioRounder = decimalRounder(3);
  const cumulRounder = decimalRounder(5);
  return data.map(d => {
    return keys.reduce(
      (acc, k, i, arr) => {
        const { obs, ratio, N } = acc;
        const raw = parseInt(d[k], 10);
        obs[i] = raw;
        ratio[i] = ratioRounder(raw / N);
        return acc;
      },
      { obs: [], ratio: [], N: getN(d), label: d.Question }
    );
  });
};

const addDataToGroup = rawsAndRatios => {
  return group => {
    const { key, series } = group;
    const items = rawsAndRatios.map((d, i) => {
      let x0 = 0,
        x1;
      return series.map(g => {
        const { idx } = g;
        const obs = d.obs[idx],
          ratio = d.ratio[idx];
        x1 = x0 + ratio;
        const r = { obs, ratio, x0, x1 };
        x0 = x1;
        return r;
      });
    });

    const maxes = items.map((d, i) => {
      return d[d.length - 1].x1;
    });

    return { group: key, series, data: items, maxes };
  };
};

const plotHorizontalHtmlLegend = props => {
  const { parentNode, data, className } = props;

  const g = d3
    .select(parentNode)
    .append("div")
    .attr("class", className);

  var item = g
    .selectAll(".legend")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "legend");

  item
    .append("div")
    .attr("class", "rect")
    .style("background-color", d => {
      return d.color;
    });

  item
    .append("div")
    .attr("class", "label")
    .text(d => {
      return d.label;
    });

  // d3.selectAll(".legendbox").attr("transform", "translate(" + movesize + ",0)");
};

const plotYAxis = props => {
  const { svg, className, yScale } = props;
  svg
    .append("g")
    .attr("class", className)
    .call(d3.axisLeft(yScale));
};

const plotZeroLine = props => {
  const { svg, className, x, ys } = props;
  const [y1, y2] = ys;
  svg
    .append("g")
    .attr("class", className)
    .append("line")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", y1)
    .attr("y2", y2);
};

const serieExtent = data => {
  const xMin = d3.min(data, d => {
    return d[0].x0;
  });

  const xMax = d3.max(data, d => {
    return d[d.length - 1].x1;
  });

  return [xMin, xMax];
};

const plotGroup = (data, svg, config) => {
  const {
    getQuestionTransform,
    getQuestionAxis,
    getBarX,
    getBarWidth,
    getBarHeight,
    getBarText,
    getBarColor
  } = config;

  svg
    .append("g")
    .attr("class", "x axis")
    .call(
      getQuestionAxis().tickFormat(d => {
        return d3.format(".0%")(Math.abs(d));
      })
    );

  const g = svg
    .selectAll(".question")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "question")
    .attr("transform", getQuestionTransform);

  var bars = g
    .selectAll("rect")
    .data((d, i) => {
      return d;
    })
    .enter()
    .append("g")
    .attr("class", "subbar");

  bars
    .append("rect")
    .attr("height", getBarHeight)
    .attr("x", getBarX)
    .attr("width", getBarWidth)
    .style("fill", getBarColor);

  bars
    .append("text")
    .attr("x", getBarX)
    .attr("y", () => {
      return getBarHeight() / 2;
    })
    .attr("dy", "0.5em")
    .attr("dx", "0.5em")
    .style("text-anchor", "begin")
    .text(getBarText);
};

const plotRest = data => {
  rows
    .insert("rect", ":first-child")
    .attr("height", bandwidth)
    .attr("x", "1")
    .attr("width", width)
    .attr("fill-opacity", "0.5")
    .style("fill", "#F5F5F5")
    .attr("class", function(d, index) {
      return index % 2 == 0 ? "even" : "uneven";
    });
};

const computeLayout = props => {
  const {
    alignRight,
    xScale,
    yScale,
    maxes,
    data,
    series,
    questionLabels
  } = props;

  const getY = i => {
    return yScale(questionLabels[i]);
  };

  const getBarHeight = () => {
    return yScale.bandwidth();
  };

  const colorScale = d3.scaleOrdinal().range(
    series.map(d => {
      return d.color;
    })
  );

  const getQuestionX = (d, i) => {
    return;
  };
  const getQuestionTransform = (d, i) => {
    const x = alignRight ? xScale(-maxes[i]) : 0;
    const y = getY(i);
    return `translate(${x},${y} )`;
  };

  const getQuestionAxis = (d, i) => {
    const [d0, d1] = xScale.domain();
    const [r0, r1] = xScale.range();

    const domain = alignRight ? [-d1, -d0] : [d0, d1];
    const range = alignRight ? [-r1, -r0] : [r0, r1];

    const scale = d3
      .scaleLinear()
      .domain(domain)
      .rangeRound(range)
      .nice();

    return d3.axisTop(scale).tickValues(
      d3.range(0, d3.max(maxes) + 0.05, 0.1).map(d => {
        return alignRight ? -d : d;
      })
    );
  };

  const getBarX = (d, i) => {
    return xScale(d.x0);
  };

  const getBarWidth = d => {
    return Math.abs(xScale(d.x1) - xScale(d.x0));
  };

  const getBarText = d => {
    return d.n !== 0 && getBarWidth(d) > 0.3 ? d.obs : "";
  };

  const getBarColor = (d, i) => {
    // console.log(d, i, series[i].label);
    return colorScale(series[i].label);
  };

  return {
    getQuestionTransform,
    getQuestionAxis,
    getBarX,
    getBarWidth,
    getBarHeight,
    getBarText,
    getBarColor
  };
};

d3.csv("raw_data.csv").then(function(data) {
  const rawsAndRatios = ratioOfLikert(
    keyConfig.map(d => {
      return d.csv;
    }),
    d => {
      return d.N;
    },
    data
  );

  const groups = keyConfig.reduce(
    (acc, d, i) => {
      const { ks, groups } = acc;
      const { g, csv, color, label } = d;
      let idx = ks.indexOf(g);
      if (idx === -1) {
        idx = ks.length;
        ks.push(g);
      }
      if (!groups[idx]) {
        groups[idx] = { key: g, series: [] };
      }
      groups[idx].series.push({ idx: i, csv, color, label });
      return { ks, groups };
    },
    { ks: [], groups: [] }
  ).groups;

  const groupsWithData = groups.map(addDataToGroup(rawsAndRatios));

  plotHorizontalHtmlLegend({
    parentNode: document.querySelector("#figure"),
    data: keyConfig.map(d => {
      return { label: d.label, color: d.color };
    }),
    center: 50,
    className: "legendbox"
  });

  const { svg, width, height } = svgChart({
    margin: { top: 50, right: 20, bottom: 10, left: 230 },
    width: 800,
    height: 500,
    selector: "#figure",
    id: "d3-plot"
  });

  const questionLabels = rawsAndRatios.map(function(d) {
    return d.label;
  });

  const yScale = d3
    .scaleBand()
    .rangeRound([0, height])
    .padding(0.3)
    .domain(questionLabels);

  const xEnd = d3.sum(groupsWithData, d => {
    return d3.max(d.maxes);
  });

  const leftPadding = 32;
  const neutralPadding = 96;
  const xScale = d3
    .scaleLinear()
    .domain([0, xEnd])
    .rangeRound([0, width - neutralPadding - leftPadding])
    .nice();

  plotYAxis({ svg, className: "y axis", yScale });

  const svgGroup = svg
    .append("g")
    .attr("class", "plot")
    .attr("transform", "translate(" + leftPadding + "," + 0 + ")");

  const config = {
    xScale,
    yScale,
    questionLabels
  };

  let groupData, xOffset, xMax;
  // -- group
  groupData = groupsWithData[0];
  xOffset = xScale(d3.max(groupsWithData[0].maxes));
  plotGroup(
    groupData.data,
    svgGroup
      .append("g")
      .attr("class", "negative")
      .attr("transform", "translate(" + xOffset + "," + 0 + ")"),
    computeLayout(
      Object.assign({}, config, groupData, {
        alignRight: true
      })
    )
  );

  // -- group
  groupData = groupsWithData[2];
  xOffset = xScale(d3.max(groupsWithData[0].maxes));
  plotGroup(
    groupData.data,
    svgGroup
      .append("g")
      .attr("class", "positive")
      .attr("transform", "translate(" + xOffset + "," + 0 + ")"),
    computeLayout(Object.assign({}, config, groupData))
  );

  plotZeroLine({
    svg: svgGroup,
    className: "zero axis",
    x: xOffset,
    ys: [0, height]
  });
  // -- group
  groupData = groupsWithData[1];
  xOffset =
    xScale(d3.max(groupsWithData[0].maxes)) +
    neutralPadding +
    xScale(d3.max(groupsWithData[2].maxes));
  plotGroup(
    groupData.data,
    svgGroup
      .append("g")
      .attr("class", "neutral")
      .attr("transform", "translate(" + xOffset + "," + 0 + ")"),
    computeLayout(Object.assign({}, config, groupData))
  );
});