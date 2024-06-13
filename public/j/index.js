class FlightBurstBar {
  constructor(wrapperId, fixedValue, burstCapacity, burstValue, color) {
    this.domWrapper = document.getElementById(wrapperId);

    this.domCanvas = this.newCanvas();
    this.domGlowCanvas = this.newCanvas();
    this.domGlowCanvas.style.filter = 'blur(6px)';
    this.domDiffusionCanvas = this.newCanvas();
    this.domDiffusionCanvas.style.filter = 'blur(72px)';
    this.domDiffusionCanvas.style.opacity = '0.5';
    this.domCanvases = [this.domCanvas, this.domGlowCanvas, this.domDiffusionCanvas];
    this.domWrapper.appendChild(this.domCanvas);
    this.domWrapper.appendChild(this.domGlowCanvas);
    this.domWrapper.appendChild(this.domDiffusionCanvas);

    this.fixedValue = fixedValue;
    this.burstCapacity = burstCapacity;
    this.burstValue = burstValue;
    this.color = color;

    this.canvasCtxs = this.domCanvases.map(canvas => canvas.getContext('2d'));

    const resizeObserver = new ResizeObserver((_e) => {
      const viewportDimensions = this.domWrapper.getBoundingClientRect();
      this.domCanvases.forEach((domCanvas) => {
        domCanvas.width = viewportDimensions.width;
        domCanvas.height = viewportDimensions.height;
        domCanvas.style.width = `${viewportDimensions.width}px`;
        domCanvas.style.height = `${viewportDimensions.height}px`;
      });
      this.canvasCtxs.forEach((ctx) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
      });
      this.drawOuterRect();
      this.eraseBurstCapacityRect();
      this.drawBurstedRect();
    });
    resizeObserver.observe(this.domWrapper);
  }

  newCanvas() {
    const viewportDimensions = this.domWrapper.getBoundingClientRect();
    const domCanvas = document.createElement('canvas');
    domCanvas.style.position = 'absolute';
    domCanvas.style.top = '0';
    domCanvas.style.left = '0';

    return domCanvas;
  }

  drawRoundedRect(left, top, width, height, borderRadius) {
    const rightX = left + width;
    const bottomY = top + height;
    this.canvasCtxs.forEach((ctx) => {
      ctx.beginPath();
      ctx.moveTo(left, top + borderRadius);
      ctx.arc(left + borderRadius, top + borderRadius, borderRadius, -Math.PI, -Math.PI / 2, false);
      ctx.lineTo(rightX - borderRadius, top);
      ctx.arc(rightX - borderRadius, top + borderRadius, borderRadius, -Math.PI / 2, 0, false);
      ctx.lineTo(rightX, bottomY - borderRadius);
      ctx.arc(rightX - borderRadius, bottomY - borderRadius, borderRadius, 0, Math.PI / 2, false);
      ctx.lineTo(left + borderRadius, bottomY);
      ctx.arc(left + borderRadius, bottomY - borderRadius, borderRadius, Math.PI / 2, Math.PI, false);
      ctx.closePath();
      ctx.fill();
    });
  }

  drawOuterRect() {
    this.drawRoundedRect(0, 0, this.domCanvas.width, this.domCanvas.height, 9);
  }

  eraseBurstCapacityRect() {
    const rectHeight = this.domCanvas.height - 6;
    const availableLength = this.domCanvas.width - 6;
    const rectWidth = this.burstCapacity / (this.fixedValue + this.burstCapacity) * availableLength;
    this.canvasCtxs.forEach(ctx => ctx.globalCompositeOperation = 'destination-out');
    this.drawRoundedRect(this.domCanvas.width - 3 - rectWidth, 3, rectWidth, rectHeight, 6);
    this.canvasCtxs.forEach(ctx => ctx.globalCompositeOperation = 'source-over');
  }

  drawBurstedRect() {
    const rectHeight = this.domCanvas.height - 12;
    const availableLength = this.burstCapacity / (this.fixedValue + this.burstCapacity) * (this.domCanvas.width - 6) - 6;
    const rectWidth = this.burstValue / this.burstCapacity * availableLength;
    this.drawRoundedRect(this.domCanvas.width - availableLength - 6, 6, rectWidth, rectHeight, 3);
  }
}

