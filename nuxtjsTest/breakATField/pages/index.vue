<template>
  <section class="section">
    <!-- p5 -->
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script> -->
    <!-- ml5 -->
    <!-- <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script> -->
    <!-- <Capture ref="cap" /> -->
    <MaskView />
  </section>
</template>

<script>
import Capture from '~/components/Capture'
import MaskView from '~/components/MaskView'

export default {
  name: 'HomePage',
  components: {
    Capture,
    MaskView
  },
  mounted: async function () {
    // console.log(this.$refs.cap.video);

  }
}
</script>
