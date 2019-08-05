/* eslint-disable */
let soloVideo = {
  // 监听点击事件
  onClickToVideo (id) {
    $(`body #${id}`).click(function (event) {
      // console.warn(event)
      let videoHeight = $(this).css('height')
      if (videoHeight !== '100vh') {
        $(this).css({
          'right': 0,
          'top': 0,
          'width': '100%',
          'height': '100vh',
          'z-index': 0
        })
        $(`body video[id != ${id}]`).css({
          'right': '10px',
          'top': '10px',
          'width': '120px',
          'height': '70px',
          'z-index': 998
        })
        // 设置默认头像的位置
        let otherStatus = $(`body video[id != ${id}]`).attr('openFlag')
        let ownerStatus = $(`body video[id = ${id}]`).attr('openFlag')
        if (otherStatus === '1') {
          $(`.localVideo1`).css({
            'right': '10px',
            'top': '10px',
            'width': '120px',
            'height': '70px',
            'z-index': 998
          })
        }
        if (ownerStatus === '1') {
          $(`.localVideo1`).css({
            'right': '0',
            'top': '0',
            'width': '100%',
            'height': '100vh',
            'z-index': 0
          })
        }
      }
    })
  },
  // 设置默认头像显示 => owner
  setOwnerNormlaAvatar (type) {
    if (type === 'show') {
      let videoHeight = $(`#localVideo1`).css('height')
      let videoWidth = $(`#localVideo1`).css('width')
      let bodyHeight = $('body').height() + 'px'
      if (videoHeight !== bodyHeight) {
        $(`.video-main-component .normal-avatar`).css({
          'right': '10px',
          'top': '10px',
          'display': 'flex',
          'height': videoHeight,
          'width': videoWidth
        })
      } else {
        $(`.video-main-component .normal-avatar`).css({
          'right': 0,
          'top': 0,
          'display': 'flex',
          'height': videoHeight,
          'width': videoWidth,
          'z-index': 0
        })
      }
      return
    }
    $(`.video-main-component .normal-avatar`).css({
      'display': 'none'
    })

  },
  // 设置显示风格
  initVideoStyle ({participant, idx}) {
    $(`body #${participant}video${idx}`).css({
      'position': 'fixed',
      'right': '0',
      'top': '0',
      'width': '100%',
      'height': '100vh',
      'object-fit': 'fill'
    })
    $('body #localVideo1').css({
      'position': 'fixed',
      'right': '10px',
      'top': '10px',
      'width': '120px',
      'height': '70px',
      'object-fit': 'fill',
      'z-index': '999'
    })
  },
  // 初始化默认背景头像
  initNormalAvatar (id) {
    $('.video-main-component').append(`
      <div class="normal-avatar ${id}">
        <img src="../static/img/boy.png" alt="默认头像" />
      </div>
    `)
  }
}

export default soloVideo