class FlightBurstPie {
  constructor(wrapperId, data) {
    this.domWrapper = document.getElementById(wrapperId);

    this.domCanvas = this.newCanvas();
    this.domGlowCanvas = this.newCanvas();
    this.domGlowCanvas.style.filter = 'blur(6px)';
    this.domDiffusionCanvas = this.newCanvas();
    this.domDiffusionCanvas.style.filter = 'blur(72px)';
    this.domDiffusionCanvas.style.opacity = '0.5';
    this.domWrapper.appendChild(this.domCanvas);
    this.domWrapper.appendChild(this.domGlowCanvas);
    this.domWrapper.appendChild(this.domDiffusionCanvas);

    // [
    //   {
    //     fixedValue:
    //     burstCapacity:
    //     burstValue:
    //     color:
    //   }
    // ]
    this.data = data;

    this.canvasCtxs = [this.domCanvas.getContext('2d'), this.domGlowCanvas.getContext('2d'), this.domDiffusionCanvas.getContext('2d')];
    // this.drawBorderReducedRoundedArcRect(this.domCanvas.width / 2, this.domCanvas.height / 2, 84, 120, 0, 3, 1.5, 9, '#ffff00');
    this.draw();
    // this.eraseBurstCapacityRect();
    // this.drawBurstedRect();
  }

  newCanvas() {
    const viewportDimensions = this.domWrapper.getBoundingClientRect();
    const domCanvas = document.createElement('canvas');
    domCanvas.width = viewportDimensions.width;
    domCanvas.height = viewportDimensions.height;
    domCanvas.style.position = 'absolute';
    domCanvas.style.top = '0';
    domCanvas.style.left = '0';
    domCanvas.style.width = `${viewportDimensions.width}px`;
    domCanvas.style.height = `${viewportDimensions.height}px`;

    return domCanvas;
  }

  drawBorderReducedArcRect(centerX, centerY, nearR, farR, startRadian, pieRadian, innerBorderWidth, color) {
    const eccentricNearR = nearR + innerBorderWidth;
    const eccentricNearRadian = Math.asin(innerBorderWidth / eccentricNearR);
    const eccentricNearStartRadian = startRadian + eccentricNearRadian;
    const eccentricNearEndRadian = startRadian + pieRadian - eccentricNearRadian;
    const nearStartX = centerX + eccentricNearR * Math.sin(eccentricNearStartRadian);
    const nearStartY = centerY - eccentricNearR * Math.cos(eccentricNearStartRadian);
    const nearEndX = centerX + eccentricNearR * Math.sin(eccentricNearEndRadian);
    const nearEndY = centerY - eccentricNearR * Math.cos(eccentricNearEndRadian);

    const eccentricFarR = farR - innerBorderWidth;
    const eccentricFarRadian = Math.asin(innerBorderWidth / eccentricFarR);
    const eccentricFarStartRadian = startRadian + eccentricFarRadian;
    const eccentricFarEndRadian = startRadian + pieRadian - eccentricFarRadian;
    const farStartX = centerX + eccentricFarR * Math.sin(eccentricFarStartRadian);
    const farStartY = centerY - eccentricFarR * Math.cos(eccentricFarStartRadian);
    const farEndX = centerX + eccentricFarR * Math.sin(eccentricFarEndRadian);
    const farEndY = centerY - eccentricFarR * Math.cos(eccentricFarEndRadian);


    this.canvasCtxs.forEach((ctx) => {

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(nearStartX, nearStartY);
      ctx.lineTo(farStartX, farStartY);
      ctx.arc(centerX, centerY, eccentricFarR, eccentricFarStartRadian - Math.PI / 2, eccentricFarEndRadian - Math.PI / 2, false);
      ctx.lineTo(nearEndX, nearEndY);
      ctx.arc(centerX, centerY, eccentricNearR, eccentricNearEndRadian - Math.PI / 2, eccentricNearStartRadian - Math.PI / 2, true);
      ctx.closePath();
      ctx.fill();
    });
  }

