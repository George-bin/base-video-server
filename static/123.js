/* global $, JitsiMeetJS */
import soloVideo from './video-help'
const options = {
  hosts: {
    domain: 'im.cf.nm.cp',
    focus: 'focus.im.cf.nm.cp',
    muc: 'conference.im.cf.nm.cp',
    bridge: 'jitsi-videobridge.im.cf.nm.cp'
  },
  bosh: 'wss://192.168.1.222:7443/ws/', // FIXME: use xep-0156 for that
  // bosh: 'ws://im.cf.nm.cp:7070/ws/', // FIXME: use xep-0156 for that
  // The name of client node advertised in XEP-0115 'c' stanza
  clientNode: 'http://192.168.1.222'
}

const confOptions = {
  openBridgeChannel: true
}

let connection = null
let isJoined = false
let room = null

// 本地流
let localTracks = []
// 远端流
const remoteTracks = {}
// 所有轨道，用于挂断后删除DOM元素
let allTracks = ['localAudio0', 'localVideo1']

/**
 * Handles local tracks.
 * @param tracks Array with JitsiTrack objects
 */
export function onLocalTracks (tracks) {
  // console.log(tracks)
  // debugger
  localTracks = tracks
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, audioLevel => console.log(`Audio Level local: ${audioLevel}`))
    // JitsiTrack被静音或取消静音
    localTracks[i].addEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, () => console.log('local track muted'))
    // 提示音已经停止已停止
    localTracks[i].addEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, () => console.log('local track stoped'))
    // 表示轨道的音频输出设备已更改（参数 - deviceId（字符串） - 新的音频输出设备ID）
    localTracks[i].addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, deviceId => console.log(`track audio output device was changed to ${deviceId}`))
    if (localTracks[i].getType() === 'video') {
      $('body').append(`<video autoplay='1' id='localVideo${i}' />`)
      localTracks[i].attach($(`#localVideo${i}`)[0])
    } else {
      $('body').append(`<audio autoplay='1' muted='true' id='localAudio${i}' />`)
      localTracks[i].attach($(`#localAudio${i}`)[0])
    }
    if (isJoined) {
      room.addTrack(localTracks[i])
    }
  }
}

// 收到远程流的处理函数
function onRemoteTrack (track) {
  console.warn('测试啦')
  // 判断是否为本地轨道
  if (track.isLocal()) {
    return
  }
  // console.warn(track)
  console.warn(`流：${track}`)
  // 流id
  const participant = track.getParticipantId()
  // console.warn(`participant:${participant}`)

  // 是否已经存在该轨道
  if (!remoteTracks[participant]) {
    remoteTracks[participant] = []
  }
  const idx = remoteTracks[participant].push(track)

  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
    audioLevel => console.log(`Audio Level remote: ${audioLevel}`)
  )
  // 静音或取消静音
  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
    () => console.log('remote track muted')
  )
  // 本地流停止传输
  track.addEventListener(
    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
    () => console.warn(`remote track stoped：本地流停止传输`)
  )
  // 表示轨道的音频输出设备已更改
  track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
    deviceId =>
      console.log(`track audio output device was changed to ${deviceId}`)
  )
  const id = participant + track.getType() + idx

  // 避免添加多余的DOM元素
  // if (track.type === 'video' && allTracks.some(item => { return item.indexOf(participant + 'video') === 0 })) {
  //   $(`body video[id ^= ${participant}video]`).remove()
  // }
  // if (track.type === 'audio' && allTracks.some(item => { return item.indexOf(participant + 'audio') === 0 })) {
  //   $(`body audio[id ^= ${participant}audio]`).remove()
  // }

  if (track.getType() === 'video') {
    console.warn('添加video元素')
    $('body').append(`<video autoplay='1' id='${participant}video${idx}' openFlag='0' />`)
    // soloVideo.initVideoStyle({
    //   participant: participant,
    //   idx: idx
    // })
    // allTracks.push(`${participant}video${idx}`)
    // soloVideo.onClickToVideo(`${participant}video${idx}`)
  } else {
    $('body').append(`<audio autoplay='1' id='${participant}audio${idx}' />`)
    allTracks.push(`${participant}audio${idx}`)
  }
  track.attach($(`#${id}`)[0])
}

// 加入会议
function onConferenceJoined () {
  console.warn('conference joined!')
  isJoined = true
  for (let i = 0; i < localTracks.length; i++) {
    room.addTrack(localTracks[i])
  }
  // $('#localVideo1').attr({ 'openFlag': '0' })
  // soloVideo.initNormalAvatar('localVideo1')
  // soloVideo.onClickToVideo('localVideo1')
}

/**
 *
 * @param id
 */
export function onUserLeft (id) {
  console.warn('user left')
  if (!remoteTracks[id]) {
    return
  }
  const tracks = remoteTracks[id]

  for (let i = 0; i < tracks.length; i++) {
    tracks[i].detach($(`#${id}${tracks[i].getType()}`))
  }
}

// 连接成功
function onConnectionSuccess () {
  console.warn('连接成功')
  room = connection.initJitsiConference('aaa', confOptions)
  // 收到轨道回调
  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack)
  room.on(JitsiMeetJS.events.conference.CONFERENCE_FAILED, err => {
    console.warn(err)
    console.warn('进入房间失败')
  })
  // 删除轨道回调
  room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track => {})
  // 加入会议成功
  room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined)
  // 新成员加入房间
  room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
    console.warn('user join')
    remoteTracks[id] = []
  })
  // 成员离开房间
  room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft)
  // 收到轨道
  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => {
    console.warn('收到的流')
    console.warn(track)
  })
  // 删除轨道
  room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track) => {
    console.warn('已删除流')
    console.warn(track)
  })
  room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
    console.warn(`${track.getType()} - ${track.isMuted()}`)
  })
  room.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, (userID, displayName) => console.warn(`${userID} - ${displayName}`))
  room.on(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, (userID, audioLevel) => console.warn(`${userID} - ${audioLevel}`))
  room.on(JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, () => console.warn(`${room.getPhoneNumber()} - ${room.getPhonePin()}`))
  room.join()
}

