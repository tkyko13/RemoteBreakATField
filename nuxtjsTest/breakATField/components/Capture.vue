<template>
  <div>
    <video ref="video" width="320" height="240" autoplay></video>
  </div>
</template>

<script>
export default {
  name: 'Capture',
  data: function () {
    return {
      video: {},
    }
  },
  mounted: async function () {
    this.video = this.$refs.video;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.srcObject = stream;
    this.video.play();
  }
}
</script>