  drawBorderReducedRoundedArcRect(centerX, centerY, nearR, farR, startRadian, pieRadian, innerBorderWidth, borderRadius) {

    let nearRoundedCornerCenterR = nearR + innerBorderWidth + borderRadius;
    let nearRoundedCornerCenterEccentricRadian = Math.asin((innerBorderWidth + borderRadius) / nearRoundedCornerCenterR);
    if (pieRadian - 2 * nearRoundedCornerCenterEccentricRadian < 0) {

      nearRoundedCornerCenterEccentricRadian = pieRadian / 2;

      let nearBorderReducedCornerR = innerBorderWidth + nearR;
      let nearBorderReducedCornerEccentricRadian = Math.asin(innerBorderWidth / nearBorderReducedCornerR);

      if (pieRadian - 2 * nearBorderReducedCornerEccentricRadian < 0) {
        borderRadius = 0;
        nearRoundedCornerCenterR = innerBorderWidth / Math.sin(pieRadian / 2);
        if (nearRoundedCornerCenterR > farR - innerBorderWidth) {
          console.log('return');
          return;
        }
      } else {
        borderRadius = (nearR + + innerBorderWidth) * Math.sin(nearRoundedCornerCenterEccentricRadian) - innerBorderWidth;
        nearRoundedCornerCenterR = innerBorderWidth + borderRadius + nearR;
      }
    }
    const nearStartRoundedCornerCenterRadian = startRadian + nearRoundedCornerCenterEccentricRadian;
    const nearStartRoundedCornerCenterX = centerX + nearRoundedCornerCenterR * Math.sin(nearStartRoundedCornerCenterRadian);
    const nearStartRoundedCornerCenterY = centerY - nearRoundedCornerCenterR * Math.cos(nearStartRoundedCornerCenterRadian);
    const nearStartRoundedCornerCenterStartRadian = Math.PI + nearStartRoundedCornerCenterRadian;
    const nearStartRoundedCornerCenterEndRadian = Math.PI * 3 / 2 + startRadian;
    const nearStartX = centerX + (nearR + innerBorderWidth) * Math.sin(nearStartRoundedCornerCenterRadian);
    const nearStartY = centerY - (nearR + innerBorderWidth) * Math.cos(nearStartRoundedCornerCenterRadian);
    if (borderRadius === 0) {
      console.log(nearStartRoundedCornerCenterX, nearStartX, nearStartRoundedCornerCenterY, nearStartY);
    }

    const farRoundedCornerCenterR = farR - innerBorderWidth - borderRadius;
    const farRoundedCornerCenterEccentricRadian = Math.asin((innerBorderWidth + borderRadius) / farRoundedCornerCenterR);
    const farStartRoundedCornerCenterRadian = startRadian + farRoundedCornerCenterEccentricRadian;
    const farStartRoundedCornerCenterX = centerX + farRoundedCornerCenterR * Math.sin(farStartRoundedCornerCenterRadian);
    const farStartRoundedCornerCenterY = centerY - farRoundedCornerCenterR * Math.cos(farStartRoundedCornerCenterRadian);
    const farStartRoundedCornerCenterStartRadian = nearStartRoundedCornerCenterEndRadian;
    const farStartRoundedCornerCenterEndRadian = farStartRoundedCornerCenterRadian;

    const farArcEndRadian = farStartRoundedCornerCenterRadian + pieRadian - 2 * farRoundedCornerCenterEccentricRadian;

    const farEndRoundedCornerCenterX = centerX + farRoundedCornerCenterR * Math.sin(farArcEndRadian);
    const farEndRoundedCornerCenterY = centerY - farRoundedCornerCenterR * Math.cos(farArcEndRadian);
    const farEndRoundedCornerCenterStartRadian = farArcEndRadian;
    const farEndRoundedCornerCenterEndRadian = Math.PI / 2 + startRadian + pieRadian;

    const nearArcEndRadian = nearStartRoundedCornerCenterRadian + pieRadian - 2 * nearRoundedCornerCenterEccentricRadian;

    const nearEndRoundedCornerCenterX = centerX + nearRoundedCornerCenterR * Math.sin(nearArcEndRadian);
    const nearEndRoundedCornerCenterY = centerY - nearRoundedCornerCenterR * Math.cos(nearArcEndRadian);
    const nearEndRoundedCornerCenterStartRadian = farEndRoundedCornerCenterEndRadian;
    const nearEndRoundedCornerCenterEndRadian = Math.PI + nearArcEndRadian;



    this.canvasCtxs.forEach((ctx) => {
      ctx.beginPath();
      ctx.moveTo(nearStartX, nearStartY);
      ctx.arc(nearStartRoundedCornerCenterX, nearStartRoundedCornerCenterY, borderRadius, nearStartRoundedCornerCenterStartRadian - Math.PI / 2, nearStartRoundedCornerCenterEndRadian - Math.PI / 2, false);
      ctx.arc(farStartRoundedCornerCenterX, farStartRoundedCornerCenterY, borderRadius, farStartRoundedCornerCenterStartRadian - Math.PI / 2, farStartRoundedCornerCenterEndRadian - Math.PI / 2, false);
      ctx.arc(centerX, centerY, farR - innerBorderWidth, farStartRoundedCornerCenterEndRadian - Math.PI / 2, farArcEndRadian - Math.PI / 2, false);
      ctx.arc(farEndRoundedCornerCenterX, farEndRoundedCornerCenterY, borderRadius, farEndRoundedCornerCenterStartRadian - Math.PI / 2, farEndRoundedCornerCenterEndRadian - Math.PI / 2, false);
      ctx.arc(nearEndRoundedCornerCenterX, nearEndRoundedCornerCenterY, borderRadius, nearEndRoundedCornerCenterStartRadian - Math.PI / 2, nearEndRoundedCornerCenterEndRadian - Math.PI / 2, false);
      ctx.arc(centerX, centerY, nearR + innerBorderWidth, nearArcEndRadian - Math.PI / 2, nearStartRoundedCornerCenterRadian - Math.PI / 2, true);
      ctx.closePath();
      ctx.fill();
    });
  }