// 连接失败
export function onConnectionFailed () {
  console.error('Connection Failed!')
}

// 设备列表改变
export function onDeviceListChanged (devices) {
  console.info('current devices', devices)
}

// 断开连接回调
export function disconnect () {
  console.warn('disconnect：断开连接')
  connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess)
  connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed)
  connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect)
}

// 挂断
export function unload () {
  // 挂断后删除所有轨道承载体：video、audio
  allTracks.forEach(item => {
    $(`body #${item}`).remove()
  })
  allTracks = []
  console.warn(localTracks)

  // 处理本地轨道
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].dispose()
  }
  room.leave()
  connection.disconnect()
}

let isVideo = true

// 切换视频
export function switchVideo () { // eslint-disable-line no-unused-vars
  isVideo = !isVideo
  if (localTracks[1]) {
    localTracks[1].dispose()
    localTracks.pop()
  }
  JitsiMeetJS.createLocalTracks({
    devices: [isVideo ? 'video' : 'desktop']
  })
    .then(tracks => {
      localTracks.push(tracks[0])
      localTracks[1].addEventListener(
        JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        () => console.log('local track muted'))
      localTracks[1].addEventListener(
        JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log('local track stoped'))
      localTracks[1].attach($('#localVideo1')[0])
      room.addTrack(localTracks[1])
    })
    .catch(error => console.log(error))
}

// 改变音频输出
export function changeAudioOutput (selected) { // eslint-disable-line no-unused-vars
  JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value)
}

export const initOptions = {
  disableAudioLevels: true,

  // The ID of the jidesha extension for Chrome.
  desktopSharingChromeExtId: 'mbocklcggfhnbahlnepmldehdhpjfcjp',

  // Whether desktop sharing should be disabled on Chrome.
  desktopSharingChromeDisabled: false,

  // The media sources to use when using screen sharing with the Chrome
  // extension.
  desktopSharingChromeSources: ['screen', 'window'],

  // Required version of Chrome extension
  desktopSharingChromeMinExtVersion: '0.1',

  // Whether desktop sharing should be disabled on Firefox.
  desktopSharingFirefoxDisabled: true
}
$(window).bind('beforeunload', unload)
$(window).bind('unload', unload)
export const initVideo = function () {
  allTracks = ['localAudio0', 'localVideo1']
  /* eslint-disable */
  console.log($)
  // JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

  JitsiMeetJS.init(initOptions)

  // 实例化一个服务器连接
  connection = new JitsiMeetJS.JitsiConnection(null, null, options)
  // 监听连接成功（原型方法）
  connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess)
  // 监听连接失败（原型方法）
  connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed)
  // 监听连接断开（原型方法）
  connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect)

  // 附加处理程序
  JitsiMeetJS.mediaDevices.addEventListener(JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED, onDeviceListChanged)

  // 开始建立服务器连接
  connection.connect({
    id: 'gsb@im.cf.nm.cp',
    password: '123456'
  })

  // 创建媒体轨道并返回promise对象
  JitsiMeetJS.createLocalTracks({
    devices: ['audio', 'video']
    // devices: ['audio']
  })
    .then(onLocalTracks)
    .catch(error => {
      throw error
    })

  // 如果支持更改输入（摄像机/麦克风）或输出（音频）设备，则返回true，否则返回false;
  if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
    // 返回可用设备的列表作为回调函数的参数
    JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
      const audioOutputDevices = devices.filter(d => d.kind === 'audiooutput')

      if (audioOutputDevices.length > 1) {
        $('#audioOutputSelect').html(
          audioOutputDevices
            .map(
              d =>
                `<option value="${d.deviceId}">${d.label}</option>`)
            .join('\n'))

        $('#audioOutputSelectWrapper').show()
      }
    })
  }
}

// 打开摄像头
export function openCameraRequest () {
  localTracks.forEach(item => {
    if (item.type === 'video') {
      item.attach($('#localVideo1')[0])
      room.addTrack(item)
      soloVideo.setOwnerNormlaAvatar('hidden')
    }
  })
  $('#localVideo1').attr({ 'openFlag': '0' })
}

// 关闭摄像头
export function closeCameraRequest () {
  localTracks.forEach(item => {
    if (item.type === 'video') {
      item.detach($('#localVideo1')[0])
      room.removeTrack(item)
      soloVideo.setOwnerNormlaAvatar('show')
    }
  })
  $('#localVideo1').attr({ 'openFlag': '1' })
}

// 静音
export function closeVoiceRequest () {
  localTracks.forEach(item => {
    if (item.type === 'audio') {
      item.unmute()
    }
  })
}

// 取消静音
export function openVoiceRequest () {
  localTracks.forEach(item => {
    if (item.type === 'audio') {
      item.mute()
      // console.warn($(`body #localVideo1`).css('top'))
      let top = $(`body #localVideo1`).css('top');
      $(`.video-main-component .normal-avatar`).css({
        'display': 'none'
      })
    }
  })
}
