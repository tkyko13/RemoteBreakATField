"use strict";

let localStream = null;
let peer = null;
let existingCall = null;

navigator.mediaDevices
  .getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  })
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
  const net2 = await bodyPix.load();

  const myVideo = $("#my-video").get(0);
  const destCanvas = $("#my-canvas").get(0);

  const theirVideo = $("#their-video").get(0);
  const destTheirCnv = $("#their-canvas").get(0);

  $("#btn").get(0).onclick = async () => {
    // THESE LINES ARE REQUIRED!
    myVideo.width = theirVideo.width = destCanvas.width = destTheirCnv.width =
      myVideo.videoWidth;
    myVideo.height = theirVideo.height = destCanvas.height = destTheirCnv.height =
      myVideo.videoHeight;

    const destCtx = destCanvas.getContext("2d");
    const destTheirCtx = destTheirCnv.getContext("2d");

    // to remove background, need another canvas
    const tempCnv = document.createElement("canvas");
    tempCnv.width = myVideo.videoWidth;
    tempCnv.height = myVideo.videoHeight;
    const tempCtx = tempCnv.getContext("2d");

    const tempTheirCnv = document.createElement("canvas");
    tempTheirCnv.width = theirVideo.videoWidth;
    tempTheirCnv.height = theirVideo.videoHeight;
    const tempTheirCtx = tempTheirCnv.getContext("2d");

    (async function loop() {
      requestAnimationFrame(loop);

      // create mask on temp canvas
      const segmentation = await net.segmentPerson(myVideo);
      const mask = bodyPix.toMask(segmentation);
      tempCtx.putImageData(mask, 0, 0);

      // draw original
      destCtx.drawImage(myVideo, 0, 0, destCanvas.width, destCanvas.height);
      // then overwrap, masked area will be removed
      destCtx.save();
      destCtx.globalCompositeOperation = "destination-out";
      destCtx.drawImage(tempCnv, 0, 0, destCanvas.width, destCanvas.height);
      destCtx.restore();

      const segmentation2 = await net2.segmentPerson(theirVideo);
      const mask2 = bodyPix.toMask(segmentation2);
      tempTheirCtx.putImageData(mask2, 0, 0);

      destTheirCtx.drawImage(
        theirVideo,
        0,
        0,
        destTheirCnv.width,
        destTheirCnv.height
      );
      // then overwrap, masked area will be removed
      destTheirCtx.save();
      destTheirCtx.globalCompositeOperation = "destination-out";
      destTheirCtx.drawImage(
        tempTheirCnv,
        0,
        0,
        destTheirCnv.width,
        destTheirCnv.height
      );
      destTheirCtx.restore();
    })();
  };
})();