  draw() {
    const chartDimension = this.domCanvas.height;
    const totalCapacity = this.data.reduce((accumulator, platformData) => {
      return accumulator + platformData.fixedValue + platformData.burstCapacity;
    }, 0);
    this.data.reduce((platformStartRadian, platformData) => {
      this.canvasCtxs.forEach(ctx => ctx.fillStyle = platformData.color);
      const platformCapacity = platformData.fixedValue + platformData.burstCapacity;
      const platformCapacityRadian = 2 * Math.PI * platformCapacity / totalCapacity;

      this.drawBorderReducedRoundedArcRect(chartDimension / 2, chartDimension / 2, chartDimension / 2 - 37.5, chartDimension / 2 + 1.5, platformStartRadian, platformCapacityRadian, 1.5, 9);
      if (platformData.burstCapacity > 0) {
        const platformFixedCapacityRadian = platformData.fixedValue / platformCapacity * platformCapacityRadian;
        const platformBurstCapacityRadian = platformCapacityRadian - platformFixedCapacityRadian;

        this.canvasCtxs.forEach(ctx => ctx.globalCompositeOperation = 'destination-out');
        this.drawBorderReducedRoundedArcRect(chartDimension / 2, chartDimension / 2, chartDimension / 2 - 37.5, chartDimension / 2 + 1.5, platformStartRadian + platformFixedCapacityRadian, platformBurstCapacityRadian, 4.5, 6);
        this.canvasCtxs.forEach(ctx => ctx.globalCompositeOperation = 'source-over');

        if (platformData.burstValue > 0) {
          const platformBurstValueRadian = platformData.burstValue / platformData.burstCapacity * platformBurstCapacityRadian;
          this.drawBorderReducedRoundedArcRect(chartDimension / 2, chartDimension / 2, chartDimension / 2 - 37.5, chartDimension / 2 + 1.5, platformStartRadian + platformFixedCapacityRadian, platformBurstValueRadian, 7.5, 3, true);
        }
      }
      return platformStartRadian + platformCapacityRadian;
    }, 0);
  }
}

