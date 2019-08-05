<template>
  <div class="video-main-component">
    <div class="video-btn-group-background"></div>
    <div class="video-btn-group">
      <!--静音-->
      <img v-if="openVoiceFlag && openFlag" @click="closeVoice" class="btn" src="../../../../static/img/unmute.png" title="静音" alt="close-voice-iocn" />
      <img v-else-if="!openVoiceFlag && openFlag" @click="openVoice" class="btn" src="../../../../static/img/mute.png" title="取消静音" alt="close-voice-iocn" />

      <!--通话-->
      <img v-if="!openFlag" class="open-btn btn" src="../../../../static/img/connected.png" @click="openVideo" alt="open" />
      <img v-else class="close-btn btn" src="../../../../static/img/closed.png" @click="closeVideo" title="挂断" alt="close" />

      <!--摄像头-->
      <img v-if="openVideoFlag && openFlag" @click="closeCamera" class="btn" src="../../../../static/img/cameraoff copy.png" title="关闭摄像机" alt="open-video-icon" />
      <img v-else-if="!openVideoFlag && openFlag" class="btn" @click="openCamera" src="../../../../static/img/cameraoff.png" title="打开摄像机" alt="close-video-icon" />
    </div>

    <!--关闭相机的默认背景-->
    <!--<div class="localVideo1 normal-avatar">-->
      <!--<img src="../../../../static/img/boy.png" alt="默认头像" />-->
    <!--</div>-->
    <!--<div class="localVideo2 normal-avatar">-->
      <!--<img src="../../../../static/img/boy.png" alt="默认头像" />-->
    <!--</div>-->
  </div>
</template>

<script>
  import {
    initVideo,
    // disconnect,
    unload,
    openCameraRequest,
    closeCameraRequest,
    openVoiceRequest,
    closeVoiceRequest
  } from '../../../../static/example'
  export default {
    data () {
      return {
        openFlag: false,
        // 打开摄像头
        openVideoFlag: true,
        // 打开声音
        openVoiceFlag: true
      }
    },
    mounted () {},
    methods: {
      openVideo () {
        initVideo()
        this.openFlag = true
      },
      closeVideo () {
        this.openFlag = false
        unload()
      },
      // 打开摄像头
      openCamera () {
        this.openVideoFlag = true
        openCameraRequest()
      },
      // 关闭摄像头
      closeCamera () {
        this.openVideoFlag = false
        closeCameraRequest()
      },
      // 取消静音
      openVoice () {
        this.openVoiceFlag = true
        openVoiceRequest()
      },
      // 静音
      closeVoice () {
        this.openVoiceFlag = false
        closeVoiceRequest()
      }
    }
  }
</script>

<style lang="scss">
  #localVideo1 {
    position: fixed;
    right: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    object-fit: fill;
  }
  .video-main-component {
    height: 100vh;
    background: #464646;
    .video-btn-group {
      position: fixed;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 70px;
      font-size: 0;
      z-index: 9999;
      .btn {
        width: 40px;
        height: 40px;
        cursor: pointer;
      }
      .btn + .btn {
        margin-left: 20px;
      }
    }
    .normal-avatar {
      position: fixed;
      top: 10px;
      right: 10px;
      display: none;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 70px;
      background: #1b1b1b;
      z-index: 998;
      img {
        width: 50px;
        height: 50px;
      }
    }
  }
  .video-btn-group-background {
    background-image: linear-gradient(to top,rgba(51,51,51,1),rgba(51,51,51,0.4));
    transition: bottom .3s ease-in;
    height: 70px;
    width: 100%;
    bottom: 0;
    position: absolute;
    z-index: 4;
  }
  .video-btn-group-background:after {
    content: "";
    width:100%;
    height:100%;
    position: absolute;
    left:0;
    top:0;
    background: inherit;
    filter: blur(15px);/*为了模糊更明显，调高模糊度*/
    z-index: 2;
  }
</style>
