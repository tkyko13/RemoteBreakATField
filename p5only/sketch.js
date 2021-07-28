let video; //src
let maskCnv; //mask 相手に送る自分のマスク画像
let segmentationImage;
let viewCnv; //表示用のキャンバス　親であれば子供に送るストリーム
let targetVideo;

let uNet;

let peer;
let existingCall = null;

function preload() {
  uNet = ml5.uNet('face');
}

function setup() {
  viewCnv = createCanvas(320, 240);
  maskCnv = createGraphics(320, 240);

  // setup skyway
  peer = new Peer({
    key: '51af5899-2541-43dc-acff-95976dccb605',
    debug: 3,
  });
  peer.on("open", () => {
    console.log('id: ' + peer.id);
  });

  const input = createInput('');
  const callBtn = createButton('call');

  // 子から親へ呼び出す
  // wip urlからid取得したい
  callBtn.mousePressed((e) => {
    // console.log(input.value());
    const call = peer.call(input.value(), maskCnv.canvas.captureStream(60));
    call.on("stream", stream => {
      console.log('on stream in Child!');
      // 親から来るストリームは重なっている映像
      targetVideo = select('#their-video');
      targetVideo.elt.srcObject = stream;
      targetVideo.elt.play();
      targetVideo.hide();
    });
  });

  // $("#end-call").click(function () {
  //   existingCall.close();
  // });

  // 親から子へ呼び出される
  peer.on("call", (call) => {
    // 重なった映像を返す
    call.answer(viewCnv.canvas.captureStream(60));

    call.on("stream", stream => {
      console.log('on stream in Parent!');
      // 子から来るストリームを重ねる
      targetVideo = select('#their-video');
      targetVideo.elt.srcObject = stream;
      targetVideo.elt.play();
      targetVideo.hide();
    });
  });

  // function setupCallEventHandlers(call, streamCallback) {
  //   if (existingCall) {
  //     existingCall.close();
  //   }

  //   existingCall = call;

  //   call.on("stream", streamCallback);
  //   // function (stream) {
  //   //   // addVideo(call, stream);
  //   //   // setupEndCallUI();
  //   //   // $("#their-id").text(call.remoteId);
  //   //   console.log('remote id: ' + call.remoteId);
  //   // });

  //   call.on("close", function () {
  //     // removeVideo(call.remoteId);
  //     // setupMakeCallUI();
  //   });
  // }




  // load up your video
  video = createCapture(VIDEO, () => {
    uNet.segment(video, gotResult);
  });
  video.size(width, height);
  video.hide(); // Hide the video element, and just show the canvas

  segmentationImage = createImage(width, height);
}

function gotResult(error, result) {
  // if there's an error return it
  if (error) {
    console.error(error);
    return;
  }
  // set the result to the global segmentation variable
  segmentationImage = result.backgroundMask;
  maskCnv.image(segmentationImage, 0, 0, maskCnv.width, maskCnv.height);
  // maskCnv.image(segmentationImage);

  // Continue asking for a segmentation image
  uNet.segment(video, gotResult);
}

function draw() {
  background(255);
  // image(segmentationImage, 0, 0, width, height);
  if (targetVideo) {
    console.log('draw video');
    image(targetVideo, 0, 0, width, height);
  }

}