const expandList = function () {
  requestAnimationFrame(() => {
    const resourceWrapperHeight = document.getElementById('resource-wrapper').getBoundingClientRect().height;
    $('#resource-wrapper').css({
      'grid-row-end': '4',
      'height': `${resourceWrapperHeight}px`
    });
    requestAnimationFrame(() => {
      $('#resource-wrapper').css({
        'height': '100%',
        'border-radius': '24px 24px 135px 24px',
        'transition':
          'height 360ms ease-in,' +
          'border-radius 360ms ease-in'
      });

      $('#earth-scene-wrapper').css({
        'top': 'calc(100% - 315px)',
        'left': 'calc(100% - 315px)',
        'width': '240px',
        'height': '240px'
      });
    });
    $('#resource-wrapper').off('transitionend');
  })
}

const collapseList = function () {
  requestAnimationFrame(() => {
    const resourceWrapperTargetHeight = document.getElementById('resource-dimension-box').getBoundingClientRect().height;
    $('#resource-wrapper').css({
      'height': `${resourceWrapperTargetHeight}px`,
      'border-radius': '24px',
      'transition':
        'height 360ms ease-out,' +
        'border-radius 360ms ease-out'
    });
    $('#earth-scene-wrapper').css({
      'top': '',
      'left': '',
      'width': '',
      'height': ''
    });
    $('#resource-wrapper').one('transitionend', () => {
      $('#resource-wrapper').css({
        'grid-row-end': '',
        'height': '',
        'transition': ''
      });
    });
  })
}

