<template>
  <div>
    <video ref="video" width="320" height="240" autoplay></video>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>

export default {
  name: 'MaskView',
  head: {
    script: [
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js',
        // asunc: true,
      },
      {
        src: 'https://unpkg.com/ml5@latest/dist/ml5.min.js',
        // asunc: true,
      },
    ],
  },
  data: function () {
    return {
      video: {},
      canvas: {},
    }
  },
  mounted: async function () {

    this.video = this.$refs.video;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.srcObject = stream;
    this.video.play();

    console.log('ml5 version:', ml5.version);
    // createCanvas(800, 600);

    const uNet = ml5.uNet('face');
    this.video.addEventListener('loadeddata', (e) => {
      uNet.segment(this.video, gotResult);
    });
    function gotResult(error, result) {
      // if there's an error return it
      if (error) {
        console.error(error);
        return;
      }
      // log your result
      console.log(result);
    }
  },
}
</script>
