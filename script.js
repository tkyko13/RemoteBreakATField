"use strict";

let localStream = null;
let peer = null;
let existingCall = null;

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(function (stream) {
    // Success
    $("#my-video").get(0).srcObject = stream;
    localStream = stream;
  })
  .catch(function (error) {
    // Error
    console.error("mediaDevice.getUserMedia() error:", error);
    return;
  });

peer = new Peer({
  key: "bbf8329c-5612-4dbb-873e-d59df221bd81",
  debug: 3,
});

peer.on("open", function () {
  $("#my-id").text(peer.id);
});

$("#make-call").submit(function (e) {
  e.preventDefault();
  const call = peer.call($("#callto-id").val(), localStream);
  setupCallEventHandlers(call);
});

$("#end-call").click(function () {
  existingCall.close();
});

peer.on("call", function (call) {
  call.answer(localStream);
  setupCallEventHandlers(call);
});

function setupCallEventHandlers(call) {
  if (existingCall) {
    existingCall.close();
  }

  existingCall = call;

  call.on("stream", function (stream) {
    addVideo(call, stream);
    setupEndCallUI();
    $("#their-id").text(call.remoteId);
  });

  call.on("close", function () {
    removeVideo(call.remoteId);
    setupMakeCallUI();
  });
}

function addVideo(call, stream) {
  $("#their-video").get(0).srcObject = stream;
}
function removeVideo(peerId) {
  $("#their-video").get(0).srcObject = undefined;
}
function setupMakeCallUI() {
  $("#make-call").show();
  $("#end-call").hide();
}

function setupEndCallUI() {
  $("#make-call").hide();
  $("#end-call").show();
}

// ------ tensorflow
(async () => {
  const net = await bodyPix.load();

  // input source
  const myVideo = $("#my-video").get(0);
  const thirVideo = $("#their-video").get(0);
  // output source
  const destCanvas = $("#my-canvas").get(0);

  $("#btn").get(0).onclick = async () => {
    console.log("a");
    // THESE LINES ARE REQUIRED!
    myVideo.width = thirVideo.width = destCanvas.width = myVideo.videoWidth;
    myVideo.height = thirVideo.height = destCanvas.height = myVideo.videoHeight;

    const destCtx = destCanvas.getContext("2d");

    // to remove background, need another canvas
    const tempCnv = document.createElement("canvas");
    tempCnv.width = myVideo.videoWidth;
    tempCnv.height = myVideo.videoHeight;
    const tempCtx = tempCnv.getContext("2d");

    (async function loop() {
      requestAnimationFrame(loop);

      // create mask on temp canvas
      const segmentation = await net.segmentPerson(myVideo);
      const mask = bodyPix.toMask(segmentation);
      tempCtx.putImageData(mask, 0, 0);

      const segmentation2 = await net.segmentPerson(thirVideo);
      const mask2 = bodyPix.toMask(segmentation2);
      tempCtx.putImageData(mask2, 0, 0);

      // draw original
      destCtx.drawImage(myVideo, 0, 0, destCanvas.width, destCanvas.height);
      // then overwrap, masked area will be removed
      destCtx.save();
      destCtx.globalCompositeOperation = "destination-out";
      destCtx.drawImage(tempCnv, 0, 0, destCanvas.width, destCanvas.height);
      destCtx.restore();
    })();
  };
})();
