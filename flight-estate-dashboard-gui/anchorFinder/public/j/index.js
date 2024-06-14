window.onload = async function () {

  document.addEventListener('earthready', () => {
    globalThis.initEarth('earth-wrapper');
    $('#earth-wrapper').on('countryanchormove', (e) => {
      const viewportDimensions = document.getElementById('earth-wrapper').getBoundingClientRect();
      for (const [key, value] of Object.entries(e.detail)) {

        if (key === 'GBR' && value.isVisible) {
          const anchorTranslateX = value.clientX - viewportDimensions.left;
          const anchorTranslateY = value.clientY - viewportDimensions.top;
          $('#uk').css({
            'translate': `${anchorTranslateX}px ${anchorTranslateY}px`,
          });
          if (value.isVisible) {
            $('#uk').css({
              'visibility': 'visible',
              'scale': '1',
              'opacity': '1',
              'transition':
                'scale 270ms cubic-bezier(.82,.08,.51,1.65),' +
                'opacity 270ms cubic-bezier(.82,.08,.51,1.65)'
            });
          } else {
            $('#uk').css({
              'visibility': '',
              'scale': '',
              'opacity': '',
              'transition': ''
            });
          }
        }

      }
      console.log(e.detail.GBR.isVisible);
    })
  })
  
}
