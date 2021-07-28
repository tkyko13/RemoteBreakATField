let video; //src
let myMask; //mask 相手に送る自分のマスク画像
let thireMask;
let viewCnv; //表示用のキャンバス　親であれば子供に送るストリーム

let uNet;

let peer;
let existingCall = null;
let dataConnection;

let inviteId;

function convParamToObj() {
  var search = location.search.substring(1);
  if (search) {
    return JSON.parse('{"' + decodeURI(search.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
  }
  return {};
}

function preload() {
  uNet = ml5.uNet('face');
}

function setup() {
  let param = convParamToObj();
  inviteId = param.d;
  // console.log(param);

  viewCnv = createCanvas(320, 240);
  viewCnv.parent("#mainContainer");
  myMask = null;//createImage(320, 240);
  thireMask = createImage(128, 128);

  // setup skyway
  peer = new Peer({
    key: '51af5899-2541-43dc-acff-95976dccb605',
    debug: 3,
  });
  peer.on("open", () => {
    console.log('id: ' + peer.id);

    if (inviteId) {
      dataConnection = peer.connect(inviteId);
      dataConnection.once('open', async () => {
        console.log('open in child');
      });
      dataConnection.on('data', data => {

        // console.log('on data is');
        // console.log(data);
        // image(data, 0, 0);

        thireMask.loadPixels();
        // thireMask.pixels = result.raw.backgroundMask;
        const view = new DataView(data);
        for (let y = 0; y < 128; y++) {
          for (let x = 0; x < 128; x++) {
            const index = x * 4 + y * 4 * 128;
            thireMask.set(x, y, color(view.getUint8(index), view.getUint8(index + 1), view.getUint8(index + 2), view.getUint8(index + 3)));
          }
        }
        thireMask.updatePixels();

        // console.log('onData in child');
      });
    } else {
      const invitURL = location.href + "?d=" + peer.id;
      // const idP = createP('Invite URL : ' + invitURL);
      document.getElementById("inviteURL").value = invitURL;
    }
  });

  // const input = createInput('');
  // const callBtn = createButton('call');

  // 子から親へ呼び出す
  // wip urlからid取得したい
  // callBtn.mousePressed((e) => {

  //   dataConnection = peer.connect(input.value());
  //   dataConnection.once('open', async () => {
  //     console.log('open in child');
  //   });
  //   dataConnection.on('data', data => {

  //     // console.log('on data is');
  //     // console.log(data);
  //     // image(data, 0, 0);

  //     thireMask.loadPixels();
  //     // thireMask.pixels = result.raw.backgroundMask;
  //     const view = new DataView(data);
  //     for (let y = 0; y < 128; y++) {
  //       for (let x = 0; x < 128; x++) {
  //         const index = x * 4 + y * 4 * 128;
  //         thireMask.set(x, y, color(view.getUint8(index), view.getUint8(index + 1), view.getUint8(index + 2), view.getUint8(index + 3)));
  //       }
  //     }
  //     thireMask.updatePixels();

  //     // console.log('onData in child');
  //   });
  // });

  // 親から子へ呼び出される
  peer.on("connection", (_dataConnection) => {
    dataConnection = _dataConnection;
    dataConnection.once('open', async () => {
      console.log('open in pareint');
    });
    dataConnection.on('data', data => {

      // console.log('on data is');
      // console.log(data);
      // image(data, 0, 0);

      thireMask.loadPixels();
      // thireMask.pixels = result.raw.backgroundMask;
      const view = new DataView(data);
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const index = x * 4 + y * 4 * 128;
          thireMask.set(x, y, color(view.getUint8(index), view.getUint8(index + 1), view.getUint8(index + 2), view.getUint8(index + 3)));
        }
      }
      thireMask.updatePixels();

      // console.log('onData in pareint');
    });
  });


  // load up your video
  video = createCapture(VIDEO, () => {
    uNet.segment(video, gotResult);
  });
  video.size(width, height);
  video.hide(); // Hide the video element, and just show the canvas
}


function gotResult(error, result) {
  if (error) {
    console.error(error);
    return;
  }

  myMask = result.backgroundMask;
  if (peer.open && dataConnection) {
    // console.log('send data is');
    // console.log(result.raw.backgroundMask);
    dataConnection.send(result.raw.backgroundMask);
  }

  uNet.segment(video, gotResult);
}

function draw() {
  background(255);
  if (myMask) {
    image(myMask, 0, 0, 320, 240);
  }
  if (thireMask) {
    image(thireMask, 0, 0, 320, 240);
  }
}