window.onload = async function () {
  const res = await fetch(`/org/${organisation}/raw-data`);
  const data = await res.json();
  $('#main-title').text(`${data.organization.name}'s Estate`);
  $('#capacity-data-wrapper').append(
			`<p class="monthly-overview-data">Dedicated: ${data.capacity.dedicated}</p>` +
			`<p class="monthly-overview-data">Burst (utilized): ${data.capacity.utilizedBurst}</p>` +
			`<p class="monthly-overview-data">Burst (max): ${data.capacity.maxBurst}</p>` +
			`<p class="monthly-overview-data">Total (utilized): ${data.capacity.utilizedTotal}</p>` +
			`<p class="monthly-overview-data">Total (max): ${data.capacity.maxTotal}</p>`
  );
  new FlightBurstBar('capacity-bar', data.capacity.dedicated, data.capacity.maxBurst, data.capacity.utilizedBurst, '#B3D4FF');

  $('#cost-data-wrapper').append(
    `<p class="monthly-overview-data">Dedicated: ${data.cost.dedicated}</p>` +
    `<p class="monthly-overview-data">Burst (utilized): ${data.cost.utilizedBurst}</p>` +
    `<p class="monthly-overview-data">Burst (max): ${data.cost.maxBurst}</p>` +
    `<p class="monthly-overview-data">Total (utilized): ${data.cost.utilizedTotal}</p>` +
    `<p class="monthly-overview-data">Total (max): ${data.cost.maxTotal}</p>`
);
  new FlightBurstBar('cost-bar', data.cost.dedicated, data.cost.maxBurst, data.cost.utilizedBurst, '#B3D4FF');

  const legendColors = ['#0bb4ff', '#e6d800', '#50e991'];
  const platformData = data.resources.reduce((result, resource) => {
    if (!result[resource.platform]) {
      result[resource.platform] = {
        'length': 0,
        'capacity': {
          'dedicated': 0,
          'utilizedBurst': 0,
          'maxBurst': 0,
          'utilizedTotal': 0,
          'maxTotal': 0
        },
        'cost': {
          'dedicated': 0,
          'utilizedBurst': 0,
          'maxBurst': 0,
          'utilizedTotal': 0,
          'maxTotal': 0
        }
      };
    }

    const platform = result[resource.platform];
    platform.length += 1;
    Object.keys(platform.capacity).forEach((key) => {
      platform.capacity[key] += resource.capacity[key];
      platform.cost[key] += resource.cost[key];
    });

    return result;
  },{});

  const platformCapacityData = Object.values(platformData).map((platform, index) => {
    const capacity = platform.capacity;
    return {
      'fixedValue': capacity.dedicated,
      'burstCapacity': capacity.maxBurst,
      'burstValue': capacity.utilizedBurst,
      'color': legendColors[index % 3],
    };
  });
  new FlightBurstPie('platform-capacity-pie-chart', platformCapacityData);

  const platformCostData = Object.values(platformData).map((platform, index) => {
    const capacity = platform.capacity;
    return {
      'fixedValue': capacity.dedicated,
      'burstCapacity': capacity.maxBurst,
      'burstValue': capacity.utilizedBurst,
      'color': legendColors[index % 3],
    };
  });
  new FlightBurstPie('platform-cost-pie-chart', platformCostData);

  Object.entries(platformData).forEach(([platformName, value], index) => {
    $('#platform-legend-scroll-wrapper').append(
      `<div class="platform-legend-entry" flight-platform="${platformName}" style="--flight-legend-color:${legendColors[index % 3]}">
        <div class="platform-legend"></div>
        <h2 class="platform-legend-title">${platformName}</h2>
        <div class="platform-legend-summary-wrapper">
          <p class="platform-legend-summary"><b>Resources: </b>${value.length}</p>
          <p class="platform-legend-summary">
            <b>Costs per Slot</b><br>
            <b>Dedicated: </b>£${Math.round(value.cost.dedicated / value.capacity.dedicated * 100) / 100}/month<br>
            <b>Burst: </b>£${value.capacity.maxBurst === 0 ? 0 : Math.round(value.cost.maxBurst / value.capacity.maxBurst * 100) / 100}/month
          </p>
        </div>
        <div class="platform-legend-data-wrapper">
          <p class="platform-legend-data"></p>
          <p class="platform-legend-data platform-legend-capacity-data"><b>Capacity (slots)</b></p>
          <p class="platform-legend-data platform-legend-cost-data"><b>Costs (GBP/month)</b></p>
          <p class="platform-legend-data"><b>Dedicated</b></p>
          <p class="platform-legend-data platform-legend-capacity-data">${value.capacity.dedicated}</p>
          <p class="platform-legend-data platform-legend-cost-data">${value.cost.dedicated}</p>
          <p class="platform-legend-data"><b>Burst (utilized)</b></p>
          <p class="platform-legend-data platform-legend-capacity-data">${value.cost.utilizedBurst}</p>
          <p class="platform-legend-data platform-legend-cost-data">${value.cost.utilizedBurst}</p>
          <p class="platform-legend-data"><b>Burst (max)</b></p>
          <p class="platform-legend-data platform-legend-capacity-data">${value.cost.maxBurst}</p>
          <p class="platform-legend-data platform-legend-cost-data">${value.cost.maxBurst}</p>
          <div class="platform-legend-data-dividing"></div>
          <p class="platform-legend-data"><b>Total (utilized)</b></p>
          <p class="platform-legend-data platform-legend-capacity-data">${value.cost.utilizedTotal}</p>
          <p class="platform-legend-data platform-legend-cost-data">${value.cost.utilizedTotal}</p>
          <p class="platform-legend-data"><b>Total (max)</b></p>
          <p class="platform-legend-data platform-legend-capacity-data">${value.cost.maxTotal}</p>
          <p class="platform-legend-data platform-legend-cost-data">${value.cost.maxTotal}</p>
        </div>
      </div>`
    );
  });

  document.addEventListener('earthready', () => {
    globalThis.initEarth('earth-scene-wrapper');
    $('#earth-scene-wrapper').on('countryanchormove', (e) => {
      for (const [key, value] of Object.entries(e.detail)) {

        if (key === 'GBR') {
          const anchorTranslateX = value.clientX;
          const anchorTranslateY = value.clientY;
          $('#uk').css({
            'translate': `${anchorTranslateX}px ${anchorTranslateY}px`,
          });
          if (value.isVisible) {
            $('#uk').css({
              'z-index': '999'
            });
          } else {
            $('#uk').css({
              'z-index': '10'
            });
          }
        }

      }
    });

    $('#resource-wrapper').on('mouseenter', () => {
      expandList();
    })

    $('#resource-wrapper').on('mouseleave', () => {
      collapseList();
    })

    $('.platform-legend-entry').on('click', (e) => {
      $('#resource-wrapper .board-title').text(`Resources on ${$(e.currentTarget).attr('flight-platform')}`);
      $('#resource-wrapper .board-content').empty();
      var platformEntries = data.resources.filter(obj => { return obj.platform === $(e.currentTarget).attr('flight-platform') });
      Object.entries(platformEntries).forEach(([platformName, value], index) => {
          $('#resource-wrapper .board-content').append(
              `<p>${value.capacity.maxTotal} of '${value.resource_class}' in ${value.location}</p>`
          );
      });
      $('#resource-wrapper').off('mouseenter');
      $('#resource-wrapper').off('mouseleave');
      requestAnimationFrame(() => {
        $('.platform-legend-entry').css({
          'boxShadow': ''
        });
        $(e.currentTarget).css({
          'boxShadow':
            '6px 6px 12px 0 #00000080,' +
            '0 0 120px 0 #B3D4FF40 inset'
        });
        $('#resource-return').css({
          'visibility': 'visible',
          'opacity': '1',
          'transition': 'opacity 360ms ease-in'
        });
      });
      expandList();
    });

    $('#resource-return').on('click', () => {
      $('#resource-wrapper .board-title').text('Global Resources');
      requestAnimationFrame(() => {
        $('.platform-legend-entry').css({
          'boxShadow': ''
        });
        $('#resource-return').css({
          'visibility': '',
          'opacity': '',
          'transition': ''
        });
      })
      collapseList();
      $('#resource-wrapper').on('mouseenter', () => {
        expandList();
      });
      $('#resource-wrapper').on('mouseleave', () => {
        collapseList();
      });
    });

    $('.earth-anchor').on('click', (e) => {
      $('#resource-wrapper .board-title').text(`Resources in ${$(e.target).attr('flight-location')}`);
      $('#resource-wrapper .board-content').empty();
      var locationEntries = data.resources.filter(obj => { return obj.location === $(e.currentTarget).attr('flight-location') });
      Object.entries(locationEntries).forEach(([platformName, value], index) => {
          $('#resource-wrapper .board-content').append(
              `<p>${value.capacity.maxTotal} of '${value.resource_class}' on ${value.platform}</p>`
          );
      });
      $('#resource-wrapper').off('mouseenter');
      $('#resource-wrapper').off('mouseleave');
      requestAnimationFrame(() => {
        $('.platform-legend-entry').css({
          'boxShadow': ''
        });
        $('#resource-return').css({
          'visibility': 'visible',
          'opacity': '1',
          'transition': 'opacity 360ms ease-in'
        });
      });
      expandList();
    });
  })

}
